import { useState, useEffect } from "react";
import SentimentBadge from "../components/SentimentBadge";
import { getDocentes, crearEvaluacion } from "../../api/api";

const MAX_CHARS = 500;

function EvaluationForm() {
  const [docentes, setDocentes]   = useState([]);
  const [docenteId, setDocenteId] = useState("");
  const [comentario, setComentario] = useState("");
  const [loading, setLoading]     = useState(false);
  const [loadingDocentes, setLoadingDocentes] = useState(true);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");

  useEffect(() => {
    getDocentes()
      .then(setDocentes)
      .catch((err) => setError("No se pudo cargar la lista de docentes: " + err.message))
      .finally(() => setLoadingDocentes(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!docenteId || comentario.trim().length < 10) {
      setError("Selecciona un docente y escribe al menos 10 caracteres.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await crearEvaluacion({ docenteId, comentario });
      setResult(data);
    } catch (err) {
      setError(err.message || "Error al analizar el comentario.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setComentario("");
    setDocenteId("");
    setError("");
  }

  const docente  = docentes.find((d) => d._id === docenteId);
  const charsLeft = MAX_CHARS - comentario.length;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-2xl mx-auto">

      <div className="mb-10">
        <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">✦ Nueva evaluación</p>
        <h1 className="text-3xl font-bold text-white">Evaluar docente</h1>
        <p className="text-white/40 mt-1 text-sm">
          Tu comentario será analizado con IA para detectar el sentimiento.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Docente selector */}
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Docente</label>
            {loadingDocentes ? (
              <div className="h-12 rounded-xl bg-white/4 border border-white/10 animate-pulse" />
            ) : (
              <select
                value={docenteId}
                onChange={(e) => setDocenteId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500/60 focus:bg-white/6 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-zinc-900">Selecciona un docente...</option>
                {docentes.map((d) => (
                  <option key={d._id} value={d._id} className="bg-zinc-900">
                    {d.nombre} — {d.materia}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/40 uppercase tracking-widest">Comentario</label>
              <span className={`text-xs font-mono ${charsLeft < 50 ? "text-rose-400" : "text-white/25"}`}>
                {charsLeft} restantes
              </span>
            </div>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value.slice(0, MAX_CHARS))}
              rows={5}
              placeholder="Escribe tu opinión sobre el docente..."
              className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-3 text-sm resize-none focus:outline-none focus:border-violet-500/60 focus:bg-white/6 transition-all placeholder:text-white/20"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !docenteId || comentario.trim().length < 10}
            className="w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analizando con IA...
              </>
            ) : "✦ Analizar comentario"}
          </button>
        </form>
      ) : (
        /* ── Resultado ─────────────────────────────────────────────────── */
        <div className="flex flex-col gap-4">
          <div className={`rounded-2xl border p-6 ${
            result.nlp.sentiment === "positivo" ? "border-emerald-500/30 bg-emerald-500/5" :
            result.nlp.sentiment === "negativo" ? "border-rose-500/30 bg-rose-500/5" :
            "border-amber-500/30 bg-amber-500/5"
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Resultado del análisis</p>
                <p className="text-white font-semibold">{result.docente?.nombre ?? docente?.nombre}</p>
                <p className="text-xs text-white/30">{result.docente?.materia ?? docente?.materia}</p>
              </div>
              <SentimentBadge sentiment={result.nlp.sentiment} score={result.nlp.score} />
            </div>

            {/* Explicación de la IA */}
            {result.nlp.razon && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/8">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Razón detectada</p>
                <p className="text-sm text-white/70 italic">"{result.nlp.razon}"</p>
              </div>
            )}

            {/* Score bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/30 mb-1">
                <span>Negativo</span>
                <span>Score: <span className="font-mono text-white/60">{result.nlp.score.toFixed(3)}</span></span>
                <span>Positivo</span>
              </div>
              <div className="h-2 rounded-full bg-white/8 relative overflow-hidden">
                <div
                  className={`absolute top-0 h-full rounded-full transition-all duration-700 ${
                    result.nlp.sentiment === "positivo" ? "bg-emerald-500" :
                    result.nlp.sentiment === "negativo" ? "bg-rose-500" : "bg-amber-500"
                  }`}
                  style={{
                    width: `${Math.abs(result.nlp.score) * 50}%`,
                    left:  result.nlp.score >= 0 ? "50%" : "auto",
                    right: result.nlp.score  < 0 ? "50%" : "auto",
                  }}
                />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
              </div>
            </div>

            <div className="flex gap-6 text-xs">
              <div>
                <span className="text-white/30 uppercase tracking-widest text-[10px] block">Confianza</span>
                <span className="font-mono text-white/70">{(result.nlp.confianza * 100).toFixed(1)}%</span>
              </div>
              {result.nlp.keywords?.length > 0 && (
                <div>
                  <span className="text-white/30 uppercase tracking-widest text-[10px] block">Palabras clave</span>
                  <span className="text-white/60">{result.nlp.keywords.join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Comentario original */}
          <div className="rounded-xl border border-white/8 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Comentario enviado</p>
            <p className="text-sm text-white/70 leading-relaxed">"{comentario}"</p>
          </div>

          <button
            onClick={handleReset}
            className="w-full rounded-xl py-3 text-sm font-semibold border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
          >
            Nueva evaluación
          </button>
        </div>
      )}
    </div>
  );
}

export default EvaluationForm;
