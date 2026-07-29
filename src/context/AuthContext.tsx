import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Single-manager login. The password is stored as a SHA-256 hash rather than
// plaintext. NOTE: any client-side check is ultimately bypassable — this keeps
// the password out of the source, it is not a substitute for real auth.
// To change the password: run in a terminal —
//   node -e "console.log(require('crypto').createHash('sha256').update('NEW_PASSWORD').digest('hex'))"
// and paste the result below.
const ADMIN_EMAIL = 'admin@alyazen.com';
const ADMIN_PASSWORD_SHA256 = '0c62fa356a8b4f0fc5f14d2268f405437b35a572cd6ffdaa3c971fe3dd56c240';

const sha256Hex = async (text: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('alyazen_auth');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const passwordHash = await sha256Hex(password);
    if (email.trim().toLowerCase() === ADMIN_EMAIL && passwordHash === ADMIN_PASSWORD_SHA256) {
      const adminUser: User = { email: ADMIN_EMAIL, role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('alyazen_auth', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('alyazen_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
