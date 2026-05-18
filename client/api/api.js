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

export const getDocentes            = ()   => request("/api/docentes");
export const getDocente             = (id) => request(`/api/docentes/${id}`);
export const crearDocente           = (data) => request("/api/docentes", { method: "POST", body: JSON.stringify(data) });
export const actualizarDocente      = (id, data) => request(`/api/docentes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const eliminarDocente        = (id) => request(`/api/docentes/${id}`, { method: "DELETE" });

export const getEvaluaciones        = ()   => request("/api/evaluaciones");
export const getEvaluacionesByDocente = (id) => request(`/api/evaluaciones/docente/${id}`);
export const crearEvaluacion        = (data) => request("/api/evaluaciones", { method: "POST", body: JSON.stringify(data) });

export const getEstadisticas        = ()   => request("/api/stats");
export const getTendencia           = ()   => request("/api/stats/tendencia");
export const getRanking             = ()   => request("/api/stats/ranking");
