CREATE TABLE "NotificationSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sendTime" TEXT NOT NULL DEFAULT '09:00',
    "domainEnabled" BOOLEAN NOT NULL DEFAULT true,
    "chargeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "domainDays" INTEGER[] NOT NULL DEFAULT ARRAY[30,15,7,1]::INTEGER[],
    "chargeDays" INTEGER[] NOT NULL DEFAULT ARRAY[30,15,7,1]::INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);
