import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SentimentBadge from "../components/SentimentBadge";
import { getDocentes } from "../../api/api";

function ScoreRing({ score }) {
  const sentiment   = score > 0.15 ? "positivo" : score < -0.15 ? "negativo" : "neutro";
  const color       = sentiment === "positivo" ? "#10b981" : sentiment === "negativo" ? "#f43f5e" : "#f59e0b";
  const pct         = Math.round(((score + 1) / 2) * 100);
  const circumference = 2 * Math.PI * 18;
  const dash        = (pct / 100) * circumference;

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/60">
        {pct}
      </span>
    </div>
  );
}

function Docentes() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState("score");

  useEffect(() => {
    getDocentes()
      .then(setDocentes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = docentes
    .filter((d) =>
      d.nombre.toLowerCase().includes(search.toLowerCase()) ||
      d.materia.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === "score" ? (b.stats?.sentimentPromedio ?? 0) - (a.stats?.sentimentPromedio ?? 0) :
      sort === "evals" ? (b.stats?.totalEvaluaciones  ?? 0) - (a.stats?.totalEvaluaciones  ?? 0) :
      a.nombre.localeCompare(b.nombre)
    );

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto">

      <div className="mb-8">
        <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">◉ Directorio</p>
        <h1 className="text-3xl font-bold text-white">Docentes</h1>
        <p className="text-white/40 mt-1 text-sm">Ranking según el análisis NLP de sus evaluaciones.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-400 text-sm mb-6">
          ⚠ {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Buscar docente o materia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/4 text-white/60 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all cursor-pointer"
        >
          <option value="score" className="bg-zinc-900">Mejor puntuación</option>
          <option value="evals" className="bg-zinc-900">Más evaluados</option>
          <option value="nombre" className="bg-zinc-900">Nombre A-Z</option>
        </select>
        <Link
          to="/evaluar"
          className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-sm font-semibold transition-all"
        >
          + Evaluar
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/8 p-4 h-20 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">
          {search ? "No se encontraron docentes con esa búsqueda." : "Aún no hay docentes registrados."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((d, i) => {
            const score     = d.stats?.sentimentPromedio ?? 0;
            const dist      = d.stats?.distribucion ?? { positivo: 0, neutro: 0, negativo: 0 };
            const sentiment = score > 0.15 ? "positivo" : score < -0.15 ? "negativo" : "neutro";

            return (
              <div
                key={d._id}
                className="rounded-xl border border-white/8 p-4 flex items-center gap-4 hover:border-white/15 transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <span className="text-xs font-mono text-white/20 w-5 text-center shrink-0">{i + 1}</span>

                <ScoreRing score={score} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-white">{d.nombre}</span>
                    <SentimentBadge sentiment={sentiment} score={score} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/35">
                    <span>{d.materia}</span>
                    {d.departamento && <><span>·</span><span>{d.departamento}</span></>}
                    <span>·</span>
                    <span>{d.stats?.totalEvaluaciones ?? 0} evaluaciones</span>
                  </div>
                </div>

                {/* Mini distribution bar */}
                <div className="hidden md:flex flex-col gap-1 w-28">
                  <div className="flex rounded-full overflow-hidden h-1.5 gap-px">
                    <div className="bg-emerald-500 transition-all" style={{ width: `${dist.positivo}%` }} />
                    <div className="bg-amber-500  transition-all" style={{ width: `${dist.neutro}%`   }} />
                    <div className="bg-rose-500   transition-all" style={{ width: `${dist.negativo}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-white/25">
                    <span className="text-emerald-400">{dist.positivo}%</span>
                    <span className="text-rose-400">{dist.negativo}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Docentes;
