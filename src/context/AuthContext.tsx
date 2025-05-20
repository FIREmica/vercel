
"use client";

import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile } from '@/types/ai-schemas';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  isPremium: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      console.log("AuthContext: No user ID provided, setting profile to null and non-premium.");
      setUserProfile(null);
      setIsPremium(false);
      return;
    }

    console.log(`AuthContext: Fetching user profile for ID: ${userId}`);
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId);

      if (error) {
        console.error('AuthContext: Error fetching user profile:', error.message);
        setUserProfile(null);
        setIsPremium(false);
      } else if (profiles && profiles.length > 0) {
        const profile = profiles[0] as UserProfile;
        setUserProfile(profile);
        // Determine premium status based on profile data
        const premiumStatuses = ['active_premium', 'premium_monthly', 'premium_yearly', 'active'];
        const currentSubscriptionStatus = profile?.subscription_status?.toLowerCase() || 'free';
        const newIsPremium = premiumStatuses.some(status => currentSubscriptionStatus.includes(status));
        setIsPremium(newIsPremium);
        console.log("AuthContext: User profile fetched. Profile:", profile, "New isPremium status:", newIsPremium);
      } else {
        console.warn(`AuthContext: No user profile found for user ID: ${userId}. User will be treated as non-premium.`);
        setUserProfile(null);
        setIsPremium(false);
      }
    } catch (e: any) {
        console.error('AuthContext: Critical error in fetchUserProfile:', e.message);
        setUserProfile(null);
        setIsPremium(false);
    }
  }, []);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      setIsLoading(true);
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("AuthContext: Error getting initial session:", sessionError.message);
      }
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      await fetchUserProfile(currentSession?.user?.id);
      setIsLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log("AuthContext: Auth state changed. Event:", _event, "New session:", !!currentSession);
        setIsLoading(true);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        await fetchUserProfile(currentSession?.user?.id);
        setIsLoading(false);
        if (!currentSession) {
            console.log("AuthContext: User logged out, resetting profile and premium status.");
            setUserProfile(null);
            setIsPremium(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signOutUser = async () => {
    setIsLoading(true);
    console.log("AuthContext: Signing out user...");
    await supabase.auth.signOut();
    // Auth listener will handle setting session, user, profile to null, and isPremium to false.
    setIsLoading(false);
    console.log("AuthContext: User signed out.");
  };

  const refreshUserProfileData = useCallback(async () => {
    if (user) {
      console.log("AuthContext: Refreshing user profile data...");
      setIsLoading(true);
      await fetchUserProfile(user.id);
      setIsLoading(false);
      console.log("AuthContext: User profile data refreshed.");
    } else {
        console.log("AuthContext: No user to refresh profile data for.");
    }
  }, [user, fetchUserProfile]);

  const value = {
    session,
    user,
    userProfile,
    isPremium,
    isLoading,
    signOut: signOutUser,
    refreshUserProfile: refreshUserProfileData,
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
