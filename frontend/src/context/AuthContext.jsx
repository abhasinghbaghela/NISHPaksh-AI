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
    id: "FSL412",
    name: "Dr. Sunita Sharma",
    role: "FSL Lab Analyst",
    roleKey: "FSL_LAB",
    lab: "Regional FSL, Rohini",
    badge: "FSL-412"
  },
  ZONAL_HQ: {
    id: "HQ087",
    name: "Comm. Vikram Singh",
    role: "Zonal HQ Administrator",
    roleKey: "ZONAL_HQ",
    zone: "Northern Zone Command",
    badge: "HQ-087"
  },
  COURT: {
    id: "JDG021",
    name: "Justice Amitabh Kant",
    role: "Special Judge (NDPS)",
    roleKey: "COURT",
    court: "Special Court No. 4, Delhi",
    badge: "JDG-021"
  }
};

// Exact authorized login credentials required for each role
export const OFFICIAL_CREDENTIALS = [
  {
    roleKey: "FIELD_OFFICER",
    title: "Field Officer",
    officerId: "FO12345",
    email: "field.officer@ncb.gov.in",
    password: "Field@2026",
    user: USER_ROLES.FIELD_OFFICER
  },
  {
    roleKey: "FSL_LAB",
    title: "Forensic Science Laboratory (FSL)",
    officerId: "FSL412",
    email: "fsl.analyst@fsl.gov.in",
    password: "FslLab@2026",
    user: USER_ROLES.FSL_LAB
  },
  {
    roleKey: "ZONAL_HQ",
    title: "Zonal Police / HQ Command",
    officerId: "HQ087",
    email: "zonal.hq@police.gov.in",
    password: "ZonalHq@2026",
    user: USER_ROLES.ZONAL_HQ
  },
  {
    roleKey: "COURT",
    title: "Special NDPS Court / Judiciary",
    officerId: "JDG021",
    email: "judge.ndps@delhicourts.nic.in",
    password: "Court@2026",
    user: USER_ROLES.COURT
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('nishpaksh_user_role');
    return USER_ROLES[saved] || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('nishpaksh_authenticated');
  });

  // Authenticate strictly with exact Officer ID / Email and Security Password
  const loginWithCredentials = (identifier, password) => {
    if (!identifier || !password) {
      return { success: false, error: 'Officer ID and Password are required.' };
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const matched = OFFICIAL_CREDENTIALS.find(c => 
      (c.officerId.toLowerCase() === cleanId || c.email.toLowerCase() === cleanId) &&
      c.password === cleanPass
    );

    if (matched) {
      setCurrentUser(matched.user);
      setIsAuthenticated(true);
      localStorage.setItem('nishpaksh_user_role', matched.roleKey);
      localStorage.setItem('nishpaksh_authenticated', 'true');
      return { success: true, user: matched.user };
    }

    return { 
      success: false, 
      error: 'Authentication failed: Invalid Officer ID or Security Password. Please check authorized credentials.' 
    };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('nishpaksh_user_role');
    localStorage.removeItem('nishpaksh_authenticated');
  };

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      isAuthenticated,
      loginWithCredentials,
      logout,
      roles: USER_ROLES,
      officialCredentials: OFFICIAL_CREDENTIALS
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
