import { createFileRoute } from "@tanstack/react-router";
import { VisitPage } from "@/features/visit/visit-page";
import { validEntrance } from "@/features/visit/model";
export const Route = createFileRoute("/_authenticated/app/visita")({
  validateSearch: (search: Record<string, unknown>) => ({
    entrada: typeof search["entrada"] === "string" ? validEntrance(search["entrada"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Minha visita | Capim Dourado Connect" },
      {
        name: "description",
        content: "Organize um roteiro ilustrativo pelas lojas das suas reservas ativas.",
      },
      { property: "og:title", content: "Minha visita — Capim Dourado Connect" },
      {
        property: "og:description",
        content: "Entrada e roteiro demonstrativo para suas reservas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <VisitPage initialEntrance={Route.useSearch().entrada} />,
});
