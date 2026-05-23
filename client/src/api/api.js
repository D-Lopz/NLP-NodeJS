const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Error en la solicitud");
  }
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (data) =>
  request("/api/auth/login", { method: "POST", body: JSON.stringify(data) });

// ── Docentes (Docente.js model) ───────────────────────────────────────────────
export const getDocentes         = ()       => request("/api/docentes");
export const getDocenteByNombre  = (nombre) => request(`/api/docentes?nombre=${encodeURIComponent(nombre)}`);
export const crearDocente        = (data)   => request("/api/docentes", { method: "POST", body: JSON.stringify(data) });
export const actualizarDocente   = (id, d)  => request(`/api/docentes/${id}`, { method: "PUT", body: JSON.stringify(d) });
export const eliminarDocente     = (id)     => request(`/api/docentes/${id}`, { method: "DELETE" });

// ── Usuarios / Estudiantes (project.js model) ─────────────────────────────────
export const getEstudiantes      = ()       => request("/api/usuarios?rol=estudiante");
export const crearEstudiante     = (data)   => request("/api/usuarios", { method: "POST", body: JSON.stringify(data) });
export const actualizarEstudiante= (id, d)  => request(`/api/usuarios/${id}`, { method: "PUT", body: JSON.stringify(d) });
export const eliminarEstudiante  = (id)     => request(`/api/usuarios/${id}`, { method: "DELETE" });

// ── Asignaturas ───────────────────────────────────────────────────────────────
export const getAsignaturas      = ()       => request("/api/asignaturas");
export const crearAsignatura     = (data)   => request("/api/asignaturas", { method: "POST", body: JSON.stringify(data) });
export const actualizarAsignatura= (id, d)  => request(`/api/asignaturas/${id}`, { method: "PUT", body: JSON.stringify(d) });
export const eliminarAsignatura  = (id)     => request(`/api/asignaturas/${id}`, { method: "DELETE" });

// ── Evaluaciones / Comentarios ────────────────────────────────────────────────
export const getEvaluaciones           = ()    => request("/api/evaluaciones");
export const getEvaluacionesByDocente  = (id)  => request(`/api/evaluaciones/docente/${id}`);
export const crearEvaluacion           = (data)=> request("/api/evaluaciones", { method: "POST", body: JSON.stringify(data) });

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getEstadisticas = () => request("/api/stats");
