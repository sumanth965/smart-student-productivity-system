import { createContext, useCallback, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'ssp_auth';

export const AuthContext = createContext(null);

const loadStoredUser = () => {
  try {
    const value = localStorage.getItem(AUTH_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  const login = useCallback((payload) => {
    setUser(payload);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
