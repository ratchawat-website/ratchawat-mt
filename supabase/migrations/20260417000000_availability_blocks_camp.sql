-- Add optional `camp` column to availability_blocks.
--
-- Private sessions have capacity PRIVATE_SLOT_CAPACITY per camp per time
-- slot. Knowing which camp a `private-slot` row targets lets us count
-- occupancy per (date, time_slot, camp) and block only when a specific
-- camp is full, leaving the other camp still bookable for that slot.
--
-- Existing `full` and `private` blocks apply to both camps and keep a
-- NULL `camp`. Historical `private-slot` rows before this migration are
-- backfilled from their linked booking via `reason = 'Booking <uuid>'`.
ALTER TABLE availability_blocks
  ADD COLUMN IF NOT EXISTS camp text;

-- Backfill camp on existing private-slot rows by pulling the camp from
-- the associated booking referenced in the `reason` field.
UPDATE availability_blocks ab
SET camp = b.camp
FROM bookings b
WHERE ab.type = 'private-slot'
  AND ab.camp IS NULL
  AND ab.reason = 'Booking ' || b.id::text;

-- Optional (but lightweight) index to speed up occupancy queries.
CREATE INDEX IF NOT EXISTS availability_blocks_camp_lookup_idx
  ON availability_blocks (date, time_slot, camp)
  WHERE type = 'private-slot' AND is_blocked = true;
