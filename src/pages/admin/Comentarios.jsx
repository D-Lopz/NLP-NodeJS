import SentimentBadge from "../../components/SentimentBadge";
import { getEvaluaciones, getDocentes } from "../../api/api";
import { useState, useEffect } from "react";

const SENTIMIENTOS = [
  { value: "", label: "Todos los sentimientos" },
  { value: "positivo", label: "Positivo", color: "text-emerald-400" },
  { value: "neutro",   label: "Neutro",   color: "text-amber-400" },
  { value: "negativo", label: "Negativo", color: "text-rose-400" },
];

function Comentarios() {
  const [evaluaciones, setEvaluaciones]           = useState([]);
  const [docentes, setDocentes]                   = useState([]);
  const [filtroDocente, setFiltroDocente]         = useState("");
  const [filtroSentimiento, setFiltroSentimiento] = useState("");
  const [loading, setLoading]                     = useState(true);

  useEffect(() => {
    Promise.all([getEvaluaciones(), getDocentes()])
      .then(([evals, docs]) => { setEvaluaciones(evals); setDocentes(docs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtradas = evaluaciones
    .filter(e => !filtroDocente || e.docente?._id?.toString() === filtroDocente)
    .filter(e => !filtroSentimiento || e.nlp?.sentiment === filtroSentimiento);

  const docenteFiltrado = docentes.find(d => d._id === filtroDocente);
  const nombreDocente   = (d) => d?.nombre + (d?.docente?.titulo ? ` — ${d.docente.titulo}` : "");

  const conteo = {
    positivo: filtradas.filter(e => e.nlp?.sentiment === "positivo").length,
    neutro:   filtradas.filter(e => e.nlp?.sentiment === "neutro").length,
    negativo: filtradas.filter(e => e.nlp?.sentiment === "negativo").length,
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">✦ Feedback</p>
        <h1 className="text-2xl font-bold text-white">Retroalimentación de Alumnos</h1>
        <p className="text-white/40 text-sm mt-1">Revisión de las opiniones y evaluaciones cualitativas recibidas por los docentes.</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filtroDocente} onChange={(e) => setFiltroDocente(e.target.value)}
          className="flex-1 min-w-48 rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all cursor-pointer">
          <option value="" className="bg-zinc-900">Todos los docentes</option>
          {docentes.map((d) => (
            <option key={d._id} value={d._id} className="bg-zinc-900">{nombreDocente(d)}</option>
          ))}
        </select>

        <select value={filtroSentimiento} onChange={(e) => setFiltroSentimiento(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all cursor-pointer">
          {SENTIMIENTOS.map(s => (
            <option key={s.value} value={s.value} className="bg-zinc-900">{s.label}</option>
          ))}
        </select>

        {(filtroDocente || filtroSentimiento) && (
          <button onClick={() => { setFiltroDocente(""); setFiltroSentimiento(""); }}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-white/40 hover:text-white/70 transition-all">
            Limpiar ✕
          </button>
        )}
      </div>

      {/* Resumen */}
      <div className="rounded-xl border border-white/8 p-4 mb-6 flex items-center gap-6"
        style={{ background: "rgba(255,255,255,0.02)" }}>
        {docenteFiltrado && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{docenteFiltrado.nombre}</p>
            {docenteFiltrado.docente?.titulo && <p className="text-xs text-white/40">{docenteFiltrado.docente.titulo}</p>}
          </div>
        )}
        <div className="flex gap-5 text-xs font-mono ml-auto">
          <div className="text-center">
            <p className="text-white/70 text-lg font-bold">{filtradas.length}</p>
            <p className="text-white/30 uppercase tracking-widest text-[10px]">Total</p>
          </div>
          <div className="text-center">
            <p className="text-emerald-400 text-lg font-bold">{conteo.positivo}</p>
            <p className="text-white/30 uppercase tracking-widest text-[10px]">Positivos</p>
          </div>
          <div className="text-center">
            <p className="text-amber-400 text-lg font-bold">{conteo.neutro}</p>
            <p className="text-white/30 uppercase tracking-widest text-[10px]">Neutros</p>
          </div>
          <div className="text-center">
            <p className="text-rose-400 text-lg font-bold">{conteo.negativo}</p>
            <p className="text-white/30 uppercase tracking-widest text-[10px]">Negativos</p>
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-white/8 animate-pulse"
              style={{ background: "rgba(255,255,255,0.02)" }} />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <p className="text-center py-10 text-white/30 text-sm">No hay comentarios para mostrar.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map((ev) => (
            <div key={ev._id} className="rounded-xl border border-white/8 p-4 hover:border-white/15 transition-all"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {!filtroDocente && ev.docente?.nombre && (
                    <span className="text-sm font-semibold text-white">{ev.docente.nombre}</span>
                  )}
                  {ev.docente?.docente?.titulo && (
                    <span className="text-xs text-white/30 font-mono">{ev.docente.docente.titulo}</span>
                  )}
                  <SentimentBadge sentiment={ev.nlp?.sentiment} score={ev.nlp?.score} />
                </div>
                <span className="text-xs text-white/25 font-mono shrink-0">
                  {new Date(ev.createdAt).toLocaleDateString("es-CO")}
                </span>
              </div>
              <p className="text-sm text-white/65 leading-relaxed">{ev.comentario}</p>
              {ev.nlp?.razon && (
                <p className="text-xs text-white/30 italic mt-2 border-t border-white/6 pt-2">
                  IA: "{ev.nlp.razon}"
                </p>
              )}
              <div className="flex gap-3 mt-2 text-xs font-mono text-white/20">
                <span>Score: {ev.nlp?.score?.toFixed(3)}</span>
                <span>·</span>
                <span>Confianza: {((ev.nlp?.confianza ?? 0)*100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Comentarios;
