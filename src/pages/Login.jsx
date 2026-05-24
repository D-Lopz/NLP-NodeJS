import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/api";

const ROLES = [
  { value: "estudiante",    label: "Estudiante",    icon: "◎", desc: "Enviar evaluaciones" },
  { value: "docente",       label: "Docente",       icon: "◈", desc: "Ver mis evaluaciones" },
  { value: "administrativo",label: "Administrativo",icon: "⬡", desc: "Panel de control" },
];

const REDIRECCION = {
  estudiante: "/estudiante", docente: "/docente",
  administrativo: "/admin", administrador: "/admin",
};

// Recuperar último email usado (por rol)
function getStoredEmail(rol) {
  try { return localStorage.getItem(`nlp_email_${rol}`) || ""; } catch { return ""; }
}
function storeEmail(rol, email) {
  try { localStorage.setItem(`nlp_email_${rol}`, email); } catch {}
}

function Login() {
  const { guardarSesion } = useAuth();
  const navigate = useNavigate();
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [form, setForm]     = useState({ email: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  function seleccionarRol(rol) {
    setRolSeleccionado(rol);
    setForm({ email: getStoredEmail(rol), contrasena: "" });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form);
      storeEmail(data.usuario.rol, form.email); // guardar email para próxima vez
      guardarSesion(data.usuario);
      navigate(REDIRECCION[data.usuario.rol] || "/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#141414" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-violet-400 text-3xl">⬡</span>
            <span className="font-mono text-xl font-bold tracking-widest text-white">
              NLP<span className="text-violet-400">·</span>EVAL
            </span>
          </div>
          <p className="text-white/40 text-sm">Evaluación docente con inteligencia artificial</p>
        </div>

        {!rolSeleccionado ? (
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest text-center mb-4">¿Cómo deseas ingresar?</p>
            <div className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <button key={r.value} onClick={() => seleccionarRol(r.value)}
                  className="flex items-center gap-4 rounded-xl border border-white/10 p-4 text-left hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-2xl text-violet-400 group-hover:scale-110 transition-transform">{r.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{r.label}</p>
                    <p className="text-white/35 text-xs">{r.desc}</p>
                  </div>
                  <span className="ml-auto text-white/20 group-hover:text-white/50 transition-colors">→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => { setRolSeleccionado(null); setError(""); }}
                className="text-white/30 hover:text-white/70 transition-colors text-sm">← Volver</button>
              <span className="text-white/20">|</span>
              <span className="text-sm text-violet-400 font-mono">
                {ROLES.find(r => r.value === rolSeleccionado)?.label}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest block mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  placeholder="correo@universidad.edu"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest block mb-2">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={form.contrasena}
                  placeholder="••••••••"
                  onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/4 text-white px-4 py-3 text-sm focus:outline-none focus:border-violet-500/60 transition-all placeholder:text-white/20"
                />
              </div>

              {/* Email recordado */}
              {form.email && (
                <p className="text-xs text-white/25 -mt-2">
                  Último acceso: <span className="text-white/40">{form.email}</span>
                </p>
              )}

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !form.email || !form.contrasena}
                className="w-full rounded-xl py-3 text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Ingresando...</>
                  : "Ingresar"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;