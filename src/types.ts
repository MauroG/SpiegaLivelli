export type Level = "biennio" | "triennio" | "maturita";

export interface FileAttachment {
  name: string;
  type: string;
  size?: string;
  url?: string;
  base64?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  level: Level;
  timestamp: Date;
  attachment?: FileAttachment;
}

export interface ConceptSample {
  title: string;
  prompt: string;
  description: string;
}

export interface SchoolSubject {
  id: string;
  name: string;
  iconName: string; // Dynamic Lucide icon key
  color: string;
  sampleConcepts: ConceptSample[];
}
