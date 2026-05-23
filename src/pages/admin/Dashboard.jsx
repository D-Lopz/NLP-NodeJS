import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SentimentBadge from "../../components/SentimentBadge";
import { getEstadisticas, getEvaluaciones } from "../../api/api";

function StatCard({ label, value, accent, icon, loading }) {
  return (
    <div className="rounded-xl border border-white/8 p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className={`text-2xl ${accent}`}>{icon}</div>
      <div>
        {loading
          ? <div className="h-8 w-16 rounded bg-white/8 animate-pulse mb-1" />
          : <p className="text-3xl font-mono font-bold text-white">{value}</p>}
        <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{label}</p>
      </div>
      <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 ${accent.replace("text-","bg-")}`} />
    </div>
  );
}

function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    Promise.all([getEstadisticas(), getEvaluaciones()])
      .then(([s, e]) => { setStats(s); setRecientes(e.slice(0, 5)); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">⬡ Panel principal</p>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 mt-1 text-sm">Resumen general de evaluaciones con NLP.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-400 text-sm mb-6">⚠ {error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Evaluaciones" value={stats?.totalEvaluaciones ?? "—"} accent="text-violet-400" icon="◈" loading={loading} />
        <StatCard label="Docentes"     value={stats?.totalDocentes     ?? "—"} accent="text-sky-400"    icon="◉" loading={loading} />
        <StatCard label="% Positivos"  value={stats ? `${stats.positivos}%`  : "—"} accent="text-emerald-400" icon="↑" loading={loading} />
        <StatCard label="% Negativos"  value={stats ? `${stats.negativos}%`  : "—"} accent="text-rose-400"    icon="↓" loading={loading} />
      </div>

      {stats && (
        <div className="rounded-xl border border-white/8 p-5 mb-8" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Distribución de sentimientos</p>
          <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
            <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${stats.positivos}%` }} />
            <div className="bg-amber-500  transition-all duration-700" style={{ width: `${stats.neutros}%` }} />
            <div className="bg-rose-500   transition-all duration-700" style={{ width: `${stats.negativos}%` }} />
          </div>
          <div className="flex gap-6 mt-3 text-xs text-white/50">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Positivo {stats.positivos}%</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500  inline-block"/>Neutro {stats.neutros}%</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500   inline-block"/>Negativo {stats.negativos}%</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/40 uppercase tracking-widest">Evaluaciones recientes</p>
        <Link to="/admin/comentarios" className="text-xs text-violet-400 hover:text-violet-300 font-mono">Ver todas →</Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/8 p-4 h-16 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
          ))}
        </div>
      ) : recientes.length === 0 ? (
        <p className="text-center py-8 text-white/30 text-sm">Aún no hay evaluaciones registradas.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {recientes.map((ev) => (
            <div key={ev._id} className="rounded-xl border border-white/8 p-4 flex items-start gap-4 hover:border-white/15 transition-all"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                ev.nlp.sentiment === "positivo" ? "bg-emerald-500/15 text-emerald-400" :
                ev.nlp.sentiment === "negativo" ? "bg-rose-500/15 text-rose-400" :
                "bg-amber-500/15 text-amber-400"}`}>
                {ev.nlp.sentiment === "positivo" ? "↑" : ev.nlp.sentiment === "negativo" ? "↓" : "→"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-white">{ev.docente?.nombre ?? "—"}</span>
                  <span className="text-xs text-white/30 font-mono">{ev.docente?.materia}</span>
                  <SentimentBadge sentiment={ev.nlp.sentiment} score={ev.nlp.score} />
                </div>
                <p className="text-xs text-white/50 truncate">{ev.comentario}</p>
                {ev.nlp.razon && <p className="text-xs text-white/25 italic mt-0.5">"{ev.nlp.razon}"</p>}
              </div>
              <span className="text-xs text-white/25 font-mono shrink-0">
                {new Date(ev.createdAt).toLocaleDateString("es-CO")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
