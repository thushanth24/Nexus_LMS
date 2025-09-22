# Nexus LMS - API Backend

This directory contains the NestJS backend for the Nexus Learning Management System. It provides all the necessary APIs for the web and mobile frontends.

## Prerequisites

- Node.js (v18 or later)
- pnpm (or npm/yarn)
- PostgreSQL database
- Docker (recommended for running PostgreSQL)
- An S3-compatible object storage service (e.g., AWS S3, MinIO)
- A LiveKit server instance

## Environment Variables

Create a `.env` file in the root of the `apps/api` directory. Use the `.env.example` as a template.

```env
# -----------------------------
# DATABASE
# -----------------------------
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_lms?schema=public"

# -----------------------------
# AUTH
# -----------------------------
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="1d"

# -----------------------------
# LIVEKIT
# -----------------------------
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"
LIVEKIT_HOST="http://localhost:7880"

# -----------------------------
# AWS S3
# -----------------------------
AWS_S3_BUCKET_NAME="your-s3-bucket-name"
AWS_REGION="your-aws-region"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"

```

## Installation

1.  Navigate to the `apps/api` directory:
    ```bash
    cd apps/api
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```

## Database Migrations

This project uses Prisma for database management.

1.  Ensure your `DATABASE_URL` in the `.env` file is correctly configured.
2.  Run the migrations to set up your database schema:
    ```bash
    pnpm prisma migrate dev
    ```
    This will apply all migrations in the `prisma/migrations` folder.

3.  (Optional) To seed the database with initial data:
    ```bash
    pnpm prisma db seed
    ```

## Running the App

```bash
# Development mode with hot-reload
pnpm start:dev
```

The application will be running on `http://localhost:3000` by default.

## API Structure

The API is organized into modules based on features:

-   `/auth`: Authentication (login, me)
-   `/users`: User management
-   `/groups`: Group class management
-   `/schedule`: Session scheduling
-   `/livekit`: LiveKit token generation
-   `/materials`: S3 pre-signed URL generation for uploads
-   `/homework`: Homework assignment management
-   `/submissions`: Homework submission and grading
-   `/chess`: Chess preset management
-   `/health`: Health check


-- SQL Schema for Nexus LMS on Supabase (PostgreSQL)

-- ---------------------------------
-- ENUM TYPES
-- Create custom types to enforce specific values for certain columns.
-- ---------------------------------

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');
CREATE TYPE "MaterialType" AS ENUM ('PDF', 'VIDEO');
CREATE TYPE "HomeworkType" AS ENUM ('TEXT', 'PGN');
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'GRADED');


-- ---------------------------------
-- TABLES
-- ---------------------------------

-- Table to store all users (Admins, Teachers, Students)
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL, -- This should store a hashed password
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "timezone" TEXT,
    "subjects" TEXT[], -- PostgreSQL array type for teacher subjects
    "level" TEXT,      -- For student proficiency level
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for group classes
CREATE TABLE "Group" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "meetingDays" TEXT[],
    "durationMin" INTEGER NOT NULL,
    "cap" INTEGER NOT NULL,
    "levelSpread" TEXT[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for one-to-one pairings
CREATE TABLE "Pair" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
    "studentId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "durationMin" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Join table for the many-to-many relationship between Groups and student Users (Roster)
CREATE TABLE "_GroupRoster" (
    "A" TEXT NOT NULL REFERENCES "Group"(id) ON DELETE CASCADE,
    "B" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

-- Table for scheduled class sessions
CREATE TABLE "Session" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "groupId" TEXT REFERENCES "Group"(id) ON DELETE SET NULL, -- Polymorphic relation
    "pairId" TEXT REFERENCES "Pair"(id) ON DELETE SET NULL,   -- Polymorphic relation
    "startsAt" TIMESTAMPTZ NOT NULL,
    "endsAt" TIMESTAMPTZ NOT NULL,
    "isChessEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "session_has_class_link" CHECK ("groupId" IS NOT NULL OR "pairId" IS NOT NULL)
);

-- Join table for session attendees (handles exceptions/additions to the main group roster)
CREATE TABLE "_SessionAttendees" (
    "A" TEXT NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
    "B" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

-- Table for class materials (PDFs, videos, etc.)
CREATE TABLE "Material" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "url" TEXT NOT NULL,
    "groupId" TEXT REFERENCES "Group"(id) ON DELETE SET NULL, -- Polymorphic relation
    "pairId" TEXT REFERENCES "Pair"(id) ON DELETE SET NULL,   -- Polymorphic relation
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "material_has_class_link" CHECK ("groupId" IS NOT NULL OR "pairId" IS NOT NULL)
);

-- Table for homework assignments
CREATE TABLE "Homework" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "type" "HomeworkType" NOT NULL,
    "dueAt" TIMESTAMPTZ NOT NULL,
    "groupId" TEXT REFERENCES "Group"(id) ON DELETE SET NULL, -- Polymorphic relation
    "pairId" TEXT REFERENCES "Pair"(id) ON DELETE SET NULL,   -- Polymorphic relation
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "homework_has_class_link" CHECK ("groupId" IS NOT NULL OR "pairId" IS NOT NULL)
);

-- Table for student submissions to homework
CREATE TABLE "Submission" (
    "id" TEXT PRIMARY KEY,
    "homeworkId" TEXT NOT NULL REFERENCES "Homework"(id) ON DELETE CASCADE,
    "studentId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "submittedAt" TIMESTAMPTZ,
    "content" JSONB, -- Flexible JSONB for text or file links
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "grade" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE ("homeworkId", "studentId") -- A student can only submit once per assignment
);

-- Table for chess presets (FEN/PGN strings) owned by teachers
CREATE TABLE "ChessPreset" (
    "id" TEXT PRIMARY KEY,
    "label" TEXT NOT NULL,
    "fen" TEXT,
    "pgn" TEXT,
    "ownerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------
-- INDEXES
-- Add indexes to foreign key columns for better query performance.
-- ---------------------------------
CREATE INDEX "Group_teacherId_idx" ON "Group"("teacherId");
CREATE INDEX "Pair_teacherId_idx" ON "Pair"("teacherId");
CREATE INDEX "Pair_studentId_idx" ON "Pair"("studentId");
CREATE INDEX "Session_groupId_idx" ON "Session"("groupId");
CREATE INDEX "Session_pairId_idx" ON "Session"("pairId");
CREATE INDEX "Homework_groupId_idx" ON "Homework"("groupId");
CREATE INDEX "Homework_pairId_idx" ON "Homework"("pairId");
CREATE INDEX "Submission_homeworkId_idx" ON "Submission"("homeworkId");
CREATE INDEX "Submission_studentId_idx" ON "Submission"("studentId");
CREATE INDEX "ChessPreset_ownerId_idx" ON "ChessPreset"("ownerId");