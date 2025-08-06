export interface Product {
  id?: string; // Opcional porque Firestore lo genera
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt?: Date;
}