import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  toggleBucketList: (destinationId: string) => Promise<void>;
  authModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const token = localStorage.getItem('wanderhub_token');
    if (token) {
      api.getMe()
        .then(res => setUser(res.user))
        .catch(() => {
          // Fallback demo user
          loginAsDemo().catch(console.error);
        })
        .finally(() => setLoading(false));
    } else {
      // Automatically activate demo traveler on initial visit for delightful zero-barrier UX
      loginAsDemo().catch(console.error).finally(() => setLoading(false));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('wanderhub_token', res.token);
    setUser(res.user);
    setAuthModalOpen(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    localStorage.setItem('wanderhub_token', res.token);
    setUser(res.user);
    setAuthModalOpen(false);
  };

  const loginAsDemo = async () => {
    try {
      const res = await api.login('alex@wanderhub.com', 'wander2026');
      localStorage.setItem('wanderhub_token', res.token);
      setUser(res.user);
    } catch {
      // Set local demo fallback if needed
      const fallbackUser: User = {
        id: 'usr-demo-wanderer',
        email: 'alex@wanderhub.com',
        name: 'Alex Vance',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        bio: 'Photographer & slow traveler passionate about mountain trails and ancient heritage.',
        homeCountry: 'United States',
        travelStyle: 'Culture & Adventure',
        bucketList: ['kyoto-japan', 'amalfi-italy', 'reykjavik-iceland', 'zermatt-switzerland']
      };
      localStorage.setItem('wanderhub_token', fallbackUser.id);
      setUser(fallbackUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('wanderhub_token');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const res = await api.updateProfile(updates);
    setUser(res.user);
  };

  const toggleBucketList = async (destId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    const currentList = user.bucketList || [];
    const exists = currentList.includes(destId);
    const newList = exists ? currentList.filter(id => id !== destId) : [...currentList, destId];
    await updateProfile({ bucketList: newList });
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginAsDemo,
        logout,
        updateProfile,
        toggleBucketList,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
