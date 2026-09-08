import { ArrowUpRight, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { daysUntil } from "@/lib/dates";
import { fmtDate, fmtMoney } from "@/lib/format";
import Shell from "./Shell";
import TestNotifyButton from "./TestNotifyButton";
import ChargeButton from "./ChargeButton";

export const revalidate = 0;

const DAY = 86400000;
const URGENT_DAYS = 30;

const FILTERS: Array<[string, string]> = [
  ["", "Todas"],
  ["expiring", "Caducan <30d"],
  ["charges", "Cobros pendientes"],
  ["bajas", "Bajas"],
  ["todas", "Incluir bajas"],
];

type Urgent = {
  id: string;
  webId: string;
  name: string;
  clientName: string;
  provider: string;
  kind: "dominio" | "cobro";
  days: number;
  date: Date;
  price: number | null;
};

function buildUrgent(webs: Awaited<ReturnType<typeof prisma.website.findMany>>): Urgent[] {
  const out: Urgent[] = [];
  for (const w of webs) {
    const dDom = daysUntil(w.domainExpiresAt);
    if (dDom !== null && dDom < URGENT_DAYS && w.domainExpiresAt) {
      out.push({
        id: `${w.id}-dom`,
        webId: w.id,
        name: w.name,
        clientName: w.clientName,
        provider: w.domainProvider,
        kind: "dominio",
        days: dDom,
        date: w.domainExpiresAt,
        price: w.domainCost,
      });
    }
    if (w.chargeStatus === "pendiente" && w.nextChargeAt) {
      const dCob = daysUntil(w.nextChargeAt);
      if (dCob !== null && dCob < URGENT_DAYS) {
        out.push({
          id: `${w.id}-cob`,
          webId: w.id,
          name: w.name,
          clientName: w.clientName,
          provider: w.hostingProvider,
          kind: "cobro",
          days: dCob,
          date: w.nextChargeAt,
          price: w.clientPrice,
        });
      }
    }
  }
  out.sort((a, b) => a.days - b.days);
  return out;
}

function dueLabel(days: number): string {
  if (days < 0) return `${-days}d tarde`;
  if (days === 0) return "hoy";
  return `${days}d`;
}

function idx(n: number): string {
  return String(n).padStart(2, "0");
}

function pillFor(days: number | null): string {
  if (days === null || days >= 30) return "pill-ok";
  if (days < 7) return "pill-crit";
  return "pill-warn";
}

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; f?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const f = searchParams.f ?? "";

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { url: { contains: q, mode: "insensitive" } },
      { clientName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (f === "expiring") where.domainExpiresAt = { lte: new Date(Date.now() + 30 * DAY) };
  else if (f === "charges") where.chargeStatus = "pendiente";
  else if (f === "bajas") where.status = "baja";
  else if (!f) where.NOT = { status: "baja" };

  const webs = await prisma.website.findMany({
    where,
    orderBy: [{ domainExpiresAt: "asc" }, { nextChargeAt: "asc" }],
  });

  const showDigest = !f || f === "expiring" || f === "charges";
  const urgent = showDigest ? buildUrgent(webs) : [];
  const urgentWebIds = new Set(urgent.map((u) => u.webId));
  const calm = webs.filter((w) => !urgentWebIds.has(w.id));

  const hrefFor = (v: string) =>
    v ? `/?f=${v}${q ? `&q=${encodeURIComponent(q)}` : ""}` : q ? `/?q=${encodeURIComponent(q)}` : "/";

  let n = 0;

  return (
    <Shell>
      <p className="ed-kicker">
        Panel · {webs.length} {webs.length === 1 ? "web" : "webs"}
      </p>

      {webs.length === 0 ? (
        <div className="empty" style={{ marginTop: 16 }}>
          <p>No hay webs aquí todavía.</p>
          <a href="/webs/nueva" className="btn-primary">
            <Plus size={15} /> Añade tu primera web
          </a>
        </div>
      ) : (
        <>
          {urgent.length > 0 && (
            <>
              <h1 className="ed-title">Qué necesita atención</h1>
              <div style={{ marginBottom: 30 }}>
                {urgent.map((u) => {
                  n += 1;
                  return (
                    <div key={u.id} className="ed-row">
                      <span className="ed-idx">{idx(n)}</span>
                      <h3>
                        <a href={`/webs/${u.webId}`}>{u.name}</a>
                      </h3>
                      <span className="ed-meta">
                        <span className={`pill pill-${u.days < 7 ? "crit" : "warn"}`}>
                          {u.kind} · {dueLabel(u.days)}
                        </span>
                        <span className="cell-sub">
                          {u.kind === "cobro"
                            ? `${fmtMoney(u.price)} · ${u.clientName || ""}`
                            : `${fmtDate(u.date)}${u.provider ? ` · ${u.provider}` : ""}`}
                        </span>
                        {u.kind === "cobro" && <ChargeButton id={u.webId} compact />}
                        <a
                          href={`/webs/${u.webId}`}
                          className="icon-btn"
                          title="Abrir ficha"
                          aria-label={`Abrir ${u.name}`}
                        >
                          <ArrowUpRight size={15} />
                        </a>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {calm.length > 0 && (
            <>
              <h2 className="ed-title" style={{ fontSize: 30 }}>
                En orden
              </h2>
              <div>
                {calm.map((w) => {
                  n += 1;
                  const dDom = daysUntil(w.domainExpiresAt);
                  const dCob = daysUntil(w.nextChargeAt);
                  const next =
                    dDom !== null && (dCob === null || dDom <= dCob)
                      ? { label: "dominio", days: dDom, date: w.domainExpiresAt }
                      : { label: "cobro", days: dCob, date: w.nextChargeAt };
                  return (
                    <div key={w.id} className="ed-row">
                      <span className="ed-idx">{idx(n)}</span>
                      <h3>
                        <a href={`/webs/${w.id}`}>{w.name}</a>
                      </h3>
                      <span className="ed-meta">
                        <span className={`pill ${pillFor(next.days)}`}>
                          {next.label} · {dueLabel2(next.days)}
                        </span>
                        <span className="cell-sub">
                          {w.clientName || fmtDate(next.date)}
                        </span>
                        <a
                          href={`/webs/${w.id}`}
                          className="icon-btn"
                          title="Abrir ficha"
                          aria-label={`Abrir ${w.name}`}
                        >
                          <ArrowUpRight size={15} />
                        </a>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      <div className="toolbar">
        <form action="/">
          <input name="q" defaultValue={q} placeholder="Buscar web, cliente…" className="input search" />
          {f && <input type="hidden" name="f" value={f} />}
        </form>
        <a href="/webs/nueva" className="btn-primary">
          <Plus size={15} /> Nueva web
        </a>
        <TestNotifyButton />
      </div>

      <nav className="chips">
        {FILTERS.map(([v, label]) => {
          const active = (v === "" && !f) || v === f;
          return (
            <a key={label} href={hrefFor(v)} className={`chip${active ? " active" : ""}`}>
              {label}
            </a>
          );
        })}
      </nav>
    </Shell>
  );
}

function dueLabel2(days: number | null): string {
  if (days === null) return "sin fecha";
  if (days < 0) return `caducó hace ${-days}d`;
  if (days === 0) return "hoy";
  return `${days}d`;
}
