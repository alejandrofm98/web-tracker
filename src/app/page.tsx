import Link from "next/link";
import { ArrowUpRight, Info, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/db";
import { daysUntil } from "@/lib/dates";
import { fmtDate, fmtMoney } from "@/lib/format";
import { chargeLabel, inventoryWhere, needsCompletion } from "@/lib/inventory";
import Shell from "./Shell";
import TestNotifyButton from "./TestNotifyButton";
import ChargeButton from "./ChargeButton";

export const revalidate = 0;
const FILTERS = [["", "Todas"], ["charges", "Cobros pendientes"], ["incomplete", "Por completar"],
  ["expiring", "Caducan <30d"], ["bajas", "Bajas"], ["todas", "Incluir bajas"]];

function hostname(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
function domainLabel(days: number) {
  if (days < 0) return `Caducó hace ${-days} días`;
  if (days === 0) return "Caduca hoy";
  return `Quedan ${days} días`;
}

export default async function Home({ searchParams }: { searchParams: { q?: string; f?: string } }) {
  const q = (searchParams.q ?? "").trim();
  const f = FILTERS.some(([value]) => value === searchParams.f) ? searchParams.f ?? "" : "";
  const [results, portfolio] = await Promise.all([
    prisma.website.findMany({ where: inventoryWhere(q, f), orderBy: [{ domainExpiresAt: "asc" }, { name: "asc" }] }),
    prisma.website.findMany({ where: { NOT: { status: "baja" } } }),
  ]);
  const webs = f === "incomplete" ? results.filter(needsCompletion) : results;
  const incomplete = portfolio.filter(needsCompletion).length;
  const hrefFor = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("f", value);
    if (q) params.set("q", q);
    return params.size ? `/?${params}` : "/";
  };
  return (
    <Shell activeFilter={f}>
      <div className="inventory-heading">
        <div>
          <p className="ed-kicker">Tu cartera de webs</p>
          <h1 className="ed-title">Todo a la vista.</h1>
          <p className="inventory-subtitle">Dominios, clientes y cobros en un mismo lugar.</p>
        </div>
        <Link href="/webs/nueva" className="btn-primary"><Plus size={16} /> Nueva web</Link>
      </div>
      <div className="inventory-summary" aria-label="Resumen de la cartera">
        <span><i className="status-dot" />{portfolio.length} webs activas</span>
        <span>{portfolio.filter(w => w.domainExpiresAt).length} dominios con fecha</span>
        <span>{portfolio.filter(w => w.chargeStatus === "cobrado").length} cobros resueltos</span>
        <time dateTime={new Date().toISOString().slice(0, 10)}>{new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", timeZone: "Europe/Madrid" })}</time>
      </div>
      {incomplete > 0 && (
        <aside className="inventory-notice">
          <Info size={17} aria-hidden="true" />
          <p><strong>{incomplete === 1 ? "Hay una ficha por completar." : `Hay ${incomplete} fichas por completar.`}</strong> <span>Faltan datos de cliente, dominio o cobro.</span></p>
          <Link href="/?f=incomplete">Revisar fichas <ArrowUpRight size={14} /></Link>
        </aside>
      )}
      <div className="inventory-toolbar">
        <nav className="inventory-filters" aria-label="Filtrar webs">
          {FILTERS.map(([value, label]) => <Link key={value} href={hrefFor(value)} className={`inventory-filter${f === value ? " active" : ""}`} aria-current={f === value ? "page" : undefined}>{label}</Link>)}
        </nav>
        <form action="/" className="inventory-search" role="search">
          <Search size={16} aria-hidden="true" />
          <input type="search" name="q" defaultValue={q} key={q} placeholder="Buscar web o cliente…" aria-label="Buscar web o cliente" className="input" />
          {f && <input type="hidden" name="f" value={f} />}
          <button type="submit" className="sr-only">Buscar</button>
        </form>
      </div>
      {webs.length > 0 ? (
        <table className="inventory-table">
          <caption className="sr-only">Inventario de webs, clientes, dominios y cobros</caption>
          <thead><tr>{["Web", "Cliente", "Proveedor", "Dominio", "Cobro", "Ficha"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>{webs.map(w => {
            const days = daysUntil(w.domainExpiresAt);
            const domainTone = days === null ? "warning" : days < 7 ? "danger" : days < 30 ? "warning" : "success";
            return <tr key={w.id}>
              <th scope="row" className="inventory-web"><Link href={`/webs/${w.id}`}>{w.name}</Link><span className="inventory-secondary">{hostname(w.url)}{w.status === "baja" && <span className="inventory-inactive"> · Baja</span>}</span></th>
              <td data-label="Cliente" className={!w.clientName ? "muted" : ""}>{w.clientName || "Sin asignar"}</td>
              <td data-label="Proveedor" className={!w.domainProvider ? "muted" : ""}>{w.domainProvider || "Sin registrar"}</td>
              <td data-label="Dominio"><span className={days === null ? "tone-warning" : ""}>{days === null ? "Por completar" : fmtDate(w.domainExpiresAt)}</span><span className={`inventory-secondary tone-${domainTone}`}>{days === null ? "Falta la fecha" : domainLabel(days)}</span></td>
              <td data-label="Cobro"><span>{w.chargeStatus === "sin-cobro" ? "Sin facturación" : w.clientPrice === null ? "Importe sin definir" : <>{fmtMoney(w.clientPrice)}<span className="muted"> /{w.billingPeriod === "mensual" ? "mes" : "año"}</span></>}</span><span className={`inventory-secondary tone-${w.chargeStatus === "cobrado" ? "success" : w.chargeStatus === "sin-cobro" ? "muted" : "warning"}`}>{chargeLabel(w)}</span>{w.chargeStatus === "pendiente" && <ChargeButton id={w.id} compact />}</td>
              <td className="inventory-open"><Link href={`/webs/${w.id}`} className="icon-btn" aria-label={`Abrir ficha de ${w.name}`} title="Abrir ficha"><ArrowUpRight size={17} /></Link></td>
            </tr>;
          })}</tbody>
        </table>
      ) : (
        <div className="empty inventory-empty"><h2>{q || f ? "No hay webs con estos filtros" : "Tu inventario empieza aquí"}</h2><p>{q || f ? "Prueba otra búsqueda o vuelve al listado completo." : "Añade una web para seguir su dominio y sus cobros."}</p><Link href={q || f ? "/" : "/webs/nueva"} className="btn-primary">{q || f ? "Ver todas las webs" : "Añadir primera web"}</Link></div>
      )}
      <footer className="inventory-footer"><span>{webs.length} {webs.length === 1 ? "web en este listado" : "webs en este listado"}</span><TestNotifyButton /></footer>
    </Shell>
  );
}
