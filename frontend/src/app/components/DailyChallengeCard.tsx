"use client";

import { useMemo, useState } from "react";
import type { Poll } from "@/app/lib/content";

export default function DailyChallengeCard({ poll }: { poll: Poll | null }) {
  const [selected, setSelected] = useState<string>("");
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries((poll?.options || []).map((option) => [option.key, option.count])),
  );
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  const total = useMemo(() => Object.values(counts).reduce((sum, count) => sum + count, 0), [counts]);

  async function vote() {
    if (!poll || !selected) return;

    setStatus("saving");
    const res = await fetch(`/api/polls/${poll.documentId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option: selected }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      return;
    }

    if (data?.data?.counts) setCounts(data.data.counts);
    setStatus("done");
  }

  return (
    <section className="bg-surface border border-border-light dark:bg-dark-surface dark:border-border-dark rounded-lg p-6 text-center md:text-left">
      <span className="block text-secondary dark:text-secondary-fixed-dim text-xs font-black uppercase tracking-[0.25em] mb-2">Reto Diario</span>
      <h2 className="font-serif text-2xl font-bold text-primary dark:text-primary-fixed-dim mb-3">
        {poll?.title || "Participa en el reto de hoy"}
      </h2>
      <p className="text-on-surface-variant dark:text-surface-variant mb-5 leading-relaxed">
        {poll?.question || "Muy pronto tendremos un nuevo reto diario para nuestros lectores."}
      </p>
      {poll?.description && <p className="text-sm text-on-surface-variant dark:text-surface-variant mb-4">{poll.description}</p>}

      <div className="space-y-2 mb-5">
        {(poll?.options || []).map((option) => {
          const count = counts[option.key] || 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelected(option.key)}
              className={`w-full border px-3 py-2 text-left text-sm transition-colors ${selected === option.key ? "border-secondary bg-secondary/10" : "border-border dark:border-border-dark hover:border-secondary"}`}
            >
              <span className="font-bold mr-2">{option.key}.</span>
              {option.label}
              {status === "done" && <span className="float-right font-bold text-primary dark:text-primary-fixed-dim">{percent}%</span>}
            </button>
          );
        })}
      </div>

      {poll ? (
        <button
          onClick={vote}
          disabled={!selected || status === "saving" || status === "done"}
          className="w-full bg-secondary text-white py-3 px-4 text-xs font-black uppercase tracking-widest disabled:opacity-50"
        >
          {status === "saving" ? "Enviando..." : status === "done" ? "Voto registrado" : "Responder reto"}
        </button>
      ) : (
        <div className="border border-dashed border-border dark:border-border-dark py-3 text-sm text-muted-foreground">Sin reto activo</div>
      )}
      {status === "error" && <p className="mt-3 text-sm text-secondary">No se pudo registrar el voto. Intenta nuevamente.</p>}
    </section>
  );
}
