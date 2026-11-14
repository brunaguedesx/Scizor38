CREATE TYPE public.app_role AS ENUM ('CUSTOMER', 'MERCHANT');
CREATE TYPE public.offer_availability AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'CHECK_WITH_STORE');
CREATE TYPE public.reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'EXPIRED');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Cliente',
  marketing_opt_in boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.stores (
  id text PRIMARY KEY,
  name text NOT NULL,
  location_label text NOT NULL,
  active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.stores TO anon, authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.merchant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_id text NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'ATTENDANT',
  UNIQUE (user_id, store_id)
);
GRANT SELECT ON public.merchant_memberships TO authenticated;
GRANT ALL ON public.merchant_memberships TO service_role;
ALTER TABLE public.merchant_memberships ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  brand text NOT NULL,
  description text NOT NULL,
  image_key text NOT NULL,
  color text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  options text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.offers (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id text NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  original_price_cents integer CHECK (original_price_cents IS NULL OR original_price_cents >= price_cents),
  availability public.offer_availability NOT NULL DEFAULT 'AVAILABLE',
  stock_mode text NOT NULL DEFAULT 'MANUAL_CONFIRMATION',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, store_id)
);
GRANT SELECT ON public.offers TO anon, authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.favorites (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reservation_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, idempotency_key)
);
GRANT SELECT ON public.reservation_groups TO authenticated;
GRANT ALL ON public.reservation_groups TO service_role;
ALTER TABLE public.reservation_groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.reservation_groups(id) ON DELETE CASCADE,
  store_id text NOT NULL REFERENCES public.stores(id),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.reservation_status NOT NULL DEFAULT 'PENDING',
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  decided_at timestamptz,
  rejection_reason text
);
GRANT SELECT ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reservation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  offer_id text NOT NULL REFERENCES public.offers(id),
  selected_option text,
  quantity integer NOT NULL CHECK (quantity > 0 AND quantity <= 5),
  unit_price_cents_snapshot integer NOT NULL CHECK (unit_price_cents_snapshot >= 0)
);
GRANT SELECT ON public.reservation_items TO authenticated;
GRANT ALL ON public.reservation_items TO service_role;
ALTER TABLE public.reservation_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.coupons (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE,
  rule_type text NOT NULL,
  discount_description text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coupon_id text NOT NULL REFERENCES public.coupons(id),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  redeemed_at timestamptz,
  UNIQUE (user_id, coupon_id, reservation_id)
);
GRANT SELECT ON public.user_coupons TO authenticated;
GRANT ALL ON public.user_coupons TO service_role;
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_store_member(_store_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'MERCHANT') AND EXISTS (
    SELECT 1 FROM public.merchant_memberships WHERE user_id = auth.uid() AND store_id = _store_id
  );
$$;

CREATE POLICY "profiles_read_operational" ON public.profiles FOR SELECT TO authenticated USING (
  id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.reservations r WHERE r.customer_id = profiles.id AND public.is_store_member(r.store_id)
  )
);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "roles_read_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "memberships_read_own" ON public.merchant_memberships FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "stores_public_read" ON public.stores FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "offers_public_read" ON public.offers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "favorites_own_all" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'CUSTOMER')) WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'CUSTOMER'));
CREATE POLICY "groups_read_own" ON public.reservation_groups FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "reservations_read_scoped" ON public.reservations FOR SELECT TO authenticated USING (customer_id = auth.uid() OR public.is_store_member(store_id));
CREATE POLICY "items_read_scoped" ON public.reservation_items FOR SELECT TO authenticated USING (EXISTS (
  SELECT 1 FROM public.reservations r WHERE r.id = reservation_id AND (r.customer_id = auth.uid() OR public.is_store_member(r.store_id))
));
CREATE POLICY "notifications_read_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "coupons_public_read" ON public.coupons FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "user_coupons_read_own" ON public.user_coupons FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "audit_read_own" ON public.audit_events FOR SELECT TO authenticated USING (actor_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, marketing_opt_in)
  VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), 'Cliente'), COALESCE((NEW.raw_user_meta_data->>'marketing_opt_in')::boolean, false));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'CUSTOMER');
  INSERT INTO public.user_coupons (user_id, coupon_id)
  SELECT NEW.id, 'welcome' WHERE EXISTS (SELECT 1 FROM public.coupons WHERE id = 'welcome');
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
    VALUES (v_group, v_store, auth.uid(), upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), now() + interval '2 hours') RETURNING id INTO v_reservation;
    INSERT INTO public.reservation_items (reservation_id, offer_id, selected_option, quantity, unit_price_cents_snapshot)
    SELECT v_reservation, o.id, NULLIF(j->>'selected_option', ''), (j->>'quantity')::int, o.price_cents
    FROM jsonb_array_elements(p_items) j JOIN public.offers o ON o.id = j->>'offer_id' WHERE o.store_id = v_store;
  END LOOP;
  INSERT INTO public.audit_events (actor_id, entity_type, entity_id, action) VALUES (auth.uid(), 'reservation_group', v_group::text, 'CREATED');
  RETURN v_group;
