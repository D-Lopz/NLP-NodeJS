import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin",             label: "Dashboard",    icon: "◈", end: true },
  { to: "/admin/docentes",    label: "Académicos",   icon: "◉" },
  { to: "/admin/estudiantes", label: "Alumnos",      icon: "◎" },
  { to: "/admin/asignaturas", label: "Cursos ",      icon: "◫" },
  { to: "/admin/programas",   label: "Programas",    icon: "◧" },
  { to: "/admin/comentarios", label: "Comentarios",  icon: "✦" },
];

function AdminLayout() {
  const { user, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    cerrarSesion();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#141414" }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/8 flex flex-col"
        style={{ background: "rgba(255,255,255,0.015)" }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <span className="text-violet-400 text-lg">⬡</span>
            <span className="font-mono text-sm font-bold tracking-widest text-white">
              NLP<span className="text-violet-400">·</span>EVAL
            </span>
          </div>
          <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Administrativo</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {links.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/25"
                    : "text-white/45 hover:text-white/80 hover:bg-white/5"
                }`}>
              <span className="text-xs opacity-70">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-white/8">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-white/60 font-medium truncate">{user?.nombre}</p>
            <p className="text-[10px] text-white/25 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-rose-400 hover:bg-rose-500/8 transition-all">
            <span>⏻</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
