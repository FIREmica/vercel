
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

  const fetchUserProfile = useCallback(async (userIdToFetch: string | undefined) => {
    if (!userIdToFetch) {
      console.log("AuthContext: No user ID provided to fetchUserProfile. Setting profile to null and non-premium.");
      setUserProfile(null);
      setIsPremium(false);
      return;
    }

    console.log(`AuthContext: Attempting to fetch user profile for ID: ${userIdToFetch}`);
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userIdToFetch); // No .single()

      if (error) {
        console.error(`AuthContext: Error fetching user profile for ID ${userIdToFetch}:`, error.message);
        setUserProfile(null);
        setIsPremium(false);
      } else if (profiles && profiles.length > 0) {
        const profile = profiles[0] as UserProfile;
        setUserProfile(profile);
        const currentSubscriptionStatus = profile?.subscription_status?.toLowerCase() || 'free';
        const premiumStatuses = ['active_premium', 'premium_monthly', 'premium_yearly', 'active']; // Consider 'active' as a generic premium state
        const newIsPremium = premiumStatuses.some(status => currentSubscriptionStatus.includes(status));
        setIsPremium(newIsPremium);
        console.log(`AuthContext: User profile fetched successfully for ID ${userIdToFetch}. Profile:`, profile, "New isPremium status:", newIsPremium);
      } else {
        console.warn(`AuthContext: No user profile found for user ID: ${userIdToFetch}. User will be treated as non-premium.`);
        setUserProfile(null);
        setIsPremium(false);
      }
    } catch (e: any) {
        console.error(`AuthContext: Critical error in fetchUserProfile for ID ${userIdToFetch}:`, e.message);
        setUserProfile(null);
        setIsPremium(false);
    }
  }, []);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      console.log("AuthContext: Initializing session and profile fetch...");
      setIsLoading(true);
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("AuthContext: Error getting initial session:", sessionError.message);
      }
      
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      console.log("AuthContext: Initial session state:", currentSession ? `User ID: ${currentUser?.id}` : "No session");

      await fetchUserProfile(currentUser?.id);
      setIsLoading(false);
      console.log("AuthContext: Finished initializing session and profile fetch.");
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log("AuthContext: Auth state changed. Event:", _event, "New session:", !!currentSession);
        setIsLoading(true);
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        console.log("AuthContext: Auth state change. New session state:", currentSession ? `User ID: ${currentUser?.id}` : "No session");

        await fetchUserProfile(currentUser?.id);
        
        if (!currentSession) {
            console.log("AuthContext: User logged out, resetting profile and premium status.");
            setUserProfile(null);
            setIsPremium(false);
        }
        setIsLoading(false);
        console.log("AuthContext: Finished processing auth state change.");
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
    // No need to manually set state here as onAuthStateChange will fire.
    console.log("AuthContext: User sign out initiated. Waiting for auth state change.");
    // setIsLoading(false); // isLoading will be handled by onAuthStateChange
  };

  const refreshUserProfileData = useCallback(async () => {
    if (user) {
      console.log(`AuthContext: Manually refreshing user profile data for User ID: ${user.id}...`);
      setIsLoading(true); // Potentially show a loading state specific to profile refresh
      await fetchUserProfile(user.id);
      setIsLoading(false);
      console.log(`AuthContext: User profile data refreshed for User ID: ${user.id}.`);
    } else {
        console.log("AuthContext: No user to refresh profile data for (refreshUserProfileData called).");
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
