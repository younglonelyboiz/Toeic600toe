import { supabase, isSupabaseConfigured } from './supabaseClient';

export const authService = {
  isConfigured() {
    return isSupabaseConfigured();
  },

  async signUp({ email, password, displayName }) {
    if (!isSupabaseConfigured()) {
      throw new Error('Chưa cấu hình Supabase. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName || email.split('@')[0]
        }
      }
    });

    if (error) throw error;
    return data;
  },

  async signIn({ email, password }) {
    if (!isSupabaseConfigured()) {
      throw new Error('Chưa cấu hình Supabase. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      throw new Error('Chưa cấu hình Supabase.');
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured()) return { success: true };
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },

  async getCurrentSession() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  },

  onAuthStateChange(callback) {
    if (!isSupabaseConfigured()) {
      // Mock empty state when not configured
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },

  async getProfile(userId) {
    if (!isSupabaseConfigured() || !userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile', error);
      return null;
    }
    return data;
  },

  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured() || !userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
