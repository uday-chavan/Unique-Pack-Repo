-- Fix spare parts category typos in the database
-- This script normalizes "spear part" and "spear parts" to "spare part" and "spare parts"

BEGIN;

-- Update "spear part" to "spare part"
UPDATE machines
SET category = 'spare part'
WHERE LOWER(category) = 'spear part';

-- Update "spear parts" to "spare parts"
UPDATE machines
SET category = 'spare parts'
WHERE LOWER(category) = 'spear parts';

-- Verify the changes
SELECT id, name, category FROM machines WHERE LOWER(category) LIKE '%spare%' OR LOWER(category) LIKE '%part%' ORDER BY created_at DESC;

COMMIT;
