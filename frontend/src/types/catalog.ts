export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
}

// Firestore Admin renvoie les dates sous la forme { _seconds, _nanoseconds }
export interface FirestoreDate {
  _seconds: number;
  _nanoseconds: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images?: string[];
  ingredients?: string[];
  isAvailable: boolean;
  servesCount: number;
  // null ou absent : stock non suivi
  stock?: number | null;
  createdAt?: FirestoreDate;
}
