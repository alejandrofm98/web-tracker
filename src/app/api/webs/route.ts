import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hasApiAccess } from "@/lib/access";

import { inventoryWhere, needsCompletion } from "@/lib/inventory";

async function guard(req: Request) {
  if (!(await hasApiAccess(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const f = searchParams.get("f") ?? "";

  const where = inventoryWhere(q, f);

  const webs = await prisma.website.findMany({
    where,
    orderBy: [{ domainExpiresAt: "asc" }, { nextChargeAt: "asc" }],
  });
  return NextResponse.json(f === "incomplete" ? webs.filter(needsCompletion) : webs);
}

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const url = String(body.url ?? "").trim();
  if (!name || !url) {
    return NextResponse.json({ error: "nombre y url son obligatorios" }, { status: 400 });
  }
  const web = await prisma.website.create({
    data: {
      name,
      url,
      clientName: String(body.clientName ?? ""),
      clientContact: String(body.clientContact ?? ""),
      status: String(body.status ?? "activa"),
      domainProvider: String(body.domainProvider ?? ""),
      domainExpiresAt: body.domainExpiresAt ? new Date(body.domainExpiresAt) : null,
      domainCost: body.domainCost != null && body.domainCost !== "" ? Number(body.domainCost) : null,
      domainAutoRenew: Boolean(body.domainAutoRenew ?? false),
      hostingProvider: String(body.hostingProvider ?? ""),
      hostingPlan: String(body.hostingPlan ?? ""),
      ownCost: body.ownCost != null && body.ownCost !== "" ? Number(body.ownCost) : null,
      clientPrice: body.clientPrice != null && body.clientPrice !== "" ? Number(body.clientPrice) : null,
      billingPeriod: String(body.billingPeriod ?? "anual"),
      nextChargeAt: body.nextChargeAt ? new Date(body.nextChargeAt) : null,
      chargeStatus: String(body.chargeStatus ?? "pendiente"),
      stack: String(body.stack ?? ""),
      repoUrl: String(body.repoUrl ?? ""),
      credentialsHint: String(body.credentialsHint ?? ""),
      envHint: String(body.envHint ?? ""),
      notes: String(body.notes ?? ""),
    },
  });
  return NextResponse.json(web, { status: 201 });
}
