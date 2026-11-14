import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatMoney, getLowestOffer, productImages, type Product } from "@/lib/catalog";
import { getFavoriteIds, toggleFavorite } from "@/features/account/functions";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const { data: favoriteIds = [] } = useQuery({ queryKey: ["favorites"], queryFn: () => getFavoriteIds() });
  const favorite = favoriteIds.includes(product.id);
  const mutation = useMutation({
    mutationFn: () => toggleFavorite({ data: { productId: product.id, favorite: !favorite } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["search-demand"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-insights"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const offer = getLowestOffer(product);
  if (!offer) return null;
  const availableStores = product.offers.filter((item) => item.availability !== "UNAVAILABLE").length;
  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-lg bg-surface">
        <Link to="/app/produto/$id" params={{ id: product.id }} className="focus-ring block">
          <img src={productImages[product.image_key]} alt={product.name} width={912} height={1104} loading="lazy" className="product-image aspect-[4/5] w-full transition duration-500 group-hover:scale-[1.025]" />
        </Link>
        <Button type="button" variant="secondary" size="icon" className="absolute right-2.5 top-2.5 rounded-full bg-card/90 shadow-sm" aria-label={favorite ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`} disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          <Heart className={favorite ? "fill-primary text-primary" : "text-foreground"} />
        </Button>
        {offer.original_price_cents && <span className="absolute bottom-2.5 left-2.5 rounded-full bg-primary px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-primary-foreground">Oferta demo</span>}
      </div>
      <div className="pt-3">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-muted-foreground">{product.brand}</p>
        <Link to="/app/produto/$id" params={{ id: product.id }} className="focus-ring mt-1 block text-sm font-medium leading-snug text-foreground hover:text-primary">{product.name}</Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-semibold text-foreground">{formatMoney(offer.price_cents)}</span>
          {offer.original_price_cents && <span className="text-xs text-muted-foreground line-through">{formatMoney(offer.original_price_cents)}</span>}
        </div>
        <p className="mt-2 flex items-center gap-1 text-[0.68rem] text-muted-foreground"><MapPin className="h-3 w-3" />{availableStores > 0 ? `${availableStores} ${availableStores === 1 ? "loja" : "lojas"} · sob confirmação` : "Indisponível no momento"}</p>
      </div>
    </article>
  );
}
