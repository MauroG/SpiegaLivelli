import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for base64 file uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Initialize the Gemini API client
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARN: GEMINI_API_KEY environment variable is not set. App might run in mock mode.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// API Routes
app.post("/api/explain", async (req, res) => {
  try {
    const { concept, level, file, chatHistory } = req.body;
    
    // level: 'biennio' | 'triennio' | 'maturita'
    let levelPrefix = "[🟢 BIENNIO]";
    let levelInstruction = "";
    
    if (level === "triennio") {
      levelPrefix = "[🟡 TRIENNIO]";
      levelInstruction = "Sei al livello Triennio (studenti di 16-18 anni). Lo studente conosce già le grandi basi. Usa terminologia disciplinare appropriata, connetti il tema a concetti storici o teorici già noti, e offri esempi pertinenti e contestualizzati.";
    } else if (level === "maturita") {
      levelPrefix = "[🔴 MATURITÀ]";
      levelInstruction = "Sei al livello Maturità (studenti di 18-19 anni, verso l'esame di Stato). Dimostra massima padronanza: usa linguaggio accademico e specialistico, fai riferimenti ad autori, teorie contrapposte, dibattiti critici ed effettua connessioni interdisciplinari raffinate.";
    } else {
      // Default / Biennio
      levelPrefix = "[🟢 BIENNIO]";
      levelInstruction = "Sei al livello Biennio (studenti di 14-16 anni). Mantieni un linguaggio estremamente semplice, chiaro e accessibile. Evita i tecnicismi non strettamente necessari (se li introduci, spiegali subito). Usa analogie con la vita di tutti i giorni. Frasi corte. Concentrati su 'cosa è' e sul 'perché esiste'.";
    }

    const systemPrompt = `Sei SpiegaLivelli, un assistente didattico empatico, chiaro e altamente qualificato per la scuola superiore italiana.
Il tuo compito principale è spiegare qualsiasi concetto disciplinare (storia, filosofia, fisica, chimica, matematica, letteratura, ecc.) calibrando il linguaggio e la profondità sull'ordine di studi richiesto.

ECCO LE REGOLE IMPERATIVE PER LE RISPOSTE:
1. Devi INIZIARE SEMPRE la tua risposta esattamente con la stringa di livello attiva: ${levelPrefix} seguita da un a capo.
2. ${levelInstruction}
3. REGOLA FONDAMENTALE ANTI-ESERCIZIO: Non risolvere mai esercizi specifici, equazioni con dati numerici particolari, traduzioni di frasi assegnate, o risposte a tracce precise di compiti! Se l'utente ti fornisce un esercizio o una frase da tradurre, devi individuare il concetto o la regola teorica sottostante, spiegarla in modo impeccabile al livello richiesto, e mostrare come risolverla usando un esempio diverso e generico. Sii molto incoraggiante.
4. Se l'utente ti ha caricato un documento/immagine:
   - Analizza attentamente il suo contenuto (testo, grafico, formule, schemi).
   - Identifica i concetti teorici fondamentali presenti nel documento.
   - Se l'utente ha posto una domanda specifica o cercato un concetto all'interno del documento, spiegaglielo direttamente.
   - Se non ha specificato cosa approfondire, elenca chiaramente i 3-4 concetti teorici principali trovati nel documento e chiedigli con gentilezza quale desidera approfondire.
5. Sii sempre incoraggiante, positivo, paziente e appassionato della materia.
6. Alla fine di ogni tua spiegazione, devi assolutamente aggiungere su una riga separata (esattamente così):
— Vuoi salire di livello? Hai domande su quello che ho detto?`;

    const client = getGeminiClient();

    // Prepare contents
    const contents: any[] = [];
    
    // Add file context if present
    if (file && file.base64 && file.mimeType) {
      contents.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.base64
        }
      });
    }

    // Add conversational history context if provided
    if (chatHistory && Array.isArray(chatHistory)) {
      // Build previous messages context
      let historyText = "Cronologia della conversazione precedente per coerenza:\n";
      chatHistory.forEach((msg: any) => {
        const sender = msg.sender === "user" ? "Studente" : "SpiegaLivelli";
        historyText += `- ${sender}: ${msg.text}\n`;
      });
      contents.push({ text: historyText });
    }

    // Add current query
    const userPrompt = concept ? concept : "Analizza l'allegato e individua i concetti chiave.";
    contents.push({ text: userPrompt });

    console.log(`[SpiegaLivelli] Query level: ${level}, prompt preview: "${userPrompt.substring(0, 100)}..."`);

    let responseText = "";

    if (process.env.GEMINI_API_KEY) {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });
      
      responseText = response.text || "Non sono riuscito a generare una risposta. Riprova.";
    } else {
      // Mock mode for local testing if no API key is set
      console.log("[SpiegaLivelli] Running in Mock Mode because GEMINI_API_KEY is missing");
      responseText = `${levelPrefix}\n\n[MOCK MODE] Ecco una spiegazione di esempio su **"${userPrompt}"**:\n\nNel contesto scolastico, questo concetto è di fondamentale importanza. \n\nSe fossimo in classe, vedremmo che si ricollega direttamente alle regole fondamentali della materia. Ad esempio, pensa a quando osservi un fenomeno quotidiano: si applica esattamente lo stesso principio!\n\nContinua a studiare con questo entusiasmo!\n\n— Vuoi salire di livello? Hai domande su quello che ho detto?`;
    }

    res.json({ text: responseText });
  } catch (error: any) {
    console.error("Backend error serving explain request:", error);
    res.status(500).json({ error: error.message || "Errore sconosciuto nel server" });
  }
});

// Setup Vite Dev Server / Static production files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server SpiegaLivelli running on port ${PORT}`);
  });
}

startServer();
