"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({ icon }: { icon?: boolean }) {
  const router = useRouter();
  if (icon) {
    return (
      <button
        className="icon-btn"
        title="Salir"
        aria-label="Salir"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
          router.refresh();
        }}
      >
        <LogOut size={16} />
      </button>
    );
  }
  return (
    <button
      className="btn-ghost"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}
