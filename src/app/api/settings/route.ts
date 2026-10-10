import { NextResponse } from "next/server";
import { hasApiAccess } from "@/lib/access";
import { prisma } from "@/lib/db";
import { getNotificationSettings } from "@/lib/settings";
import { parseNotificationPreferences } from "@/lib/notification-settings";

export async function GET(req: Request) {
  if (!(await hasApiAccess(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await getNotificationSettings());
}

export async function PUT(req: Request) {
  if (!(await hasApiAccess(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  let settings;
  try {
    settings = parseNotificationPreferences(await req.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ajustes no válidos." }, { status: 400 });
  }
  await prisma.notificationSettings.upsert({
    where: { id: 1 }, create: { id: 1, ...settings }, update: settings,
  });
  return NextResponse.json(settings);
}
