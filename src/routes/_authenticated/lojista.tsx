import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, BellRing, Check, Clock3, LogOut, PackageCheck, Store, X } from "lucide-react";
import { InsightsPanel } from "@/features/merchant/insights-panel";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentProfile } from "@/features/auth/functions";
import {
  decideReservation,
  getMerchantInsights,
  getMerchantReservations,
  setOfferAvailability,
} from "@/features/reservations/functions";
import { catalogQueryOptions } from "@/features/catalog/functions";
import { formatMoney, productImages } from "@/lib/catalog";
import {
  effectiveStatus,
  formatRemaining,
  remainingMilliseconds,
  statusLabels,
  type Reservation,
} from "@/lib/reservations";
import { Brand } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/lojista")({
  loader: async () => {
    const profile = await getCurrentProfile();
    if (profile.role !== "MERCHANT" || !profile.store) throw redirect({ to: "/app" });
    return profile;
  },
  head: () => ({
    meta: [
      { title: "Painel do lojista | Capim Dourado Connect" },
      {
        name: "description",
        content: "Gerencie solicitações, disponibilidade e interesses agregados da sua loja.",
      },
      { property: "og:title", content: "Painel do lojista — Capim Dourado Connect" },
      {
        property: "og:description",
        content: "Receba intenções de compra e confirme disponibilidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MerchantPage,
});

function MerchantPage() {
  const profile = Route.useLoaderData();
  const store = profile.store;
  const [tab, setTab] = useState<"requests" | "confirmed" | "offers" | "insights">("requests");
  const { data: reservations = [] } = useQuery({
    queryKey: ["merchant-reservations"],
    queryFn: () => getMerchantReservations(),
    refetchInterval: 30_000,
  });
  const { data: catalog } = useQuery(catalogQueryOptions);
  const { data: insights } = useQuery({
    queryKey: ["merchant-insights"],
    queryFn: () => getMerchantInsights(),
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  if (!store) return null;
  const pending = reservations.filter((reservation) => effectiveStatus(reservation) === "PENDING");
  const confirmed = reservations.filter(
    (reservation) => effectiveStatus(reservation) === "CONFIRMED",
  );
  const offers =
    catalog?.products.flatMap((product) =>
      product.offers
        .filter((offer) => offer.store_id === store.id)
        .map((offer) => ({ ...offer, product })),
    ) ?? [];
  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    await navigate({ to: "/" });
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <div>
            <Brand to="/lojista" />
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-[0.62rem] font-medium text-primary">
              <Store className="h-3 w-3" />
              {store.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium">{profile.displayName}</p>
              <p className="mt-1 text-[0.62rem] text-muted-foreground">{store.location_label}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair da conta">
              <LogOut />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-primary">Atendimento da loja</p>
            <h1 className="editorial-title mt-2 text-5xl">Painel de reservas</h1>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            Acesso restrito à {store.name}. Atualizações aparecem ao recarregar a consulta.
          </p>
        </div>
        <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Novas solicitações" value={pending.length} icon={BellRing} />
          <Stat label="Reservas confirmadas" value={confirmed.length} icon={PackageCheck} />
          <Stat label="Ofertas da loja" value={offers.length} icon={Store} />
          <Stat label="Pedidos em 7 dias" value={insights?.recent_requests ?? 0} icon={BarChart3} />
        </section>
        <nav
          className="mt-8 flex gap-1 overflow-x-auto rounded-lg bg-surface p-1"
          aria-label="Seções do painel"
        >
          {(["requests", "confirmed", "offers", "insights"] as const).map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setTab(value)}
              className={`h-10 flex-1 whitespace-nowrap rounded-md px-4 text-xs font-medium ${tab === value ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              {value === "requests"
                ? `Solicitações (${pending.length})`
                : value === "confirmed"
                  ? "Confirmadas"
                  : value === "offers"
                    ? "Disponibilidade"
                    : "Insights"}
            </button>
          ))}
        </nav>
        {(tab === "requests" || tab === "confirmed") && (
          <section className="mt-6 space-y-4">
            {(tab === "requests" ? pending : confirmed).length === 0 ? (
              <div className="rounded-lg bg-surface py-16 text-center">
                <Clock3 className="mx-auto h-7 w-7 text-primary" />
                <h2 className="mt-3 font-display text-3xl">Nada aguardando atendimento</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Novas solicitações da sua loja aparecerão aqui.
                </p>
              </div>
            ) : (
              (tab === "requests" ? pending : confirmed).map((reservation) => (
                <MerchantReservation
                  key={reservation.id}
                  reservation={reservation}
                  actionable={tab === "requests"}
                />
              ))
            )}
          </section>
        )}
        {tab === "offers" && (
          <section className="mt-6">
            <div className="mb-5 rounded-lg bg-gold-soft/45 p-4 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Modo manual de confirmação.</strong> Marcar uma
              oferta como indisponível reflete no catálogo compartilhado e recusa automaticamente
              reservas pendentes com essa oferta. Reservas já confirmadas não são canceladas.
              Integração ERP e quota automática: <strong>Em breve</strong>.
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {offers.map((offer) => (
                <OfferAvailability key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        )}
        {tab === "insights" && <InsightsPanel insights={insights} />}
      </main>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Store }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-4 font-display text-4xl">{value}</p>
      <p className="mt-1 text-[0.65rem] text-muted-foreground">{label}</p>
    </div>
  );
}

function MerchantReservation({
  reservation,
  actionable,
}: {
  reservation: Reservation;
  actionable: boolean;
}) {
  const [now, setNow] = useState(Date.now());
  const queryClient = useQueryClient();
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const mutation = useMutation({
    mutationFn: (decision: "CONFIRMED" | "REJECTED") =>
      decideReservation({ data: { reservationId: reservation.id, decision } }),
    onSuccess: (_, decision) => {
      queryClient.invalidateQueries({ queryKey: ["merchant-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-insights"] });
      toast.success(
        decision === "CONFIRMED"
          ? "Disponibilidade confirmada. O cliente recebeu um cupom ilustrativo."
          : "Solicitação recusada.",
      );
    },
    onError: (error) => toast.error(error.message),
  });
  const status = effectiveStatus(reservation, now);
  return (
    <article className="rounded-lg border bg-card p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-lg font-semibold tracking-widest text-primary">
              {reservation.code}
            </span>
            <span className="rounded-full bg-gold-soft px-3 py-1 text-[0.62rem] font-medium text-primary">
              {statusLabels[status]}
            </span>
          </div>
          <p className="mt-3 text-sm font-medium">
            {reservation.customer?.display_name ?? "Cliente"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Grupo #{reservation.group_id.slice(0, 8)} · somente os itens da sua loja
          </p>
          <div className="mt-4 space-y-2">
            {reservation.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-md bg-surface p-3">
                <img
                  src={productImages[item.offer.product.image_key]}
                  alt=""
                  width={912}
                  height={1104}
                  loading="lazy"
                  className="h-12 w-12 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium">
                    {item.quantity}× {item.offer.product.name}
                  </p>
                  <p className="mt-1 text-[0.65rem] text-muted-foreground">
                    Variação {item.selected_option} · {formatMoney(item.unit_price_cents_snapshot)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between gap-5 lg:min-w-52">
          <div>
            <p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">
              Tempo restante
            </p>
            <p className="mt-1 font-mono text-2xl">
              {formatRemaining(reservation.expires_at, now)}
            </p>
            {remainingMilliseconds(reservation.expires_at, now) < 30 * 60 * 1000 && (
              <p className="mt-1 text-xs text-destructive">Menos de 30 minutos</p>
            )}
          </div>
          {actionable && (
            <div className="flex gap-2 lg:flex-col">
              <DecisionDialog
                type="CONFIRMED"
                pending={mutation.isPending}
                onConfirm={() => mutation.mutate("CONFIRMED")}
              />
              <DecisionDialog
                type="REJECTED"
                pending={mutation.isPending}
                onConfirm={() => mutation.mutate("REJECTED")}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function DecisionDialog({
  type,
  pending,
  onConfirm,
}: {
  type: "CONFIRMED" | "REJECTED";
  pending: boolean;
  onConfirm: () => void;
}) {
  const confirming = type === "CONFIRMED";
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={confirming ? "default" : "outline"}
          size="sm"
          className={confirming ? "flex-1" : "flex-1 text-destructive"}
        >
          {confirming ? <Check /> : <X />}
          {confirming ? "Confirmar" : "Recusar"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirming ? "Confirmar disponibilidade?" : "Recusar esta solicitação?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {confirming
              ? "Você confirma a disponibilidade dos itens apresentados para atendimento presencial. O prazo original de 2 horas não será reiniciado."
              : "O cliente verá que a loja não confirmou a disponibilidade. Esta decisão não altera outras lojas do grupo."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className={confirming ? "" : "bg-destructive text-destructive-foreground"}
            onClick={onConfirm}
          >
            {confirming ? "Sim, confirmar" : "Sim, recusar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function OfferAvailability({ offer }: { offer: ReturnType<typeof getOffersForStore>[number] }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (availability: "AVAILABLE" | "UNAVAILABLE") =>
      setOfferAvailability({ data: { offerId: offer.id, availability } }),
    onSuccess: (_, availability) => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-reservations"] });
      toast.success(
        availability === "UNAVAILABLE"
          ? "Oferta indisponível na vitrine; pendentes foram recusadas."
          : "Oferta disponível para novas solicitações.",
      );
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <article className="flex gap-4 rounded-lg border bg-card p-4">
      <img
        src={productImages[offer.product.image_key]}
        alt=""
        width={912}
        height={1104}
        loading="lazy"
        className="h-28 w-24 rounded-md object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">
          {offer.product.brand}
        </p>
        <h2 className="mt-1 text-sm font-medium">{offer.product.name}</h2>
        <p className="mt-1 text-sm font-semibold">{formatMoney(offer.price_cents)}</p>
        <p
          className={`mt-2 text-[0.65rem] ${offer.availability === "UNAVAILABLE" ? "text-destructive" : "text-success"}`}
        >
          {offer.availability === "UNAVAILABLE"
            ? "Indisponível na vitrine"
            : offer.availability === "CHECK_WITH_STORE"
              ? "Consultar disponibilidade"
              : "Disponível sob confirmação"}
        </p>
        {offer.availability === "UNAVAILABLE" ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("AVAILABLE")}
          >
            Disponibilizar
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-3 text-destructive">
                Marcar indisponível
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Alterar disponibilidade?</AlertDialogTitle>
                <AlertDialogDescription>
                  A oferta ficará indisponível para todos os clientes da demonstração. Reservas
                  PENDENTES com este item serão recusadas automaticamente; confirmadas não serão
                  alteradas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground"
                  onClick={() => mutation.mutate("UNAVAILABLE")}
                >
                  Confirmar indisponibilidade
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </article>
  );
}
function getOffersForStore() {
  return [] as {
    id: string;
    price_cents: number;
    availability: "AVAILABLE" | "UNAVAILABLE" | "CHECK_WITH_STORE";
    product: { name: string; brand: string; image_key: string };
  }[];
}
