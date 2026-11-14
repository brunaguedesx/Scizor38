import { createFileRoute } from "@tanstack/react-router";
import { ReservationsPage } from "@/features/reservations/reservations-page";

export const Route = createFileRoute("/_authenticated/app/reservas")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  head: () => ({ meta: [
    { title: "Minhas reservas | Capim Dourado Connect" },
    { name: "description", content: "Revise sua seleção multiloja, acompanhe confirmações e o prazo de duas horas." },
    { property: "og:title", content: "Minhas reservas — Capim Dourado Connect" },
    { property: "og:description", content: "Acompanhe cada loja de forma independente." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ReservationsPage,
});
import { catalogQueryOptions } from "@/features/catalog/functions";
