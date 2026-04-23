// src/app/features/chat/interfaces/message.ts (пример)
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: string[];
}

export function createMessage(text: string, sender: 'user' | 'bot', buttons?: string[]): Message {
  return {
    id: crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 9),
    text,
    sender,
    timestamp: new Date(),
    buttons,
  };
}
