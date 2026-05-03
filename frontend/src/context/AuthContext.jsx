import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "hostack_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    function handleStorage(e) {
      if (e.key === STORAGE_KEY) {
        setAuth(e.newValue ? JSON.parse(e.newValue) : null);
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function login(authData) {

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    setAuth(authData);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("hostack_cart");
    setAuth(null);
  }

  const value = {
    auth,
    isAuthenticated: !!auth,
    isAdmin: auth?.role === "ADMIN",
    isUser: auth?.role === "USER",
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return ctx;
}
