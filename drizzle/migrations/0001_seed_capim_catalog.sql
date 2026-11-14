INSERT INTO public.stores (id, name, location_label) VALUES
  ('casa-aurora', 'Casa Aurora', 'Piso 1 · Praça Central'),
  ('essenza', 'Essenza', 'Piso 2 · Ala Norte'),
  ('movida', 'Movida', 'Piso 1 · Entrada Sul')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.products (id, name, category, brand, description, image_key, color, tags, options) VALUES
  ('tenis-alba', 'Tênis Essencial Branco', 'Calçados', 'Alba', 'Tênis de linhas limpas, palmilha macia e solado leve para acompanhar o ritmo do seu dia.', 'tenis-branco', 'branco', ARRAY['tênis','tenis','casual','minimalista'], ARRAY['36','37','38','39','40','41','42']),
  ('camisa-nativa', 'Camisa de Linho Sálvia', 'Moda', 'Nativa', 'Camisa em tecido leve com modelagem relaxada e toque natural, ideal para dias quentes.', 'camisa-linho', 'verde', ARRAY['camisa','linho','casual'], ARRAY['P','M','G','GG']),
  ('vestido-serena', 'Vestido Midi Terracota', 'Moda', 'Casa Serena', 'Vestido midi fluido com cintura marcada e movimento suave para ocasiões especiais.', 'vestido-terracota', 'terracota', ARRAY['vestido','midi','festa'], ARRAY['P','M','G']),
  ('bolsa-lume', 'Bolsa Estruturada Caramelo', 'Acessórios', 'Lume', 'Bolsa estruturada com alça de mão, fecho metálico e compartimento interno.', 'bolsa-caramelo', 'caramelo', ARRAY['bolsa','couro','trabalho'], ARRAY['Único']),
  ('relogio-orbe', 'Relógio Clássico Dourado', 'Acessórios', 'Orbe', 'Relógio analógico de caixa dourada e pulseira marrom, com desenho atemporal.', 'relogio-dourado', 'dourado', ARRAY['relógio','relogio','clássico'], ARRAY['Único']),
  ('fone-orbe', 'Fone Sem Fio Onyx', 'Tecnologia', 'Orbe', 'Fone over-ear sem fio com almofadas macias e até 30 horas de bateria.', 'fone-preto', 'preto', ARRAY['fone','bluetooth','música','musica'], ARRAY['Único']),
  ('oculos-lume', 'Óculos de Sol Tartaruga', 'Acessórios', 'Lume', 'Óculos de sol com armação tartaruga, detalhes dourados e proteção UV400.', 'oculos-sol', 'marrom', ARRAY['óculos','oculos','sol'], ARRAY['Único']),
  ('perfume-lume', 'Eau de Parfum Âmbar 50 ml', 'Beleza', 'Lume', 'Fragrância demonstrativa de notas quentes, âmbar e baunilha em embalagem de 50 ml.', 'perfume-ambar', 'âmbar', ARRAY['perfume','fragrância','fragrancia','âmbar'], ARRAY['50 ml'])
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.offers (id, product_id, store_id, price_cents, original_price_cents, availability) VALUES
  ('tenis-movida', 'tenis-alba', 'movida', 23990, NULL, 'AVAILABLE'),
  ('tenis-essenza', 'tenis-alba', 'essenza', 22990, 29990, 'AVAILABLE'),
  ('camisa-aurora', 'camisa-nativa', 'casa-aurora', 18990, NULL, 'AVAILABLE'),
  ('camisa-essenza', 'camisa-nativa', 'essenza', 19990, NULL, 'AVAILABLE'),
  ('vestido-aurora', 'vestido-serena', 'casa-aurora', 26990, NULL, 'AVAILABLE'),
  ('bolsa-essenza', 'bolsa-lume', 'essenza', 31990, 35990, 'AVAILABLE'),
  ('relogio-essenza', 'relogio-orbe', 'essenza', 45990, NULL, 'AVAILABLE'),
  ('fone-movida', 'fone-orbe', 'movida', 29990, 34990, 'AVAILABLE'),
  ('oculos-aurora', 'oculos-lume', 'casa-aurora', 15990, NULL, 'UNAVAILABLE'),
  ('oculos-essenza', 'oculos-lume', 'essenza', 16990, NULL, 'AVAILABLE'),
  ('perfume-essenza', 'perfume-lume', 'essenza', 19990, NULL, 'CHECK_WITH_STORE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.coupons (id, code, rule_type, discount_description, expires_at) VALUES
  ('welcome', 'BEMVINDO10', 'WELCOME_ONCE', 'Cupom ilustrativo de 10% · uma concessão por conta · sem valor comercial real', now() + interval '30 days'),
  ('reservation', 'RESERVA15', 'AFTER_CONFIRMED_RESERVATION', 'Cupom ilustrativo de 15% · concedido após reserva confirmada · sem valor comercial real', now() + interval '30 days')
ON CONFLICT (id) DO NOTHING;