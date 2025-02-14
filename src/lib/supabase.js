import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const signUpNGO = async (formData) => {
  try {
    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', formData.email)
      .maybeSingle();

    if (existingUser) {
      throw new Error('User already exists. Please log in.');
    }

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          organization: formData.organization,
          registration_number: formData.registrationNumber,
          role: 'ngo'
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Signup failed: No user data returned');

    console.log("✅ Signup Success - User ID:", authData.user.id);

    // Wait for session to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Ensure correct session user ID
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || authData.user.id;

    console.log("🔍 Verified User ID:", userId);

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: userId,
          email: formData.email,
          name: formData.name,
          organization: formData.organization,
          phone: formData.phone,
          registration_number: formData.registrationNumber,
          address: formData.address,
          description: formData.description
        }
      ], { onConflict: 'id' });

    if (profileError) throw profileError;

    // Refresh session to ensure consistency
    await supabase.auth.refreshSession();
    return { user: authData.user };
  } catch (error) {
    console.error('🚨 Signup Error:', error);
    throw error;
  }
};

export const signInNGO = async (email, password) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Signin failed: No user data returned');

    console.log("✅ Sign-in Success - User ID:", authData.user.id);

    // Refresh session to sync user data
    await supabase.auth.refreshSession();

    // Fetch NGO profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError || !profile) throw new Error('Profile not found');

    return { user: authData.user, profile };
  } catch (error) {
    console.error('🚨 Signin Error:', error);
    throw error;
  }
};

export const signOutNGO = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log("✅ Signed Out Successfully");
  } catch (error) {
    console.error('🚨 SignOut Error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    await supabase.auth.refreshSession();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    return profile ? { user: session.user, profile } : null;
  } catch (error) {
    console.error('🚨 Get Current User Error:', error);
    return null;
  }
};
