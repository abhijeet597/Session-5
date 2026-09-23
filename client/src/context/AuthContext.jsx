import { createContext, useCallback, useContext, useState } from 'react';
import * as authApi from '../lib/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(authApi.isLoggedIn());

  const login = useCallback(async (email, password) => {
    await authApi.login(email, password);
    setLoggedIn(true);
  }, []);

  const signup = useCallback(async (email, password) => {
    await authApi.signup(email, password);
    setLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
