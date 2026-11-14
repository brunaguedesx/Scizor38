import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangle, Cat, Check, Clock3, MapPin, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { catalogQueryOptions } from "@/features/catalog/functions";
import { cancelReservation, createReservation, getCustomerReservations, simulateDemoAvailability } from "@/features/reservations/functions";
import { formatMoney, productImages, type Offer, type Product } from "@/lib/catalog";
import { DEMO_RESERVATION_DURATION_SECONDS, demoAvailabilityDelayMs, effectiveStatus, formatRemaining, remainingMilliseconds, statusLabels, type Reservation } from "@/lib/reservations";
import { useCart } from "@/components/app/cart-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function ReservationsPage() {
  const [tab, setTab] = useState<"selected" | "reservations">("selected");
  const [reviewOpen, setReviewOpen] = useState(false);
  const { items, removeItem, updateQuantity, clear } = useCart();
  const { data: catalog } = useSuspenseQuery(catalogQueryOptions);
  const { data: reservations = [] } = useQuery({ queryKey: ["customer-reservations"], queryFn: () => getCustomerReservations(), refetchInterval: 30_000 });
  const queryClient = useQueryClient();
  const idempotencyKey = useRef<string | null>(null);
  const selected = items.flatMap((item) => {
    for (const product of catalog.products) {
      const offer = product.offers.find((entry) => entry.id === item.offerId);
      if (offer) return [{ ...item, offer, product }];
    }
    return [];
  });
  const stores = new Set(selected.map((item) => item.offer.store_id));
  const total = selected.reduce((sum, item) => sum + item.offer.price_cents * item.quantity, 0);
  const mutation = useMutation({
    mutationFn: () => {
      if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
      return createReservation({ data: { items, idempotencyKey: idempotencyKey.current } });
    },
    onSuccess: ({ groupId }) => {
      clear(); idempotencyKey.current = null; setReviewOpen(false); setTab("reservations");
      queryClient.invalidateQueries({ queryKey: ["customer-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["search-demand"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-insights"] });
      toast.success("Solicitação enviada. Cada loja recebeu apenas sua parte.");
      const delayMs = demoAvailabilityDelayMs();
      toast.info(`Uma confirmação de disponibilidade simulada chegará em ${Math.round(delayMs / 1000)} segundos.`);
      window.setTimeout(() => {
        simulateDemoAvailability({ data: { groupId } })
          .then(({ created }) => {
            if (!created) return;
            queryClient.invalidateQueries({ queryKey: ["account"] });
            toast.success("Simulação: a disponibilidade foi confirmada. Veja suas notificações.");
          })
          .catch((error) => toast.error(error.message));
      }, delayMs);
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <p className="eyebrow text-primary">Sua jornada</p><h1 className="editorial-title mt-3 text-5xl sm:text-6xl">Reservas</h1><p className="mt-3 text-sm text-muted-foreground">Da seleção à visita presencial, sem pagamento online.</p>
      <div className="mt-7 grid grid-cols-2 rounded-lg bg-surface p-1"><button type="button" onClick={() => setTab("selected")} className={`h-11 rounded-md text-xs font-medium ${tab === "selected" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Selecionados ({items.length})</button><button type="button" onClick={() => setTab("reservations")} className={`h-11 rounded-md text-xs font-medium ${tab === "reservations" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Minhas reservas ({reservations.length})</button></div>
      {tab === "selected" ? <section className="mt-7">{selected.length === 0 ? <EmptySelection /> : <><div className="space-y-4">{selected.map((item) => <SelectedItem key={item.offerId} item={item} remove={() => removeItem(item.offerId)} update={(quantity) => updateQuantity(item.offerId, quantity)} />)}</div><div className="mt-6 rounded-lg bg-surface p-5"><div className="flex justify-between text-sm"><span>Total ilustrativo</span><strong>{formatMoney(total)}</strong></div><p className="mt-2 text-xs text-muted-foreground">{stores.size} {stores.size === 1 ? "loja receberá" : "lojas receberão"} solicitações independentes. Nenhum valor será cobrado agora.</p><Button className="mt-5 h-12 w-full rounded-full" onClick={() => setReviewOpen(true)} disabled={selected.some((item) => item.offer.availability === "UNAVAILABLE")}>Revisar solicitação<Check /></Button>{selected.some((item) => item.offer.availability === "UNAVAILABLE") && <p className="mt-3 text-center text-xs text-destructive">Remova a oferta indisponível para continuar.</p>}</div></>}</section> : <section className="mt-7 space-y-4">{reservations.length === 0 ? <EmptySelection reservations /> : reservations.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} />)}</section>}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}><DialogContent><DialogHeader><DialogTitle className="editorial-title text-3xl">Confirmar solicitação?</DialogTitle><DialogDescription>Serão criadas {stores.size} {stores.size === 1 ? "reserva" : "reservas"}, uma por loja, todas com validade demonstrativa de {DEMO_RESERVATION_DURATION_SECONDS} segundos. A regra original de 2 horas foi acelerada neste mockup.</DialogDescription></DialogHeader><div className="rounded-lg bg-surface p-4 text-sm"><div className="flex justify-between"><span>{items.length} {items.length === 1 ? "item selecionado" : "itens selecionados"}</span><strong>{formatMoney(total)}</strong></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">A disponibilidade ainda será confirmada pelos lojistas. Não há cobrança online nem garantia automática de estoque.</p></div><DialogFooter><Button variant="outline" onClick={() => setReviewOpen(false)}>Voltar e revisar</Button><Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Enviando…" : "Confirmar solicitação"}</Button></DialogFooter></DialogContent></Dialog>
      <ExpirationCat reservations={reservations} />
    </main>
  );
}

