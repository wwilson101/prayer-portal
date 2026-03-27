import { supabase } from './supabase'
import { generateGroupCode } from '../utils/helpers'

export const getMyGroups = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get group IDs the user belongs to
  const { data: memberships, error: memError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  if (memError) throw memError
  if (!memberships.length) return []

  const groupIds = memberships.map(m => m.group_id)

  // Get group details
  const { data: groups, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)
    .order('created_at', { ascending: true })

  if (groupError) throw groupError

  // Get all members for those groups (with profile names)
  const { data: allMembers, error: memberError } = await supabase
    .from('group_members')
    .select('group_id, user_id, joined_at, profiles(name)')
    .in('group_id', groupIds)

  if (memberError) throw memberError

  // Assemble the shape components expect
  return groups.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    code: g.code,
    createdBy: g.created_by,
    createdAt: g.created_at,
    members: allMembers
      .filter(m => m.group_id === g.id)
      .map(m => ({
        id: m.user_id,
        name: m.profiles?.name || 'Unknown',
        joinedAt: m.joined_at,
      })),
  }))
}

export const createGroup = async ({ name, description }, userId, userName) => {
  // Generate a unique code (retry on collision)
  let code, attempts = 0
  while (attempts < 5) {
    code = generateGroupCode()
    const { data: existing } = await supabase
      .from('groups')
      .select('id')
      .eq('code', code)
      .maybeSingle()
    if (!existing) break
    attempts++
  }

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({ name, description: description || '', code, created_by: userId })
    .select()
    .single()

  if (groupError) throw groupError

  // Add creator as first member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId })

  if (memberError) throw memberError

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    code: group.code,
    createdBy: group.created_by,
    createdAt: group.created_at,
    members: [{ id: userId, name: userName, joinedAt: new Date().toISOString() }],
  }
}

export const joinGroupByCode = async (code) => {
  const { data, error } = await supabase.rpc('join_group_by_code', { p_code: code })
  if (error) throw error
  return data // { success, message?, groupId? }
}

export const leaveGroup = async (groupId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id)

  if (error) throw error
}
