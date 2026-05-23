import { useState, useEffect } from "react";
import { getEstudiantes, crearEstudiante, actualizarEstudiante, eliminarEstudiante, getAsignaturas } from "../../api/api";

function Modal({ estudiante, asignaturas, onClose, onSave }) {
  const [form, setForm] = useState(estudiante ? {
    nombre: estudiante.nombre || "",
    email: estudiante.email || "",
    codigo: estudiante.estudiante?.codigo || estudiante.codigo || "",
    telefono: estudiante.estudiante?.telefono || estudiante.telefono || "",
    estado: estudiante.estudiante?.estado || "Activo",
    contrasena: "",
    asignaturas_ids: estudiante.estudiante?.asignaturas || [],
  } : { nombre: "", email: "", codigo: "", telefono: "", estado: "Activo", contrasena: "", asignaturas_ids: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!estudiante?._id;

  function toggleAsignatura(id) {
    setForm(prev => ({
      ...prev,
      asignaturas_ids: prev.asignaturas_ids.includes(id)
        ? prev.asignaturas_ids.filter(a => a !== id)
        : [...prev.asignaturas_ids, id]
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const payload = {
        nombre: form.nombre, email: form.email, rol: "Estudiante",
        estudiante: { estado: form.estado, codigo: form.codigo, telefono: form.telefono, asignaturas: form.asignaturas_ids },
      };
      if (form.contrasena) payload.contrasena = form.contrasena;
      isEdit ? await actualizarEstudiante(estudiante._id, payload) : await crearEstudiante({ ...payload, contrasena: form.contrasena });
      onSave();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg rounded-2xl border border-white/12 p-6 max-h-[90vh] overflow-y-auto" style={{ background: "#1c1c1c" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">{isEdit ? "Editar estudiante" : "Nuevo estudiante"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-lg">X</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[["nombre","Nombre completo","text"],["email","Email","email"],["codigo","Código estudiantil","text"],["telefono","Teléfono (opcional)","text"],["contrasena",isEdit?"Nueva contraseña (vacío = no cambiar)":"Contraseña","password"]].map(([field,label,type]) => (
            <div key={field}>
              <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">{label}</label>
              <input type={type} value={form[field]||""} onChange={(e)=>setForm({...form,[field]:e.target.value})}
                className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all" />
            </div>
          ))}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Estado</label>
            <select value={form.estado} onChange={(e)=>setForm({...form,estado:e.target.value})}
              className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none transition-all cursor-pointer">
              <option value="Activo" className="bg-zinc-900">Activo</option>
              <option value="Inactivo" className="bg-zinc-900">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-2">
              Asignaturas inscritas <span className="ml-1 text-violet-400 normal-case tracking-normal font-normal">({form.asignaturas_ids.length} seleccionadas)</span>
            </label>
            <div className="rounded-xl border border-white/10 overflow-hidden max-h-48 overflow-y-auto">
              {asignaturas.length === 0
                ? <p className="text-white/30 text-xs p-3">No hay asignaturas registradas.</p>
                : asignaturas.map((a) => {
                  const sel = form.asignaturas_ids.includes(a._id);
                  return (
                    <button type="button" key={a._id} onClick={()=>toggleAsignatura(a._id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all border-b border-white/6 last:border-0 ${sel?"bg-violet-500/15 text-white":"text-white/50 hover:bg-white/4"}`}>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 text-xs transition-all ${sel?"bg-violet-500 border-violet-500 text-white":"border-white/20"}`}>
                        {sel && "v"}
                      </span>
                      <span className="flex-1">{a.nombre_asignatura}</span>
                      {a.nombre_docente && <span className="text-xs text-white/30">{a.nombre_docente}</span>}
                      {a.creditos && <span className="text-xs font-mono text-white/25">{a.creditos}cr</span>}
                    </button>
                  );
                })}
            </div>
          </div>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">Cancelar</button>
            <button type="submit" disabled={loading||!form.nombre||!form.email} className="flex-1 rounded-xl py-2.5 text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold disabled:opacity-40 transition-all">
              {loading?"Guardando...":isEdit?"Guardar":"Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EstudiantesCRUD() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");

  const cargar = () => {
    setLoading(true);
    Promise.all([
      getEstudiantes().then(d=>d.usuarios||[]),
      getAsignaturas().then(d=>d.asignaturas||d||[]),
    ]).then(([ests,asigs])=>{setEstudiantes(ests);setAsignaturas(asigs);})
      .catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(cargar,[]);

  async function handleEliminar(id) {
    if(!confirm("Eliminar este estudiante?")) return;
    await eliminarEstudiante(id).catch(console.error);
    cargar();
  }

  const filtrados = estudiantes.filter(e=>
    e.nombre?.toLowerCase().includes(search.toLowerCase())||
    e.email?.toLowerCase().includes(search.toLowerCase())||
    (e.estudiante?.codigo||e.codigo||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl">
      {modal!==null && <Modal estudiante={modal==="new"?null:modal} asignaturas={asignaturas} onClose={()=>setModal(null)} onSave={()=>{setModal(null);cargar();}} />}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-2">Estudiantes CRUD</p>
          <h1 className="text-2xl font-bold text-white">Estudiantes</h1>
          <p className="text-white/40 text-sm mt-1">Gestiona estudiantes y sus asignaturas inscritas.</p>
        </div>
        <button onClick={()=>setModal("new")} className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-sm font-semibold transition-all">+ Nuevo</button>
      </div>
      <input value={search} placeholder="Buscar..." onChange={(e)=>setSearch(e.target.value)}
        className="w-full mb-4 rounded-xl border border-white/10 bg-white/4 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20" />
      {loading ? <div className="flex flex-col gap-2">{[...Array(4)].map((_,i)=><div key={i} className="h-16 rounded-xl border border-white/8 animate-pulse" style={{background:"rgba(255,255,255,0.02)"}}/>)}</div>
      : filtrados.length===0 ? <p className="text-center py-10 text-white/30 text-sm">No se encontraron estudiantes.</p>
      : <div className="flex flex-col gap-2">{filtrados.map(e=>{
          const asigCount=e.estudiante?.asignaturas?.length??0;
          return (
            <div key={e._id} className="rounded-xl border border-white/8 p-4 flex items-center gap-4 hover:border-white/15 transition-all" style={{background:"rgba(255,255,255,0.02)"}}>
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center text-xs font-mono shrink-0 font-bold">{e.nombre?.charAt(0)?.toUpperCase()??"?"}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{e.nombre}</p>
                <p className="text-xs text-white/35 mt-0.5">{e.email}{(e.estudiante?.codigo||e.codigo)?` · ${e.estudiante?.codigo||e.codigo}`:""}</p>
              </div>
              <span className="text-xs font-mono text-violet-400/70 hidden md:block">{asigCount} asig.</span>
              <span className={`text-xs px-2 py-1 rounded-md font-mono ${(e.estudiante?.estado||e.estado)==="Activo"?"bg-emerald-500/15 text-emerald-400":"bg-white/8 text-white/30"}`}>{e.estudiante?.estado||e.estado||"Activo"}</span>
              <div className="flex gap-1.5">
                <button onClick={()=>setModal(e)} className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/25 transition-all">Editar</button>
                <button onClick={()=>handleEliminar(e._id)} className="px-3 py-1.5 rounded-lg border border-rose-500/20 text-xs text-rose-400/60 hover:text-rose-400 hover:border-rose-500/40 transition-all">Eliminar</button>
              </div>
            </div>
          );
        })}</div>}
    </div>
  );
}
export default EstudiantesCRUD;
