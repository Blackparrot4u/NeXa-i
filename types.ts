
export enum Role {
  User = 'user',
  Model = 'model',
}

export interface Message {
  role: Role;
  content: string;
  timestamp: string;
  image?: string; // Base64 image data
  isThinking?: boolean;
  sources?: { title: string; url: string }[];
}
