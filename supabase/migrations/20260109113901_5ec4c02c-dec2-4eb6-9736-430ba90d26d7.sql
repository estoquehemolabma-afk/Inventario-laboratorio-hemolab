-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view all UBS" ON public.ubs;
DROP POLICY IF EXISTS "Authenticated users can insert UBS" ON public.ubs;
DROP POLICY IF EXISTS "Authenticated users can update UBS" ON public.ubs;
DROP POLICY IF EXISTS "Authenticated users can delete UBS" ON public.ubs;

DROP POLICY IF EXISTS "Authenticated users can view all equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can insert equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can update equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can delete equipment" ON public.equipment;

-- Create new policies - public read access, authenticated write access
CREATE POLICY "Anyone can view UBS" 
ON public.ubs 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert UBS" 
ON public.ubs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update UBS" 
ON public.ubs 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete UBS" 
ON public.ubs 
FOR DELETE 
TO authenticated
USING (true);

CREATE POLICY "Anyone can view equipment" 
ON public.equipment 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert equipment" 
ON public.equipment 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update equipment" 
ON public.equipment 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete equipment" 
ON public.equipment 
FOR DELETE 
TO authenticated
USING (true);