import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SentimentBadge from "../../components/SentimentBadge";
import { useAuth } from "../../context/AuthContext";
import { getAsignaturas, getEvaluaciones, crearEvaluacion } from "../../api/api";

const MAX_CHARS = 500;

function esTextoValido(texto) {
  const palabras = texto.trim().split(/\s+/);
  if (palabras.length < 5) return false;
  const letras = texto.replace(/[^a-záéíóúüñ]/gi, "");
  const vocales = letras.replace(/[^aeiouáéíóú]/gi, "");
  if (letras.length > 0 && vocales.length / letras.length < 0.2) return false;
  return !palabras.some(p => p.length > 10 && !/[aeiouáéíóú]/i.test(p));
}

function Evaluar() {
  const { user, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [docentes, setDocentes]         = useState([]);   // docentes disponibles para evaluar
  const [docenteId, setDocenteId]       = useState("");
  const [comentario, setComentario]     = useState("");
  const [loading, setLoading]           = useState(false);
  const [loadingDocs, setLoadingDocs]   = useState(true);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState("");

  useEffect(() => {
    // 1. Obtener asignaturas inscritas del estudiante
    const asignaturasInscritas = user?.estudiante?.asignaturas || [];

    Promise.all([getAsignaturas(), getEvaluaciones()])
      .then(([asigData, evals]) => {
        const todasAsigs = asigData.asignaturas || asigData || [];

        // 2. Filtrar solo las asignaturas en las que está inscrito
        const misAsigs = asignaturasInscritas.length > 0
          ? todasAsigs.filter(a => asignaturasInscritas.includes(a._id))
          : todasAsigs; // si no tiene asignaturas asignadas, ve todos

        // 3. Construir lista de docentes únicos desde esas asignaturas
        const docentesMap = {};
        misAsigs.forEach(a => {
          const idDoc = a.docente?.id_docente?.toString();
          const nombre = a.docente?.nombre || a.nombre_docente;
          if (idDoc && nombre && !docentesMap[idDoc]) {
            docentesMap[idDoc] = {
              _id: idDoc,
              nombre,
              materia: a.nombre_asignatura,
            };
          }
        });

        // 4. Quitar los que ya fueron evaluados
        const yaEvaluados = new Set(evals.map(e => e.docente?._id?.toString()));
        const disponibles = Object.values(docentesMap).filter(d => !yaEvaluados.has(d._id));

        setDocentes(disponibles);
      })
      .catch(console.error)
      .finally(() => setLoadingDocs(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!docenteId) { setError("Selecciona un docente."); return; }
    if (comentario.trim().length < 10) { setError("El comentario debe tener al menos 10 caracteres."); return; }
    if (!esTextoValido(comentario)) {
      setError("Por favor escribe un comentario coherente. Evita escribir texto sin sentido.");
      return;
    }
    setLoading(true);
    try {
      const data = await crearEvaluacion({ docenteId, comentario });
      setResult(data);
      setDocentes(prev => prev.filter(d => d._id !== docenteId));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function handleReset() { setResult(null); setComentario(""); setDocenteId(""); setError(""); }
  function handleLogout() { cerrarSesion(); navigate("/login"); }

  const charsLeft = MAX_CHARS - comentario.length;

  return (
    <div className="min-h-screen" style={{ background: "#141414" }}>
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.015)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <span className="text-violet-400">O</span>
          <span className="font-mono text-sm font-bold tracking-widest text-white">NLP<span className="text-violet-400">.</span>EVAL</span>
          <span className="text-white/20 mx-2">|</span>
          <span className="text-xs text-white/40 uppercase tracking-widest">Estudiante</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60">{user?.nombre}</span>
          <button onClick={handleLogout} className="text-xs text-white/30 hover:text-rose-400 transition-colors">Salir</button>
        </div>
      </header>

      <div className="pt-10 pb-12 px-6 max-w-xl mx-auto">
        <div className="mb-8">
          <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">Evaluacion</p>
          <h1 className="text-2xl font-bold text-white">Evaluar docente</h1>
          <p className="text-white/40 mt-1 text-sm">
            Tu evaluación es <span className="text-white/60">completamente anónima</span>. Sé honesto y constructivo.
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                Docente
                {docentes.length > 0 && (
                  <span className="ml-2 text-violet-400 normal-case tracking-normal font-normal text-xs">
                    (solo tus docentes)
                  </span>
                )}
              </label>
              {loadingDocs ? (
                <div className="h-12 rounded-xl bg-white/4 border border-white/10 animate-pulse" />
              ) : docentes.length === 0 ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-amber-400 text-sm">
                  Ya evaluaste a todos tus docentes disponibles.
                </div>
              ) : (
                <select value={docenteId} onChange={(e) => setDocenteId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500/60 transition-all appearance-none cursor-pointer">
                  <option value="" disabled className="bg-zinc-900">Selecciona un docente...</option>
                  {docentes.map((d) => (
                    <option key={d._id} value={d._id} className="bg-zinc-900">
                      {d.nombre}{d.materia ? ` — ${d.materia}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/40 uppercase tracking-widest">Tu comentario</label>
                <span className={`text-xs font-mono ${charsLeft < 50 ? "text-rose-400" : "text-white/25"}`}>
                  {charsLeft} restantes
                </span>
              </div>
              <textarea value={comentario} onChange={(e) => setComentario(e.target.value.slice(0, MAX_CHARS))}
                rows={5} placeholder="Describe tu experiencia con este docente. Como son sus clases? Explica bien? Es accesible?"
                className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-3 text-sm resize-none focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />
              <p className="text-xs text-white/25 mt-1.5">Escribe al menos 5 palabras describiendo tu experiencia real.</p>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-400 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading || !docenteId || comentario.trim().length < 10 || docentes.length === 0}
              className="w-full rounded-xl py-3.5 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando evaluacion...</>
                : "Enviar Evaluacion"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
              <div className="text-3xl mb-3">v</div>
              <h2 className="text-white font-semibold text-lg mb-1">Evaluacion enviada!</h2>
              <p className="text-white/45 text-sm">Tu comentario fue registrado de forma anonima.</p>
            </div>
            <div className="rounded-xl border border-white/8 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Analisis de tu comentario</p>
              <div className="flex items-center gap-3 mb-3">
                <SentimentBadge sentiment={result.nlp?.sentiment} score={result.nlp?.score} />
                <span className="text-xs font-mono text-white/40">Confianza: {((result.nlp?.confianza ?? 0)*100).toFixed(0)}%</span>
              </div>
              {result.nlp?.razon && <p className="text-xs text-white/40 italic">"{result.nlp.razon}"</p>}
            </div>
            {docentes.length > 0 && (
              <button onClick={handleReset}
                className="w-full rounded-xl py-3 text-sm font-semibold border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all">
                Evaluar otro docente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Evaluar;
