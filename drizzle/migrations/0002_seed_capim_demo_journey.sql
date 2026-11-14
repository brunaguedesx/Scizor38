INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token, email_change_token_current, email_change_confirm_status, is_sso_user, is_anonymous)
VALUES
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'cliente.demo@exemplo.test', crypt('Demo2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Cliente Demo"}', now(), now(), '', '', '', '', '', 0, false, false),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'lojista.a@exemplo.test', crypt('Demo2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Atendimento Movida"}', now(), now(), '', '', '', '', '', 0, false, false),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'lojista.b@exemplo.test', crypt('Demo2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Atendimento Essenza"}', now(), now(), '', '', '', '', '', 0, false, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.identities (id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'email', 'cliente.demo@exemplo.test', '{"sub":"10000000-0000-0000-0000-000000000001","email":"cliente.demo@exemplo.test"}', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'email', 'lojista.a@exemplo.test', '{"sub":"10000000-0000-0000-0000-000000000002","email":"lojista.a@exemplo.test"}', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'email', 'lojista.b@exemplo.test', '{"sub":"10000000-0000-0000-0000-000000000003","email":"lojista.b@exemplo.test"}', now(), now(), now())
ON CONFLICT (id) DO NOTHING;
DELETE FROM public.user_roles WHERE user_id IN ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003') AND role = 'CUSTOMER';
INSERT INTO public.user_roles (user_id, role) VALUES
  ('10000000-0000-0000-0000-000000000002', 'MERCHANT'),
  ('10000000-0000-0000-0000-000000000003', 'MERCHANT')
ON CONFLICT DO NOTHING;
INSERT INTO public.merchant_memberships (user_id, store_id) VALUES
  ('10000000-0000-0000-0000-000000000002', 'movida'),
  ('10000000-0000-0000-0000-000000000003', 'essenza')
ON CONFLICT DO NOTHING;
INSERT INTO public.favorites (user_id, product_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'tenis-alba'),
  ('10000000-0000-0000-0000-000000000001', 'bolsa-lume')
ON CONFLICT DO NOTHING;
INSERT INTO public.reservation_groups (id, customer_id, idempotency_key, created_at) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'seed-pending', now() - interval '95 minutes'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'seed-confirmed', now() - interval '30 minutes'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'seed-new', now() - interval '10 minutes')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reservations (id, group_id, store_id, customer_id, status, code, created_at, expires_at, decided_at) VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'movida', '10000000-0000-0000-0000-000000000001', 'PENDING', 'DEMO01', now() - interval '95 minutes', now() + interval '25 minutes', NULL),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'essenza', '10000000-0000-0000-0000-000000000001', 'PENDING', 'DEMO02', now() - interval '95 minutes', now() + interval '25 minutes', NULL),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'movida', '10000000-0000-0000-0000-000000000001', 'CONFIRMED', 'DEMO03', now() - interval '30 minutes', now() + interval '90 minutes', now() - interval '20 minutes'),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000003', 'essenza', '10000000-0000-0000-0000-000000000001', 'PENDING', 'DEMO04', now() - interval '10 minutes', now() + interval '110 minutes', NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.reservation_items (reservation_id, offer_id, selected_option, quantity, unit_price_cents_snapshot)
SELECT * FROM (VALUES
  ('40000000-0000-0000-0000-000000000001'::uuid, 'tenis-movida', '38', 1, 23990),
  ('40000000-0000-0000-0000-000000000002'::uuid, 'bolsa-essenza', 'Único', 1, 31990),
  ('40000000-0000-0000-0000-000000000003'::uuid, 'fone-movida', 'Único', 1, 29990),
  ('40000000-0000-0000-0000-000000000004'::uuid, 'tenis-essenza', '39', 1, 22990)
) AS seed(reservation_id, offer_id, selected_option, quantity, unit_price_cents_snapshot)
WHERE NOT EXISTS (SELECT 1 FROM public.reservation_items i WHERE i.reservation_id = seed.reservation_id AND i.offer_id = seed.offer_id);
INSERT INTO public.user_coupons (user_id, coupon_id, reservation_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'reservation', '40000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;
INSERT INTO public.notifications (user_id, type, title, message)
SELECT '10000000-0000-0000-0000-000000000001', 'PROMOTION', 'Seu favorito entrou em promoção', 'A Bolsa Estruturada Caramelo tem preço ilustrativo promocional de R$ 319,90 na Essenza.'
WHERE NOT EXISTS (SELECT 1 FROM public.notifications WHERE user_id = '10000000-0000-0000-0000-000000000001' AND type = 'PROMOTION');