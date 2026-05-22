import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import DocentesCRUD from "./pages/admin/DocentesCRUD";
import EstudiantesCRUD from "./pages/admin/EstudiantesCRUD";
import AsignaturasCRUD from "./pages/admin/AsignaturasCRUD";
import Comentarios from "./pages/admin/Comentarios";
import DocenteDashboard from "./pages/docente/DocenteDashboard";
import Evaluar from "./pages/estudiante/Evaluar";

const REDIRECCION = {
  administrativo: "/admin",
  docente:        "/docente",
  estudiante:     "/estudiante",
};

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to={REDIRECCION[user.rol] || "/login"} replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={REDIRECCION[user.rol] || "/login"} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["administrativo"]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index            element={<Dashboard />} />
            <Route path="docentes"    element={<DocentesCRUD />} />
            <Route path="estudiantes" element={<EstudiantesCRUD />} />
            <Route path="asignaturas" element={<AsignaturasCRUD />} />
            <Route path="comentarios" element={<Comentarios />} />
          </Route>

          {/* Docente */}
          <Route path="/docente" element={
            <ProtectedRoute roles={["docente"]}>
              <DocenteDashboard />
            </ProtectedRoute>
          } />

          {/* Estudiante */}
          <Route path="/estudiante" element={
            <ProtectedRoute roles={["estudiante"]}>
              <Evaluar />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;