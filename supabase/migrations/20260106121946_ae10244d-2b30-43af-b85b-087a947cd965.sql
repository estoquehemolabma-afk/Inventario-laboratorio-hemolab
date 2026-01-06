-- Create UBS table for health units
CREATE TABLE public.ubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT DEFAULT '',
  responsible TEXT DEFAULT '',
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment type enum
CREATE TYPE public.equipment_type AS ENUM ('PC', 'Impressora', 'Monitor', 'Estabilizador', 'Scanner', 'Notebook', 'Roteador', 'Switch', 'Nobreak');

-- Create conservation state enum
CREATE TYPE public.conservation_state AS ENUM ('Funcionando', 'Manutenção', 'Sucata');

-- Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ubs_id UUID NOT NULL REFERENCES public.ubs(id) ON DELETE CASCADE,
  type public.equipment_type NOT NULL,
  brand TEXT DEFAULT '',
  model TEXT DEFAULT '',
  serial_number TEXT DEFAULT '',
  patrimony_number TEXT DEFAULT '',
  location TEXT NOT NULL,
  conservation_state public.conservation_state NOT NULL DEFAULT 'Funcionando',
  installation_date TEXT DEFAULT '',
  observations TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Create policies for UBS - authenticated users can read all
CREATE POLICY "Authenticated users can view all UBS" 
ON public.ubs 
FOR SELECT 
TO authenticated
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

-- Create policies for Equipment
CREATE POLICY "Authenticated users can view all equipment" 
ON public.equipment 
FOR SELECT 
TO authenticated
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

-- Create indexes
CREATE INDEX idx_equipment_ubs_id ON public.equipment(ubs_id);
CREATE INDEX idx_equipment_type ON public.equipment(type);
CREATE INDEX idx_equipment_state ON public.equipment(conservation_state);

-- Create trigger for updated_at
CREATE TRIGGER update_ubs_updated_at
BEFORE UPDATE ON public.ubs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON public.equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();