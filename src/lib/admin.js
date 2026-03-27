import { supabase } from './supabase'

export const adminGetAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, phone, is_admin, created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export const adminGetAllGroups = async () => {
  const { data: groups, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: true })
  if (groupError) throw groupError

  if (!groups.length) return []

  const groupIds = groups.map(g => g.id)
  const { data: members, error: memberError } = await supabase
    .from('group_members')
    .select('group_id, user_id, joined_at, profiles(name)')
    .in('group_id', groupIds)
  if (memberError) throw memberError

  return groups.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    code: g.code,
    createdBy: g.created_by,
    createdAt: g.created_at,
    members: members
      .filter(m => m.group_id === g.id)
      .map(m => ({ id: m.user_id, name: m.profiles?.name || 'Unknown', joinedAt: m.joined_at })),
  }))
}

export const adminGetAllPrayers = async () => {
  const { data, error } = await supabase
    .from('prayers')
    .select('*, profiles!prayers_owner_id_fkey(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(p => ({
    id: p.id,
    title: p.title,
    request: p.request,
    status: p.status,
    requestDate: p.request_date,
    answeredDate: p.answered_date,
    ownerId: p.owner_id,
    ownerName: p.profiles?.name || 'Unknown',
  }))
}

export const adminSetAdmin = async (userId, isAdmin) => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId)
  if (error) throw error
}

export const adminDeleteGroup = async (groupId) => {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)
  if (error) throw error
}

export const adminRemoveUserFromGroup = async (groupId, userId) => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)
  if (error) throw error
}
