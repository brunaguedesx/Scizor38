import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const getMissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mission_completions")
      .select("product_id, store_id, coupon_id")
      .eq("user_id", context.userId);
    if (error) throw new Error("Não foi possível carregar as missões.");
    return data;
  });
export const completeMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        productId: z.string().min(1).max(100),
        storeId: z.string().min(1).max(100),
        simulationConfirmed: z.literal(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: couponId, error } = await context.supabase.rpc("complete_demo_mission", {
      p_product_id: data.productId,
      p_store_id: data.storeId,
    });
    if (error) throw new Error(error.message || "Não foi possível concluir a missão.");
    return couponId;
  });
