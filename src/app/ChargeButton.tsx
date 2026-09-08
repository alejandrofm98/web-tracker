"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function ChargeButton({ id, compact }: { id: string; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function mark() {
    setLoading(true);
    await fetch(`/api/webs/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chargeStatus: "cobrado" }),
    });
    router.refresh();
    setLoading(false);
  }

  if (compact) {
    return (
      <button
        className="icon-btn accent"
        title="Marcar cobrado"
        aria-label="Marcar cobrado"
        disabled={loading}
        onClick={mark}
      >
        <Check size={15} />
      </button>
    );
  }

  return (
    <button className="btn-primary" disabled={loading} onClick={mark}>
      <Check size={15} />
      {loading ? "Marcando…" : "Marcar cobrado"}
    </button>
  );
}
