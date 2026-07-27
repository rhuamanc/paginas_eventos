import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function TopNav() {
  const session = await getAuthSession();
  const userName = session?.user?.name?.trim() || session?.user?.email || "Usuario";
  const userInitial = userName.slice(0, 1).toUpperCase();

  return (
    <header className="border-b border-[color:var(--line)] bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 md:px-12">
        <Link href="/" className="font-serif text-2xl">Invita Studio</Link>
        <nav className="flex items-center gap-2">
          <Link href="/editor" className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-sm font-semibold">Editor</Link>
          <Link href="/dashboard" className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-sm font-semibold">Dashboard</Link>
          {session?.user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-2 py-1 md:flex">
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt={userName} referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand)] text-xs font-semibold text-white">
                    {userInitial}
                  </div>
                )}
                <div className="max-w-40 leading-tight">
                  <p className="truncate text-sm font-semibold">{userName}</p>
                  <p className="truncate text-xs text-[color:var(--ink-soft)]">Sesion activa</p>
                </div>
              </div>
              <LogoutButton compact />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-sm font-semibold">Entrar</Link>
              <Link href="/registro" className="rounded-full bg-[color:var(--brand)] px-3 py-1.5 text-sm font-semibold text-white">Crear cuenta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
