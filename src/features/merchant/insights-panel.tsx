import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeOpportunities, getSearchDemand } from "@/features/ai/ai.functions";
import { demandTrend } from "@/features/ai/contracts";
import type { MerchantInsights } from "@/features/reservations/functions";

export function InsightsPanel({ insights }: { insights: MerchantInsights | undefined }) {
  const demand = useQuery({
    queryKey: ["search-demand"],
    queryFn: () => getSearchDemand(),
    refetchInterval: 30_000,
  });
  const analyze = useServerFn(analyzeOpportunities);
  const mutation = useMutation({ mutationFn: () => analyze() });
  const trend = demandTrend(demand.data?.recent_searches ?? 0, demand.data?.previous_searches ?? 0);
  const reservationTrend = demandTrend(
    insights?.recent_requests ?? 0,
    insights?.previous_requests ?? 0,
  );

  return (
    <section className="mt-7 space-y-8" aria-label="Insights da loja">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">Interações reais da demonstração · agregadas por loja</p>
          <h2 className="editorial-title mt-2 text-4xl">Radar de oportunidades</h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Pesquisas, clientes distintos, favoritos e reservas alimentam estes números. O lojista
            recebe somente totais da própria loja, nunca nomes, contatos ou frases de clientes.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Atualizar insights"
          onClick={() => demand.refetch()}
        >
          <RefreshCw />
        </Button>
      </div>
      {demand.error && (
        <p role="alert" className="text-sm text-destructive">
          {demand.error.message}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Pesquisas com itens da loja", value: demand.data?.recent_searches ?? 0 },
          { label: "Clientes com interesse", value: demand.data?.interested_customers ?? 0 },
          { label: "Solicitações recentes", value: insights?.recent_requests ?? 0 },
          {
            label: "Favoritos agregados",
            value: demand.data?.products.reduce((total, product) => total + product.favorites, 0) ?? 0,
          },
        ].map((stat) => (
          <article key={stat.label} className="rounded-lg border bg-card p-4">
            <strong className="font-display text-4xl">{stat.value}</strong>
            <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
          </article>
        ))}
      </div>
      <div className="border-y py-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">
            {!trend.enough
              ? "Dados insuficientes para tendência de pesquisas"
              : trend.growing
                ? `Demanda em crescimento: +${trend.percent}%`
                : `Variação de pesquisas: ${trend.percent}%`}
          </h3>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {!reservationTrend.enough
            ? "Reservas: amostra insuficiente nos dois períodos."
            : `Reservas: variação de ${reservationTrend.percent}% entre os períodos.`}
        </p>
      </div>
      <div>
        <h3 className="font-display text-3xl">Produtos no radar</h3>
        <div className="mt-4 divide-y">
          {demand.data?.products.map((product) => (
            <article key={product.product_id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto]">
              <div>
                <h4 className="text-sm font-semibold">{product.name}</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.interested_customers} clientes · {product.searches} pesquisas · {product.favorites} favoritos · {product.requests} solicitações · {product.confirmed_requests} confirmadas
                </p>
                {product.last_searched_at && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Última pesquisa: {new Date(product.last_searched_at).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
              <p
                className={`text-xs sm:max-w-64 ${product.availability === "UNAVAILABLE" && product.searches > 0 ? "text-destructive" : "text-primary"}`}
              >
                {product.availability === "UNAVAILABLE" && product.searches > 0
                  ? "Há interesse, mas a oferta está indisponível. Revise a disponibilidade."
                  : product.searches > 0 && product.requests === 0
                    ? "Pesquisado sem solicitações recentes. Revise preço e apresentação."
                    : product.favorites > 0
                      ? "Interesse salvo: prepare o atendimento presencial."
                      : "Aguardando novos sinais de interesse."}
              </p>
            </article>
          ))}
        </div>
        {demand.isPending && <LoaderCircle className="animate-spin text-primary" />}
      </div>
      <div className="border-t pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-3xl">Análise CapimAI</h3>
          <Button
            variant="outline"
            disabled={mutation.isPending || !demand.data}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
            Analisar oportunidades
          </Button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Ao analisar, a CapimAI recebe as contagens reais acima, incluindo clientes distintos,
          favoritos, solicitações e confirmações. Nenhuma identidade ou frase de cliente é enviada.
        </p>
        {mutation.error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {mutation.error.message}
          </p>
        )}
        {mutation.data && (
          <div className="mt-5">
            <p className="text-sm leading-relaxed">{mutation.data.summary}</p>
            <ul className="mt-4 space-y-3">
              {mutation.data.opportunities.slice(0, 3).map((item, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                  {item.slice(0, 400)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
