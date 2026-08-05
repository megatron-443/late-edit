import type { Product, ProductCategory } from "./mockData";

/**
 * India HSN + GST classification per product category. Prototype-grade.
 * HSN codes and rates are indicative — real listings must be reviewed by a
 * CA before publication.
 */
const HSN_MAP: Record<ProductCategory, { hsn: string; gst: number; chapter: string }> = {
  Outerwear:  { hsn: "6201", gst: 12, chapter: "Apparel & Clothing" },
  Trousers:   { hsn: "6203", gst: 12, chapter: "Apparel & Clothing" },
  Knitwear:   { hsn: "6110", gst: 12, chapter: "Knitted Apparel" },
  Womenswear: { hsn: "6204", gst: 12, chapter: "Apparel & Clothing" },
  Bags:       { hsn: "4202", gst: 18, chapter: "Leather Goods" },
};

export function getTaxInfo(p: Product) {
  return HSN_MAP[p.category];
}

/** Ateliers that ship LATE EDIT pieces. */
export const ATELIERS = [
  { id: "mumbai", city: "Mumbai", country: "India" },
  { id: "paris", city: "Paris", country: "France" },
  { id: "tokyo", city: "Tokyo", country: "Japan" },
  { id: "new-york", city: "New York", country: "United States" },
] as const;

/**
 * Pincode → serviceability + ETA heuristic. Prototype only; a real integration
 * would call a courier API (Delhivery, Bluedart, DHL Express).
 */
export function estimateDelivery(pincode: string): {
  serviceable: boolean;
  zone: string;
  days: string;
  courier: string;
  origin: string;
} | null {
  const cleaned = pincode.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return null;

  const prefix = Number(cleaned.slice(0, 2));
  // Metro pincodes (Mumbai 400, Delhi 110, Bangalore 560, Chennai 600, Kolkata 700, Hyderabad 500)
  const isMetro = ["40", "11", "56", "60", "70", "50"].includes(cleaned.slice(0, 2));

  if (prefix >= 10 && prefix <= 85) {
    return {
      serviceable: true,
      zone: isMetro ? "Metro" : "Domestic",
      days: isMetro ? "2–3 business days" : "3–5 business days",
      courier: isMetro ? "Bluedart Insured Express" : "Delhivery Signature",
      origin: "Mumbai atelier",
    };
  }
  return { serviceable: false, zone: "Unserviced", days: "—", courier: "—", origin: "Mumbai atelier" };
}

/** Accepted payment methods, monochrome text badges. */
export const PAYMENT_METHODS = [
  { id: "upi", label: "UPI" },
  { id: "razorpay", label: "Razorpay" },
  { id: "visa", label: "Visa" },
  { id: "mastercard", label: "Mastercard" },
  { id: "amex", label: "Amex" },
  { id: "cod", label: "COD" },
] as const;
