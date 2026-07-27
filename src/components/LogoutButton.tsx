"use client";

import { signOut } from "next-auth/react";

type Props = {
  compact?: boolean;
};

export default function LogoutButton({ compact = false }: Props) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        compact
          ? "rounded-full bg-[color:var(--brand)] px-3 py-1.5 text-sm font-semibold text-white"
          : "rounded-full border border-[color:var(--line)] bg-white px-5 py-2 font-semibold"
      }
    >
      Cerrar sesion
    </button>
  );
}
