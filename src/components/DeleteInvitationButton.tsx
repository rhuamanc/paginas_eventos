"use client";

import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface DeleteInvitationButtonProps {
  invitationId: string;
  invitationTitle: string;
  onDeleted: () => void;
}

export default function DeleteInvitationButton({
  invitationId,
  invitationTitle,
  onDeleted,
}: DeleteInvitationButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("No se pudo eliminar la invitación.");
        setDeleting(false);
        return;
      }

      onDeleted();
    } catch {
      alert("Error al eliminar la invitación.");
      setDeleting(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="rounded-2xl bg-white p-6 shadow-lg max-w-sm">
          <h3 className="font-serif text-xl mb-2">¿Eliminar invitación?</h3>
          <p className="text-[color:var(--ink-soft)] mb-4">
            ¿Está seguro de que desea eliminar <strong>{invitationTitle}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={deleting}
              className="flex-1 rounded-lg border border-[color:var(--line)] px-3 py-2 font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? <LoadingSpinner size="sm" className="text-white" /> : null}
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      disabled={deleting}
      className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
    >
      Eliminar
    </button>
  );
}
