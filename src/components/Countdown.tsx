"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  dateTime: string;
};

type Counter = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

const ZERO: Counter = { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };

function getCounter(targetISO: string): Counter {
  const target = new Date(targetISO).getTime();
  const now = Date.now();
  const diff = target - now;

  if (!targetISO || Number.isNaN(target) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, done: false };
}

export default function Countdown({ dateTime }: Props) {
  // Iniciar con ceros para que SSR y primer render del cliente coincidan
  const [counter, setCounter] = useState<Counter>(ZERO);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCounter(getCounter(dateTime));

    const id = window.setInterval(() => {
      setCounter(getCounter(dateTime));
    }, 1000);

    return () => window.clearInterval(id);
  }, [dateTime]);

  const slots = useMemo(
    () => [
      { label: "Dias", value: counter.days },
      { label: "Horas", value: counter.hours },
      { label: "Min", value: counter.minutes },
      { label: "Seg", value: counter.seconds },
    ],
    [counter]
  );

  if (mounted && counter.done) {
    return <p className="text-sm text-[color:var(--ink-soft)]">El evento ya comenzo o no tiene fecha configurada.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot) => (
        <div key={slot.label} className="rounded-xl border border-[color:var(--line)] bg-white px-2 py-3 text-center">
          <p className="text-2xl font-bold">{mounted ? String(slot.value).padStart(2, "0") : "--"}</p>
          <p className="text-xs text-[color:var(--ink-soft)]">{slot.label}</p>
        </div>
      ))}
    </div>
  );
}
