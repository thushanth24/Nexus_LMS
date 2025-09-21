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
