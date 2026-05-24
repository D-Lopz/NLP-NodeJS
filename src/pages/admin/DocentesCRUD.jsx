import { useState, useEffect } from "react";
import { getDocentes, crearDocente, actualizarDocente, eliminarDocente, getEvaluacionesByDocente } from "../../api/api";
import { generarReporteDocente } from "../../utils/generarReporte";

const EMPTY = { nombre: "", email: "", contrasena: "", docente: { titulo: "", certificado: "" } };

function Modal({ docente, onClose, onSave }) {
  const [form, setForm] = useState(docente
    ? { nombre: docente.nombre || "", email: docente.email || "", contrasena: "",
        docente: { titulo: docente.docente?.titulo || "", certificado: docente.docente?.certificado || "" } }
    : EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const isEdit = !!docente?._id;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const payload = { ...form };
      if (!payload.contrasena && isEdit) delete payload.contrasena;
      isEdit ? await actualizarDocente(docente._id, payload) : await crearDocente(payload);
      onSave();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl border border-white/12 p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "#1c1c1c" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">{isEdit ? "Editar docente" : "Nuevo docente"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[["nombre","Nombre completo","text"],["email","Email","email"],["contrasena",isEdit?"Nueva contraseña (vacío = no cambiar)":"Contraseña","password"]].map(([field,label,type]) => (
            <div key={field}>
              <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">{label}</label>
              <input type={type} value={form[field]||""} onChange={(e)=>setForm({...form,[field]:e.target.value})}
                className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all" />
            </div>
          ))}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Título / Especialidad</label>
            <input value={form.docente?.titulo||""} placeholder="Ej: Ingeniería de Sistemas"
              onChange={(e)=>setForm({...form,docente:{...form.docente,titulo:e.target.value}})}
              className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all" />
          </div>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">Cancelar</button>
            <button type="submit" disabled={loading||!form.nombre||!form.email}
              className="flex-1 rounded-xl py-2.5 text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-40 transition-all">
              {loading?"Guardando...":isEdit?"Guardar":"Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DocentesCRUD() {
  const [docentes, setDocentes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [search, setSearch]       = useState("");
  const [generando, setGenerando] = useState(null);

  const cargar = () => {
    setLoading(true);
    getDocentes().then(setDocentes).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(cargar, []);

  async function handleEliminar(id) {
    if (!confirm("¿Eliminar este docente?")) return;
    await eliminarDocente(id).catch(console.error);
    cargar();
  }

  async function handleReporte(docente) {
    setGenerando(docente._id);
    try {
      const evals = await getEvaluacionesByDocente(docente._id);
      generarReporteDocente(docente, evals);
    } catch (err) {
      alert("Error al generar el reporte: " + err.message);
    } finally {
      setGenerando(null);
    }
  }

  const filtrados = docentes.filter(d =>
    d.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    d.docente?.titulo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl">
      {modal !== null && (
        <Modal docente={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={()=>{setModal(null);cargar();}} />
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">◉ Te amo mi princesa</p>
          <h1 className="text-2xl font-bold text-white">Catálogo Académico</h1>
          <p className="text-white/40 text-sm mt-1">Gestiona perfiles, materias y actividad docente.</p>
        </div>
        <button onClick={()=>setModal("new")}
          className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-sm font-semibold transition-all">
          + Nuevo Docente
        </button>
      </div>

      <input value={search} placeholder="Buscar por nombre o materia..."
        onChange={(e)=>setSearch(e.target.value)}
        className="w-full mb-4 rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_,i)=>(
            <div key={i} className="h-16 rounded-xl border border-white/8 animate-pulse" style={{background:"rgba(255,255,255,0.02)"}} />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <p className="text-center py-10 text-white/30 text-sm">No se encontraron docentes.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map((d) => {
            const total = d.stats?.totalEvaluaciones ?? 0;
            const score = d.stats?.sentimentPromedio ?? 0;
            const sentiment = score > 0.15 ? "positivo" : score < -0.15 ? "negativo" : "neutro";
            const scoreColor = sentiment === "positivo" ? "text-emerald-400" : sentiment === "negativo" ? "text-rose-400" : "text-amber-400";

            return (
              <div key={d._id} className="rounded-xl border border-white/8 p-4 flex items-center gap-4 hover:border-white/15 transition-all"
                style={{background:"rgba(255,255,255,0.02)"}}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{d.nombre}</p>
                  <p className="text-xs text-white/35 mt-0.5">{d.docente?.titulo || d.email}</p>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs font-mono">
                  <span className="text-white/30">{total} {total===1?"eval":"evals"}</span>
                  {total > 0 && (
                    <span className={scoreColor}>score {score.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={()=>handleReporte(d)} disabled={generando===d._id}
                    className="px-3 py-1.5 rounded-lg border border-violet-500/30 text-xs text-violet-400 hover:bg-violet-500/15 hover:border-violet-500/50 transition-all disabled:opacity-40 flex items-center gap-1.5">
                    {generando===d._id
                      ? <><span className="w-3 h-3 border border-violet-400/50 border-t-violet-400 rounded-full animate-spin"/>Generando...</>
                      : "⬇ PDF"}
                  </button>
                  <button onClick={()=>setModal(d)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/25 transition-all">
                    Editar
                  </button>
                  <button onClick={()=>handleEliminar(d._id)}
                    className="px-3 py-1.5 rounded-lg border border-rose-500/20 text-xs text-rose-400/60 hover:text-rose-400 hover:border-rose-500/40 transition-all">
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DocentesCRUD;
