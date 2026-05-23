import { supabase } from './supabase';

const AVATAR_MAX_SIZE = 200;
const AVATAR_BUCKET = 'avatars';

export interface Profile {
  username: string;
  avatar_url: string | null;
}

/** Build a public avatar URL from the user id (file: avatars/{userId}.jpg). */
export function buildAvatarUrl(userId: string, cacheBust = true): string {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(`${userId}.jpg`);
  const publicUrl = data.publicUrl;
  return cacheBust ? `${publicUrl}?t=${Date.now()}` : publicUrl;
}

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

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.log('[avatar] fetchProfile error', { userId, error });
    return null;
  }

  if (!data?.username) {
    return null;
  }

  const hasAvatar = Boolean(data.avatar_url);
  const avatar_url = hasAvatar ? buildAvatarUrl(userId) : null;

  console.log('[avatar] fetchProfile', {
    userId,
    username: data.username,
    storedAvatarUrl: data.avatar_url,
    resolvedAvatarUrl: avatar_url,
  });

  return {
    username: data.username.trim(),
    avatar_url,
  };
}

export async function fetchUsername(userId: string): Promise<string> {
  const profile = await fetchProfile(userId);
  return profile?.username ?? '';
}

export async function fetchAvatarsByUsernames(
  usernames: string[],
): Promise<Record<string, string | null>> {
  const unique = [...new Set(usernames.map((n) => n.trim()).filter(Boolean))];
  if (unique.length === 0) return {};

  const orFilter = unique.map((u) => `username.ilike.${u}`).join(',');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .or(orFilter);

  if (error || !data) {
    console.log('[avatar] fetchAvatarsByUsernames error', { error });
    return {};
  }

  const lookup = new Map(
    data.map((row) => [
      row.username.toLowerCase(),
      row.avatar_url ? buildAvatarUrl(row.id) : null,
    ]),
  );

  const result: Record<string, string | null> = {};
  for (const name of unique) {
    result[name] = lookup.get(name.toLowerCase()) ?? null;
  }
  return result;
}

async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(AVATAR_MAX_SIZE / width, AVATAR_MAX_SIZE / height, 1);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Impossible de traiter l\'image.'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Impossible de compresser l\'image.'));
        },
        'image/jpeg',
        0.85,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image invalide.'));
    };

    img.src = url;
  });
}

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  try {
    const blob = await resizeImage(file);
    const path = `${userId}.jpg`;

    console.log('[avatar] uploading', { userId, path, bucket: AVATAR_BUCKET });

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });

    if (uploadError) {
      console.log('[avatar] upload error', uploadError);
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const publicUrl = data.publicUrl;

    console.log('[avatar] uploaded', { userId, path, publicUrl });

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.log('[avatar] profile update error', updateError);
      return { url: null, error: updateError.message };
    }

    const avatarUrl = `${publicUrl}?t=${Date.now()}`;
    console.log('[avatar] profile updated', { avatarUrl });

    return { url: avatarUrl, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec du téléversement.';
    return { url: null, error: message };
  }
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
