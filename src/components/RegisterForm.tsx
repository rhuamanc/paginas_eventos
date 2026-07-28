"use client";

import { signIn } from "next-auth/react";

export default function RegisterForm() {
  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 font-semibold hover:bg-gray-50"
      >
        Registrarse con Google
      </button>
    </div>
  );
}
