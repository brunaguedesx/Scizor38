import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MapPin, Navigation, Share2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCustomerReservations } from "@/features/reservations/functions";
import { buildVisit, entrances, validEntrance, type Entrance } from "./model";
import { toast } from "sonner";

const mapNodes: Record<number, { x: number; y: number }> = {
  0: { x: 200, y: 28 },
  1: { x: 82, y: 100 },
  2: { x: 360, y: 150 },
  3: { x: 318, y: 210 },
  4: { x: 200, y: 272 },
  5: { x: 82, y: 210 },
};
const galleryCenter = { x: 200, y: 150 };
function nodePoint(node: number) {
  return mapNodes[node] ?? galleryCenter;
}
const galleryStores = [
  { id: "movida", name: "Movida", node: 1 },
  { id: "casa-aurora", name: "Casa Aurora", node: 5 },
  { id: "essenza", name: "Essenza", node: 3 },
];

export function VisitPage({ initialEntrance }: { initialEntrance?: string | undefined }) {
  const [entrance, setEntrance] = useState<Entrance>(validEntrance(initialEntrance));
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const fromQr = initialEntrance ?? sessionStorage.getItem("capim-entrance");
    setEntrance(validEntrance(fromQr));
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [initialEntrance]);
  const {
    data: reservations = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ["customer-reservations"],
    queryFn: () => getCustomerReservations(),
    refetchInterval: 30_000,
  });
  const route = buildVisit(reservations, entrance, now);

  function select(value: Entrance) {
    setEntrance(value);
    sessionStorage.setItem("capim-entrance", value);
  }

  async function share() {
    const text = `Roteiro ilustrativo — ${entrances.find((e) => e.id === entrance)?.name}: ${route.map((s) => `${s.name} (${s.code})`).join(" → ")}. Não é uma planta real do shopping.`;
    try {
      if (navigator.share)
        await navigator.share({ title: "Minha visita — Capim Dourado Connect", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Roteiro copiado.");
      }
    } catch {
      toast.info("Compartilhamento não concluído.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <p className="eyebrow text-primary">Do digital ao presencial</p>
      <h1 className="editorial-title mt-3 text-5xl">Minha visita</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Rota fictícia · Não use como orientação física no shopping.
      </p>
      <div className="mt-7 flex flex-wrap gap-2" aria-label="Entrada do shopping">
        {entrances.map((entry) => (
          <Button
            key={entry.id}
            variant={entrance === entry.id ? "default" : "outline"}
            className="h-11"
            onClick={() => select(entry.id)}
            aria-pressed={entrance === entry.id}
          >
            <MapPin />
            {entry.name}
          </Button>
        ))}
      </div>

      <section className="mt-7 grid items-start gap-8 md:grid-cols-[1.15fr_0.85fr]">
        <VisitMap entrance={entrance} route={route} />
        <div>
          {error && (
            <p role="alert" className="text-destructive">
              {error.message}
            </p>
          )}
          {isPending ? (
            <p>Carregando reservas…</p>
          ) : route.length === 0 ? (
            <div className="py-8">
              <Navigation className="h-7 w-7 text-primary" />
              <h2 className="mt-3 font-display text-3xl">Nenhuma parada ativa</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Reserve um produto para ver a loja e a ordem sugerida no mapa.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/app">Explorar produtos</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-display text-3xl">Seu caminho</h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Comece na entrada escolhida e siga os números. Os tempos são apenas ilustrativos.
              </p>
              <ol className="mt-5 space-y-5">
                {route.map((stop, index) => (
                  <li key={stop.id} className="flex gap-3 border-b pb-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold">{stop.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {stop.location_label} · {stop.minutes} min ilustrativos
                      </p>
                      <p className="mt-1 text-xs">
                        Código {stop.code} ·{" "}
                        {stop.status === "CONFIRMED" ? "Confirmada" : "Aguardando confirmação"}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button variant="outline" className="mt-5" onClick={share}>
                <Share2 />
                Compartilhar roteiro
              </Button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function VisitMap({
  entrance,
  route,
}: {
  entrance: Entrance;
  route: ReturnType<typeof buildVisit>;
}) {
  const origin = entrances.find((entry) => entry.id === entrance) ?? entrances[0];
  const originPoint = nodePoint(origin.node);
  const routePoints = [
    originPoint,
    ...route.flatMap((stop) => [galleryCenter, nodePoint(stop.node)]),
  ]
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <div className="overflow-hidden rounded-lg border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b bg-card px-4 py-3">
        <div>
          <p className="text-xs font-semibold">Galeria fictícia</p>
          <p className="mt-0.5 text-[0.65rem] text-muted-foreground">Você começa na {origin.name}</p>
        </div>
        <Navigation className="h-5 w-5 text-primary" />
      </div>
      <svg
        viewBox="0 0 400 300"
        className="h-auto w-full"
        role="img"
        aria-label={`Mapa ilustrativo a partir da ${origin.name}, com ${route.length} paradas: ${route.map((stop) => stop.name).join(", ") || "nenhuma"}`}
      >
        <path
          d="M200 28V272M82 100V210M82 100L200 150L360 150M82 210L200 150L318 210L200 272"
          fill="none"
          className="stroke-border"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M200 28V272M82 100V210M82 100L200 150L360 150M82 210L200 150L318 210L200 272"
          fill="none"
          className="stroke-card"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {routePoints && (
          <polyline
            points={routePoints}
            fill="none"
            className="stroke-primary"
            strokeWidth="4"
            strokeDasharray="7 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        <rect x="163" y="132" width="74" height="36" rx="8" className="fill-gold-soft" />
        <text x="200" y="147" textAnchor="middle" className="fill-primary text-[9px] font-semibold">
          PRAÇA
        </text>
        <text x="200" y="159" textAnchor="middle" className="fill-primary text-[9px]">
          CENTRAL
        </text>

        {entrances.map((entry) => {
          const point = nodePoint(entry.node);
          const active = entry.id === entrance;
          return (
            <g key={entry.id}>
              {active && (
                <circle cx={point.x} cy={point.y} r="13" className="fill-background stroke-primary" strokeWidth="2" />
              )}
              <circle cx={point.x} cy={point.y} r="7" className={active ? "fill-primary" : "fill-muted-foreground"} />
              <text
                x={point.x}
                y={entry.node === 4 ? 294 : entry.node === 0 ? 12 : point.y - 17}
                textAnchor="middle"
                className={`text-[9px] font-semibold ${active ? "fill-primary" : "fill-muted-foreground"}`}
              >
                {entry.name.toUpperCase()}
              </text>
            </g>
          );
        })}

        {galleryStores.map((store) => {
          const point = nodePoint(store.node);
          const stopIndex = route.findIndex((stop) => stop.id === store.id);
          const active = stopIndex >= 0;
          return (
            <g key={store.id}>
              <rect
                x={point.x - 62}
                y={point.y - 29}
                width="124"
                height="58"
                rx="10"
                className={active ? "fill-card stroke-primary" : "fill-card stroke-border"}
                strokeWidth={active ? 2 : 1}
              />
              <text x={point.x} y={point.y - 3} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
                {store.name}
              </text>
              <text x={point.x} y={point.y + 14} textAnchor="middle" className="fill-muted-foreground text-[9px]">
                {active ? `PARADA ${stopIndex + 1}` : "SEM PARADA ATIVA"}
              </text>
              {active && (
                <>
                  <circle cx={point.x + 48} cy={point.y - 23} r="12" className="fill-primary" />
                  <text x={point.x + 48} y={point.y - 19} textAnchor="middle" className="fill-primary-foreground text-[10px] font-bold">
                    {stopIndex + 1}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t bg-card px-4 py-3 text-[0.65rem] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-primary" />Entrada atual</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 border-t-2 border-dashed border-primary" />Percurso sugerido</span>
        <span>Números = ordem das lojas</span>
      </div>
    </div>
  );
}
