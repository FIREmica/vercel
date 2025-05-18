
"use client";

import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/types/ai-schemas'; // Assuming UserProfile type is defined here

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null; // Add userProfile state
  isPremium: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>; // Add refreshUserProfile
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // State for UserProfile
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string | undefined) => {
    if (!userId) {
      setUserProfile(null);
      setIsPremium(false);
      return;
    }

    try {
      // Fetch from user_profiles table
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId);

      if (error) {
        console.error('Error fetching user profile:', error.message);
        setUserProfile(null);
        setIsPremium(false);
      } else if (profiles && profiles.length > 0) {
        const profile = profiles[0] as UserProfile;
        setUserProfile(profile);
        // Determine premium status based on profile data
        // Define what constitutes a "premium" status. This could be a specific string or an array of strings.
        const premiumStatuses = ['active_premium', 'premium_monthly', 'premium_yearly', 'active']; // Example statuses
        setIsPremium(premiumStatuses.some(status => profile?.subscription_status?.toLowerCase().includes(status)));
        console.log("User profile fetched and premium status set:", profile, isPremium);
      } else {
        console.warn(`No user profile found for user ID: ${userId}. User will be treated as non-premium.`);
        setUserProfile(null);
        setIsPremium(false);
      }
    } catch (e: any) {
        console.error('Critical error in fetchUserProfile:', e.message);
        setUserProfile(null);
        setIsPremium(false);
    }
  };

  useEffect(() => {
    const getSessionAndProfile = async () => {
      setIsLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      await fetchUserProfile(currentSession?.user?.id); // Fetch profile after getting session
      setIsLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setIsLoading(true);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        await fetchUserProfile(currentSession?.user?.id); // Fetch profile on auth state change
        setIsLoading(false);
        // If a user logs out, ensure premium status is reset
        if (!currentSession) {
            setUserProfile(null);
            setIsPremium(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    // Auth listener will handle setting session, user, and profile to null,
    // which in turn will set isPremium to false via fetchUserProfile.
    setIsLoading(false);
  };

  const refreshUserProfile = async () => {
    if (user) {
      console.log("AuthContext: Refreshing user profile...");
      setIsLoading(true);
      await fetchUserProfile(user.id);
      setIsLoading(false);
      console.log("AuthContext: User profile refreshed.");
    } else {
        console.log("AuthContext: No user to refresh profile for.");
    }
  };

  const value = {
    session,
    user,
    userProfile,
    isPremium,
    isLoading,
    signOut,
    refreshUserProfile,
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
