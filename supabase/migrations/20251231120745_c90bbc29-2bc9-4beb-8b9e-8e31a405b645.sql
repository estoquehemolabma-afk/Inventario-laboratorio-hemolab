-- Fix function search path for generate_tracking_code
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.tracking_code := 'SUP-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));
  RETURN NEW;
END;
$$;

-- Fix function search path for update_support_updated_at
CREATE OR REPLACE FUNCTION public.update_support_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'resolvido' AND OLD.status != 'resolvido' THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$;