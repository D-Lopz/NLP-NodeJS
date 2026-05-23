/**
 * Muestra una etiqueta visual según el sentimiento NLP.
 * @param {{ sentiment: 'positivo'|'negativo'|'neutro', score?: number }} props
 */
function SentimentBadge({ sentiment, score }) {
  const config = {
    positivo: {
      label: "Positivo",
      icon: "↑",
      class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      bar: "bg-emerald-500",
    },
    negativo: {
      label: "Negativo",
      icon: "↓",
      class: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      bar: "bg-rose-500",
    },
    neutro: {
      label: "Neutro",
      icon: "→",
      class: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      bar: "bg-amber-500",
    },
  };

  const c = config[sentiment] ?? config.neutro;
  const pct = score != null ? Math.round(Math.abs(score) * 100) : null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-semibold tracking-wide ${c.class}`}
    >
      <span>{c.icon}</span>
      {c.label}
      {pct != null && <span className="opacity-70">({pct}%)</span>}
    </span>
  );
}

export default SentimentBadge;
