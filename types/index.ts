export interface Note {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: {
    id: string;
    email: string;
    name: string | null;
  };
  createdAt: string;
  updatedAt: string;
  subscribers?: NoteSubscriber[];
}

export interface NoteSubscriber {
  id: string;
  noteId: string;
  email: string;
  createdAt: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  authorEmail: string;
  authorName?: string;
  subscriberEmails?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  subscriberEmails?: string[];
}

