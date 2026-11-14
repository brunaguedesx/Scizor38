CREATE TABLE public.ai_preferences (user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE, consent boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE ON public.ai_preferences TO authenticated;
GRANT ALL ON public.ai_preferences TO service_role;
ALTER TABLE public.ai_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_preferences_own ON public.ai_preferences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TABLE public.ai_access_state (id text PRIMARY KEY CHECK (id = 'gemini'), blocked_reason text, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.ai_access_state TO authenticated;
GRANT ALL ON public.ai_access_state TO service_role;
ALTER TABLE public.ai_access_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_state_read ON public.ai_access_state FOR SELECT TO authenticated USING (true);
CREATE TABLE public.search_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, request_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), result_count integer NOT NULL CHECK (result_count >= 0), product_ids text[] NOT NULL DEFAULT '{}', category text NOT NULL DEFAULT '', UNIQUE(user_id, request_id));
GRANT SELECT, INSERT ON public.search_events TO authenticated;
GRANT ALL ON public.search_events TO service_role;
ALTER TABLE public.search_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY search_own_read ON public.search_events FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY search_own_insert ON public.search_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'CUSTOMER'));
CREATE INDEX search_events_recent ON public.search_events(created_at DESC);
CREATE TABLE public.mission_completions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, product_id text NOT NULL REFERENCES public.products(id), store_id text NOT NULL REFERENCES public.stores(id), coupon_id text NOT NULL REFERENCES public.coupons(id), completed_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id, product_id, store_id));
GRANT SELECT ON public.mission_completions TO authenticated;
GRANT ALL ON public.mission_completions TO service_role;
ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY mission_own_read ON public.mission_completions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION public.search_demand_insights() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE sid text; result jsonb;
BEGIN
 SELECT store_id INTO sid FROM public.merchant_memberships WHERE user_id = auth.uid() LIMIT 1;
 IF sid IS NULL OR NOT public.has_role(auth.uid(), 'MERCHANT') THEN RAISE EXCEPTION 'Acesso restrito à loja'; END IF;
 SELECT jsonb_build_object('recent_searches', (SELECT count(*) FROM public.search_events s WHERE s.created_at >= now() - interval '7 days' AND EXISTS (SELECT 1 FROM public.offers o WHERE o.store_id = sid AND o.product_id = ANY(s.product_ids))), 'previous_searches', (SELECT count(*) FROM public.search_events s WHERE s.created_at >= now() - interval '14 days' AND s.created_at < now() - interval '7 days' AND EXISTS (SELECT 1 FROM public.offers o WHERE o.store_id = sid AND o.product_id = ANY(s.product_ids))), 'products', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (SELECT p.id product_id, p.name, p.category, o.availability, (SELECT count(*) FROM public.search_events s WHERE p.id = ANY(s.product_ids) AND s.created_at >= now() - interval '7 days') searches, (SELECT count(*) FROM public.search_events s WHERE p.id = ANY(s.product_ids) AND s.created_at >= now() - interval '14 days' AND s.created_at < now() - interval '7 days') previous_searches, (SELECT max(s.created_at) FROM public.search_events s WHERE p.id = ANY(s.product_ids) AND s.created_at >= now() - interval '7 days') last_searched_at, (SELECT count(*) FROM public.favorites f WHERE f.product_id = p.id) favorites, (SELECT count(*) FROM public.reservation_items ri JOIN public.reservations r ON r.id = ri.reservation_id WHERE ri.offer_id = o.id AND r.created_at >= now() - interval '7 days') requests FROM public.products p JOIN public.offers o ON o.product_id = p.id WHERE o.store_id = sid AND p.active ORDER BY searches DESC, favorites DESC, p.name) t), '[]'::jsonb)) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.search_demand_insights() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_demand_insights() TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.complete_demo_mission(p_product_id text, p_store_id text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cid text; uid uuid := auth.uid();
BEGIN
 IF uid IS NULL OR NOT public.has_role(uid, 'CUSTOMER') THEN RAISE EXCEPTION 'Acesso de cliente necessário'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.offers o JOIN public.products p ON p.id = o.product_id JOIN public.stores s ON s.id = o.store_id WHERE o.product_id = p_product_id AND o.store_id = p_store_id AND o.availability <> 'UNAVAILABLE' AND p.active AND s.active) THEN RAISE EXCEPTION 'Missão indisponível'; END IF;
 cid := 'mission-' || p_product_id || '-' || p_store_id;
 INSERT INTO public.coupons(id, code, rule_type, discount_description, expires_at) VALUES(cid, 'DEMO-' || upper(substr(md5(cid),1,8)), 'DEMO_VISIT', '10% ilustrativo no produto da missão. Sem validade comercial. Uma concessão por produto/loja/conta; uso único simulado.', now() + interval '30 days') ON CONFLICT(id) DO NOTHING;
 INSERT INTO public.mission_completions(user_id, product_id, store_id, coupon_id) VALUES(uid, p_product_id, p_store_id, cid) ON CONFLICT(user_id,product_id,store_id) DO NOTHING;
 INSERT INTO public.user_coupons(user_id,coupon_id) SELECT uid,cid WHERE NOT EXISTS(SELECT 1 FROM public.user_coupons WHERE user_id = uid AND coupon_id = cid);
 RETURN cid;
END $$;
REVOKE ALL ON FUNCTION public.complete_demo_mission(text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_demo_mission(text,text) TO authenticated, service_role;