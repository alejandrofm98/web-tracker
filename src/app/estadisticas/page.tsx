import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { fmtDate, fmtMoney } from "@/lib/format";
import { portfolioStatistics } from "@/lib/statistics";
import Shell from "../Shell";

export const revalidate = 0;

export default async function StatisticsPage() {
  const stats = portfolioStatistics(await prisma.website.findMany({ where: { NOT: { status: "baja" } } }));
  const maxAmount = Math.max(...stats.months.map(m => m.amount), 1);
  return (
    <Shell>
      <div className="inventory-heading">
        <div><p className="ed-kicker">La cartera en números</p><h1 className="ed-title">Estadísticas</h1><p className="inventory-subtitle">Lo que prevés cobrar y lo que tienes pendiente.</p></div>
        <Link href="/?f=charges" className="btn-ghost">Revisar cobros <ArrowUpRight size={16} /></Link>
      </div>
      {stats.webs === 0 ? (
        <div className="empty inventory-empty"><h2>Los números empiezan con tu primera web</h2><p>Añade su cuota y las fechas para ver aquí la previsión.</p><Link href="/webs/nueva" className="btn-primary"><Plus size={16} /> Nueva web</Link></div>
      ) : (
        <>
          <dl className="stat-ledger">
            <div><dt>Cuotas anuales previstas</dt><dd>{fmtMoney(stats.annualRevenue)}</dd><p>Las cuotas mensuales se multiplican por 12.{stats.missingPrices > 0 && ` ${stats.missingPrices} sin importe.`}</p></div>
            <div><dt>Pendiente de cobrar</dt><dd>{fmtMoney(stats.pendingAmount)}</dd><p>{stats.pendingCount} {stats.pendingCount === 1 ? "cobro pendiente" : "cobros pendientes"}{stats.pendingMissingPrices > 0 && ` · ${stats.pendingMissingPrices} sin importe`}.</p></div>
            <div><dt>Coste de renovar dominios</dt><dd>{fmtMoney(stats.domainCost)}</dd><p>Suma de {stats.knownDomainCosts} {stats.knownDomainCosts === 1 ? "coste registrado" : "costes registrados"}, por renovación.</p></div>
          </dl>
          <div className="statistics-layout">
            <section className="report-section" aria-labelledby="forecast-title">
              <div className="section-heading"><h2 id="forecast-title">Próximos cobros</h2><span>12 meses</span></div>
              <p className="report-description">Solo fechas pendientes registradas desde hoy. No se generan renovaciones futuras.</p>
              {stats.months.every(m => m.count === 0) ? (
                <div className="forecast-empty"><h3>Aún no hay cobros previstos</h3><p>Añade las fechas de los próximos cobros para ver cómo se distribuyen durante el año.</p><Link href="/?f=charges">Completar los cobros <ArrowUpRight size={14} /></Link></div>
              ) : <div className="forecast-chart" role="img" aria-label={stats.months.map(m => `${m.label}: ${fmtMoney(m.amount)}, ${m.count} cobros`).join("; ")}>
                {stats.months.map(m => (
                  <div className="forecast-row" key={m.key} aria-hidden="true">
                    <span className="forecast-month">{m.label}</span>
                    <span className="forecast-track"><span className="forecast-bar" style={{ width: `${Math.max(0, m.amount) / maxAmount * 100}%` }} /></span>
                    <span className="forecast-amount">{fmtMoney(m.amount)}</span>
                  </div>
                ))}
              </div>}
              {stats.noChargeDate > 0 && <p className="report-description tone-warning">{stats.noChargeDate === 1 ? "Hay 1 cobro sin fecha que no aparece" : `Hay ${stats.noChargeDate} cobros sin fecha que no aparecen`} en la previsión.</p>}
            </section>
            <section className="report-section" aria-labelledby="attention-title">
              <div className="section-heading"><h2 id="attention-title">Requieren atención</h2><span>Hasta 30 días</span></div>
              {stats.overdueCount > 0 && <p className="overdue-summary"><strong>{fmtMoney(stats.overdueAmount)}</strong> en {stats.overdueCount} {stats.overdueCount === 1 ? "cobro atrasado" : "cobros atrasados"}. <Link href="/?f=charges">Revisar</Link></p>}
              {stats.events.length === 0 ? <p className="report-description">No hay dominios ni cobros con fechas vencidas o próximas en los siguientes 30 días.</p> : (
                <ul className="attention-list">
                  {stats.events.slice(0, 8).map(event => (
                    <li key={`${event.id}-${event.kind}`}>
                      <div><Link href={`/webs/${event.id}`}>{event.name}</Link><span>{event.kind} · {fmtDate(event.date)}{event.amount !== null ? ` · ${fmtMoney(event.amount)}` : ""}</span></div>
                      <span className={`event-due tone-${event.days < 0 ? "danger" : event.days <= 7 ? "warning" : "muted"}`}>{event.days < 0 ? `Hace ${-event.days} días` : event.days === 0 ? "Hoy" : `En ${event.days} días`}</span>
                    </li>
                  ))}
                </ul>
              )}
              {stats.events.length > 8 && <Link href="/">Ver toda la cartera ({stats.events.length} vencimientos) <ArrowUpRight size={14} /></Link>}
            </section>
          </div>
          <p className="report-footnote">Previsión basada en las fichas actuales, excluye webs de baja. No representa ingresos cobrados ni beneficio: todavía no hay un historial de pagos.</p>
        </>
      )}
    </Shell>
  );
}
