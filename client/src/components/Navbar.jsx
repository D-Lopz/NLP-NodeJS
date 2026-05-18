import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: "◈" },
  { to: "/evaluar", label: "Evaluar", icon: "✦" },
  { to: "/docentes", label: "Docentes", icon: "◉" },
];

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/8"
      style={{ background: "rgba(20,20,20,0.85)", backdropFilter: "blur(12px)" }}>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-violet-400 text-xl leading-none">⬡</span>
        <span className="font-mono text-sm font-semibold tracking-widest text-white/90 uppercase">
          NLP<span className="text-violet-400">·</span>Eval
        </span>
      </div>

      {/* Links */}
      <ul className="flex items-center gap-1">
        {links.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium ${
                  isActive
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-white/50 hover:text-white/90 hover:bg-white/6"
                }`
              }
            >
              <span className="text-xs opacity-70">{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
