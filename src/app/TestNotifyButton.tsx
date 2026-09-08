"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";

export default function TestNotifyButton() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        className="icon-btn"
        title="Probar aviso"
        aria-label="Probar aviso"
        onClick={async () => {
          setLoading(true);
          setMsg("");
          try {
            const res = await fetch("/api/cron");
            const data = await res.json().catch(() => ({}));
            setMsg(res.ok ? `Revisadas ${data.checked}, avisos ${data.notified}` : "Error");
          } catch {
            setMsg("Error de conexión");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
      >
        <BellRing size={15} />
      </button>
      {msg && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{msg}</span>}
    </span>
  );
}
