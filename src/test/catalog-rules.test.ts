import { describe, expect, it } from "vitest";
import { filterProducts, parseSearch, recommendProducts, type Product } from "@/lib/catalog";

const product = (overrides: Partial<Product> = {}): Product => ({
  id: "tenis-alba",
  name: "Tênis Essencial Branco",
  category: "Calçados",
  brand: "Alba",
  description: "Demonstração",
  image_key: "tenis-branco",
  color: "branco",
  tags: ["tênis", "casual"],
  options: ["38"],
  active: true,
  offers: [],
  ...overrides,
});

describe("Busca estruturada do catálogo", () => {
  it("interpreta tênis branco até 250 reais sem criar atributos fora do catálogo", () => {
    expect(parseSearch("Quero um tênis branco até 250 reais")).toMatchObject({
      text: "tenis",
      category: "Calçados",
      color: "branco",
      priceMax: "250",
    });
  });

  it("retorna somente produtos cadastrados que obedecem todos os filtros", () => {
    const matching = product({ offers: [{ id: "tenis-movida", store_id: "movida", price_cents: 23990 } as Product["offers"][number]] });
    const expensive = product({ id: "outro", name: "Tênis Preto", color: "preto", offers: [{ id: "outro-oferta", store_id: "movida", price_cents: 23990 } as Product["offers"][number]] });
    const result = filterProducts([matching, expensive], parseSearch("tênis branco até R$ 250"));
    expect(result.map((item) => item.id)).toEqual(["tenis-alba"]);
  });

  it("mostra estado vazio para um termo inexistente", () => {
    expect(filterProducts([product()], parseSearch("telefone inexistente"))).toEqual([]);
  });

  it("recomenda por categoria dos favoritos sem incluir o item já favoritado", () => {
    const favorite = product();
    const sameCategory = product({ id: "sandalia", name: "Sandália", offers: [{ id: "oferta" } as Product["offers"][number]] });
    const other = product({ id: "perfume", category: "Beleza", offers: [{ id: "oferta-2" } as Product["offers"][number]] });
    expect(recommendProducts([favorite, other, sameCategory], [favorite.id], []).map((item) => item.id)).toEqual(["sandalia", "perfume"]);
  });
});
