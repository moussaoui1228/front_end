export type UserRole = "buyer" | "producer" | "none";

export type PaymentMethod = "money" | "oil_percentage";

export type RequestStatus =
  | "pending"
  | "accepted"
  | "processing"
  | "completed"
  | "rejected";

export interface ProducerProfile {
  id: string;
  name: string;
  location: string;
  avatar: string;
  conversionRate: number; // kg olives per 1 liter oil
  processingPricePerKg: number; // DA per kg
  oilPercentageOptions: number[]; // e.g. [20, 25, 30]
  rating: number;
  totalProcessed: number; // total kg processed
  description: string;
}

export interface ProcessingRequest {
  id: string;
  clientName: string;
  clientAvatar: string;
  producerId: string;
  producerName: string;
  oliveQuantityKg: number;
  paymentMethod: PaymentMethod;
  oilPercentage?: number; // used when paymentMethod is oil_percentage
  expectedOilOutput: number; // liters
  producerShare: number; // liters or DA depending on payment method
  clientFinalOil: number; // liters
  totalCost?: number; // DA, used when paymentMethod is money
  status: RequestStatus;
  createdAt: string;
}

export interface CalculationResult {
  expectedOilOutput: number;
  producerShare: number;
  clientFinalOil: number;
  totalCost?: number;
}
