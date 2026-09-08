"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="icon-btn danger"
      title="Eliminar"
      aria-label="Eliminar"
      onClick={async () => {
        if (!confirm("¿Eliminar esta web?")) return;
        setLoading(true);
        await fetch(`/api/webs/${id}`, { method: "DELETE" });
        router.push("/");
        router.refresh();
      }}
      disabled={loading}
    >
      <Trash2 size={15} />
    </button>
  );
}
