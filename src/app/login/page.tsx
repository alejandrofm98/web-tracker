"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      if (!res.ok) {
        setError("Usuario o contraseña incorrectos");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-wrap">
      <a className="brand login-brand" href="/" style={{ color: "var(--text)" }}><span className="brand-mark">W</span><span className="brand-name">Web Tracker</span></a>
      <div className="login-right">
        <form onSubmit={onSubmit} className="login-card">
          <p className="ed-kicker">Tu espacio privado</p>
          <h1>Entra en Web Tracker</h1>
          <p className="login-subtitle">Retoma el control de tus webs.</p>
          <label className="field">
            <span>Usuario</span>
            <input value={user} onChange={(e) => setUser(e.target.value)} required autoComplete="username" className="input" />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              autoComplete="current-password"
              className="input"
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Entrando…" : "Entrar"}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </main>
  );
}
