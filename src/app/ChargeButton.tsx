"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChargeButton({ id, compact }: { id: string; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (compact) {
    return (
      <button
        className="btn-ghost"
        style={{ marginLeft: "auto", padding: "4px 10px", fontSize: 12, flexShrink: 0 }}
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await fetch(`/api/webs/${id}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ chargeStatus: "cobrado" }),
          });
          router.refresh();
          setLoading(false);
        }}
      >
        {loading ? "…" : "Cobrado"}
      </button>
    );
  }

  return (
    <button
      className="btn-primary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch(`/api/webs/${id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ chargeStatus: "cobrado" }),
        });
        router.refresh();
        setLoading(false);
      }}
    >
      {loading ? "Marcando…" : "Marcar cobrado"}
    </button>
  );
}