END;
$$;
REVOKE ALL ON FUNCTION public.create_reservation(jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_reservation(jsonb, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.decide_reservation(p_reservation_id uuid, p_decision text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_reservation record; v_title text; v_message text;
BEGIN
  SELECT * INTO v_reservation FROM public.reservations WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND OR NOT public.is_store_member(v_reservation.store_id) THEN RAISE EXCEPTION 'Reserva não encontrada para esta loja'; END IF;
  IF v_reservation.status <> 'PENDING' OR v_reservation.expires_at <= now() THEN RAISE EXCEPTION 'Esta reserva não está mais pendente e ativa'; END IF;
  IF p_decision NOT IN ('CONFIRMED', 'REJECTED') THEN RAISE EXCEPTION 'Decisão inválida'; END IF;
  UPDATE public.reservations SET status = p_decision::public.reservation_status, decided_at = now(), rejection_reason = CASE WHEN p_decision = 'REJECTED' THEN 'STORE_REJECTED' ELSE NULL END WHERE id = p_reservation_id;
  v_title := CASE WHEN p_decision = 'CONFIRMED' THEN 'Reserva confirmada' ELSE 'Reserva não confirmada' END;
  v_message := CASE WHEN p_decision = 'CONFIRMED' THEN 'A loja confirmou a disponibilidade. Apresente o código ' || v_reservation.code || '.' ELSE 'A loja não confirmou a disponibilidade desta reserva.' END;
  INSERT INTO public.notifications (user_id, type, title, message) VALUES (v_reservation.customer_id, 'RESERVATION', v_title, v_message);
  IF p_decision = 'CONFIRMED' THEN
    INSERT INTO public.user_coupons (user_id, coupon_id, reservation_id)
    SELECT v_reservation.customer_id, 'reservation', p_reservation_id WHERE EXISTS (SELECT 1 FROM public.coupons WHERE id = 'reservation') ON CONFLICT DO NOTHING;
  END IF;
  INSERT INTO public.audit_events (actor_id, entity_type, entity_id, action) VALUES (auth.uid(), 'reservation', p_reservation_id::text, p_decision);
END;
$$;
REVOKE ALL ON FUNCTION public.decide_reservation(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decide_reservation(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_reservation(p_reservation_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_reservation record;
BEGIN
  SELECT * INTO v_reservation FROM public.reservations WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND OR v_reservation.customer_id <> auth.uid() THEN RAISE EXCEPTION 'Reserva não encontrada'; END IF;
  IF v_reservation.status NOT IN ('PENDING', 'CONFIRMED') OR v_reservation.expires_at <= now() THEN RAISE EXCEPTION 'Esta reserva não pode mais ser cancelada'; END IF;
  UPDATE public.reservations SET status = 'CANCELLED', decided_at = now() WHERE id = p_reservation_id;
  INSERT INTO public.audit_events (actor_id, entity_type, entity_id, action) VALUES (auth.uid(), 'reservation', p_reservation_id::text, 'CANCELLED');
END;
$$;
REVOKE ALL ON FUNCTION public.cancel_reservation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_reservation(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_offer_availability(p_offer_id text, p_availability public.offer_availability)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_offer record; v_affected record;
BEGIN
  SELECT * INTO v_offer FROM public.offers WHERE id = p_offer_id FOR UPDATE;
  IF NOT FOUND OR NOT public.is_store_member(v_offer.store_id) THEN RAISE EXCEPTION 'Oferta não encontrada para esta loja'; END IF;
  UPDATE public.offers SET availability = p_availability, updated_at = now() WHERE id = p_offer_id;
  IF p_availability = 'UNAVAILABLE' THEN
    FOR v_affected IN SELECT DISTINCT r.id, r.customer_id FROM public.reservations r JOIN public.reservation_items i ON i.reservation_id = r.id WHERE i.offer_id = p_offer_id AND r.status = 'PENDING' LOOP
      INSERT INTO public.notifications (user_id, type, title, message) VALUES (v_affected.customer_id, 'RESERVATION', 'Oferta indisponível', 'Uma loja marcou a oferta como indisponível e a reserva pendente foi recusada.');
      UPDATE public.reservations SET status = 'REJECTED', decided_at = now(), rejection_reason = 'UNAVAILABLE' WHERE id = v_affected.id;
    END LOOP;
  END IF;
  INSERT INTO public.audit_events (actor_id, entity_type, entity_id, action) VALUES (auth.uid(), 'offer', p_offer_id, 'AVAILABILITY_' || p_availability::text);
END;
$$;
REVOKE ALL ON FUNCTION public.set_offer_availability(text, public.offer_availability) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_offer_availability(text, public.offer_availability) TO authenticated;

CREATE OR REPLACE FUNCTION public.merchant_insights(p_store_id text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_recent integer; v_previous integer; v_products jsonb;
BEGIN
  IF NOT public.is_store_member(p_store_id) THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  SELECT count(*) INTO v_recent FROM public.reservations WHERE store_id = p_store_id AND created_at >= now() - interval '7 days';
  SELECT count(*) INTO v_previous FROM public.reservations WHERE store_id = p_store_id AND created_at < now() - interval '7 days' AND created_at >= now() - interval '14 days';
  SELECT COALESCE(jsonb_agg(jsonb_build_object('product_id', p.id, 'name', p.name, 'favorites', COALESCE(f.total, 0)) ORDER BY COALESCE(f.total, 0) DESC, p.name), '[]'::jsonb) INTO v_products
  FROM public.products p
  JOIN (SELECT DISTINCT product_id FROM public.offers WHERE store_id = p_store_id) po ON po.product_id = p.id
  LEFT JOIN (SELECT product_id, count(*) AS total FROM public.favorites GROUP BY product_id) f ON f.product_id = p.id;
  RETURN jsonb_build_object('recent_requests', v_recent, 'previous_requests', v_previous, 'products', v_products, 'estimate', true);
END;
$$;
REVOKE ALL ON FUNCTION public.merchant_insights(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merchant_insights(text) TO authenticated;

CREATE INDEX reservations_store_status_idx ON public.reservations(store_id, status);
CREATE INDEX reservations_customer_status_idx ON public.reservations(customer_id, status);
CREATE INDEX reservation_items_offer_idx ON public.reservation_items(offer_id);
CREATE INDEX notifications_user_created_idx ON public.notifications(user_id, created_at DESC);