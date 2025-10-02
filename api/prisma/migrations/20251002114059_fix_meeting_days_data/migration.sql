-- First, add a temporary column to store the JSON data
ALTER TABLE "Group" ADD COLUMN "meeting_days_temp" JSONB;

-- Convert text array to JSON array of objects
UPDATE "Group" 
SET "meeting_days_temp" = 
  CASE 
    WHEN "meetingDays" IS NOT NULL AND array_length("meetingDays", 1) > 0 
    THEN jsonb_build_array(
           jsonb_build_object(
             'day', "meetingDays"[1], 
             'startTime', '09:00', 
             'endTime', '10:00'
           )
         )
    ELSE '[]'::jsonb
  END;

-- Drop the old column and rename the new one
ALTER TABLE "Group" DROP COLUMN "meetingDays";
ALTER TABLE "Group" RENAME COLUMN "meeting_days_temp" TO "meetingDays";
