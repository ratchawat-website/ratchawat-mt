-- Add 'private-slot-closure' type to availability_blocks.
-- Used by the admin "Private Session Slots" toggle to close a slot for
-- everyone on a given date, independently of the 6-trainer per-camp
-- capacity counter handled by 'private-slot' rows.
ALTER TABLE availability_blocks DROP CONSTRAINT availability_blocks_type_check;
ALTER TABLE availability_blocks
  ADD CONSTRAINT availability_blocks_type_check
  CHECK (type IN ('private', 'private-slot', 'private-slot-closure', 'full'));
