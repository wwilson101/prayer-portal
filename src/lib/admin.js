import { supabase } from './supabase'

export const adminSendPasswordReset = async (userId) => {
  const { data: { session } } = await supabase.auth.getSession()
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-reset`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ userId }),
    }
  )
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to send reset email')
  return result
}

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
  const [membersRes, groupAdminsRes] = await Promise.all([
    supabase
      .from('group_members')
      .select('group_id, user_id, joined_at, profiles(name)')
      .in('group_id', groupIds),
    supabase
      .from('group_admins')
      .select('group_id, user_id, granted_at, profiles!group_admins_user_id_fkey(name)')
      .in('group_id', groupIds),
  ])

  if (membersRes.error) throw membersRes.error

  const members = membersRes.data || []
  const groupAdmins = groupAdminsRes.data || []

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
    groupAdminIds: groupAdmins
      .filter(ga => ga.group_id === g.id)
      .map(ga => ga.user_id),
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

export const adminDeletePrayer = async (prayerId) => {
  const { error } = await supabase
    .from('prayers')
    .delete()
    .eq('id', prayerId)
  if (error) throw error
}

export const adminDeleteUser = async (userId) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)
  if (error) throw error
}

export const adminGetUserProfile = async (userId) => {
  const [profileRes, prayersRes, groupsRes, emailRes] = await Promise.all([
    supabase.from('profiles').select('id, name, phone, is_admin, created_at').eq('id', userId).maybeSingle(),
    supabase.from('prayers').select('id, title, status, request_date').eq('owner_id', userId).order('request_date', { ascending: false }),
    supabase.from('group_members').select('group_id, joined_at, groups(name)').eq('user_id', userId),
    supabase.rpc('admin_get_user_email', { user_id: userId }),
  ])
  if (profileRes.error) throw profileRes.error
  return {
    ...profileRes.data,
    email: emailRes.data || null,
    prayers: prayersRes.data || [],
    groups: (groupsRes.data || []).map(m => ({ id: m.group_id, name: m.groups?.name || 'Unknown', joinedAt: m.joined_at })),
  }
}

export const adminSetGroupAdmin = async (groupId, userId, grantedBy) => {
  const { error } = await supabase
    .from('group_admins')
    .insert({ group_id: groupId, user_id: userId, granted_by: grantedBy })
  if (error) throw error
}

export const adminRevokeGroupAdmin = async (groupId, userId) => {
  const { error } = await supabase
    .from('group_admins')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)
  if (error) throw error
}
