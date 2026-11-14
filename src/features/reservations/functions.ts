import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { CartItem, Reservation } from "@/lib/reservations";
import type { Availability } from "@/lib/catalog";

const reservationSelect = "*, store:stores(*), customer:profiles(display_name), items:reservation_items(*, offer:offers(*, store:stores(*), product:products(*)))";

export const getCustomerReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("reservations").select(reservationSelect).eq("customer_id", context.userId).order("created_at", { ascending: false });
    if (error) throw new Error("Não foi possível carregar suas reservas.");
    return (data ?? []) as unknown as Reservation[];
  });

export const createReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { items: CartItem[]; idempotencyKey: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: groupId, error } = await context.supabase.rpc("create_reservation", {
      p_items: data.items.map((item) => ({ offer_id: item.offerId, quantity: item.quantity, selected_option: item.selectedOption })),
      p_idempotency_key: data.idempotencyKey,
    });
    if (error) throw new Error(error.message || "Não foi possível criar a reserva.");
    return { groupId };
  });

export const simulateDemoAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ groupId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: created, error } = await context.supabase.rpc("simulate_demo_availability", {
      p_group_id: data.groupId,
    });
    if (error) throw new Error("Não foi possível criar a notificação simulada.");
    return { created: created ?? 0 };
  });

export const cancelReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { reservationId: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("cancel_reservation", { p_reservation_id: data.reservationId });
    if (error) throw new Error(error.message || "Não foi possível cancelar.");
  });

export const getMerchantReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: membership, error: membershipError } = await context.supabase.from("merchant_memberships").select("store_id").eq("user_id", context.userId).single();
    if (membershipError || !membership) throw new Error("Sua conta não está vinculada a uma loja.");
    const { data, error } = await context.supabase.from("reservations").select(reservationSelect).eq("store_id", membership.store_id).order("created_at", { ascending: false });
    if (error) throw new Error("Não foi possível carregar as solicitações da loja.");
    return (data ?? []) as unknown as Reservation[];
  });

export const decideReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { reservationId: string; decision: "CONFIRMED" | "REJECTED" }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("decide_reservation", { p_reservation_id: data.reservationId, p_decision: data.decision });
    if (error) throw new Error(error.message || "Não foi possível registrar a decisão.");
  });

export const setOfferAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { offerId: string; availability: Availability }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("set_offer_availability", { p_offer_id: data.offerId, p_availability: data.availability });
    if (error) throw new Error(error.message || "Não foi possível atualizar a disponibilidade.");
  });

export interface MerchantInsights {
  recent_requests: number;
  previous_requests: number;
  estimate: boolean;
  products: { product_id: string; name: string; favorites: number }[];
}

export const getMerchantInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MerchantInsights> => {
    const { data: membership, error: membershipError } = await context.supabase.from("merchant_memberships").select("store_id").eq("user_id", context.userId).single();
    if (membershipError || !membership) throw new Error("Sua conta não está vinculada a uma loja.");
    const { data, error } = await context.supabase.rpc("merchant_insights", { p_store_id: membership.store_id });
    if (error) throw new Error("Não foi possível calcular os insights.");
    return data as unknown as MerchantInsights;
  });
