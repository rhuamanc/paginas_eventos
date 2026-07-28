"use client";

import Link from "next/link";
import { useState } from "react";
import { Invitation } from "@/types/invitation";
import DeleteInvitationButton from "./DeleteInvitationButton";

interface DashboardContentProps {
  initialInvitations: Invitation[];
}

export default function DashboardContent({ initialInvitations }: DashboardContentProps) {
  const [invitations, setInvitations] = useState(initialInvitations);

  function handleInvitationDeleted(invitationId: string) {
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
  }

  if (invitations.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-8 text-center">
        <p className="text-[color:var(--ink-soft)] mb-4">No tienes invitaciones creadas aún.</p>
        <Link href="/editor" className="inline-block rounded-full bg-[color:var(--brand)] px-5 py-2 font-semibold text-white">
          Crear la primera invitacion
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {invitations.map((invitation) => (
        <article key={invitation.id} className="paper-card p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-2xl">{invitation.title}</h2>
              <p className="text-sm text-[color:var(--ink-soft)]">/{invitation.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/editor?id=${invitation.id}`}
                className="rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Editar
              </Link>
              <Link
                href={`/dashboard/${invitation.id}/respuestas`}
                className="rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Ver RSVP
              </Link>
              <Link
                href={`/i/${invitation.slug}`}
                className="rounded-lg bg-[color:var(--brand)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Ver publica
              </Link>
              <DeleteInvitationButton
                invitationId={invitation.id}
                invitationTitle={invitation.title}
                onDeleted={() => handleInvitationDeleted(invitation.id)}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
