"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Credenciales invalidas.");
      return;
    }

    window.location.href = result.url || "/dashboard";
  }

  return (
    <div className="mt-5 space-y-3">
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 font-semibold"
      >
        Continuar con Google
      </button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[color:var(--line)]" />
        </div>
        <p className="relative mx-auto w-fit bg-white px-2 text-xs text-[color:var(--ink-soft)]">o con email</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-[color:var(--line)] px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Contrasena"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-[color:var(--line)] px-3 py-2"
        />
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[color:var(--brand)] px-3 py-2 font-semibold text-white" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" className="text-white" /> : null}
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </form>
    </div>
  );
}
