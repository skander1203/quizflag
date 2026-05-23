import { supabase } from './supabase';

export async function isUsernameTaken(username: string): Promise<boolean> {
  const trimmed = username.trim();
  if (!trimmed) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', trimmed)
    .limit(1);

  if (error) {
    throw error;
  }

  return (data?.length ?? 0) > 0;
}

export async function createProfile(
  userId: string,
  username: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').insert({
    id: userId,
    username: username.trim(),
  });

  if (!error) {
    return { error: null };
  }

  if (error.code === '23505') {
    return { error: 'Ce pseudo est déjà pris, choisissez-en un autre' };
  }

  return { error: error.message };
}

export async function fetchUsername(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data?.username) {
    return '';
  }

  return data.username.trim();
}

export async function emailExists(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('email_exists', {
    p_email: email.trim(),
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}
