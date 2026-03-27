import { supabase } from './supabase'

// Fetch all prayers visible to the current user across their groups
export const getPrayers = async (myGroupIds) => {
  if (!myGroupIds.length) return []

  // Get all prayer IDs shared into the user's groups
  const { data: pgRows, error: pgError } = await supabase
    .from('prayer_groups')
    .select('prayer_id, group_id')
    .in('group_id', myGroupIds)

  if (pgError) throw pgError
  if (!pgRows.length) return []

  const prayerIds = [...new Set(pgRows.map(r => r.prayer_id))]

  // Fetch prayers + owner profile in one go
  const { data: prayers, error: pError } = await supabase
    .from('prayers')
    .select('*, profiles(name, phone)')
    .in('id', prayerIds)
    .order('request_date', { ascending: false })

  if (pError) throw pError

  // Fetch who's praying for each
  const { data: prays, error: praysError } = await supabase
    .from('prayer_prays')
    .select('prayer_id, user_id')
    .in('prayer_id', prayerIds)

  if (praysError) throw praysError

  // Build lookup maps
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
    // Email intentionally omitted — shown only to owner who has it from session
    ownerEmail: '',
    groupIds: groupMap[p.id] || [],
    prayedBy: praysMap[p.id] || [],
  }))
}

export const addPrayer = async ({ title, request, groupIds, userId, userName, userPhone }) => {
  const { data: prayer, error: pError } = await supabase
    .from('prayers')
    .insert({ title, request, owner_id: userId })
    .select()
    .single()

  if (pError) throw pError

  // Link to groups
  if (groupIds.length) {
    const { error: pgError } = await supabase
      .from('prayer_groups')
      .insert(groupIds.map(gid => ({ prayer_id: prayer.id, group_id: gid })))

    if (pgError) throw pgError
  }

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
}

export const addPray = async (prayerId, userId) => {
  const { error } = await supabase
    .from('prayer_prays')
    .insert({ prayer_id: prayerId, user_id: userId })
  if (error && error.code !== '23505') throw error // ignore duplicate key
}

export const removePray = async (prayerId, userId) => {
  const { error } = await supabase
    .from('prayer_prays')
    .delete()
    .eq('prayer_id', prayerId)
    .eq('user_id', userId)
  if (error) throw error
}
