import { supabase } from './supabase'

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })
}

export async function signInWithGitHub() {
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${location.origin}/auth/callback` },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}
