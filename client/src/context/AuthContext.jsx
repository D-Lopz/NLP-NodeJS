import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nlp_user")); }
    catch { return null; }
  });

  const guardarSesion = (usuario) => {
    localStorage.setItem("nlp_user", JSON.stringify(usuario));
    setUser(usuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("nlp_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, guardarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);