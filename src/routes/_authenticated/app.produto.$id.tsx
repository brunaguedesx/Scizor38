import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Heart, MapPin, Minus, Plus, ShieldCheck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { catalogQueryOptions } from "@/features/catalog/functions";
import { getFavoriteIds, toggleFavorite } from "@/features/account/functions";
import { formatMoney, productImages } from "@/lib/catalog";
import { useCart } from "@/components/app/cart-context";
import { ProductCard } from "@/components/app/product-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/produto/$id")({
  loader: async ({ context, params }) => {
    const catalog = await context.queryClient.ensureQueryData(catalogQueryOptions);
    if (!catalog.products.some((product) => product.id === params.id)) throw notFound();
  },
  head: () => ({ meta: [
    { title: "Detalhes e comparativo | Capim Dourado Connect" },
    { name: "description", content: "Compare preços e disponibilidade por loja e adicione produtos à sua reserva." },
    { property: "og:title", content: "Compare ofertas — Capim Dourado Connect" },
    { property: "og:description", content: "Escolha a loja, a variação e reserve por duas horas." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(catalogQueryOptions);
  const product = data.products.find((item) => item.id === id);
  const [selectedOfferId, setSelectedOfferId] = useState(product?.offers.find((offer) => offer.availability !== "UNAVAILABLE")?.id ?? product?.offers[0]?.id ?? "");
  const [selectedOption, setSelectedOption] = useState(product?.options[0] ?? "Único");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const { data: favoriteIds = [] } = useQuery({ queryKey: ["favorites"], queryFn: () => getFavoriteIds() });
  const favorite = favoriteIds.includes(id);
  const favoriteMutation = useMutation({ mutationFn: () => toggleFavorite({ data: { productId: id, favorite: !favorite } }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["favorites"] }); queryClient.invalidateQueries({ queryKey: ["search-demand"] }); queryClient.invalidateQueries({ queryKey: ["merchant-insights"] }); } });
  useEffect(() => { if (product) { setSelectedOfferId(product.offers.find((offer) => offer.availability !== "UNAVAILABLE")?.id ?? product.offers[0]?.id ?? ""); setSelectedOption(product.options[0] ?? "Único"); } }, [product]);
  if (!product) return null;
  const selectedOffer = product.offers.find((offer) => offer.id === selectedOfferId) ?? product.offers[0];
  const similar = data.products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3);
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
      <Button asChild variant="ghost" size="sm" className="-ml-3"><Link to="/app"><ArrowLeft />Voltar à vitrine</Link></Button>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="relative overflow-hidden rounded-lg bg-surface"><img src={productImages[product.image_key]} alt={product.name} width={912} height={1104} className="product-image aspect-[4/5] w-full" /><Button variant="secondary" size="icon" className="absolute right-4 top-4 rounded-full" onClick={() => favoriteMutation.mutate()} aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}><Heart className={favorite ? "fill-primary text-primary" : ""} /></Button></div>
        <section className="py-2"><p className="eyebrow text-primary">{product.brand} · {product.category}</p><h1 className="editorial-title mt-3 text-5xl leading-none sm:text-6xl">{product.name}</h1><p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          <div className="mt-7"><div className="flex items-baseline gap-3"><span className="text-2xl font-semibold">{selectedOffer ? formatMoney(selectedOffer.price_cents) : "—"}</span>{selectedOffer?.original_price_cents && <span className="text-sm text-muted-foreground line-through">{formatMoney(selectedOffer.original_price_cents)}</span>}</div><p className="mt-1 text-[0.65rem] text-muted-foreground">Preço demonstrativo da oferta selecionada.</p></div>
          <div className="mt-7"><p className="text-xs font-semibold uppercase tracking-wider">Escolha a variação</p><div className="mt-3 flex flex-wrap gap-2">{product.options.map((option) => <button type="button" key={option} onClick={() => setSelectedOption(option)} className={`min-w-11 rounded-md border px-3 py-2.5 text-xs ${selectedOption === option ? "border-primary bg-gold-soft text-primary" : "bg-background"}`}>{option}</button>)}</div></div>
          <div className="mt-7"><p className="text-xs font-semibold uppercase tracking-wider">Quantidade</p><div className="mt-3 inline-flex items-center rounded-full border"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Diminuir quantidade"><Minus /></Button><span className="w-8 text-center text-sm">{quantity}</span><Button variant="ghost" size="icon" className="rounded-full" onClick={() => setQuantity(Math.min(5, quantity + 1))} aria-label="Aumentar quantidade"><Plus /></Button></div></div>
          <Button className="mt-7 h-12 w-full rounded-full" disabled={!selectedOffer || selectedOffer.availability === "UNAVAILABLE"} onClick={() => { if (!selectedOffer) return; addItem({ offerId: selectedOffer.id, quantity, selectedOption }); }}><ShoppingBag />{selectedOffer?.availability === "UNAVAILABLE" ? "Oferta indisponível" : "Adicionar à reserva"}</Button>
          <Button asChild variant="outline" className="mt-3 h-11 w-full rounded-full"><Link to="/app/reservas">Revisar seleção</Link></Button>
          <div className="mt-6 flex gap-3 rounded-lg bg-surface p-4 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><p>A solicitação não é compra nem garantia de estoque. A loja confirma a disponibilidade e o pagamento é presencial.</p></div>
        </section>
      </div>
      <section className="mt-14"><p className="eyebrow text-primary">Comparativo por loja</p><h2 className="editorial-title mt-2 text-4xl">Escolha onde experimentar</h2><div className="mt-6 space-y-3">{product.offers.map((offer) => <button type="button" key={offer.id} onClick={() => offer.availability !== "UNAVAILABLE" && setSelectedOfferId(offer.id)} className={`focus-ring grid w-full gap-4 rounded-lg border p-4 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center ${selectedOfferId === offer.id ? "border-primary bg-gold-soft/30" : "bg-card"}`}><div className="flex items-start gap-3"><span className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${selectedOfferId === offer.id ? "border-primary bg-primary text-primary-foreground" : ""}`}>{selectedOfferId === offer.id && <Check className="h-3 w-3" />}</span><div><p className="text-sm font-semibold">{offer.store.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{offer.store.location_label}</p>{product.category === "Moda" && <p className="mt-2 text-xs font-medium text-primary">{offer.store.name} te aguarda nos provadores.</p>}</div></div><div><p className="text-sm font-semibold">{formatMoney(offer.price_cents)}</p>{offer.original_price_cents && <p className="text-xs text-muted-foreground line-through">{formatMoney(offer.original_price_cents)}</p>}</div><span className={`w-fit rounded-full px-3 py-1 text-[0.65rem] font-medium ${offer.availability === "UNAVAILABLE" ? "bg-muted text-muted-foreground" : offer.availability === "CHECK_WITH_STORE" ? "bg-gold-soft text-primary" : "bg-success text-success-foreground"}`}>{offer.availability === "UNAVAILABLE" ? "Indisponível" : offer.availability === "CHECK_WITH_STORE" ? "Consultar loja" : "Disponível sob confirmação"}</span></button>)}</div></section>
      {similar.length > 0 && <section className="mt-16 border-t pt-10"><h2 className="editorial-title text-4xl">Você também pode gostar</h2><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">{similar.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </main>
  );
}
