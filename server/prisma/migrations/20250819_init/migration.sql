-- Prisma baseline migration for initial schema

-- Enums
CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN');
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- Tables
CREATE TABLE "User" (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	"passwordHash" TEXT NOT NULL,
	role "Role" NOT NULL DEFAULT 'MEMBER',
	"createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
	"updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Member" (
	id TEXT PRIMARY KEY,
	"userId" TEXT NOT NULL UNIQUE,
	"membershipId" TEXT NOT NULL UNIQUE,
	"firstName" TEXT NOT NULL,
	"lastName" TEXT NOT NULL,
	points INTEGER NOT NULL DEFAULT 0,
	status "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
	"applePassId" TEXT,
	"googlePassId" TEXT,
	"createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
	"updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT "Member_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE "PointsTransaction" (
	id TEXT PRIMARY KEY,
	"memberId" TEXT NOT NULL,
	delta INTEGER NOT NULL,
	reason TEXT,
	"createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT "PointsTransaction_member_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Indexes (uniques already added above)
CREATE INDEX "PointsTransaction_member_idx" ON "PointsTransaction" ("memberId");
