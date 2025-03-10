import { createClient } from '@supabase/supabase-js';

// Hard-code the values temporarily for troubleshooting
const supabaseUrl = "https://laqmmoixletufgzhgwkl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcW1tb2l4bGV0dWZnemhnd2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MTI5NDMsImV4cCI6MjA1NzE4ODk0M30.iqwf5Z6Gmga9BUlv3br4nxG6RvqFvYRPoHcIAaYbodc";

// Create the Supabase client with explicit options for reliable connections
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true
  },
  realtime: {
    timeout: 10000 // 10 seconds
  },
  global: {
    fetch: (...args) => {
      // Add timeout to fetch requests
      const controller = new AbortController();
      const { signal } = controller;
      
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      return fetch(...args, { signal })
        .finally(() => clearTimeout(timeoutId));
    }
  }
});

// Test the connection and export the result
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return { success: false, error };
    }
    
    console.log("Supabase connection successful");
    return { success: true, data };
  } catch (e) {
    console.error("Supabase connection exception:", e);
    return { success: false, error: e };
  }
};