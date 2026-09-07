-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clientName" TEXT NOT NULL DEFAULT '',
    "clientContact" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'activa',
    "domainProvider" TEXT NOT NULL DEFAULT '',
    "domainExpiresAt" TIMESTAMP(3),
    "domainCost" DOUBLE PRECISION,
    "domainAutoRenew" BOOLEAN NOT NULL DEFAULT false,
    "hostingProvider" TEXT NOT NULL DEFAULT '',
    "hostingPlan" TEXT NOT NULL DEFAULT '',
    "ownCost" DOUBLE PRECISION,
    "clientPrice" DOUBLE PRECISION,
    "billingPeriod" TEXT NOT NULL DEFAULT 'anual',
    "nextChargeAt" TIMESTAMP(3),
    "chargeStatus" TEXT NOT NULL DEFAULT 'pendiente',
    "stack" TEXT NOT NULL DEFAULT '',
    "repoUrl" TEXT NOT NULL DEFAULT '',
    "credentialsHint" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "lastNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);
