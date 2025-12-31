-- Create enum for support request status
CREATE TYPE public.support_status AS ENUM ('recebido', 'em_andamento', 'resolvido', 'cancelado');

-- Create enum for support request type
CREATE TYPE public.support_type AS ENUM ('hardware', 'software', 'rede', 'impressora', 'outros');

-- Create enum for priority
CREATE TYPE public.support_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Create support requests table
CREATE TABLE public.support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code TEXT NOT NULL UNIQUE,
  ubs_name TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  requester_phone TEXT,
  request_type support_type NOT NULL DEFAULT 'outros',
  priority support_priority NOT NULL DEFAULT 'media',
  status support_status NOT NULL DEFAULT 'recebido',
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  equipment_info TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for public insert (directors can create requests without auth)
CREATE POLICY "Anyone can create support requests"
ON public.support_requests
FOR INSERT
WITH CHECK (true);

-- Create policy for public select by tracking code (directors can view their requests)
CREATE POLICY "Anyone can view support requests by tracking code"
ON public.support_requests
FOR SELECT
USING (true);

-- Create policy for authenticated users to update
CREATE POLICY "Authenticated users can update support requests"
ON public.support_requests
FOR UPDATE
TO authenticated
USING (true);

-- Create function to generate tracking code
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_code := 'SUP-' || to_char(NOW(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate tracking code
CREATE TRIGGER set_tracking_code
  BEFORE INSERT ON public.support_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_tracking_code();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_support_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'resolvido' AND OLD.status != 'resolvido' THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_support_requests_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_updated_at();