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

export const login = (data) =>
  request("/api/auth/login", { method: "POST", body: JSON.stringify(data) });

export const getDocentes       = ()      => request("/api/docentes");
export const crearDocente      = (data)  => request("/api/docentes", { method: "POST", body: JSON.stringify(data) });
export const actualizarDocente = (id, d) => request(`/api/docentes/${id}`, { method: "PUT", body: JSON.stringify(d) });
export const eliminarDocente   = (id)    => request(`/api/docentes/${id}`, { method: "DELETE" });

export const getEstudiantes       = ()      => request("/api/usuarios?rol=estudiante");
export const crearEstudiante      = (data)  => request("/api/save-usuario", { method: "POST", body: JSON.stringify(data) });
export const actualizarEstudiante = (id, d) => request(`/api/edit-usuario/${id}`, { method: "PUT", body: JSON.stringify(d) });
export const eliminarEstudiante   = (id)    => request(`/api/delete-usuario/${id}`, { method: "DELETE" });

export const getAsignaturas       = ()      => request("/api/asignaturas");
export const crearAsignatura      = (data)  => request("/api/save-asignatura", { method: "POST", body: JSON.stringify(data) });
export const actualizarAsignatura = (id, d) => request(`/api/edit-asignatura/${id}`, { method: "PUT", body: JSON.stringify(d) });
export const eliminarAsignatura   = (id)    => request(`/api/delete-asignatura/${id}`, { method: "DELETE" });

export const getEvaluaciones          = ()     => request("/api/evaluaciones");
export const getEvaluacionesByDocente = (id)   => request(`/api/evaluaciones/docente/${id}`);
export const crearEvaluacion          = (data) => request("/api/evaluaciones", { method: "POST", body: JSON.stringify(data) });

export const getEstadisticas = () => request("/api/stats");
export const getRanking      = () => request("/api/stats/ranking");
