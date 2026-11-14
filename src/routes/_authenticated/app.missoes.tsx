import { createFileRoute } from "@tanstack/react-router";
import { catalogQueryOptions } from "@/features/catalog/functions";
import { MissionsPage } from "@/features/missions/missions-page";
export const Route = createFileRoute("/_authenticated/app/missoes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  head: () => ({
    meta: [
      { title: "Missões e benefícios | Capim Dourado Connect" },
      {
        name: "description",
        content: "Descubra produtos e simule missões com cupons demonstrativos.",
      },
      { property: "og:title", content: "Missões — Capim Dourado Connect" },
      {
        property: "og:description",
        content: "Conheça produtos das lojas e obtenha benefícios ilustrativos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MissionsPage,
});
