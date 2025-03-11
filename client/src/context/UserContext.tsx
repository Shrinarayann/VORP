import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/auth/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in: string;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create and export the Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch or create user profile
  const fetchOrCreateProfile = async (user: User) => {
    if (!user) {
      // console.error("[DEBUG] Cannot create profile for null user");
      return null;
    }
    
    try {
      // console.log("[DEBUG] User object received:", JSON.stringify(user, null, 2));
      // console.log("[DEBUG] User ID:", user.id);
      // console.log("[DEBUG] User email:", user.email);
      // console.log("[DEBUG] User metadata:", JSON.stringify(user.user_metadata, null, 2));
      
      // First, check if auth is working correctly
      /* 
      if (authError) {
        console.error("[DEBUG] Auth verification failed:", authError);
      } else {
        console.log("[DEBUG] Auth verification successful. Current authenticated user:", authData?.user?.id);
        
        if (authData?.user?.id !== user.id) {
          console.warn("[DEBUG] Warning: Current auth session user ID does not match the user ID we're trying to create a profile for!");
        }
      }
      */
      
      // Check if profile exists
      let { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
  
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("[DEBUG] No profile found, will create a new one");
        } else {
          console.error('[DEBUG] Error fetching profile:', error);
          console.error('[DEBUG] Error details:', error.message);
          return null;
        }
      }
  
      // If profile doesn't exist, create one
      if (!existingProfile) {
        // Check if table exists and is accessible
        const { data: checkTable, error: tableError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
          
        if (tableError) {
          console.error("[DEBUG] Table check failed. There might be issue with table access:", tableError);
        } else {
          console.log("[DEBUG] Table check successful. Table exists and is accessible.");
        }
          
        // Extract data from user object
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          created_at: new Date().toISOString(),
          last_sign_in: new Date().toISOString(),
        };
  
        console.log("[DEBUG] About to insert new profile with data:", JSON.stringify(newProfile, null, 2));
        
        // Insert the new profile
        const { data, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select();
  
        if (insertError) {
          console.error('[DEBUG] Error creating profile:', insertError);
          console.error('[DEBUG] Failed profile data:', JSON.stringify(newProfile, null, 2));
          return null;
        }
  
        console.log("[DEBUG] Profile created successfully. Response data:", JSON.stringify(data, null, 2));
        
        if (!data || !data[0]) {
          console.error("[DEBUG] Empty response data after insert");
          return newProfile as UserProfile; // Return the data we tried to insert as fallback
        }
        
        return data[0] as UserProfile;
      } else {
        console.log("[DEBUG] Existing profile found:", JSON.stringify(existingProfile, null, 2));
        
        // Update the last_sign_in field for existing profiles
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ last_sign_in: new Date().toISOString() })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('[DEBUG] Error updating last sign in time:', updateError);
        } else {
          console.log('[DEBUG] Last sign in time updated successfully');
        }
        
        return existingProfile as UserProfile;
      }
    } catch (error) {
      console.error('[DEBUG] Error in fetchOrCreateProfile:', error);
      if (error instanceof Error) {
        console.error('[DEBUG] Error details:', error.message);
        console.error('[DEBUG] Stack trace:', error.stack);
      }
      return null;
    }
  };

  useEffect(() => {
    // Check for existing session on initial load
    const getInitialUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Get or create user profile
          const userProfile = await fetchOrCreateProfile(session.user);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error getting initial user session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialUser();
    
    // Set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed. Event:", event);
        
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log("User authenticated:", currentUser.id);
          // Get or create user profile whenever auth state changes
          const userProfile = await fetchOrCreateProfile(currentUser);
          setProfile(userProfile);
          console.log("User profile set:", userProfile);
        } else {
          setProfile(null);
          console.log("User logged out or session expired");
        }
        
        setLoading(false);
      }
    );
    
    // Clean up subscription when component unmounts
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login function
  const login = async () => {
    try {
      console.log("Starting Google OAuth login process");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
      
      console.log("OAuth sign-in initiated:", data);
      
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error logging in:', error.message);
      } else {
        console.error('Error logging in:', error);
      }
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user and profile state
      setUser(null);
      setProfile(null);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error logging out:', error.message);
      } else {
        console.error('Error logging out:', error);
      }
    }
  };

  // Provider value
  const value = {
    user,
    profile,
    loading,
    login,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Create and export the hook separately - not as a named export from the same module
function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export { useUser };

// Default export the Provider component
export default UserProvider;