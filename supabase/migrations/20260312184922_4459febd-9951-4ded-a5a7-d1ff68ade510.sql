
CREATE TABLE public.equipment_status_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  previous_state TEXT NOT NULL,
  new_state TEXT NOT NULL,
  justification TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.equipment_status_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view status logs" ON public.equipment_status_logs FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert status logs" ON public.equipment_status_logs FOR INSERT TO authenticated WITH CHECK (true);
