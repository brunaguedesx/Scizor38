import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Heart, LogOut, ShieldCheck, Tag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { catalogQueryOptions } from "@/features/catalog/functions";
import { getAccountData, getFavoriteIds, updatePreferences } from "@/features/account/functions";
import { ProductCard } from "@/components/app/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function AccountPage() {
  const { data: catalog } = useSuspenseQuery(catalogQueryOptions);
  const { data: favoriteIds = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => getFavoriteIds(),
  });
  const { data: account } = useQuery({ queryKey: ["account"], queryFn: () => getAccountData() });
  const [tab, setTab] = useState<"favorites" | "coupons" | "preferences">("favorites");
  const [name, setName] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (account?.profile) {
      setName(account.profile.display_name);
      setMarketing(account.profile.marketing_opt_in);
    }
  }, [account]);

  const favorites = catalog.products.filter((product) => favoriteIds.includes(product.id));
  const saveMutation = useMutation({
    mutationFn: () => updatePreferences({ data: { displayName: name, marketingOptIn: marketing } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Preferências salvas.");
    },
    onError: (error) => toast.error(error.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    saveMutation.mutate();
  }

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    queryClient.clear();
    await navigate({ to: "/" });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-primary">Seu espaço</p>
          <h1 className="editorial-title mt-3 text-5xl sm:text-6xl">Conta e favoritos</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Interesses privados, benefícios ilustrativos e escolhas de privacidade.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-11 w-full shrink-0 rounded-full sm:w-auto"
          onClick={signOut}
          disabled={signingOut}
        >
          <LogOut />
          {signingOut ? "Saindo…" : "Sair da conta"}
        </Button>
      </div>

      <div className="mt-7 flex gap-1 overflow-x-auto rounded-lg bg-surface p-1">
        {(["favorites", "coupons", "preferences"] as const).map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setTab(value)}
            className={`h-10 flex-1 whitespace-nowrap rounded-md px-3 text-xs font-medium ${tab === value ? "bg-card shadow-sm" : "text-muted-foreground"}`}
          >
            {value === "favorites"
              ? `Favoritos (${favorites.length})`
              : value === "coupons"
                ? `Cupons (${account?.coupons.length ?? 0})`
                : "Preferências"}
          </button>
        ))}
      </div>

      {tab === "favorites" && (
        <section className="mt-7">
          {favorites.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-surface py-16 text-center">
              <Heart className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-4 font-display text-3xl">Nenhum favorito ainda</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Toque no coração dos produtos para guardá-los aqui.
              </p>
            </div>
          )}
        </section>
      )}

      {tab === "coupons" && (
        <section className="mt-7 grid gap-4 sm:grid-cols-2">
          {account?.coupons.map((userCoupon) => (
            <article
              key={userCoupon.id}
              className="relative overflow-hidden rounded-lg border border-primary/25 bg-gold-soft/35 p-6"
            >
              <Tag className="h-6 w-6 text-primary" />
              <p className="mt-5 break-all font-mono text-xl font-semibold text-primary">
                {userCoupon.coupon.code}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {userCoupon.coupon.discount_description}
              </p>
              <p className="mt-4 text-[0.65rem] text-muted-foreground">
                Concedido em {new Date(userCoupon.claimed_at).toLocaleDateString("pt-BR")} ·{" "}
                {userCoupon.redeemed_at
                  ? "Utilizado"
                  : userCoupon.coupon.expires_at &&
                      Date.parse(userCoupon.coupon.expires_at) <= Date.now()
                    ? "Expirado"
                    : "Disponível na demo"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {userCoupon.coupon.expires_at
                  ? `Validade: ${new Date(userCoupon.coupon.expires_at).toLocaleDateString("pt-BR")}`
                  : "Sem data de validade definida na demonstração"}
              </p>
            </article>
          ))}
          {account?.coupons.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum cupom concedido.</p>
          )}
          <div className="rounded-lg bg-surface p-5 text-xs leading-relaxed text-muted-foreground sm:col-span-2">
            <strong className="text-foreground">Regras transparentes:</strong> BEMVINDO10 é
            concedido uma vez por conta. RESERVA15 nasce após uma confirmação do lojista. Missões
            concedem benefício ilustrativo uma vez por produto e loja. Nenhum cupom garante desconto
            comercial.
          </div>
        </section>
      )}

      {tab === "preferences" && (
        <section className="mx-auto mt-7 max-w-xl">
          <form onSubmit={submit} className="rounded-lg border bg-card p-5">
            <div className="space-y-2">
              <Label htmlFor="display-name">Nome de exibição</Label>
              <Input
                id="display-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={80}
                required
              />
            </div>
            <label className="mt-6 flex cursor-pointer items-start justify-between gap-4 rounded-lg bg-surface p-4">
              <span>
                <span className="block text-sm font-medium">Promoções personalizadas</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Permite usar favoritos para recomendações e alertas demonstrativos. Não
                  compartilha seus favoritos identificáveis com lojistas.
                </span>
              </span>
              <Switch checked={marketing} onCheckedChange={setMarketing} />
            </label>
            <Button
              type="submit"
              className="mt-5 w-full rounded-full"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Salvando…" : "Salvar preferências"}
            </Button>
          </form>
          <div className="mt-5 rounded-lg bg-surface p-5">
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="text-sm font-semibold">Privacidade da demonstração</h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Coletamos apenas conta, identificador e registros necessários às reservas. Para
                  solicitar remoção de dados da conta neste MVP, fale com a equipe Scizor38 pelo
                  canal oficial do projeto. A eliminação self-service está em evolução.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
