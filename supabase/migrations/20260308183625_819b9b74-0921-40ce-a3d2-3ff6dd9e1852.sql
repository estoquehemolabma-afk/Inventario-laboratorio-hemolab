
-- Table to store admin invite codes
CREATE TABLE public.admin_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.admin_invite_codes ENABLE ROW LEVEL SECURITY;

-- Only allow reading via a security definer function (no direct access)
CREATE POLICY "No direct access to invite codes"
ON public.admin_invite_codes
FOR SELECT
USING (false);

-- Security definer function to validate invite code
CREATE OR REPLACE FUNCTION public.validate_invite_code(input_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_invite_codes
    WHERE code = input_code AND is_active = true
  )
$$;

-- Insert a default invite code
INSERT INTO public.admin_invite_codes (code) VALUES ('HEMOLAB2026');
