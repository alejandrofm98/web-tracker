"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseNotificationPreferences, type NotificationPreferences } from "@/lib/notification-settings";

export default function NotificationForm({ initial }: { initial: NotificationPreferences }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [domainDays, setDomainDays] = useState(initial.domainDays.join(", "));
  const [chargeDays, setChargeDays] = useState(initial.chargeDays.join(", "));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  function readDays(text: string) {
    if (!/^\s*\d+\s*(,\s*\d+\s*)*$/.test(text)) throw new Error("Separa los días con comas, por ejemplo: 30, 15, 7, 1, 0.");
    return text.split(",").map(Number);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(""); setError("");
    let payload;
    try {
      payload = parseNotificationPreferences({ ...settings, domainDays: readDays(domainDays), chargeDays: readDays(chargeDays) });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Revisa los ajustes.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudieron guardar los ajustes.");
      setSettings(payload); setDomainDays(payload.domainDays.join(", ")); setChargeDays(payload.chargeDays.join(", "));
      setDirty(false); setMessage("Ajustes guardados. Se aplican sin reiniciar la aplicación.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error de conexión. Vuelve a intentarlo.");
    } finally { setLoading(false); }
  }

  return (
    <form className="notification-form" onSubmit={save} onChange={() => { setDirty(true); setMessage(""); setError(""); }}>
      <section className="settings-section">
        <div className="settings-section-title"><h2>Horario de revisión</h2><p>Una revisión al día. Solo recibirás mensajes cuando coincida un día de aviso.</p></div>
        <div className="settings-controls">
          <label className="check-field"><input type="checkbox" checked={settings.enabled} onChange={e => setSettings({ ...settings, enabled: e.target.checked })} /><span>Activar avisos automáticos</span></label>
          <label className="field time-field"><span>Hora de envío · Madrid</span><input type="time" required value={settings.sendTime} onChange={e => setSettings({ ...settings, sendTime: e.target.value })} className="input" /><small className="cell-sub">Europe/Madrid, cambia automáticamente con el horario de verano.</small></label>
        </div>
      </section>
      {(["domain", "charge"] as const).map(kind => {
        const domain = kind === "domain";
        const enabledKey = domain ? "domainEnabled" : "chargeEnabled";
        const value = domain ? domainDays : chargeDays;
        const setDays = domain ? setDomainDays : setChargeDays;
        return <section className="settings-section" key={kind}>
          <div className="settings-section-title"><h2>{domain ? "Caducidad de dominios" : "Cobros al cliente"}</h2><p>{domain ? "Te recuerda cuándo renovar los dominios que gestionas." : "Te recuerda las cuotas pendientes por dominio y hosting. Los cobros resueltos se excluyen."}</p></div>
          <div className="settings-controls">
            <label className="check-field"><input type="checkbox" checked={settings[enabledKey]} onChange={e => setSettings({ ...settings, [enabledKey]: e.target.checked })} /><span>{domain ? "Avisar de dominios" : "Avisar de cobros"}</span></label>
            <label className="field"><span>Días de antelación</span><input className="input" value={value} onChange={e => setDays(e.target.value)} required aria-describedby={`${kind}-days-help`} /><small id={`${kind}-days-help`} className="cell-sub">Separa con comas. 0 avisa el día del vencimiento. De 0 a 365 días.</small></label>
            <div className="day-presets" aria-label={`Opciones de aviso para ${domain ? "dominios" : "cobros"}`}>
              <button type="button" className="btn-ghost" onClick={() => { setDays("30, 15, 7, 1"); setDirty(true); setMessage(""); }}>30, 15, 7, 1</button>
              <button type="button" className="btn-ghost" onClick={() => { setDays("30, 15, 7, 1, 0"); setDirty(true); setMessage(""); }}>Incluir vencimiento</button>
            </div>
          </div>
        </section>;
      })}
      <div className="notification-preview" role="status">
        <strong>{settings.enabled ? `Revisión diaria a las ${settings.sendTime} (Madrid)` : "Avisos automáticos pausados"}</strong>
        <p>{settings.enabled ? `Dominios: ${settings.domainEnabled ? `${domainDays} días antes` : "desactivados"}. Cobros: ${settings.chargeEnabled ? `${chargeDays} días antes` : "desactivados"}.` : "Tus webs y cobros siguen disponibles. Puedes enviar un mensaje de prueba."}</p>
        <small>Como máximo un mensaje por web y día. No hay recordatorios después del vencimiento.</small>
      </div>
      <div className="settings-save"><button className="btn-primary" type="submit" disabled={loading || !dirty}>{loading ? "Guardando…" : "Guardar ajustes"}</button>{dirty && !loading && <span className="muted">Hay cambios sin guardar</span>}</div>
      {error && <p role="alert" className="form-error">{error}</p>}
      {message && <p role="status" className="tone-success">{message}</p>}
    </form>
  );
}
