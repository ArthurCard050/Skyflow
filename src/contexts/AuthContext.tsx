import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  ownerId: string; // = id if admin, = admin.id if team member
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (authUser: User) => {
    try {
      // Fetch profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist — auto-create
          const newProfile = {
            id: authUser.id,
            name: authUser.email?.split('@')[0] || 'Novo Usuário',
            email: authUser.email!,
            role: 'client' as UserRole,
            avatar: authUser.email?.charAt(0).toUpperCase() || '?',
          };
          await supabase.from('profiles').insert(newProfile);
          setProfile({ ...newProfile, ownerId: authUser.id });
          return;
        }
        throw error;
      }

      if (data) {
        let ownerId = data.id; // Default: admin owns themselves

        // If not admin, look up their team_members record to find their owner
        if (data.role !== 'admin') {
          const { data: tm } = await supabase
            .from('team_members')
            .select('owner_id')
            .eq('member_id', data.id)
            .limit(1)
            .single();
          if (tm?.owner_id) {
            ownerId = tm.owner_id;
          }
        }

        setProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          avatar: data.avatar || data.name?.charAt(0) || '?',
          phone: data.phone,
          ownerId,
        });
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
