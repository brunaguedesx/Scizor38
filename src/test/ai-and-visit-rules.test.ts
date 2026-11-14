import { describe, expect, it } from "vitest";
import { demandTrend, isSpiderClick, validateExtraction } from "@/features/ai/contracts";
import { rankBehavior } from "@/features/recommendations/model";
import { buildVisit, entrances, validEntrance } from "@/features/visit/model";
import { emptyFilters, filterProducts, type CatalogData, type Product } from "@/lib/catalog";
import type { Reservation } from "@/lib/reservations";

const product = (id: string, category: string): Product => ({
  id,
  name: id,
  category,
  brand: "Alba",
  color: "branco",
  description: "",
  image_key: "tenis-branco",
  tags: [],
  options: [],
  active: true,
  offers: [
    {
      id,
      availability: "AVAILABLE",
      price_cents: 23990,
      original_price_cents: null,
    } as Product["offers"][number],
  ],
});
const catalog: CatalogData = {
  products: [product("tenis", "Calçados")],
  stores: [{ id: "movida", name: "Movida", location_label: "", active: true }],
};
describe("Extração Gemini segura", () => {
  it("mantém tênis branco e o teto de 250 reais", () => {
    expect(
      validateExtraction(
        {
          text: "tênis",
          category: "Calçados",
          color: "branco",
          priceMin: null,
          priceMax: 250,
          brand: "",
          store: "Movida",
        },
        catalog,
      ),
    ).toMatchObject({ text: "tênis", color: "branco", priceMax: "250", store: "movida" });
  });
  it("não aceita marca, categoria ou loja inventada", () => {
    expect(
      validateExtraction(
        {
          text: "telefone",
          category: "Telefones",
          color: "azul",
          priceMin: null,
          priceMax: null,
          brand: "Fictícia",
          store: "Inexistente",
        },
        catalog,
      ),
    ).toMatchObject({ text: "telefone", category: "", color: "", brand: "", store: "" });
  });
  it("a mesma oferta deve respeitar mínimo e máximo", () => {
    const p = product("p", "Moda");
    p.offers = [10000, 40000].map((price_cents) => ({ price_cents }) as Product["offers"][number]);
    expect(filterProducts([p], { ...emptyFilters, priceMin: "200", priceMax: "300" })).toEqual([]);
  });
});
describe("Comportamento e demanda", () => {
  it("a aranha aparece no clique 13, não antes nem no 14", () => {
    expect(isSpiderClick(12)).toBe(false);
    expect(isSpiderClick(13)).toBe(true);
    expect(isSpiderClick(14)).toBe(false);
  });
  it("exige três sinais em ambos os períodos para tendência", () => {
    expect(demandTrend(10, 2).enough).toBe(false);
    expect(demandTrend(4, 3)).toMatchObject({ enough: true, growing: true, percent: 33 });
  });
  it("usa categoria reservada para ordenar e exclui produtos já reservados", () => {
    const ranked = rankBehavior(
      [product("reservado", "Moda"), product("blusa", "Moda"), product("tenis", "Calçados")],
      [],
      ["reservado"],
    );
    expect(ranked.candidates.map((p) => p.id)).toEqual(["blusa", "tenis"]);
    expect(ranked.candidates[0]?.score).toBe(7);
  });
  it("mantém cartões disponíveis quando todos os produtos novos já foram escolhidos", () => {
    const ranked = rankBehavior([product("camisa", "Moda")], ["camisa"], []);
    expect(ranked.candidates.map((p) => p.id)).toEqual(["camisa"]);
  });
});
describe("Visita ilustrativa", () => {
  const now = Date.parse("2026-11-14T12:00:00Z");
  const r = (store_id: string, expires_at: string): Reservation =>
    ({
      store_id,
      status: "CONFIRMED",
      expires_at,
      code: store_id,
      store: { id: store_id, name: store_id },
    }) as Reservation;
  it("QR reconhece a entrada sul e rejeita entradas desconhecidas", () => {
    expect(validEntrance("sul")).toBe("sul");
    expect(validEntrance("inexistente")).toBe("norte");
  });
  it("ordena a partir da entrada sul e não inclui reserva expirada", () => {
    const stops = buildVisit(
      [
        r("movida", "2026-11-14T14:00:00Z"),
        r("essenza", "2026-11-14T14:00:00Z"),
        r("expirada", "2026-11-14T11:00:00Z"),
      ],
      "sul",
      now,
    );
    expect(stops.map((s) => s.id)).toEqual(["essenza", "movida"]);
  });
  it("Casa Aurora recebe uma parada própria, separada da Entrada Leste", () => {
    const stops = buildVisit([r("casa-aurora", "2026-11-14T14:00:00Z")], "norte", now);
    expect(stops[0]?.node).toBe(5);
    expect(stops[0]?.node).not.toBe(entrances.find((entry) => entry.id === "leste")?.node);
  });
});
