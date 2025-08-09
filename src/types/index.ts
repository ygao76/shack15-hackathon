export interface Meeting {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendees: string[];
  description?: string;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
