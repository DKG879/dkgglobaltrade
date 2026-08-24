-- Replace definer-function policy checks with direct owner-scoped lookups
DROP POLICY IF EXISTS "admins insert commodities" ON public.commodities;
DROP POLICY IF EXISTS "admins update commodities" ON public.commodities;
DROP POLICY IF EXISTS "admins delete commodities" ON public.commodities;

CREATE POLICY "admins insert commodities" ON public.commodities
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "admins update commodities" ON public.commodities
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

CREATE POLICY "admins delete commodities" ON public.commodities
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

-- Signed-in users can no longer execute the SECURITY DEFINER role helper directly
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated, anon, PUBLIC;
