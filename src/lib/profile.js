import { supabase } from './supabase'

export const getMyProfile = async () => {
  const { data, error } = await supabase.rpc('get_my_profile')
  if (error) throw error
  return data
}

export const updateProfile = async ({ name, phone }) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ name, phone: phone || '' })
    .eq('id', user.id)

  if (error) throw error
}

export const saveOneSignalPlayerId = async (playerId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('profiles')
    .update({ onesignal_player_id: playerId })
    .eq('id', user.id)

  if (error) console.error('Failed to save OneSignal player ID:', error)
}

export const updateEmail = async (newEmail) => {
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) throw error
}