function SelectedItem({ item, remove, update }: { item: { offerId: string; quantity: number; selectedOption: string; offer: Offer; product: Product }; remove: () => void; update: (quantity: number) => void }) {
  return <article className="flex gap-4 rounded-lg border bg-card p-3"><img src={productImages[item.product.image_key]} alt="" width={912} height={1104} loading="lazy" className="h-32 w-24 rounded-md object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">{item.offer.store.name}</p><h2 className="mt-1 text-sm font-medium">{item.product.name}</h2></div><Button variant="ghost" size="icon" onClick={remove} aria-label={`Remover ${item.product.name}`}><Trash2 /></Button></div><p className="mt-1 text-xs text-muted-foreground">Opção: {item.selectedOption}</p><div className="mt-4 flex items-center justify-between"><select aria-label={`Quantidade de ${item.product.name}`} value={item.quantity} onChange={(event) => update(Number(event.target.value))} className="h-8 rounded-md border bg-background px-2 text-xs">{[1,2,3,4,5].map((number) => <option key={number} value={number}>{number} un.</option>)}</select><strong className="text-sm">{formatMoney(item.offer.price_cents * item.quantity)}</strong></div></div></article>;
}

function EmptySelection({ reservations = false }: { reservations?: boolean }) {
  return <div className="rounded-lg bg-surface px-6 py-16 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-4 font-display text-3xl">{reservations ? "Nenhuma reserva ainda" : "Sua seleção está vazia"}</h2><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Explore a vitrine e adicione produtos de uma ou mais lojas.</p><Button asChild className="mt-5 rounded-full"><Link to="/app">Explorar produtos</Link></Button></div>;
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const [now, setNow] = useState(Date.now());
  const queryClient = useQueryClient();
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const status = effectiveStatus(reservation, now);
  const active = (status === "PENDING" || status === "CONFIRMED") && remainingMilliseconds(reservation.expires_at, now) > 0;
  const expiringSoon = active && remainingMilliseconds(reservation.expires_at, now) < 30 * 60 * 1000;
  const cancelMutation = useMutation({ mutationFn: () => cancelReservation({ data: { reservationId: reservation.id } }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customer-reservations"] }); toast.success("Reserva cancelada."); }, onError: (error) => toast.error(error.message) });
  return <article className="rounded-lg border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">Código da loja</p><p className="mt-1 font-mono text-xl font-semibold tracking-[0.15em] text-primary">{reservation.code}</p></div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-medium ${status === "CONFIRMED" ? "bg-success text-success-foreground" : status === "PENDING" ? "bg-gold-soft text-primary" : "bg-muted text-muted-foreground"}`}>{statusLabels[status]}</span></div><div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /><strong className="text-foreground">{reservation.store.name}</strong> · {reservation.store.location_label}</div><div className="mt-4 space-y-2 border-t pt-4">{reservation.items.map((item) => <div key={item.id} className="flex justify-between gap-3 text-xs"><span>{item.quantity}× {item.offer.product.name} · {item.selected_option}</span><span>{formatMoney(item.unit_price_cents_snapshot * item.quantity)}</span></div>)}</div>{active && <div className={`mt-4 flex items-center gap-3 rounded-lg p-3 ${expiringSoon ? "bg-warning text-warning-foreground" : "bg-surface"}`}><Clock3 className="h-5 w-5" /><div><p className="text-xs font-semibold">{remainingMilliseconds(reservation.expires_at, now) <= 20_000 ? "Últimos segundos · demonstração" : expiringSoon ? "Menos de 30 minutos" : "Tempo restante"}</p><p className="mt-0.5 font-mono text-lg">{formatRemaining(reservation.expires_at, now)}</p></div></div>}{status === "REJECTED" && <p className="mt-4 text-xs text-muted-foreground">{reservation.rejection_reason === "UNAVAILABLE" ? "A oferta foi marcada como indisponível pela loja." : "A loja não confirmou esta disponibilidade."}</p>}<div className="mt-4 flex items-center justify-between"><span className="text-[0.65rem] text-muted-foreground">Grupo #{reservation.group_id.slice(0, 8)}</span>{active && <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive"><X />Cancelar</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cancelar esta reserva?</AlertDialogTitle><AlertDialogDescription>Você perderá esta reserva na {reservation.store.name}. Confirmar cancelamento?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Manter reserva</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" disabled={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>Sim, cancelar reserva</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}</div></article>;
}

function ExpirationCat({ reservations }: { reservations: Reservation[] }) {
  const [visible, setVisible] = useState(false);
  const [now, setNow] = useState(Date.now());
  const previouslyActive = useRef<Set<string>>(new Set());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const activeIds = new Set(reservations.filter((reservation) => effectiveStatus(reservation, now) !== "EXPIRED" && (reservation.status === "PENDING" || reservation.status === "CONFIRMED")).map((reservation) => reservation.id));
    const expired = reservations.find((reservation) => previouslyActive.current.has(reservation.id) && effectiveStatus(reservation, now) === "EXPIRED");
    previouslyActive.current = activeIds;
    if (!expired) return;
    const key = `capim-cat-${expired.id}`;
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "seen"); setVisible(true);
  }, [reservations, now]);
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(timer);
  }, [visible]);
  if (!visible) return null;
  return <div className="cat-crossing" role="status" aria-label="Uma reserva expirou"><div className="flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-background shadow-lift"><Cat className="h-7 w-7" /><span className="text-xs">Uma reserva expirou… o gato passou por aqui.</span></div></div>;
}
