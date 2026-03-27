import { supabase } from './supabase'

export const getPrayers = async (myGroupIds) => {
  if (!myGroupIds.length) return []

  const { data: pgRows, error: pgError } = await supabase
    .from('prayer_groups')
    .select('prayer_id, group_id')
    .in('group_id', myGroupIds)

  if (pgError) throw pgError
  if (!pgRows.length) return []

  const prayerIds = [...new Set(pgRows.map(r => r.prayer_id))]

  const { data: prayers, error: pError } = await supabase
    .from('prayers')
    .select('*, profiles!prayers_owner_id_fkey(name, phone)')
    .in('id', prayerIds)
    .order('request_date', { ascending: false })

  if (pError) throw pError

  const { data: prays, error: praysError } = await supabase
    .from('prayer_prays')
    .select('prayer_id, user_id')
    .in('prayer_id', prayerIds)

  if (praysError) throw praysError

  const groupMap = {}
  pgRows.forEach(r => {
    if (!groupMap[r.prayer_id]) groupMap[r.prayer_id] = []
    groupMap[r.prayer_id].push(r.group_id)
  })

  const praysMap = {}
  prays.forEach(r => {
    if (!praysMap[r.prayer_id]) praysMap[r.prayer_id] = []
    praysMap[r.prayer_id].push(r.user_id)
  })

  return prayers.map(p => ({
    id: p.id,
    title: p.title,
    request: p.request,
    requestDate: p.request_date,
    status: p.status,
    answeredDate: p.answered_date,
    answeredNote: p.answered_note,
    ownerId: p.owner_id,
    ownerName: p.profiles?.name || 'Unknown',
    ownerPhone: p.profiles?.phone || '',
    ownerEmail: '',
    notifyOnPray: p.notify_on_pray || false,
    groupIds: groupMap[p.id] || [],
    prayedBy: praysMap[p.id] || [],
  }))
}

export const addPrayer = async ({ title, request, groupIds, userId, userName, userPhone, notifyOnPray = false }) => {
  const { data: prayer, error } = await supabase
    .rpc('add_prayer_with_groups', {
      p_title: title,
      p_request: request,
      p_group_ids: groupIds,
      p_notify_on_pray: notifyOnPray,
    })

  if (error) throw error

  return {
    id: prayer.id,
    title: prayer.title,
    request: prayer.request,
    requestDate: prayer.request_date,
    status: 'active',
    answeredDate: null,
    answeredNote: null,
    ownerId: userId,
    ownerName: userName,
    ownerEmail: '',
    ownerPhone: userPhone || '',
    notifyOnPray: prayer.notify_on_pray || false,
    groupIds,
    prayedBy: [],
  }
}

export const markAnswered = async (prayerId, note = '') => {
  const { error } = await supabase
    .from('prayers')
    .update({
      status: 'answered',
      answered_date: new Date().toISOString(),
      answered_note: note || null,
    })
    .eq('id', prayerId)

  if (error) throw error

  await supabase
    .from('prayer_notifications_sent')
    .delete()
    .eq('prayer_id', prayerId)
}

export const addPray = async (prayerId, userId) => {
  const { error } = await supabase
    .from('prayer_prays')
    .insert({ prayer_id: prayerId, user_id: userId })
  if (error && error.code !== '23505') throw error
}

export const removePray = async (prayerId, userId) => {
  const { error } = await supabase
    .from('prayer_prays')
    .delete()
    .eq('prayer_id', prayerId)
    .eq('user_id', userId)
  if (error) throw error
}

export const sendPrayNotification = async ({ prayerId, prayerOwnerId, prayerOwnerPhone, prayerOwnerName, prayerTitle, prayerByName }) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  try {
    await fetch(`${supabaseUrl}/functions/v1/send-pray-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'Apikey': anonKey,
      },
      body: JSON.stringify({ prayerId, prayerOwnerId, prayerOwnerPhone, prayerOwnerName, prayerTitle, prayerByName }),
    })
  } catch (err) {
    console.error('Failed to send pray notification:', err)
  }
}
