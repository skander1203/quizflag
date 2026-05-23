import { supabase } from './supabase';

export async function reportFlag(
  countryIso: string,
  countryName: string,
  userId: string | null,
): Promise<void> {
  const { error } = await supabase.from('flag_reports').insert({
    country_iso: countryIso.toLowerCase(),
    country_name: countryName,
    user_id: userId,
  });

  if (error) throw error;
}
