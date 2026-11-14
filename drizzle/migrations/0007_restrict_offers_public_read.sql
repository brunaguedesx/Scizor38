DROP POLICY IF EXISTS offers_public_read ON public.offers;
CREATE POLICY offers_public_read ON public.offers FOR SELECT TO anon, authenticated
USING (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = offers.store_id AND s.active = true)
  AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = offers.product_id AND p.active = true)
);