import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import type { CatalogData, Product, Store } from "@/lib/catalog";

export const getCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<CatalogData> => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const [{ data: products, error: productsError }, { data: stores, error: storesError }] = await Promise.all([
    supabase.from("products").select("*, offers(*, store:stores(*))").eq("active", true).order("name"),
    supabase.from("stores").select("*").eq("active", true).order("name"),
  ]);
  if (productsError || storesError) throw new Error("Não foi possível carregar o catálogo. Tente novamente.");
  return { products: (products ?? []) as unknown as Product[], stores: (stores ?? []) as Store[] };
});

export const catalogQueryOptions = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
  staleTime: 15_000,
});
