// Modèle de précommande partagé (boutique + administration).
// Identique au document Firestore écrit par backend/services/orderService.js.

export type OrderStatus =
  | "PENDING"
  | "AWAITING_CUSTOMER_SELECTION"
  | "CONFIRMED"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "CASH_ON_PICKUP" | "PAID" | "FAILED";

export type PaymentMethod = "CASH" | "PAYPAL";

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PickupSlot {
  id: string;
  date: string; // AAAA-MM-JJ
  startTime: string; // HH:MM
  endTime: string;
}

export interface OrderHistoryEntry {
  at: string;
  type: string;
  message: string;
  actor: "client" | "admin" | "system";
  visibility?: "all" | "admin";
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  // Absent côté client tant que la précommande n'est pas validée
  pickupCode?: string;
  userId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  payment: { method: PaymentMethod; status: PaymentStatus; transactionId: string | null; amount: number; paidAt: string } | null;
  requestedPickupDate: string;
  proposedSlots: PickupSlot[];
  selectedSlot: PickupSlot | null;
  customerNote: string;
  adminMessage: string;
  cancellationReason: string;
  createdAt: string;
  confirmedAt: string | null;
  slotSelectedAt: string | null;
  readyAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  // Champs réservés à l'administration
  completedBy?: { uid: string; email: string };
  confirmedBy?: { uid: string; email: string };
  cancelledBy?: { uid: string; email: string };
  history: OrderHistoryEntry[];
}

export interface ShopConfig {
  currency: string;
  maxQuantityPerItem: number;
  minLeadDays: number;
  maxLeadDays: number;
  earliestPickupDate: string;
  latestPickupDate: string;
  defaultSlotTimes: [string, string][];
  paypalEnabled: boolean;
  paypalMode: "sandbox" | "live";
}

export interface PreOrderPayload {
  items: { productId: string; quantity: number }[];
  customer: { firstName: string; lastName: string; phone: string };
  requestedPickupDate: string;
  customerNote: string;
}
