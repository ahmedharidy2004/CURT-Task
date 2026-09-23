-- Add the global user role used by authentication and authorization.
ALTER TABLE "User"
ADD COLUMN "role" "Role" NOT NULL DEFAULT 'MEMBER';
