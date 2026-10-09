import React, { createContext, useContext, useState, useEffect } from 'react';

export const USER_ROLES = {
  FIELD_OFFICER: {
    id: "FO12345",
    name: "Insp. Rajesh Kumar",
    role: "Field Officer",
    roleKey: "FIELD_OFFICER",
    station: "Connaught Place PS, Delhi",
    badge: "NCB-8821"
  },
  FSL_LAB: {
    id: "FSL-RJ-0412",
    name: "Dr. Sunita Sharma",
    role: "FSL Lab Analyst",
    roleKey: "FSL_LAB",
    lab: "Regional FSL, Rohini",
    badge: "FSL-412"
  },
  ZONAL_HQ: {
    id: "ZHQ-JP-0087",
    name: "Comm. Vikram Singh",
    role: "Zonal HQ Administrator",
    roleKey: "ZONAL_HQ",
    zone: "Northern Zone",
    badge: "HQ-087"
  },
  COURT: {
    id: "CRT-JP-0021",
    name: "Justice Amitabh Kant",
    role: "Special Judge (NDPS)",
    roleKey: "COURT",
    court: "Special Court No. 4, Delhi",
    badge: "JDG-021"
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('nishpaksh_user_role');
    return USER_ROLES[saved] || USER_ROLES.FIELD_OFFICER;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (roleKey = 'FIELD_OFFICER') => {
    const user = USER_ROLES[roleKey] || USER_ROLES.FIELD_OFFICER;
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('nishpaksh_user_role', roleKey);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nishpaksh_user_role');
  };

  const switchRole = (roleKey) => {
    if (USER_ROLES[roleKey]) {
      setCurrentUser(USER_ROLES[roleKey]);
      localStorage.setItem('nishpaksh_user_role', roleKey);
    }
  };

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      isAuthenticated,
      login,
      logout,
      switchRole,
      roles: USER_ROLES
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
