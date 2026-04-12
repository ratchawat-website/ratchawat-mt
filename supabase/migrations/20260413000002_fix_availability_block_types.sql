-- Fix availability_blocks type constraint
-- Old: ('private','camp-stay','all')
-- New: ('private','private-slot','full')
--
-- 'camp-stay' blocks replaced by manual bookings (admin creates reservations)
-- 'all' replaced by 'full' (close entire camp)
-- 'private-slot' added for individual time slot blocking

-- Remove rows with deprecated types
DELETE FROM availability_blocks WHERE type IN ('camp-stay', 'all');

-- Drop old constraint and add new one
ALTER TABLE availability_blocks DROP CONSTRAINT availability_blocks_type_check;
ALTER TABLE availability_blocks
  ADD CONSTRAINT availability_blocks_type_check
  CHECK (type IN ('private', 'private-slot', 'full'));
