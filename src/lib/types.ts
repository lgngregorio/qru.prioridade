
export interface Note {
  id: string;
  uid: string;
  title: string;
  content: string;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
}
