import { getProgramas, crearPrograma, actualizarPrograma, eliminarPrograma } from "../../api/api";
import { useState, useEffect } from "react";

function Modal({ programa, onClose, onSave }) {
  const [form, setForm] = useState(
    programa ? { nombre_programa: programa.nombre_programa || "", codigo: programa.codigo || "" }
             : { nombre_programa: "", codigo: "" }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const isEdit                = !!programa?._id;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      isEdit ? await actualizarPrograma(programa._id, form) : await crearPrograma(form);
      onSave();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl border border-white/12 p-6" style={{ background: "#1c1c1c" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">{isEdit ? "Editar programa" : "Nuevo programa"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Nombre del programa</label>
            <input value={form.nombre_programa} placeholder="Ej: Ingeniería de Sistemas"
              onChange={(e) => setForm({ ...form, nombre_programa: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Código</label>
            <input value={form.codigo} placeholder="Ej: IS2025"
              onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />
          </div>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !form.nombre_programa || !form.codigo}
              className="flex-1 rounded-xl py-2.5 text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-40 transition-all">
              {loading ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProgramasCRUD() {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [search, setSearch]       = useState("");

  const cargar = () => {
    setLoading(true);
    getProgramas()
      .then(d => setProgramas(d.programas || d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  async function handleEliminar(id) {
    if (!confirm("¿Eliminar este programa?")) return;
    await eliminarPrograma(id).catch(console.error);
    cargar();
  }

  const filtrados = programas.filter(p =>
    p.nombre_programa?.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl">
      {modal !== null && (
        <Modal
          programa={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); cargar(); }}
        />
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">◧ Programas</p>
          <h1 className="text-2xl font-bold text-white">Carreras Universitarias</h1>
          <p className="text-white/40 text-sm mt-1">Administración de las mallas curriculares de la institución.</p>
        </div>
        <button onClick={() => setModal("new")}
          className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-sm font-semibold transition-all">
          + Nuevo Programa
        </button>
      </div>

      <input value={search} placeholder="Buscar por nombre o código..."
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-white/8 animate-pulse"
              style={{ background: "rgba(255,255,255,0.02)" }} />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <p className="text-center py-10 text-white/30 text-sm">No se encontraron programas.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map((p) => (
            <div key={p._id} className="rounded-xl border border-white/8 p-4 flex items-center gap-4 hover:border-white/15 transition-all"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="w-16 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center text-xs font-mono shrink-0 font-bold tracking-wider">
                {p.codigo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{p.nombre_programa}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setModal(p)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/25 transition-all">
                  Editar
                </button>
                <button onClick={() => handleEliminar(p._id)}
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

export default ProgramasCRUD;
