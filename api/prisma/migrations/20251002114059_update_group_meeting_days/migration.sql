-- AlterTable
ALTER TABLE "Group" 
  DROP COLUMN IF EXISTS "startTime",
  DROP COLUMN IF EXISTS "endTime",
  ALTER COLUMN "meetingDays" DROP NOT NULL,
  ALTER COLUMN "meetingDays" SET DATA TYPE JSONB USING COALESCE("meetingDays"::jsonb, '[]'::jsonb);

-- Recreate the index to ensure it exists (idempotent operation)
CREATE INDEX IF NOT EXISTS "Group_teacherId_idx" ON public."Group" ("teacherId");
