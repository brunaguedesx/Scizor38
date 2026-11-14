import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Store } from "@/lib/catalog";

export interface CurrentProfile {
  id: string;
  displayName: string;
  role: "CUSTOMER" | "MERCHANT";
  store: Store | null;
}

export const getCurrentProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CurrentProfile> => {
    const [{ data: profile, error: profileError }, { data: roles, error: rolesError }, { data: memberships, error: membershipError }] = await Promise.all([
      context.supabase.from("profiles").select("id, display_name").eq("id", context.userId).single(),
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase.from("merchant_memberships").select("store:stores(*)").eq("user_id", context.userId).limit(1),
    ]);
    if (profileError || rolesError || membershipError || !profile || !roles?.length) throw new Error("Não foi possível identificar seu perfil.");
    const role = roles.some((item) => item.role === "MERCHANT") ? "MERCHANT" : "CUSTOMER";
    const membership = memberships?.[0] as unknown as { store: Store } | undefined;
    return { id: profile.id, displayName: profile.display_name, role, store: membership?.store ?? null };
  });
