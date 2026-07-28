import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { listInvitationsByOwner } from "@/lib/storage";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import DashboardContent from "@/components/DashboardContent";

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

        <DashboardContent initialInvitations={invitations} />
      </section>
    </main>
  );
}
