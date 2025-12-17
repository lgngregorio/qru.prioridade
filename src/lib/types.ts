
import { Timestamp } from 'firebase/firestore';

export interface Note {
  id: string;
  uid: string;
  title: string;
  content: string;
  createdAt: Timestamp; // ISO string
  updatedAt?: Timestamp; // ISO string
}
