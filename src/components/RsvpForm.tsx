"use client";

import { useState } from "react";

type Props = {
  invitationId: string;
};

export default function RsvpForm({ invitationId }: Props) {
  const [name, setName] = useState("");
  const [attendees, setAttendees] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setStatus("Escribe tu nombre para confirmar.");
      return;
    }

    setSending(true);
    setStatus("");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          name: name.trim(),
          attendees,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const info = await response.json();
        setStatus(info.error || "No se pudo enviar RSVP.");
        return;
      }

      setStatus("Gracias, tu asistencia fue registrada.");
      setName("");
      setAttendees(1);
      setMessage("");
    } catch {
      setStatus("Error de red al enviar RSVP.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-[color:var(--line)] bg-white p-4">
      <h3 className="font-serif text-2xl">Confirmar asistencia</h3>
      <input
        className="w-full rounded-lg border border-[color:var(--line)] px-3 py-2"
        placeholder="Tu nombre"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        className="w-full rounded-lg border border-[color:var(--line)] px-3 py-2"
        type="number"
        min={1}
        max={20}
        value={attendees}
        onChange={(event) => setAttendees(Number(event.target.value) || 1)}
      />
      <textarea
        className="min-h-[80px] w-full rounded-lg border border-[color:var(--line)] px-3 py-2"
        placeholder="Mensaje (opcional)"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-lg bg-[color:var(--brand)] px-3 py-2 font-semibold text-white disabled:opacity-50"
      >
        {sending ? "Enviando..." : "Enviar RSVP"}
      </button>
      {status ? <p className="text-sm text-[color:var(--ink-soft)]">{status}</p> : null}
    </form>
  );
}
