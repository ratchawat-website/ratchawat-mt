-- Remap 09:00 → 08:00 for existing private availability blocks
-- The gym changed morning slot from 09:00 to 08:00

UPDATE availability_blocks
SET time_slot = '08:00'
WHERE time_slot = '09:00' AND type IN ('private', 'all');
