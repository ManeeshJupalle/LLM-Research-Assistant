import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any | null;
  profile: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and then set to not loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock successful sign in
    const mockUser = {
      id: '1',
      email: email,
      created_at: new Date().toISOString()
    };
    
    const mockProfile = {
      id: '1',
      email: email,
      full_name: email.split('@')[0],
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setSession({ user: mockUser });
    
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    // Mock successful sign up
    const mockUser = {
      id: '1',
      email: email,
      created_at: new Date().toISOString()
    };
    
    const mockProfile = {
      id: '1',
      email: email,
      full_name: email.split('@')[0],
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setSession({ user: mockUser });
    
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { error: new Error('No user logged in') };

    setProfile(prev => prev ? { ...prev, ...updates } : null);
    return { error: null };
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};