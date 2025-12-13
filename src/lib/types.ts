
export interface Note {
  id: string;
  userEmail: string;
  title: string;
  content: string;
  createdAt: string; // ISO String
  updatedAt?: string; // ISO String
}
