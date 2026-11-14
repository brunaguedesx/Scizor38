DROP POLICY IF EXISTS ai_state_read ON public.ai_access_state;
REVOKE ALL ON public.ai_access_state FROM authenticated, anon;