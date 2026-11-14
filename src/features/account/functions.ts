import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getFavoriteIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("favorites").select("product_id").eq("user_id", context.userId);
    if (error) throw new Error("Não foi possível carregar seus favoritos.");
    return data.map((favorite) => favorite.product_id);
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productId: string; favorite: boolean }) => input)
  .handler(async ({ data, context }) => {
    const response = data.favorite
      ? await context.supabase.from("favorites").upsert({ user_id: context.userId, product_id: data.productId })
      : await context.supabase.from("favorites").delete().eq("user_id", context.userId).eq("product_id", data.productId);
    if (response.error) throw new Error("Não foi possível atualizar o favorito.");
    return { favorite: data.favorite };
  });

export const getAccountData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, coupons, notifications] = await Promise.all([
      context.supabase.from("profiles").select("display_name, marketing_opt_in").eq("id", context.userId).single(),
      context.supabase.from("user_coupons").select("*, coupon:coupons(*)").eq("user_id", context.userId).order("claimed_at", { ascending: false }),
      context.supabase.from("notifications").select("*").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(30),
    ]);
    if (profile.error || coupons.error || notifications.error) throw new Error("Não foi possível carregar os dados da conta.");
    return { profile: profile.data, coupons: coupons.data, notifications: notifications.data };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error("Não foi possível atualizar a notificação.");
  });

export const updatePreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { displayName: string; marketingOptIn: boolean }) => input)
  .handler(async ({ data, context }) => {
    const displayName = data.displayName.trim();
    if (displayName.length < 2 || displayName.length > 80) throw new Error("Informe um nome entre 2 e 80 caracteres.");
    const { error } = await context.supabase.from("profiles").update({ display_name: displayName, marketing_opt_in: data.marketingOptIn }).eq("id", context.userId);
    if (error) throw new Error("Não foi possível salvar suas preferências.");
  });
