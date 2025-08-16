// Mock Supabase client to prevent loading issues
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ error: null }),
    signUp: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => ({ 
      eq: () => ({ 
        single: () => Promise.resolve({ data: null, error: null }) 
      }) 
    }),
    update: () => ({ 
      eq: () => Promise.resolve({ error: null }) 
    }),
    insert: () => Promise.resolve({ error: null })
  })
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};