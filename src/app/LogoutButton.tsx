"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      style={{
        background: "transparent",
        color: "oklch(0.70 0.008 260)",
        border: "1px solid oklch(0.34 0.008 260)",
        borderRadius: 8,
        padding: "8px 14px",
        cursor: "pointer",
      }}
    >
      Salir
    </button>
  );
}
