-- Drop the levelSpread column if it exists
ALTER TABLE "Group" DROP COLUMN IF EXISTS "levelSpread";

-- Recreate the index to ensure it exists (idempotent operation)
CREATE INDEX IF NOT EXISTS "Group_teacherId_idx" ON public."Group" ("teacherId");
