import tenisBranco from "@/assets/products/tenis-branco.jpg";
import bolsaCaramelo from "@/assets/products/bolsa-caramelo.jpg";
import camisaLinho from "@/assets/products/camisa-linho.jpg";
import relogioDourado from "@/assets/products/relogio-dourado.jpg";
import fonePreto from "@/assets/products/fone-preto.jpg";
import oculosSol from "@/assets/products/oculos-sol.jpg";
import vestidoTerracota from "@/assets/products/vestido-terracota.jpg";
import perfumeAmbar from "@/assets/products/perfume-ambar.jpg";

export const productImages: Record<string, string> = {
  "tenis-branco": tenisBranco,
  "bolsa-caramelo": bolsaCaramelo,
  "camisa-linho": camisaLinho,
  "relogio-dourado": relogioDourado,
  "fone-preto": fonePreto,
  "oculos-sol": oculosSol,
  "vestido-terracota": vestidoTerracota,
  "perfume-ambar": perfumeAmbar,
};

export type Availability = "AVAILABLE" | "UNAVAILABLE" | "CHECK_WITH_STORE";

export interface Store {
  id: string;
  name: string;
  location_label: string;
  active: boolean;
}

export interface Offer {
  id: string;
  product_id: string;
  store_id: string;
  price_cents: number;
  original_price_cents: number | null;
  availability: Availability;
  stock_mode: string;
  updated_at: string;
  store: Store;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  image_key: string;
  color: string;
  tags: string[];
  options: string[];
  active: boolean;
  offers: Offer[];
}

export interface CatalogData {
  stores: Store[];
  products: Product[];
}

export interface SearchFilters {
  text: string;
  category: string;
  color: string;
  priceMin: string;
  priceMax: string;
  brand: string;
  store: string;
}

export const emptyFilters: SearchFilters = {
  text: "",
  category: "",
  color: "",
  priceMin: "",
  priceMax: "",
  brand: "",
  store: "",
};

export const categories = ["Moda", "Calçados", "Acessórios", "Tecnologia", "Beleza"];

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parsePrice(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1_000_000 ? String(parsed) : "";
}

export function parseSearch(input: string, brands: string[] = [], stores: Store[] = []): SearchFilters {
  const normalized = normalizeText(input).slice(0, 240);
  const result = { ...emptyFilters };
  const categoryTerms: Record<string, string[]> = {
    Calçados: ["calcado", "calcados", "tenis", "sapato", "sandalia"],
    Moda: ["moda", "roupa", "camisa", "vestido", "blusa"],
    Acessórios: ["acessorio", "acessorios", "bolsa", "relogio", "oculos"],
    Tecnologia: ["tecnologia", "fone", "bluetooth", "eletronico"],
    Beleza: ["beleza", "perfume", "fragrancia"],
  };
  for (const [category, terms] of Object.entries(categoryTerms)) {
    if (terms.some((term) => normalized.includes(term))) {
      result.category = category;
      break;
    }
  }
  const productTerms = ["tenis", "camisa", "vestido", "bolsa", "relogio", "fone", "oculos", "perfume"];
  result.text = productTerms.find((term) => normalized.includes(term)) ?? "";
  const colors = ["branco", "preto", "verde", "caramelo", "dourado", "marrom", "terracota", "ambar"];
  result.color = colors.find((color) => normalized.includes(color)) ?? "";
  const maxMatch = normalized.match(/(?:ate|no maximo|maximo|por menos de)\s*(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/);
  const minMatch = normalized.match(/(?:a partir de|minimo|acima de)\s*(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/);
  if (maxMatch?.[1]) result.priceMax = parsePrice(maxMatch[1]);
  if (minMatch?.[1]) result.priceMin = parsePrice(minMatch[1]);
  result.brand = brands.find((brand) => normalized.includes(normalizeText(brand))) ?? "";
  result.store = stores.find((store) => normalized.includes(normalizeText(store.name)))?.id ?? "";
  return result;
}

export function filterProducts(products: Product[], filters: SearchFilters) {
  const text = normalizeText(filters.text);
  const color = normalizeText(filters.color);
  const min = filters.priceMin === "" ? null : Number(filters.priceMin) * 100;
  const max = filters.priceMax === "" ? null : Number(filters.priceMax) * 100;
  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.brand && product.brand !== filters.brand) return false;
    if (color && normalizeText(product.color) !== color) return false;
    if (text) {
      const haystack = normalizeText([product.name, product.brand, product.category, product.color, ...product.tags].join(" "));
      if (!haystack.includes(text)) return false;
    }
    const relevantOffers = filters.store ? product.offers.filter((offer) => offer.store_id === filters.store) : product.offers;
    if (filters.store && relevantOffers.length === 0) return false;
    if ((min !== null || max !== null) && !relevantOffers.some((offer) => (min === null || offer.price_cents >= min) && (max === null || offer.price_cents <= max))) return false;
    return true;
  });
}

export function getLowestOffer(product: Product) {
  return [...product.offers].sort((a, b) => {
    const aUnavailable = a.availability === "UNAVAILABLE" ? 1 : 0;
    const bUnavailable = b.availability === "UNAVAILABLE" ? 1 : 0;
    return aUnavailable - bUnavailable || a.price_cents - b.price_cents;
  })[0];
}

export function recommendProducts(products: Product[], favoriteIds: string[], reservedProductIds: string[]) {
  const favorites = products.filter((product) => favoriteIds.includes(product.id));
  const excluded = new Set([...favoriteIds, ...reservedProductIds]);
  return products
    .filter((product) => !excluded.has(product.id) && product.offers.some((offer) => offer.availability !== "UNAVAILABLE"))
    .map((product) => ({
      product,
      score:
        (favorites.some((favorite) => favorite.category === product.category) ? 3 : 0) +
        (favorites.some((favorite) => favorite.brand === product.brand) ? 1 : 0) +
        (product.offers.some((offer) => offer.original_price_cents !== null) ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, 3)
    .map(({ product }) => product);
}
