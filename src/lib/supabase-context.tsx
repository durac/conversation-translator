import React, { createContext, useContext } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

const SupabaseContext = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context.supabase;
}