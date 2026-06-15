import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser, logout as storageLogout } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = getCurrentUser();
    if (saved) setUser(saved);
    setLoading(false);
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
    setUser(userData);
  };

  const logout = () => {
    storageLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
