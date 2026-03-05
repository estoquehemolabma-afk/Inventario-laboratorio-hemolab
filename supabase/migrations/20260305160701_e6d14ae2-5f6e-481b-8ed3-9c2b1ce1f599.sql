
-- Change equipment.type from enum to text to allow custom types
ALTER TABLE public.equipment ALTER COLUMN type TYPE text USING type::text;

-- Drop the old enum
DROP TYPE IF EXISTS public.equipment_type;

-- Create equipment_types table for managing custom types
CREATE TABLE public.equipment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default types
INSERT INTO public.equipment_types (name) VALUES 
  ('PC'), ('Impressora'), ('Monitor'), ('Estabilizador'), 
  ('Scanner'), ('Notebook'), ('Roteador'), ('Switch'), ('Nobreak');

-- Enable RLS
ALTER TABLE public.equipment_types ENABLE ROW LEVEL SECURITY;

-- Anyone can view equipment types
CREATE POLICY "Anyone can view equipment types" ON public.equipment_types
  FOR SELECT USING (true);

-- Authenticated users can insert equipment types
CREATE POLICY "Authenticated users can insert equipment types" ON public.equipment_types
  FOR INSERT TO authenticated WITH CHECK (true);

-- Authenticated users can delete equipment types
CREATE POLICY "Authenticated users can delete equipment types" ON public.equipment_types
  FOR DELETE TO authenticated USING (true);
