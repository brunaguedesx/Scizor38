import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  Footprints,
  Headphones,
  LayoutGrid,
  Search,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Watch,
} from "lucide-react";
import { catalogQueryOptions } from "@/features/catalog/functions";
import { getFavoriteIds } from "@/features/account/functions";
import { getCustomerReservations } from "@/features/reservations/functions";
import { categories, emptyFilters, filterProducts, type SearchFilters } from "@/lib/catalog";
import { SearchPanel, AppliedFilters } from "@/features/ai/search-panel";
import { RecommendationsSection } from "@/features/recommendations/recommendations-section";
import { ProductCard } from "@/components/app/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated/app/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  head: () => ({
    meta: [
      { title: "Vitrine digital | Capim Dourado Connect" },
      {
        name: "description",
        content: "Busque, filtre e favorite produtos demonstrativos das lojas participantes.",
      },
      { property: "og:title", content: "Vitrine digital — Capim Dourado Connect" },
      {
        property: "og:description",
        content: "Encontre o que procura e reserve para experimentar na loja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogPage,
});

const categoryIcons: Record<string, typeof Shirt> = {
  Moda: Shirt,
  Calçados: Footprints,
  Acessórios: Watch,
  Tecnologia: Headphones,
  Beleza: Sparkles,
};

function CatalogPage() {
  const { data } = useSuspenseQuery(catalogQueryOptions);
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => getFavoriteIds(),
  });
  const { data: reservations = [] } = useQuery({
    queryKey: ["customer-reservations"],
    queryFn: () => getCustomerReservations(),
  });
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
  const filtered = useMemo(() => filterProducts(data.products, filters), [data.products, filters]);
  const brands = [...new Set(data.products.map((product) => product.brand))].sort();
  const reservedIds = reservations
    .filter((r) => r.status !== "CANCELLED" && r.status !== "REJECTED")
    .flatMap((reservation) => reservation.items.map((item) => item.offer.product_id));
  function updateFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
      <section>
        <p className="eyebrow text-primary">Vitrine digital</p>
        <h1 className="editorial-title mt-3 text-5xl sm:text-6xl">Encontre o que procura.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Explore produtos das lojas do shopping.
        </p>
      </section>
      <SearchPanel onResult={setFilters} />
      <AppliedFilters filters={filters} stores={data.stores} />
      <div className="mt-8 flex gap-3 overflow-x-auto pb-3" aria-label="Categorias">
        <CategoryButton
          label="Todos"
          icon={LayoutGrid}
          active={!filters.category}
          onClick={() => updateFilter("category", "")}
        />
        {categories.map((category) => (
          <CategoryButton
            key={category}
            label={category}
            icon={categoryIcons[category] ?? Sparkles}
            active={filters.category === category}
            onClick={() => updateFilter("category", filters.category === category ? "" : category)}
          />
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "produto" : "produtos"}
        </p>
        <FilterSheet
          filters={filters}
          updateFilter={updateFilter}
          count={filtered.length}
          brands={brands}
          stores={data.stores}
          clear={() => setFilters(emptyFilters)}
        />
      </div>
      {filtered.length > 0 ? (
        <section
          className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4"
          aria-label="Produtos encontrados"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <div className="mt-8 rounded-lg bg-surface px-6 py-16 text-center">
          <Search className="mx-auto h-7 w-7 text-primary" />
          <h2 className="mt-4 font-display text-3xl">Nenhum item disponível com estes critérios</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Não criamos resultados fictícios. Tente remover cor ou faixa de preço.
          </p>
          <Button
            variant="outline"
            className="mt-5 rounded-full"
            onClick={() =>
              setFilters((current) => ({ ...current, color: "", priceMin: "", priceMax: "" }))
            }
          >
            Remover cor e preço
          </Button>
        </div>
      )}
      <RecommendationsSection
        products={data.products}
        favoriteIds={favorites}
        reservedIds={reservedIds}
      />
      <div className="mt-14 rounded-lg bg-surface p-4 text-center text-xs text-muted-foreground">
        Reserve online. Compre na loja. Disponibilidade sujeita à confirmação da loja.
      </div>
    </main>
  );
}

function CategoryButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof Shirt;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring flex shrink-0 flex-col items-center gap-2 text-[0.65rem] font-medium"
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "bg-surface text-foreground"}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className={active ? "text-primary" : "text-muted-foreground"}>{label}</span>
    </button>
  );
}

function FilterSheet({
  filters,
  updateFilter,
  count,
  brands,
  stores,
  clear,
}: {
  filters: SearchFilters;
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  count: number;
  brands: string[];
  stores: { id: string; name: string }[];
  clear: () => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <SlidersHorizontal />
          Filtros
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="editorial-title text-3xl">Refine sua busca</SheetTitle>
          <SheetDescription>
            Combine filtros para encontrar exatamente o que deseja.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <LabelTitle>Categoria</LabelTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() =>
                    updateFilter("category", filters.category === category ? "" : category)
                  }
                  className={`rounded-full border px-3 py-2 text-xs ${filters.category === category ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <FilterSelect
            label="Marca"
            value={filters.brand}
            onChange={(value) => updateFilter("brand", value)}
            options={brands.map((brand) => ({ value: brand, label: brand }))}
          />
          <FilterSelect
            label="Loja"
            value={filters.store}
            onChange={(value) => updateFilter("store", value)}
            options={stores.map((store) => ({ value: store.id, label: store.name }))}
          />
          <div>
            <LabelTitle>Faixa de preço (R$)</LabelTitle>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input
                type="number"
                min="0"
                placeholder="Mínimo"
                value={filters.priceMin}
                onChange={(event) => updateFilter("priceMin", event.target.value)}
              />
              <Input
                type="number"
                min="0"
                placeholder="Máximo"
                value={filters.priceMax}
                onChange={(event) => updateFilter("priceMax", event.target.value)}
              />
            </div>
          </div>
          <FilterSelect
            label="Cor"
            value={filters.color}
            onChange={(value) => updateFilter("color", value)}
            options={[
              "branco",
              "preto",
              "verde",
              "caramelo",
              "dourado",
              "marrom",
              "terracota",
              "âmbar",
            ].map((color) => ({ value: color, label: color[0]?.toUpperCase() + color.slice(1) }))}
          />
        </div>
        <SheetFooter className="mt-8 flex-col gap-2 sm:flex-col">
          <SheetClose asChild>
            <Button className="h-11 w-full rounded-full">
              Ver {count} {count === 1 ? "produto" : "produtos"}
            </Button>
          </SheetClose>
          <Button variant="ghost" className="w-full" onClick={clear}>
            Limpar filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
function LabelTitle({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
      >
        <option value="">Todas</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
