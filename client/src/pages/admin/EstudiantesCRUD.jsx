import { useState, useEffect } from "react";
import { getEstudiantes, crearEstudiante, actualizarEstudiante, eliminarEstudiante } from "../../api/api";

const EMPTY = { nombre: "", email: "", codigo: "", telefono: "", estado: "activo" };

function Modal({ estudiante, onClose, onSave }) {
  const [form, setForm] = useState(estudiante ? {
    nombre: estudiante.nombre || "", email: estudiante.email || "",
    codigo: estudiante.codigo || "", telefono: estudiante.telefono || "",
    estado: estudiante.estado || "activo", contrasena: ""
  } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!estudiante?._id;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const payload = { ...form, rol: "estudiante" };
      if (!form.contrasena && isEdit) delete payload.contrasena;
      isEdit ? await actualizarEstudiante(estudiante._id, payload) : await crearEstudiante(payload);
      onSave();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const campos = [
    ["nombre","Nombre completo","Ej: Juan García","text"],
    ["email","Email","correo@universidad.edu","email"],
    ["codigo","Código estudiantil","Ej: 2023001","text"],
    ["telefono","Teléfono (opcional)","Ej: 3001234567","text"],
    ["contrasena", isEdit ? "Nueva contraseña (dejar vacío = no cambiar)" : "Contraseña","••••••••","password"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl border border-white/12 p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "#1c1c1c" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">{isEdit ? "Editar estudiante" : "Nuevo estudiante"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {campos.map(([field, label, ph, type]) => (
            <div key={field}>
              <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">{label}</label>
              <input type={type} value={form[field] || ""} placeholder={ph}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />
            </div>
          ))}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Estado</label>
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none transition-all cursor-pointer">
              <option value="activo" className="bg-zinc-900">Activo</option>
              <option value="inactivo" className="bg-zinc-900">Inactivo</option>
            </select>
          </div>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">Cancelar</button>
            <button type="submit" disabled={loading || !form.nombre || !form.email}
              className="flex-1 rounded-xl py-2.5 text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-40 transition-all">
              {loading ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EstudiantesCRUD() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [search, setSearch]   = useState("");

  const cargar = () => {
    setLoading(true);
    getEstudiantes().then((d) => setEstudiantes(d.usuarios || []))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  async function handleEliminar(id) {
    if (!confirm("¿Eliminar este estudiante?")) return;
    await eliminarEstudiante(id).catch(console.error);
    cargar();
  }

  const filtrados = estudiantes.filter(e =>
    e.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl">
      {modal !== null && (
        <Modal estudiante={modal === "new" ? null : modal}
          onClose={() => setModal(null)} onSave={() => { setModal(null); cargar(); }} />
      )}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">◎ CRUD</p>
          <h1 className="text-2xl font-bold text-white">Estudiantes</h1>
          <p className="text-white/40 text-sm mt-1">Gestión de estudiantes registrados.</p>
        </div>
        <button onClick={() => setModal("new")}
          className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-sm font-semibold transition-all">
          + Nuevo estudiante
        </button>
      </div>
      <input value={search} placeholder="Buscar por nombre, email o código..."
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-white/8 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <p className="text-center py-10 text-white/30 text-sm">No se encontraron estudiantes.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map((e) => (
            <div key={e._id} className="rounded-xl border border-white/8 p-4 flex items-center gap-4 hover:border-white/15 transition-all"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center text-xs font-mono shrink-0 font-bold">
                {e.nombre?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{e.nombre}</p>
                <p className="text-xs text-white/35 mt-0.5">{e.email}{e.codigo ? ` · ${e.codigo}` : ""}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-md font-mono ${e.estado === "activo" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/8 text-white/30"}`}>
                {e.estado || "activo"}
              </span>
              <div className="flex gap-1.5">
                <button onClick={() => setModal(e)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/25 transition-all">Editar</button>
                <button onClick={() => handleEliminar(e._id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/20 text-xs text-rose-400/60 hover:text-rose-400 hover:border-rose-500/40 transition-all">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EstudiantesCRUD;