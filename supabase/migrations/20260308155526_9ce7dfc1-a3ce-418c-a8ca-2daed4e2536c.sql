
-- Drop restrictive policies and recreate as permissive for equipment table
DROP POLICY IF EXISTS "Anyone can view equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can delete equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can insert equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can update equipment" ON public.equipment;

CREATE POLICY "Anyone can view equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update equipment" ON public.equipment FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete equipment" ON public.equipment FOR DELETE TO authenticated USING (true);
