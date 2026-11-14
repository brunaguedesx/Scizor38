import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/app/product-card";
import { Button } from "@/components/ui/button";
import { getAiConsent, predictInterests } from "@/features/ai/ai.functions";
import { rankBehavior } from "./model";
import type { Product } from "@/lib/catalog";

export function RecommendationsSection({
  products,
  favoriteIds,
  reservedIds,
}: {
  products: Product[];
  favoriteIds: string[];
  reservedIds: string[];
}) {
  const predict = useServerFn(predictInterests);
  const { data: consent } = useQuery({ queryKey: ["ai-consent"], queryFn: () => getAiConsent() });
  const mutation = useMutation({ mutationFn: () => predict() });
  const ranked = rankBehavior(products, favoriteIds, reservedIds);
  const ids = mutation.data?.productIds.length
    ? mutation.data.productIds
    : ranked.candidates.slice(0, 3).map((product) => product.id);
  const recommendations = ids.flatMap((id) => {
    const product = products.find((item) => item.id === id);
    return product ? [product] : [];
  });

  return (
    <section className="mt-14 border-t pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">
            {mutation.data ? "Seleção da CapimAI" : "Seus interesses"}
          </p>
          <h2 className="editorial-title mt-2 text-4xl">Produtos que podem combinar com você</h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
            {mutation.data
              ? "A CapimAI escolheu estes cartões somente entre produtos existentes no catálogo."
              : "Sugestões iniciais por categoria, marca e reservas. Analise com CapimAI para refinar a seleção."}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!consent || !ranked.hasSignals || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
          Analisar com CapimAI
        </Button>
      </div>
      {mutation.error && (
        <p className="mt-3 text-xs text-destructive" role="alert">
          {mutation.error.message}
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {mutation.data && (
        <details className="mt-6 rounded-lg bg-surface p-4 text-sm">
          <summary className="cursor-pointer font-medium">Por que estes produtos?</summary>
          <p className="mt-3 leading-relaxed text-muted-foreground">{mutation.data.summary}</p>
        </details>
      )}
    </section>
  );
}
