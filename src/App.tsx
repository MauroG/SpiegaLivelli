import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Compass,
  Zap,
  BookOpen,
  Globe,
  Hash,
  FlaskConical,
  GraduationCap,
  Award,
  Sparkles,
  Send,
  Upload,
  X,
  FileText,
  AlertTriangle,
  Loader2,
  HelpCircle,
  RefreshCw,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Info
} from "lucide-react";
import { SUBJECTS } from "./data";
import { Level, Message, FileAttachment } from "./types";
import LevelSelector from "./components/LevelSelector";

// Map dynamic icon string to Lucide component
const iconMap: Record<string, React.ComponentType<any>> = {
  Compass,
  Zap,
  BookOpen,
  Globe,
  Hash,
  FlaskConical
};

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<Level>("biennio");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: "welcome",
      text: "[🟢 BIENNIO]\n\nCiao! Sono **SpiegaLivelli**, il tuo professore digitale! 🎓\n\nPosso spiegarti qualsiasi concetto di *filosofia, fisica, storia, letteratura, matematica o scienze* calibrando le parole sul tuo livello della scuola superiore.\n\nScegli il tuo livello preferito qui sopra (Biennio, Triennio o Maturità), seleziona uno dei concetti pronti a sinistra, oppure scrivimi direttamente la tua domanda!\n\n> ⚠️ *Ricorda: per aiutarti davvero a studiare, non posso risolvere esercizi specifici ma ti spiegherò sempre la regola teorica sottostante con esempi pratici e incoraggianti!*",
      sender: "bot",
      level: "biennio",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [attachedFile, setAttachedFile] = useState<FileAttachment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  // Handle file reading to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Limits size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      showError("Il file supera il limite di 5MB. Carica un file più piccolo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract main base64 data without scheme header
      const base64Data = base64String.split(",")[1];
      
      setAttachedFile({
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + " KB",
        base64: base64Data
      });
    };
    reader.onerror = () => {
      showError("Errore durante la lettura del file.");
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const showError = (message: string) => {
    setErrorToast(message);
    setTimeout(() => {
      setErrorToast(null);
    }, 4500);
  };

  // Send request to API backend
  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() && !attachedFile) return;

    // Create user message
    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      text: promptToSend || `Analizza il documento caricato (${attachedFile?.name})`,
      sender: "user",
      level: currentLevel,
      timestamp: new Date(),
      attachment: attachedFile || undefined
    };

    setChatHistory((prev) => [...prev, newUserMessage]);
    setInputText("");
    const prevAttachedFile = attachedFile;
    setAttachedFile(null); // Clear active attachment state
    setIsLoading(true);

    try {
      // Build simplified history payload for context keeping
      const simplifiedHistory = chatHistory
        .filter(m => m.id !== "welcome")
        .slice(-6) // Send last 6 messages for context
        .map(m => ({
          sender: m.sender,
          text: m.text
        }));

      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          concept: promptToSend,
          level: currentLevel,
          file: prevAttachedFile ? {
            base64: prevAttachedFile.base64,
            mimeType: prevAttachedFile.type
          } : null,
          chatHistory: simplifiedHistory
        })
      });

      if (!response.ok) {
        throw new Error("Errore nella risposta del server d'intelligenza artificiale.");
      }

      const data = await response.json();
      
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        sender: "bot",
        level: currentLevel,
        timestamp: new Date()
      };

      setChatHistory((prev) => [...prev, newBotMessage]);
    } catch (err: any) {
      console.error(err);
      showError("Impossibile contattare SpiegaLivelli. Verifica la connessione.");
      
      // Add feedback error message in chat
      setChatHistory((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `❌ Oh no! C'è stato un piccolo intoppo tecnico nel contattare il server.\n\nAssicurati che la chiave **GEMINI_API_KEY** sia stata configurata correttamente nel pannello Secrets. Puoi riprovare tra un attimo!`,
          sender: "bot",
          level: currentLevel,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Triggers explaining previous concept but shifting level
  const handleExplainInNewLevel = (newLevel: Level) => {
    setCurrentLevel(newLevel);
    // Find last user message, or last bot topic
    const lastUserMessage = [...chatHistory].reverse().find(m => m.sender === "user");
    if (lastUserMessage) {
      // Prompt explain with new level
      setInputText(`Rispiegami l'argomento precedente ("${lastUserMessage.text.substring(0, 50)}${lastUserMessage.text.length > 50 ? '...' : ''}") ma calibrato sul livello ${newLevel.toUpperCase()}.`);
    }
  };

  // Quick action from pre-selected school concept
  const handleSelectConcept = (promptText: string) => {
    setInputText(promptText);
  };

  // Color theme generator based on active level
  const getLevelTheme = () => {
    switch (currentLevel) {
      case "biennio":
        return {
          primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
          border: "border-emerald-200",
          text: "text-emerald-800",
          lightBg: "bg-emerald-50/50",
          accentColor: "emerald"
        };
      case "triennio":
        return {
          primary: "bg-amber-600 hover:bg-amber-700 text-white",
          border: "border-amber-200",
          text: "text-amber-800",
          lightBg: "bg-amber-50/50",
          accentColor: "amber"
        };
      case "maturita":
        return {
          primary: "bg-rose-600 hover:bg-rose-700 text-white",
          border: "border-rose-200",
          text: "text-rose-800",
          lightBg: "bg-rose-50/50",
          accentColor: "rose"
        };
    }
  };

  const theme = getLevelTheme();

  return (
    <div id="spiegalivelli-container" className="flex h-screen w-full overflow-hidden bg-[#FAF9F6] text-gray-900 font-sans antialiased">
      
      {/* Subject curriculum sidebar (left) */}
      <aside
        id="subjects-sidebar"
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-20 ${
          isSidebarOpen ? "w-[330px] translate-x-0" : "w-0 -translate-x-full"
        } absolute lg:relative h-full`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 text-amber-900 p-2 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base tracking-tight text-gray-900">
                Programmi Scolastici
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">Concetti chiave delle superiori</p>
            </div>
          </div>
          <button
            id="close-sidebar-btn"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subjects list grid selector */}
        <div className="p-3 grid grid-cols-2 gap-2 border-b border-gray-100 bg-gray-50/50">
          {SUBJECTS.map((sub) => {
            const SubIcon = iconMap[sub.iconName] || BookOpen;
            const isSelected = selectedSubject.id === sub.id;
            return (
              <button
                id={`sub-tab-${sub.id}`}
                key={sub.id}
                onClick={() => setSelectedSubject(sub)}
                className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all text-xs font-semibold ${
                  isSelected
                    ? "bg-white border-gray-300 shadow-xs text-gray-900 ring-1 ring-gray-100"
                    : "bg-transparent border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
                }`}
              >
                <div className={`p-1 rounded-md ${sub.color}`}>
                  <SubIcon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{sub.name}</span>
              </button>
            );
          })}
        </div>

        {/* Concept suggestions for selected subject */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider font-display mb-1">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Spunti di Studio — {selectedSubject.name}</span>
          </div>

          <div className="space-y-3">
            {selectedSubject.sampleConcepts.map((concept, idx) => (
              <button
                id={`concept-card-${idx}`}
                key={idx}
                onClick={() => handleSelectConcept(concept.prompt)}
                className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/40 hover:bg-white transition-all group relative cursor-pointer"
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="font-bold text-xs text-gray-800 group-hover:text-gray-900 group-hover:underline">
                    {concept.title}
                  </h3>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-sans line-clamp-2">
                  {concept.description}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-6 p-3 rounded-xl bg-amber-50/50 border border-amber-100/80">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-900">Regola Fondamentale:</span>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  Non risolviamo mai compiti o quesiti numerici specifici. Se li inserisci, analizzeremo e spiegheremo solo le formule e le teorie correlate!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-[11px] text-gray-400">
          <span>Classe attiva: {currentLevel.toUpperCase()}</span>
          <span>SpiegaLivelli v1.2</span>
        </div>
      </aside>

      {/* Main chat window area */}
      <main id="chat-container" className="flex-1 flex flex-col h-full bg-[#FAF9F6] relative overflow-hidden">
        
        {/* Top bar header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                id="open-sidebar-btn"
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all cursor-pointer"
                title="Apri programmi scolastici"
              >
                <BookOpen className="w-5 h-5 text-amber-700" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-amber-900">
                  SpiegaLivelli
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Didattico
                </span>
              </div>
              <p className="text-xs text-gray-505 invisible sm:visible">L'assistente per la scuola superiore italiana</p>
            </div>
          </div>

          {/* Quick instructions & active actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 bg-gray-100 py-1 px-2.5 rounded-lg text-xs font-medium text-gray-600">
              <Info className="w-4 h-4 text-gray-500" />
              <span>Scegli argomento e livello</span>
            </div>
            
            <button
              id="clear-chat-btn"
              onClick={() => {
                if (confirm("Vuoi svuotare la conversazione?")) {
                  setChatHistory([
                    {
                      id: "welcome",
                      text: `[🟢 BIENNIO]\n\nConversazione ripristinata! Di cosa vorresti parlare adesso nel livello **${currentLevel.toUpperCase()}**?\n\nPuoi scegliere uno spunto dal pannello di sinistra o scrivere un tuo quesito!`,
                      sender: "bot",
                      level: currentLevel,
                      timestamp: new Date()
                    }
                  ]);
                }
              }}
              className="text-xs font-semibold px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-1 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pulisci Chat</span>
            </button>
          </div>
        </header>

        {/* Level selection configuration zone */}
        <section className="bg-white border-b border-gray-200 p-4 shadow-xs">
          <LevelSelector currentLevel={currentLevel} onLevelChange={(lvl) => handleExplainInNewLevel(lvl)} />
        </section>

        {/* Error toast alerts */}
        {errorToast && (
          <div className="absolute top-20 right-4 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl shadow-lg z-30 flex items-center gap-3 animate-bounce max-w-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div className="text-xs font-medium">{errorToast}</div>
            <button onClick={() => setErrorToast(null)} className="text-rose-400 hover:text-rose-600 ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live chat stream */}
        <div
          id="chat-scroller"
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
        >
          {chatHistory.map((message) => {
            const isUser = message.sender === "user";
            
            // Format time
            const timeStr = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={message.id}
                className={`flex gap-3 md:gap-4 max-w-4xl mx-auto items-start ${
                  isUser ? "flex-row-reverse" : "flex-row"
                } fade-in`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs border flex-shrink-0 ${
                    isUser
                      ? "bg-slate-800 text-slate-100 border-slate-700"
                      : message.level === "biennio"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : message.level === "triennio"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                >
                  {isUser ? (
                    "ST"
                  ) : message.level === "biennio" ? (
                    "🟢"
                  ) : message.level === "triennio" ? (
                    "🟡"
                  ) : (
                    "🔴"
                  )}
                </div>

                {/* Message block */}
                <div className={`flex flex-col max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
                  
                  {/* Status header indicator */}
                  <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono text-gray-400">
                    <span className="font-semibold text-gray-500">
                      {isUser ? "Tu (Studente)" : "SpiegaLivelli Bot"}
                    </span>
                    <span>•</span>
                    <span>{timeStr}</span>
                    {!isUser && (
                      <span className={`px-1.5 py-0.2 rounded-md font-bold text-[9px] uppercase ${
                        message.level === "biennio"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : message.level === "triennio"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {message.level}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div
                    className={`rounded-2xl p-4 md:p-5 shadow-xs border transition-all ${
                      isUser
                        ? "bg-slate-800 text-white border-slate-700 rounded-tr-none"
                        : "bg-white text-gray-800 border-gray-200 rounded-tl-none font-sans"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.text}</p>
                    ) : (
                      <div className="markdown-body text-sm leading-relaxed prose prose-neutral max-w-none text-gray-800">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    )}

                    {/* Show attachment if present */}
                    {message.attachment && (
                      <div className={`mt-3 p-2.5 rounded-xl flex items-center gap-2.5 border text-xs leading-none ${
                        isUser 
                          ? "bg-slate-700/60 border-slate-600 text-slate-100" 
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}>
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <div className="flex-1 truncate">
                          <p className="font-semibold truncate text-[11px]">{message.attachment.name}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{message.attachment.size}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shifting tool hints directly under answers for user context */}
                  {!isUser && message.id !== "welcome" && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-mono text-gray-400 self-center mr-1">
                        Vuoi un'altra prospettiva?
                      </span>
                      {currentLevel !== "biennio" && (
                        <button
                          id={`change-lvl-biennio-${message.id}`}
                          onClick={() => handleExplainInNewLevel("biennio")}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-800 hover:bg-emerald-100/60 transition-all cursor-pointer"
                        >
                          🟢 Spiega nel BIENNIO (Più Semplice)
                        </button>
                      )}
                      {currentLevel !== "triennio" && (
                        <button
                          id={`change-lvl-triennio-${message.id}`}
                          onClick={() => handleExplainInNewLevel("triennio")}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-amber-800 hover:bg-amber-100 text-gray-800 transition-all cursor-pointer"
                        >
                          🟡 Spiega nel TRIENNIO (Intermedio)
                        </button>
                      )}
                      {currentLevel !== "maturita" && (
                        <button
                          id={`change-lvl-maturita-${message.id}`}
                          onClick={() => handleExplainInNewLevel("maturita")}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-rose-800 hover:bg-rose-100 text-gray-800 transition-all cursor-pointer"
                        >
                          🔴 Spiega per la MATURITÀ (Massima Profondità)
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Assistant generated status spinner loader */}
          {isLoading && (
            <div className="flex gap-3 md:gap-4 max-w-4xl mx-auto items-start fade-in">
              <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center animate-pulse">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[10px] font-mono text-gray-400">SpiegaLivelli sta scrivendo per te...</span>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-xs">
                  <div className="flex space-x-2 py-1 items-center">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs text-gray-400 pl-2">Elaborando la risposta calibrata sul livello {currentLevel.toUpperCase()}...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating background dropzone or indicator state */}
        <section
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-t border-gray-200 bg-white p-4 relative"
        >
          {isDragOver && (
            <div className="absolute inset-0 bg-[#FAF9F6]/90 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-amber-400 z-10 m-1 rounded-xl">
              <Upload className="w-10 h-10 text-amber-600 animate-bounce" />
              <p className="font-display font-bold text-sm text-amber-900">Rilascia il file qui per caricarlo</p>
              <p className="text-[11px] text-gray-500">Immagini, PDF o testi per SpiegaLivelli</p>
            </div>
          )}

          {/* Selected attachment preview state block */}
          {attachedFile && (
            <div className="flex items-center gap-2 mb-3 bg-gray-50 border border-gray-200 p-2.5 rounded-xl max-w-md">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-gray-800 truncate">{attachedFile.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{attachedFile.size} • Pronto all'analisi</p>
              </div>
              <button
                id="remove-attachment-btn"
                onClick={() => setAttachedFile(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200/50 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* User action message input box form container */}
          <div className="max-w-4xl mx-auto flex items-end gap-2.5">
            {/* Context attachment paperclip */}
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf,text/plain"
                className="hidden"
              />
              <button
                id="attach-file-btn"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 hover:border-gray-300 shadow-xs cursor-pointer transition-all flex items-center justify-center ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Carica documento o immagine di un problema"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>

            {/* Input message form block */}
            <div className="flex-1 relative flex items-center">
              <textarea
                id="concept-textarea"
                rows={1}
                disabled={isLoading}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Inserisci un concetto scolastico o allega lo screenshot di un esercizio..."
                className="w-full resize-none bg-gray-50 hover:bg-gray-100/45 focus:bg-white border border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-900 focus:outline-hidden transition-all placeholder:text-gray-450 leading-relaxed font-sans shadow-inner-xs min-h-[46px]"
              />

              {/* Input details inside box */}
              <div className="absolute right-3.5 bottom-2">
                <button
                  id="send-message-btn"
                  onClick={() => handleSend()}
                  disabled={isLoading || (!inputText.trim() && !attachedFile)}
                  className={`p-1.5 rounded-lg text-white transition-all cursor-pointer ${
                    (inputText.trim() || attachedFile) && !isLoading
                      ? theme.primary
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick didactic disclaimer bar footer */}
          <div className="max-w-4xl mx-auto mt-2 flex items-center justify-between text-[11px] text-gray-400 px-1">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-650" />
              <span>Calibrazione: <strong>{currentLevel.toUpperCase()}</strong> • Studio guidato</span>
            </div>
            <span>Premi Invio per inviare • Shift+Invio per andare a capo</span>
          </div>

        </section>
      </main>
    </div>
  );
}
