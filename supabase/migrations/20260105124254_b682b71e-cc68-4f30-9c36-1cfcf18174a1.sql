-- Change ubs_name from text to text[] to support multiple UBS per director
ALTER TABLE public.profiles 
ALTER COLUMN ubs_name TYPE text[] 
USING CASE 
  WHEN ubs_name IS NULL OR ubs_name = '' THEN NULL 
  ELSE ARRAY[ubs_name] 
END;

-- Update the handle_new_user function to handle text array
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ubs_array text[];
BEGIN
  -- Parse the ubs_name from metadata (could be comma-separated string or single value)
  IF new.raw_user_meta_data ->> 'ubs_name' IS NOT NULL AND new.raw_user_meta_data ->> 'ubs_name' != '' THEN
    -- Split by comma if multiple, otherwise create single-element array
    ubs_array := string_to_array(new.raw_user_meta_data ->> 'ubs_name', '|||');
  ELSE
    ubs_array := NULL;
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email, phone, ubs_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'phone', ''),
    ubs_array
  );
  RETURN new;
END;
$$;