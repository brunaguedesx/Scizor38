CREATE OR REPLACE FUNCTION public.create_reservation(p_items jsonb, p_idempotency_key text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_group uuid;
  v_store text;
  v_reservation uuid;
  v_item jsonb;
  v_offer record;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'CUSTOMER') THEN RAISE EXCEPTION 'Apenas clientes podem criar reservas'; END IF;
  IF p_idempotency_key IS NULL OR length(p_idempotency_key) < 8 OR length(p_idempotency_key) > 100 THEN RAISE EXCEPTION 'Chave de operação inválida'; END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 20 THEN RAISE EXCEPTION 'Selecione entre 1 e 20 itens'; END IF;
  SELECT id INTO v_group FROM public.reservation_groups WHERE customer_id = auth.uid() AND idempotency_key = p_idempotency_key;
  IF v_group IS NOT NULL THEN RETURN v_group; END IF;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    IF (v_item->>'quantity')::int < 1 OR (v_item->>'quantity')::int > 5 THEN RAISE EXCEPTION 'Quantidade inválida'; END IF;
    SELECT * INTO v_offer FROM public.offers WHERE id = v_item->>'offer_id' FOR UPDATE;
    IF NOT FOUND OR v_offer.availability = 'UNAVAILABLE' THEN RAISE EXCEPTION 'Uma oferta ficou indisponível. Revise sua seleção.'; END IF;
  END LOOP;
  INSERT INTO public.reservation_groups (customer_id, idempotency_key) VALUES (auth.uid(), p_idempotency_key) RETURNING id INTO v_group;
  FOR v_store IN SELECT DISTINCT o.store_id FROM jsonb_array_elements(p_items) j JOIN public.offers o ON o.id = j->>'offer_id' LOOP
    INSERT INTO public.reservations (group_id, store_id, customer_id, code, expires_at)
    VALUES (v_group, v_store, auth.uid(), upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), now() + interval '20 seconds') RETURNING id INTO v_reservation;
    INSERT INTO public.reservation_items (reservation_id, offer_id, selected_option, quantity, unit_price_cents_snapshot)
    SELECT v_reservation, o.id, NULLIF(j->>'selected_option', ''), (j->>'quantity')::int, o.price_cents
    FROM jsonb_array_elements(p_items) j JOIN public.offers o ON o.id = j->>'offer_id' WHERE o.store_id = v_store;
  END LOOP;
  INSERT INTO public.audit_events (actor_id, entity_type, entity_id, action) VALUES (auth.uid(), 'reservation_group', v_group::text, 'CREATED');
  RETURN v_group;
END;
$$;
COMMENT ON FUNCTION public.create_reservation(jsonb, text) IS 'Demonstração acelerada: novas reservas expiram em 20 segundos para evidenciar o easter egg; a regra de produto original permanece 2 horas.';
REVOKE ALL ON FUNCTION public.create_reservation(jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_reservation(jsonb, text) TO authenticated;