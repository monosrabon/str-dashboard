"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ENTERPRISE_PERSONAS, hasPermission as checkPermission } from "./rbac";

const AuthContext = createContext({
  currentUser: ENTERPRISE_PERSONAS[0],
  currentRole: ENTERPRISE_PERSONAS[0].role,
  personas: ENTERPRISE_PERSONAS,
  switchPersona: () => {},
  hasPermission: () => false,
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(ENTERPRISE_PERSONAS[0]);

  useEffect(() => {
    try {
      const storedId = localStorage.getItem("aura_str_active_user");
      if (storedId) {
        const found = ENTERPRISE_PERSONAS.find((p) => p.id === storedId);
        if (found) setCurrentUser(found);
      }
    } catch {
      // LocalStorage unavailable in SSR
    }
  }, []);

  const switchPersona = (personaId) => {
    const selected = ENTERPRISE_PERSONAS.find((p) => p.id === personaId);
    if (selected) {
      setCurrentUser(selected);
      try {
        localStorage.setItem("aura_str_active_user", selected.id);
      } catch {
        // LocalStorage unavailable
      }
    }
  };

  const hasPermission = (permission) => {
    return checkPermission(currentUser.role, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        personas: ENTERPRISE_PERSONAS,
        switchPersona,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
