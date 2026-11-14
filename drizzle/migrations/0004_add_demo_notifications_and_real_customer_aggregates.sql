ALTER TABLE public.notifications ADD COLUMN deduplication_key text;
CREATE UNIQUE INDEX notifications_user_deduplication_idx ON public.notifications(user_id, deduplication_key) WHERE deduplication_key IS NOT NULL;
COMMENT ON COLUMN public.notifications.deduplication_key IS 'Chave opcional para notificações automáticas idempotentes.';

CREATE OR REPLACE FUNCTION public.simulate_demo_availability(p_group_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_reservation record;
  v_count integer := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'CUSTOMER') THEN
    RAISE EXCEPTION 'Acesso de cliente necessário';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.reservation_groups g WHERE g.id = p_group_id AND g.customer_id = auth.uid()) THEN
    RAISE EXCEPTION 'Grupo de reserva não encontrado';
  END IF;
  FOR v_reservation IN
    SELECT r.id, r.code, s.name AS store_name
    FROM public.reservations r
    JOIN public.stores s ON s.id = r.store_id
    WHERE r.group_id = p_group_id
      AND r.customer_id = auth.uid()
      AND r.status = 'PENDING'
      AND r.expires_at > now()
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, deduplication_key)
    VALUES (
      auth.uid(),
      'DEMO_AVAILABILITY',
      'Disponibilidade confirmada · simulação',
      'Simulação: ' || v_reservation.store_name || ' confirmou a disponibilidade para o código ' || v_reservation.code || '. Isto não substitui a decisão do lojista nem garante estoque real.',
      'demo-availability:' || v_reservation.id::text
    ) ON CONFLICT DO NOTHING;
    IF FOUND THEN v_count := v_count + 1; END IF;
  END LOOP;
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.simulate_demo_availability(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.simulate_demo_availability(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.search_demand_insights() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE sid text; result jsonb;
BEGIN
  SELECT store_id INTO sid FROM public.merchant_memberships WHERE user_id = auth.uid() LIMIT 1;
  IF sid IS NULL OR NOT public.has_role(auth.uid(), 'MERCHANT') THEN RAISE EXCEPTION 'Acesso restrito à loja'; END IF;
  SELECT jsonb_build_object(
    'recent_searches', (SELECT count(*) FROM public.search_events s WHERE s.created_at >= now() - interval '7 days' AND EXISTS (SELECT 1 FROM public.offers o WHERE o.store_id = sid AND o.product_id = ANY(s.product_ids))),
    'previous_searches', (SELECT count(*) FROM public.search_events s WHERE s.created_at >= now() - interval '14 days' AND s.created_at < now() - interval '7 days' AND EXISTS (SELECT 1 FROM public.offers o WHERE o.store_id = sid AND o.product_id = ANY(s.product_ids))),
    'interested_customers', (
      SELECT count(*) FROM (
        SELECT f.user_id AS customer_id FROM public.favorites f WHERE EXISTS (SELECT 1 FROM public.offers o WHERE o.store_id = sid AND o.product_id = f.product_id)
        UNION
        SELECT r.customer_id FROM public.reservations r WHERE r.store_id = sid AND r.created_at >= now() - interval '30 days'
      ) customers
    ),
    'products', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT
        p.id product_id,
        p.name,
        p.category,
        o.availability,
        (SELECT count(*) FROM public.search_events s WHERE p.id = ANY(s.product_ids) AND s.created_at >= now() - interval '7 days') searches,
        (SELECT count(*) FROM public.search_events s WHERE p.id = ANY(s.product_ids) AND s.created_at >= now() - interval '14 days' AND s.created_at < now() - interval '7 days') previous_searches,
        (SELECT max(s.created_at) FROM public.search_events s WHERE p.id = ANY(s.product_ids) AND s.created_at >= now() - interval '7 days') last_searched_at,
        (SELECT count(*) FROM public.favorites f WHERE f.product_id = p.id) favorites,
        (SELECT count(*) FROM public.reservation_items ri JOIN public.reservations r ON r.id = ri.reservation_id WHERE ri.offer_id = o.id AND r.created_at >= now() - interval '7 days') requests,
        (SELECT count(*) FROM public.reservation_items ri JOIN public.reservations r ON r.id = ri.reservation_id WHERE ri.offer_id = o.id AND r.created_at >= now() - interval '7 days' AND r.status = 'CONFIRMED') confirmed_requests,
        (SELECT count(*) FROM (
          SELECT f.user_id AS customer_id FROM public.favorites f WHERE f.product_id = p.id
          UNION
          SELECT r.customer_id FROM public.reservations r JOIN public.reservation_items ri ON ri.reservation_id = r.id WHERE ri.offer_id = o.id AND r.created_at >= now() - interval '30 days'
        ) product_customers) interested_customers
      FROM public.products p
      JOIN public.offers o ON o.product_id = p.id
      WHERE o.store_id = sid AND p.active
      ORDER BY searches DESC, favorites DESC, requests DESC, p.name
    ) t), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.search_demand_insights() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_demand_insights() TO authenticated, service_role;