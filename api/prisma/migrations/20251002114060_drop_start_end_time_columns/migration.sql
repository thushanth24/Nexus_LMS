-- First, ensure the meetingDays column exists and is properly set up
ALTER TABLE "Group" 
  ALTER COLUMN "meetingDays" SET NOT NULL,
  ALTER COLUMN "meetingDays" SET DEFAULT '[]'::jsonb;

-- Now drop the old columns
ALTER TABLE "Group" 
  DROP COLUMN IF EXISTS "startTime",
  DROP COLUMN IF EXISTS "endTime";
