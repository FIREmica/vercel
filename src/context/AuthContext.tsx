
"use client";

import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation'; // For potential redirects
import type { UserProfile } from '@/types/ai-schemas'; // Import UserProfile type

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null; // Add userProfile
  isPremium: boolean; // Add isPremium status
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      const { data: profiles, error } = await supabase
        .from('user_profiles') // Ensure this matches your table name
        .select('*')
        .eq('id', userId);
        // Removed .single() to handle cases where profile might not exist or (less likely) multiple exist.

      if (error) {
        console.error('Error fetching user profile:', error.message);
        setUserProfile(null);
        setIsPremium(false);
      } else if (profiles && profiles.length > 0) {
        const profile = profiles[0]; // Take the first profile.
        setUserProfile(profile as UserProfile); // Cast to UserProfile
        // Determine premium status based on profile data
        setIsPremium(profile?.subscription_status === 'active_premium' || profile?.subscription_status === 'premium_monthly' || profile?.subscription_status === 'premium_yearly');
      } else {
        // No profile found, or an empty array was returned.
        console.warn(`No user profile found for user ID: ${userId}. User will be treated as non-premium.`);
        setUserProfile(null);
        setIsPremium(false);
      }
    };

    const getSessionAndProfile = async () => {
      setIsLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user.id);
      } else {
        setUserProfile(null);
        setIsPremium(false);
      }
      setIsLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setIsLoading(true);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
        } else {
          setUserProfile(null);
          setIsPremium(false);
        }
        setIsLoading(false);
        // Example: Redirect on login/logout if needed from a central place
        // if (_event === 'SIGNED_IN') router.push('/');
        // if (_event === 'SIGNED_OUT') router.push('/login');
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [router]); // router dependency was already there, keeping it

  const signOut = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle setting session, user, and profile to null.
    // router.push('/login'); 
  };

  const value = {
    session,
    user,
    userProfile,
    isPremium,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
