import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SentimentBadge from "../../components/SentimentBadge";
import { useAuth } from "../../context/AuthContext";
import { getDocentes, getEvaluacionesByDocente } from "../../api/api";

function DocenteDashboard() {
  const { user, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [docente, setDocente]       = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    // Buscar el perfil de docente que coincide con el nombre del usuario
    getDocentes()
      .then((docs) => {
        const match = docs.find(d =>
          d.nombre.toLowerCase().includes(user?.nombre?.toLowerCase()) ||
          user?.nombre?.toLowerCase().includes(d.nombre.toLowerCase())
        );
        if (!match) { setError("No se encontró tu perfil de docente. Contacta al administrador."); setLoading(false); return; }
        setDocente(match);
        return getEvaluacionesByDocente(match._id);
      })
      .then((evals) => { if (evals) setEvaluaciones(evals); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() { cerrarSesion(); navigate("/login"); }

  const pos  = evaluaciones.filter(e => e.nlp?.sentiment === "positivo").length;
  const neg  = evaluaciones.filter(e => e.nlp?.sentiment === "negativo").length;
  const neu  = evaluaciones.filter(e => e.nlp?.sentiment === "neutro").length;
  const total = evaluaciones.length;
  const scorePromedio = total > 0
    ? (evaluaciones.reduce((a, e) => a + (e.nlp?.score ?? 0), 0) / total).toFixed(3)
    : "—";

  return (
    <div className="min-h-screen" style={{ background: "#141414" }}>
      {/* Top bar */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.015)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <span className="text-violet-400">⬡</span>
          <span className="font-mono text-sm font-bold tracking-widest text-white">
            NLP<span className="text-violet-400">·</span>EVAL
          </span>
          <span className="text-white/20 mx-2">|</span>
          <span className="text-xs text-white/40 uppercase tracking-widest">Docente</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60">{user?.nombre}</span>
          <button onClick={handleLogout}
            className="text-xs text-white/30 hover:text-rose-400 transition-colors">⏻ Salir</button>
        </div>
      </header>

      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">◈ Mi panel</p>
          <h1 className="text-2xl font-bold text-white">
            {docente ? docente.nombre : "Dashboard docente"}
          </h1>
          {docente && <p className="text-white/40 text-sm mt-1">{docente.materia}{docente.departamento ? ` · ${docente.departamento}` : ""}</p>}
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-400 text-sm mb-6">⚠ {error}</div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl border border-white/8 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
            ))}
          </div>
        ) : docente && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total", value: total, accent: "text-violet-400", icon: "◈" },
                { label: "Positivos", value: pos, accent: "text-emerald-400", icon: "↑" },
                { label: "Negativos", value: neg, accent: "text-rose-400", icon: "↓" },
                { label: "Score prom.", value: scorePromedio, accent: "text-sky-400", icon: "≈" },
              ].map(({ label, value, accent, icon }) => (
                <div key={label} className="rounded-xl border border-white/8 p-4 relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className={`text-xl mb-2 ${accent}`}>{icon}</div>
                  <p className={`text-2xl font-mono font-bold ${accent}`}>{value}</p>
                  <p className="text-xs text-white/35 uppercase tracking-widest mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Distribution bar */}
            {total > 0 && (
              <div className="rounded-xl border border-white/8 p-5 mb-8" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Distribución de sentimientos</p>
                <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
                  <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${(pos/total)*100}%` }} />
                  <div className="bg-amber-500  transition-all duration-700" style={{ width: `${(neu/total)*100}%` }} />
                  <div className="bg-rose-500   transition-all duration-700" style={{ width: `${(neg/total)*100}%` }} />
                </div>
                <div className="flex gap-6 mt-3 text-xs text-white/50">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Positivo {Math.round((pos/total)*100)}%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500  inline-block"/>Neutro {Math.round((neu/total)*100)}%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500   inline-block"/>Negativo {Math.round((neg/total)*100)}%</span>
                </div>
              </div>
            )}

            {/* Comments */}
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
              Comentarios anónimos recibidos ({total})
            </p>

            {total === 0 ? (
              <p className="text-center py-10 text-white/30 text-sm">Aún no has recibido evaluaciones.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {evaluaciones.map((ev) => (
                  <div key={ev._id} className="rounded-xl border border-white/8 p-4 hover:border-white/15 transition-all"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <SentimentBadge sentiment={ev.nlp?.sentiment} score={ev.nlp?.score} />
                      <span className="text-xs text-white/25 font-mono ml-auto">
                        {new Date(ev.createdAt).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                    <p className="text-sm text-white/65 leading-relaxed">{ev.comentario}</p>
                    {ev.nlp?.razon && (
                      <p className="text-xs text-white/25 italic mt-2 border-t border-white/6 pt-2">
                        "{ev.nlp.razon}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DocenteDashboard;