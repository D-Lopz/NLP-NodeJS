import { useState, useEffect } from "react";
import { getAsignaturas, crearAsignatura, actualizarAsignatura, eliminarAsignatura, getDocentes } from "../../api/api";

function Modal({ asignatura, docentes, onClose, onSave }) {
  const [form, setForm] = useState(asignatura
    ? { nombre_asignatura: asignatura.nombre_asignatura || "", creditos: asignatura.creditos || "", nombre_docente: asignatura.nombre_docente || "" }
    : { nombre_asignatura: "", creditos: "", nombre_docente: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const isEdit = !!asignatura?._id;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const payload = { ...form, creditos: Number(form.creditos) };
      isEdit ? await actualizarAsignatura(asignatura._id, payload) : await crearAsignatura(payload);
      onSave();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl border border-white/12 p-6" style={{ background: "#1c1c1c" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">{isEdit ? "Editar asignatura" : "Nueva asignatura"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Nombre de la asignatura</label>
            <input value={form.nombre_asignatura} placeholder="Ej: Bases de Datos Avanzadas"
              onChange={(e) => setForm({ ...form, nombre_asignatura: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Créditos</label>
            <input type="number" min="1" max="10" value={form.creditos} placeholder="Ej: 3"
              onChange={(e) => setForm({ ...form, creditos: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Docente asignado</label>
            <select value={form.nombre_docente} onChange={(e) => setForm({ ...form, nombre_docente: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all cursor-pointer appearance-none">
              <option value="" className="bg-zinc-900">Sin docente asignado</option>
              {docentes.map((d) => (
                <option key={d._id} value={d.nombre} className="bg-zinc-900">{d.nombre}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">Cancelar</button>
            <button type="submit" disabled={loading || !form.nombre_asignatura}
              className="flex-1 rounded-xl py-2.5 text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-40 transition-all">
              {loading ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AsignaturasCRUD() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [docentes, setDocentes]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null);
  const [search, setSearch]           = useState("");

  const cargar = () => {
    setLoading(true);
    Promise.all([
      getAsignaturas().then(d => d.asignaturas || d || []),
      getDocentes()
    ]).then(([asigs, docs]) => { setAsignaturas(asigs); setDocentes(docs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  async function handleEliminar(id) {
    if (!confirm("¿Eliminar esta asignatura?")) return;
    await eliminarAsignatura(id).catch(console.error);
    cargar();
  }

  const filtradas = asignaturas.filter(a =>
    a.nombre_asignatura?.toLowerCase().includes(search.toLowerCase()) ||
    a.nombre_docente?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl">
      {modal !== null && (
        <Modal
          asignatura={modal === "new" ? null : modal}
          docentes={docentes}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); cargar(); }}
        />
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">◫ CRUD</p>
          <h1 className="text-2xl font-bold text-white">Asignaturas</h1>
          <p className="text-white/40 text-sm mt-1">Gestión del catálogo de materias.</p>
        </div>
        <button onClick={() => setModal("new")}
          className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-sm font-semibold transition-all">
          + Nueva asignatura
        </button>
      </div>

      <input value={search} placeholder="Buscar por nombre o docente..."
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-white/8 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <p className="text-center py-10 text-white/30 text-sm">No se encontraron asignaturas.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtradas.map((a) => (
            <div key={a._id} className="rounded-xl border border-white/8 p-4 flex items-center gap-4 hover:border-white/15 transition-all"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-mono shrink-0 font-bold">
                {a.creditos || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{a.nombre_asignatura}</p>
                {a.nombre_docente && <p className="text-xs text-white/35 mt-0.5">{a.nombre_docente}</p>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setModal(a)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/25 transition-all">Editar</button>
                <button onClick={() => handleEliminar(a._id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/20 text-xs text-rose-400/60 hover:text-rose-400 hover:border-rose-500/40 transition-all">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AsignaturasCRUD;
