import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hasApiAccess } from "@/lib/access";

async function guard(req: Request) {
  if (!(await hasApiAccess(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  const web = await prisma.website.findUnique({ where: { id } });
  if (!web) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(web);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  for (const k of [
    "name", "url", "clientName", "clientContact", "status",
    "domainProvider", "hostingProvider", "hostingPlan",
    "billingPeriod", "chargeStatus", "stack", "repoUrl",
    "credentialsHint", "envHint", "notes",
  ]) {
    if (body[k] !== undefined) data[k] = String(body[k]);
  }
  if (body.domainExpiresAt !== undefined)
    data.domainExpiresAt = body.domainExpiresAt ? new Date(body.domainExpiresAt) : null;
  if (body.nextChargeAt !== undefined)
    data.nextChargeAt = body.nextChargeAt ? new Date(body.nextChargeAt) : null;
  for (const k of ["domainCost", "ownCost", "clientPrice"]) {
    if (body[k] !== undefined)
      data[k] = body[k] === null || body[k] === "" ? null : Number(body[k]);
  }
  if (body.domainAutoRenew !== undefined) data.domainAutoRenew = Boolean(body.domainAutoRenew);

  try {
    const web = await prisma.website.update({ where: { id }, data });
    return NextResponse.json(web);
  } catch {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    await prisma.website.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
}
