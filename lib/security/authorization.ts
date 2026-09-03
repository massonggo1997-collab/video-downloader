import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/types/user';

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return {
        id: user.id,
        email: user.email || '',
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
        role: 'USER',
        createdAt: user.created_at,
        updatedAt: user.created_at,
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      role: profile.role || 'USER',
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return user;
}
