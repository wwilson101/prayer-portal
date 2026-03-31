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
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-password-reset`
  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email }),
    })
  } catch (networkErr) {
    throw new Error('Network error: ' + networkErr.message)
  }
  const text = await response.text()
  let result
  try { result = JSON.parse(text) } catch { result = {} }
  if (!response.ok) throw new Error(result.error || 'Failed to send reset email')
}
