import { supabase } from './supabase'

export const signUp = async ({ name, email, phone, password }) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  // Create the profile row immediately
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: data.user.id, name, phone: phone || '' })

  if (profileError) throw profileError
  return data
}

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return () => subscription.unsubscribe()
}

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const sendPasswordReset = async (email) => {
  const appUrl = window.location.origin
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/`,
  })
  if (error) throw error
}
