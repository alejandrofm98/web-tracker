"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";

export default function TestNotifyButton() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        className="btn-ghost"
        title="Probar aviso"
        aria-label="Probar aviso"
        onClick={async () => {
          setLoading(true);
          setMsg("");
          try {
            const res = await fetch("/api/cron", { method: "POST" });
            const data = await res.json().catch(() => ({}));
            setMsg(res.ok ? "Mensaje de prueba enviado a Telegram" : data.error ?? "No se pudo enviar el aviso");
          } catch {
            setMsg("Error de conexión");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
      >
        <BellRing size={15} /> {loading ? "Enviando…" : "Probar aviso"}
      </button>
      {msg && <span role="status" style={{ fontSize: 12, color: "var(--text-muted)" }}>{msg}</span>}
    </span>
  );
}
