import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "@/features/account/account-page";
import { catalogQueryOptions } from "@/features/catalog/functions";

export const Route = createFileRoute("/_authenticated/app/conta")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  head: () => ({ meta: [
    { title: "Conta e favoritos | Capim Dourado Connect" },
    { name: "description", content: "Gerencie favoritos, cupons demonstrativos e preferências de privacidade." },
    { property: "og:title", content: "Sua conta — Capim Dourado Connect" },
    { property: "og:description", content: "Seus interesses, suas escolhas e seus cupons ilustrativos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AccountPage,
});
