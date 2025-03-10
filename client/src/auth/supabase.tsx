import { createClient } from '@supabase/supabase-js';

// Hard-code the values temporarily for troubleshooting
const supabaseUrl = "https://laqmmoixletufgzhgwkl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcW1tb2l4bGV0dWZnemhnd2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MTI5NDMsImV4cCI6MjA1NzE4ODk0M30.iqwf5Z6Gmga9BUlv3br4nxG6RvqFvYRPoHcIAaYbodc";

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);