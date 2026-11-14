import { z } from "zod";
import {
  categories,
  emptyFilters,
  normalizeText,
  type CatalogData,
  type SearchFilters,
} from "@/lib/catalog";

export const GEMINI_MODEL = "google/gemini-3.1-flash-lite";
export const extractionSchema = z.object({
  text: z.string(),
  category: z.string(),
  color: z.string(),
  priceMin: z.number().nullable(),
  priceMax: z.number().nullable(),
  brand: z.string(),
  store: z.string(),
});
export const analysisSchema = z.object({
  summary: z.string(),
  productIds: z.array(z.string()),
  opportunities: z.array(z.string()),
});
export type Extraction = z.infer<typeof extractionSchema>;

/** Only catalog-owned values can become facet filters; free text never becomes SQL. */
export function validateExtraction(raw: Extraction, catalog: CatalogData): SearchFilters {
  const allowed = (value: string, values: string[]) =>
    values.find((item) => normalizeText(item) === normalizeText(value)) ?? "";
  const price = (value: number | null) =>
    value !== null && Number.isFinite(value) && value >= 0 && value <= 1_000_000
      ? String(value)
      : "";
  const store = catalog.stores.find(
    (item) => item.id === raw.store || normalizeText(item.name) === normalizeText(raw.store),
  );
  const result = {
    ...emptyFilters,
    text: raw.text.trim().slice(0, 240),
    category: allowed(raw.category, categories),
    color: allowed(
      raw.color,
      catalog.products.map((p) => p.color),
    ),
    brand: allowed(
      raw.brand,
      catalog.products.map((p) => p.brand),
    ),
    store: store?.id ?? "",
    priceMin: price(raw.priceMin),
    priceMax: price(raw.priceMax),
  };
  if (result.priceMin && result.priceMax && Number(result.priceMin) > Number(result.priceMax))
    throw new Error("O preço mínimo deve ser menor que o máximo.");
  return result;
}

export function isSpiderClick(clicks: number) {
  return clicks === 13;
}
export function demandTrend(recent: number, previous: number) {
  if (recent < 3 || previous < 3) return { enough: false, growing: false, percent: null };
  return {
    enough: true,
    growing: recent > previous * 1.2,
    percent: Math.round(((recent - previous) / previous) * 100),
  };
}
