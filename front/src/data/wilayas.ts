export interface Wilaya {
  code: number;
  name: string;
  shipping: number;
}

export const wilayas: Wilaya[] = [
  { code: 1, name: "Adrar", shipping: 1200 },
  { code: 2, name: "Chlef", shipping: 600 },
  { code: 3, name: "Laghouat", shipping: 900 },
  { code: 4, name: "Oum El Bouaghi", shipping: 700 },
  { code: 5, name: "Batna", shipping: 700 },
  { code: 6, name: "Béjaïa", shipping: 400 },
  { code: 7, name: "Biskra", shipping: 800 },
  { code: 8, name: "Béchar", shipping: 1200 },
  { code: 9, name: "Blida", shipping: 500 },
  { code: 10, name: "Bouira", shipping: 400 },
  { code: 11, name: "Tamanrasset", shipping: 1500 },
  { code: 12, name: "Tébessa", shipping: 800 },
  { code: 13, name: "Tlemcen", shipping: 800 },
  { code: 14, name: "Tiaret", shipping: 700 },
  { code: 15, name: "Tizi Ouzou", shipping: 300 },
  { code: 16, name: "Alger", shipping: 500 },
  { code: 17, name: "Djelfa", shipping: 800 },
  { code: 18, name: "Jijel", shipping: 500 },
  { code: 19, name: "Sétif", shipping: 600 },
  { code: 20, name: "Saïda", shipping: 800 },
  { code: 21, name: "Skikda", shipping: 600 },
  { code: 22, name: "Sidi Bel Abbès", shipping: 800 },
  { code: 23, name: "Annaba", shipping: 700 },
  { code: 24, name: "Guelma", shipping: 700 },
  { code: 25, name: "Constantine", shipping: 600 },
  { code: 26, name: "Médéa", shipping: 500 },
  { code: 27, name: "Mostaganem", shipping: 700 },
  { code: 28, name: "M'Sila", shipping: 700 },
  { code: 29, name: "Mascara", shipping: 700 },
  { code: 30, name: "Ouargla", shipping: 1000 },
  { code: 31, name: "Oran", shipping: 700 },
  { code: 32, name: "El Bayadh", shipping: 1000 },
  { code: 33, name: "Illizi", shipping: 1500 },
  { code: 34, name: "Bordj Bou Arréridj", shipping: 600 },
  { code: 35, name: "Boumerdès", shipping: 400 },
  { code: 36, name: "El Tarf", shipping: 700 },
  { code: 37, name: "Tindouf", shipping: 1500 },
  { code: 38, name: "Tissemsilt", shipping: 700 },
  { code: 39, name: "El Oued", shipping: 900 },
  { code: 40, name: "Khenchela", shipping: 800 },
  { code: 41, name: "Souk Ahras", shipping: 700 },
  { code: 42, name: "Tipaza", shipping: 500 },
  { code: 43, name: "Mila", shipping: 600 },
  { code: 44, name: "Aïn Defla", shipping: 600 },
  { code: 45, name: "Naâma", shipping: 1000 },
  { code: 46, name: "Aïn Témouchent", shipping: 800 },
  { code: 47, name: "Ghardaïa", shipping: 1000 },
  { code: 48, name: "Relizane", shipping: 700 },
  { code: 49, name: "El M'Ghair", shipping: 1000 },
  { code: 50, name: "El Meniaa", shipping: 1200 },
  { code: 51, name: "Ouled Djellal", shipping: 900 },
  { code: 52, name: "Bordj Badji Mokhtar", shipping: 1500 },
  { code: 53, name: "Béni Abbès", shipping: 1200 },
  { code: 54, name: "Timimoun", shipping: 1500 },
  { code: 55, name: "Touggourt", shipping: 1000 },
  { code: 56, name: "Djanet", shipping: 1500 },
  { code: 57, name: "In Salah", shipping: 1500 },
  { code: 58, name: "In Guezzam", shipping: 1500 },
];

import { OilQualityEnum } from "@/types/models";

export interface OilType {
  id: string;
  name: string;
  quality_name: OilQualityEnum; // Added for DB matching
  description: string;
  pricePerLiter: number;
  conversionRate: number; // kg olives per 1 liter
  processingPricePerKg: number; // DA per kg for pressing service
}

export const oilTypes: OilType[] = [
  {
    id: "extra-vierge",
    name: "Extra Vierge",
    quality_name: "extra_virgin",
    description: "Première pression à froid, qualité supérieure",
    pricePerLiter: 2500,
    conversionRate: 5,
    processingPricePerKg: 40,
  },
  {
    id: "vierge",
    name: "Vierge",
    quality_name: "virgin",
    description: "Pressée à froid, bon équilibre qualité-prix",
    pricePerLiter: 1800,
    conversionRate: 4.5,
    processingPricePerKg: 35,
  },
  {
    id: "courante",
    name: "Courante",
    quality_name: "third_quality",
    description: "Huile raffinée, usage quotidien",
    pricePerLiter: 1200,
    conversionRate: 4,
    processingPricePerKg: 30,
  },
];

export const buyQuantities = ["1L", "2L", "5L", "10L"] as const;

export const oilPercentageOptions = [20, 25, 30] as const;
