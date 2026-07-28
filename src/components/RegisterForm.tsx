"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const registerResponse = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!registerResponse.ok) {
      const info = await registerResponse.json();
      setLoading(false);
      setError(info.error || "No se pudo crear la cuenta.");
      return;
    }

    const login = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (!login || login.error) {
      setError("Cuenta creada, pero no se pudo iniciar sesion automaticamente.");
      return;
    }

    window.location.href = login.url || "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-3">
      <input
        name="name"
        required
        placeholder="Nombre"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="w-full rounded-lg border border-[color:var(--line)] px-3 py-2"
      />
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
        minLength={6}
        placeholder="Contrasena (min 6)"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="w-full rounded-lg border border-[color:var(--line)] px-3 py-2"
      />
      <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[color:var(--brand)] px-3 py-2 font-semibold text-white" disabled={loading}>
        {loading ? <LoadingSpinner size="sm" className="text-white" /> : null}
        {loading ? "Creando..." : "Crear y entrar"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
