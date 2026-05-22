import { useState, useEffect } from "react";
import { getDocentes, crearDocente, actualizarDocente, eliminarDocente } from "../../api/api";

const EMPTY = { nombre: "", materia: "", departamento: "" };

function Modal({ docente, onClose, onSave }) {
  const [form, setForm] = useState(docente || EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!docente?._id;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      isEdit ? await actualizarDocente(docente._id, form) : await crearDocente(form);
      onSave();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl border border-white/12 p-6"
        style={{ background: "#1c1c1c" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">{isEdit ? "Editar docente" : "Nuevo docente"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[["nombre","Nombre completo","Ej: Dr. Carlos Ramírez"],
            ["materia","Materia","Ej: Cálculo III"],
            ["departamento","Departamento (opcional)","Ej: Matemáticas"]].map(([field, label, ph]) => (
            <div key={field}>
              <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">{label}</label>
              <input value={form[field]} placeholder={ph}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />
            </div>
          ))}
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !form.nombre || !form.materia}
              className="flex-1 rounded-xl py-2.5 text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-40 transition-all">
              {loading ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DocentesCRUD() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | "new" | docente obj
  const [search, setSearch]     = useState("");

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

  const filtrados = docentes.filter(d =>
    d.nombre.toLowerCase().includes(search.toLowerCase()) ||
    d.materia.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl">
      {modal !== null && (
        <Modal
          docente={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); cargar(); }}
        />
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">◉ CRUD</p>
          <h1 className="text-2xl font-bold text-white">Docentes</h1>
          <p className="text-white/40 text-sm mt-1">Gestión del catálogo de docentes.</p>
        </div>
        <button onClick={() => setModal("new")}
          className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-sm font-semibold transition-all">
          + Nuevo docente
        </button>
      </div>

      <input value={search} placeholder="Buscar por nombre o materia..."
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-white/8 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <p className="text-center py-10 text-white/30 text-sm">No se encontraron docentes.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map((d) => (
            <div key={d._id} className="rounded-xl border border-white/8 p-4 flex items-center gap-4 hover:border-white/15 transition-all"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{d.nombre}</p>
                <p className="text-xs text-white/35 mt-0.5">
                  {d.materia}{d.departamento ? ` · ${d.departamento}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/30 font-mono">
                <span>{d.stats?.totalEvaluaciones ?? 0} evals</span>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setModal(d)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/25 transition-all">
                  Editar
                </button>
                <button onClick={() => handleEliminar(d._id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/20 text-xs text-rose-400/60 hover:text-rose-400 hover:border-rose-500/40 transition-all">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocentesCRUD;
