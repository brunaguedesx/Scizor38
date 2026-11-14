import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Check, Gift, Ticket } from "lucide-react";
import { toast } from "sonner";
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
import { catalogQueryOptions } from "@/features/catalog/functions";
import { productImages } from "@/lib/catalog";
import { completeMission, getMissions } from "./missions.functions";

export function MissionsPage() {
  const { data: catalog } = useSuspenseQuery(catalogQueryOptions);
  const completions = useQuery({ queryKey: ["missions"], queryFn: () => getMissions() });
  const finish = useServerFn(completeMission);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: { productId: string; storeId: string }) =>
      finish({ data: { ...data, simulationConfirmed: true } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Missão demonstrativa concluída. Cupom na sua conta.");
    },
  });
  const missions = catalog.products
    .flatMap((p) => {
      const o = p.offers.find((o) => o.availability !== "UNAVAILABLE");
      return o ? [{ product: p, offer: o }] : [];
    })
    .slice(0, 4);
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <p className="eyebrow text-primary">Descobertas no shopping</p>
      <h1 className="editorial-title mt-3 text-5xl">Missões & benefícios</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Demonstração · Cupons sem validade comercial, uso único simulado. Visitas não são
        comprovadas.
      </p>
      <div className="mt-6 flex items-center gap-3 border-y py-4">
        <Gift className="h-6 w-6 text-primary" />
        <strong>{completions.data?.length ?? 0} missões concluídas</strong>
        <Button asChild variant="ghost" className="ml-auto">
          <Link to="/app/conta">
            <Ticket />
            Cupons
          </Link>
        </Button>
      </div>
      {(completions.error || mutation.error) && (
        <p role="alert" className="mt-4 text-destructive">
          {completions.error?.message ?? mutation.error?.message}
        </p>
      )}
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        {missions.map(({ product, offer }) => {
          const done = completions.data?.some(
            (m) => m.product_id === product.id && m.store_id === offer.store_id,
          );
          return (
            <article key={offer.id} className="overflow-hidden rounded-lg border bg-card">
              <img
                src={productImages[product.image_key]}
                alt={product.name}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5">
                <p className="text-xs text-primary">{offer.store.name}</p>
                <h2 className="mt-2 font-display text-3xl">Conheça {product.name}</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  10% ilustrativo neste produto · Uma concessão por conta, produto e loja. Validade
                  exibida na conta.
                </p>
                {done ? (
                  <p className="mt-4 flex items-center gap-2 text-sm text-success">
                    <Check className="h-4 w-4" />
                    Benefício na sua conta
                  </p>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="mt-5 w-full"
                        disabled={mutation.isPending || completions.isPending}
                      >
                        <Gift />
                        Simular visita
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Concluir missão demonstrativa?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação simula conhecer o produto na loja. Não confirma uma visita real
                          nem gera desconto comercial. O cupom ilustrativo será concedido uma vez.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            mutation.mutate({ productId: product.id, storeId: offer.store_id })
                          }
                        >
                          Confirmar simulação
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
