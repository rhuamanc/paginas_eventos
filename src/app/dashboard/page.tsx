import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { listInvitationsByOwner } from "@/lib/storage";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const invitations = await listInvitationsByOwner(session.user.id);

  return (
    <main className="px-6 py-8 md:px-12">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-4xl">Dashboard</h1>
            <p className="text-[color:var(--ink-soft)]">Gestiona tus invitaciones y revisa RSVPs. Sesion: {session.user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/editor" className="rounded-full bg-[color:var(--brand)] px-5 py-2 font-semibold text-white">
              Nueva invitacion
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-4">
          {invitations.map((invitation) => (
            <article key={invitation.id} className="paper-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl">{invitation.title}</h2>
                  <p className="text-sm text-[color:var(--ink-soft)]">/{invitation.slug}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/editor?id=${invitation.id}`}
                    className="rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/dashboard/${invitation.id}/respuestas`}
                    className="rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold"
                  >
                    Ver RSVP
                  </Link>
                  <Link
                    href={`/i/${invitation.slug}`}
                    className="rounded-lg bg-[color:var(--brand)] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Ver publica
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
