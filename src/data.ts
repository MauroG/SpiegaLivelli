import { SchoolSubject } from "./types";

export const SUBJECTS: SchoolSubject[] = [
  {
    id: "philosophy",
    name: "Filosofia",
    iconName: "Compass",
    color: "from-purple-500/10 to-purple-600/10 text-purple-700 border-purple-200",
    sampleConcepts: [
      {
        title: "Socrate e l'Ironia",
        prompt: "Spiegami il metodo socratico, in particolare il funzionamento e il senso dell'ironia e della maieutica.",
        description: "Il 'sapere di non sapere' e l'arte di 'partorire' la verità."
      },
      {
        title: "Il Mito della Caverna",
        prompt: "Spiegami l'allegoria della caverna di Platone e il suo significato gnoseologico e politico.",
        description: "Dal buio dell'ignoranza alla luce dell'iperuranio."
      },
      {
        title: "La Critica della Ragion Pura",
        prompt: "Spiegami la Critica della Ragion Pura di Kant: cosa sono i giudizi sintetici a priori e la rivoluzione copernicana?",
        description: "I limiti e le possibilità della conoscenza umana secondo Kant."
      }
    ]
  },
  {
    id: "physics",
    name: "Fisica",
    iconName: "Zap",
    color: "from-amber-500/10 to-amber-600/10 text-amber-700 border-amber-200",
    sampleConcepts: [
      {
        title: "I Principi della Dinamica",
        prompt: "Spiegami i tre principi della dinamica di Newton con esempi pratici.",
        description: "Inerzia, forza e accelerazione, azione e reazione."
      },
      {
        title: "La Relatività Ristretta",
        prompt: "Spiegami i concetti base della Teoria della Relatività Ristretta di Einstein: dilatazione del tempo e contrazione delle lunghezze.",
        description: "Come lo spazio e il tempo cambiano vicino alla velocità della luce."
      },
      {
        title: "L'Entropia e la Termodinamica",
        prompt: "Spiegami il secondo principio della termodinamica e il concetto di Entropia come misura del disordine.",
        description: "Perché il calore si sposta da caldo a freddo e la freccia del tempo."
      }
    ]
  },
  {
    id: "literature",
    name: "Letteratura",
    iconName: "BookOpen",
    color: "from-blue-500/10 to-blue-600/10 text-blue-700 border-blue-200",
    sampleConcepts: [
      {
        title: "Il Decameron e la Peste",
        prompt: "Spiegami l'introduzione e la cornice del Decameron di Boccaccio. Come reagiscono i ragazzi alla peste?",
        description: "La peste di Firenze come disgregazione sociale e la reinvenzione dell'ordine civile."
      },
      {
        title: "La Divina Commedia (Dante)",
        prompt: "Spiegami la struttura del viaggio dantesco e il significato della selva oscura e delle tre fiere nel Canto I dell'Inferno.",
        description: "Il viaggio di redenzione spirituale e allegorico di Dante Alighieri."
      },
      {
        title: "I Promessi Sposi (Manzoni)",
        prompt: "Spiegami il concetto di 'Provvidenzialismo' o 'Provvida Sventura' in Alessandro Manzoni nei Promessi Sposi.",
        description: "Come la fede ed il disegno divino guidano la vicenda di Renzo e Lucia."
      }
    ]
  },
  {
    id: "history",
    name: "Storia",
    iconName: "Globe",
    color: "from-emerald-500/10 to-emerald-600/10 text-emerald-700 border-emerald-200",
    sampleConcepts: [
      {
        title: "La Rivoluzione Francese",
        prompt: "Spiegami le riforme cruciali e le cause profonde che hanno portato allo scoppio della Rivoluzione Francese nel 1789.",
        description: "La fine dell'Antico Regime, gli Stati Generali e la presa della Bastiglia."
      },
      {
        title: "La Guerra Fredda",
        prompt: "Spiegami la nascita del bipolarismo tra USA e URSS e il concetto della Dottrina Truman del contenimento.",
        description: "Le sfere di influenza mondiale e i blocchi geopolitici d'oltreoceano."
      },
      {
        title: "La Caduta di Roma",
        prompt: "Spiegami i fattori principali (interni ed esterni) che condussero alla caduta dell'Impero Romano d'Occidente nel 476 d.C.",
        description: "Le scorrerie barbariche, le fragilità interne e la destituzione di Romolo Augustolo."
      }
    ]
  },
  {
    id: "math",
    name: "Matematica",
    iconName: "Hash",
    color: "from-rose-500/10 to-rose-600/10 text-rose-700 border-rose-200",
    sampleConcepts: [
      {
        title: "Il Teorema di Pitagora",
        prompt: "Spiegami la teoria geometrica dietro il Teorema di Pitagora. Qual è il suo reale senso geometrico (aree dei quadrati dei cateti e dell'ipotenusa)?",
        description: "La relazione fondamentale tra i lati di un triangolo rettangolo."
      },
      {
        title: "Le Equazioni di 2° Grado",
        prompt: "Spiegami da dove deriva la formula risolutiva delle equazioni di secondo grado ax^2 + bx + c = 0 e qual è il significato geometrico del Delta.",
        description: "Lo studio del discriminante e l'intersezione della parabola con l'asse x."
      },
      {
        title: "Che cos'è la Derivata",
        prompt: "Spiegami in modo intuitivo il concetto di Derivata di una funzione come pendenza e come limite del rapporto incrementale.",
        description: "La variazione istantanea di una grandezza e l'approssimazione lineare."
      }
    ]
  },
  {
    id: "science",
    name: "Chimica e Scienze",
    iconName: "FlaskConical",
    color: "from-teal-500/10 to-teal-600/10 text-teal-700 border-teal-200",
    sampleConcepts: [
      {
        title: "La Tavola Periodica",
        prompt: "Spiegami la struttura della Tavola Periodica degli elementi. Cosa indicano i gruppi e i periodi, e cosa rappresenta l'elettronegatività?",
        description: "L'ordinamento sistematico degli elementi in base al numero atomico."
      },
      {
        title: "Il Legame Covalente",
        prompt: "Spiegami come si forma un legame chimico covalente puro e un legame covalente polare, con esempi pratici (come l'acqua).",
        description: "La condivisione di coppie di elettroni per raggiungere l'ottetto stabile."
      },
      {
        title: "La Duplicazione del DNA",
        prompt: "Spiegami come avviene la duplicazione semiconservativa del DNA e il ruolo della DNA polimerasi.",
        description: "La trasmissione fedele dell'informazione genetica cellulare."
      }
    ]
  }
];
