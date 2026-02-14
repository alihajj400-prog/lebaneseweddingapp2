import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  role: 'couple' | 'vendor' | 'admin';
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  wedding_date: string | null;
  partner_name: string | null;
  estimated_budget_usd: number | null;
  estimated_guests: string | null;
  venue_booked: boolean | null;
  preferred_wedding_day: string | null;
  preferred_wedding_month: string | null;
  onboarding_completed: boolean | null;
}

const OAUTH_SIGNUP_ROLE_KEY = 'oauth_signup_role';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: { user: User } | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (role?: 'couple' | 'vendor') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  updateProfileForUserId: (userId: string, data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id, session.user.user_metadata);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, session.user.user_metadata);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, userMetadata?: { full_name?: string; name?: string; email?: string }) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
      return;
    }

    // Only create profile when no row exists (new OAuth user), not on fetch error
    if (error || data !== null) return;

    const role = (typeof window !== 'undefined' ? sessionStorage.getItem(OAUTH_SIGNUP_ROLE_KEY) : null) as 'couple' | 'vendor' | null;
    const profileRole = role || 'couple';
    if (typeof window !== 'undefined') sessionStorage.removeItem(OAUTH_SIGNUP_ROLE_KEY);

    const fullName = userMetadata?.full_name || userMetadata?.name || userMetadata?.email || null;
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        role: profileRole,
        full_name: fullName,
        onboarding_completed: profileRole === 'couple' ? false : null,
      }, { onConflict: 'user_id' });

    if (!insertError) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (newProfile) setProfile(newProfile as Profile);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return {
      data: authData?.user ? { user: authData.user } : null,
      error: error as Error | null,
    };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signInWithGoogle = async (role: 'couple' | 'vendor' = 'couple') => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(OAUTH_SIGNUP_ROLE_KEY, role);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    return updateProfileForUserId(user.id, data);
  };

  const updateProfileForUserId = async (userId: string, data: Partial<Profile>) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' });

    if (!error) {
      await fetchProfile(userId);
    }
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      updateProfileForUserId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
