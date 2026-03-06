
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS municipality text DEFAULT '';
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS deactivation_reason text DEFAULT NULL;
