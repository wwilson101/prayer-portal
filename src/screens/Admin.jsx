import { useState, useEffect } from 'react'
import { Users, Shield, Trash2, UserMinus, RefreshCw, ChevronDown, ChevronUp, BookOpen, Mail, Eye, X, Phone, BookMarked, CircleCheck as CheckCircle, ShieldCheck, ShieldOff } from 'lucide-react'
import { adminGetAllUsers, adminGetAllGroups, adminGetAllPrayers, adminSetAdmin, adminDeleteGroup, adminRemoveUserFromGroup, adminDeletePrayer, adminDeleteUser, adminSendPasswordReset, adminGetUserProfile, adminSetGroupAdmin, adminRevokeGroupAdmin } from '../lib/admin'
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers'
import Tooltip from '../components/Tooltip'

function SectionHeader({ title, count, expanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold" style={{ color: '#f0ede0' }}>{title}</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#111111', color: '#c8b99a' }}>{count}</span>
      </div>
      {expanded
        ? <ChevronUp size={16} style={{ color: '#a89060' }} />
        : <ChevronDown size={16} style={{ color: '#a89060' }} />
      }
    </button>
  )
}

function UserProfileModal({ userId, currentUserId, onClose }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetUserProfile(userId).then(p => { setProfile(p); setLoading(false) }).catch(() => setLoading(false))
  }, [userId])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-3xl pb-8 pt-5 px-5 space-y-4"
        style={{ background: '#111111', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold" style={{ color: '#f0ede0' }}>User Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#1a1a1a', color: '#c8b99a' }}>
            <X size={15} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: '#c8b99a' }}>Loading...</div>
        ) : !profile ? (
          <div className="py-12 text-center text-sm text-red-400">Failed to load profile.</div>
        ) : (
          <>
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: '#0d0d0d' }}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(profile.name)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-lg font-bold">{getInitials(profile.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-base font-bold" style={{ color: '#f0ede0' }}>{profile.name}</p>
                  {profile.is_admin && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#1a1204', color: '#a89060' }}>App Admin</span>
                  )}
                  {profile.id === currentUserId && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#1a2e22', color: '#a89060' }}>You</span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#c8b99a' }}>Joined {formatDate(profile.created_at)}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl space-y-3" style={{ background: '#0d0d0d' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a89060' }}>Contact Info</p>
              {profile.email && (
                <div className="flex items-center gap-2 text-sm" style={{ color: '#c8b99a' }}>
                  <Mail size={13} style={{ color: '#a89060' }} />
                  <span className="truncate">{profile.email}</span>
                </div>
              )}
              {profile.phone ? (
                <div className="flex items-center gap-2 text-sm" style={{ color: '#c8b99a' }}>
                  <Phone size={13} style={{ color: '#a89060' }} />
                  <span>{profile.phone}</span>
                </div>
              ) : (
                <p className="text-sm" style={{ color: '#6b6360' }}>No phone number on file</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Prayers', value: profile.prayers.length, icon: BookMarked },
                { label: 'Answered', value: profile.prayers.filter(p => p.status === 'answered').length, icon: CheckCircle },
                { label: 'Groups', value: profile.groups.length, icon: Users },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ background: '#0d0d0d' }}>
                  <Icon size={14} className="mx-auto mb-1" style={{ color: '#a89060' }} />
                  <p className="text-xl font-bold" style={{ color: '#f0ede0' }}>{value}</p>
                  <p className="text-[11px]" style={{ color: '#c8b99a' }}>{label}</p>
                </div>
              ))}
            </div>

            {profile.groups.length > 0 && (
              <div className="p-4 rounded-2xl space-y-2" style={{ background: '#0d0d0d' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#a89060' }}>Groups</p>
                {profile.groups.map(g => (
                  <div key={g.id} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: '#1a1a1a' }}>
                    <span className="text-sm" style={{ color: '#f0ede0' }}>{g.name}</span>
                    <span className="text-xs" style={{ color: '#c8b99a' }}>Joined {formatDate(g.joinedAt)}</span>
                  </div>
                ))}
              </div>
            )}

            {profile.prayers.length > 0 && (
              <div className="p-4 rounded-2xl space-y-2" style={{ background: '#0d0d0d' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#a89060' }}>Recent Prayers</p>
                {profile.prayers.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: '#1a1a1a' }}>
                    <span className="text-sm truncate flex-1 mr-2" style={{ color: '#f0ede0' }}>{p.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-semibold"
                      style={p.status === 'answered'
                        ? { background: '#0f1e14', color: '#a89060' }
                        : { background: '#1a2e22', color: '#c8b99a' }
                      }
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
                {profile.prayers.length > 5 && (
                  <p className="text-xs text-center pt-1" style={{ color: '#6b6360' }}>+ {profile.prayers.length - 5} more</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function Admin({ currentUserId }) {
  const [users, setUsers]       = useState([])
  const [groups, setGroups]     = useState([])
  const [prayers, setPrayers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [expandedSection, setExpandedSection] = useState('users')
  const [actionLoading, setActionLoading] = useState(null)
  const [viewingUserId, setViewingUserId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [u, g, p] = await Promise.all([
        adminGetAllUsers(),
        adminGetAllGroups(),
        adminGetAllPrayers(),
      ])
      setUsers(u)
      setGroups(g)
      setPrayers(p)
    } catch (err) {
      setError('Failed to load admin data. Make sure your account has admin privileges.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleSection = (id) => setExpandedSection(prev => prev === id ? null : id)

  const handleToggleAdmin = async (userId, currentStatus) => {
    setActionLoading(`admin-${userId}`)
    try {
      await adminSetAdmin(userId, !currentStatus)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentStatus } : u))
    } catch (err) {
      setError('Failed to update admin status.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!confirm(`Delete group "${groupName}"? This cannot be undone.`)) return
    setActionLoading(`group-${groupId}`)
    try {
      await adminDeleteGroup(groupId)
      setGroups(prev => prev.filter(g => g.id !== groupId))
    } catch (err) {
      setError('Failed to delete group.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveMember = async (groupId, userId, userName) => {
    if (!confirm(`Remove ${userName} from this group?`)) return
    setActionLoading(`member-${groupId}-${userId}`)
    try {
      await adminRemoveUserFromGroup(groupId, userId)
      setGroups(prev => prev.map(g =>
        g.id === groupId
          ? { ...g, members: g.members.filter(m => m.id !== userId), groupAdminIds: g.groupAdminIds.filter(id => id !== userId) }
          : g
      ))
    } catch (err) {
      setError('Failed to remove member.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeletePrayer = async (prayerId, prayerTitle) => {
    if (!confirm(`Delete prayer "${prayerTitle}"? This cannot be undone.`)) return
    setActionLoading(`prayer-${prayerId}`)
    try {
      await adminDeletePrayer(prayerId)
      setPrayers(prev => prev.filter(p => p.id !== prayerId))
    } catch (err) {
      setError('Failed to delete prayer.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Remove account for "${userName}"? This will delete their profile. This cannot be undone.`)) return
    setActionLoading(`delete-user-${userId}`)
    try {
      await adminDeleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err) {
      setError('Failed to remove account.')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePasswordReset = async (userId, userName) => {
    if (!confirm(`Send a password reset email to ${userName}?`)) return
    setActionLoading(`reset-${userId}`)
    try {
      await adminSendPasswordReset(userId)
      setError('')
    } catch (err) {
      setError(`Failed to send reset email: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleGroupAdmin = async (groupId, userId, isCurrentlyAdmin) => {
    setActionLoading(`gadmin-${groupId}-${userId}`)
    try {
      if (isCurrentlyAdmin) {
        await adminRevokeGroupAdmin(groupId, userId)
        setGroups(prev => prev.map(g =>
          g.id === groupId
            ? { ...g, groupAdminIds: g.groupAdminIds.filter(id => id !== userId) }
            : g
        ))
      } else {
        await adminSetGroupAdmin(groupId, userId, currentUserId)
        setGroups(prev => prev.map(g =>
          g.id === groupId
            ? { ...g, groupAdminIds: [...g.groupAdminIds, userId] }
            : g
        ))
      }
    } catch (err) {
      setError('Failed to update group admin status.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {viewingUserId && (
        <UserProfileModal
          userId={viewingUserId}
          currentUserId={currentUserId}
          onClose={() => setViewingUserId(null)}
        />
      )}
      <div className="header-bg px-5 pt-14 pb-5 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-0.5">Admin</h1>
            <p className="text-sm" style={{ color: '#c8b99a' }}>Manage users, groups & prayers</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
            style={{ background: '#111111', color: '#c8b99a' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-400 border border-red-800" style={{ background: '#1a0808' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm" style={{ color: '#c8b99a' }}>
            Loading...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Users', value: users.length, icon: Users },
                { label: 'Groups', value: groups.length, icon: Shield },
                { label: 'Prayers', value: prayers.length, icon: BookOpen },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass-card rounded-xl p-3 text-center">
                  <Icon size={16} className="mx-auto mb-1" style={{ color: '#a89060' }} />
                  <p className="text-xl font-bold" style={{ color: '#f0ede0' }}>{value}</p>
                  <p className="text-[11px]" style={{ color: '#c8b99a' }}>{label}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl p-4">
              <SectionHeader
                title="Users"
                count={users.length}
                expanded={expandedSection === 'users'}
                onToggle={() => toggleSection('users')}
              />
              {expandedSection === 'users' && (
                <div className="mt-3 space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#0d0d0d' }}>
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(u.name)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{getInitials(u.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold truncate" style={{ color: '#f0ede0' }}>{u.name}</p>
                          {u.is_admin && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: '#1a1204', color: '#a89060' }}>App Admin</span>
                          )}
                          {u.id === currentUserId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: '#1a2e22', color: '#a89060' }}>You</span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: '#c8b99a' }}>Joined {formatDate(u.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Tooltip label="View profile" position="top">
                          <button
                            onClick={() => setViewingUserId(u.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-colors"
                            style={{ background: '#1a1a2e', color: '#93c5fd' }}
                          >
                            <Eye size={13} />
                          </button>
                        </Tooltip>
                      </div>
                      {u.id !== currentUserId && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Tooltip label={u.is_admin ? 'Revoke app admin' : 'Make app admin'} position="top">
                            <button
                              onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                              disabled={actionLoading === `admin-${u.id}`}
                              className="text-[11px] px-2.5 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
                              style={u.is_admin
                                ? { background: '#1a1204', color: '#a89060' }
                                : { background: '#111111', color: '#c8b99a' }
                              }
                            >
                              {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                            </button>
                          </Tooltip>
                          <Tooltip label="Send password reset email" position="top">
                            <button
                              onClick={() => handlePasswordReset(u.id, u.name)}
                              disabled={actionLoading === `reset-${u.id}`}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-colors disabled:opacity-50"
                              style={{ background: '#111827', color: '#7dd3fc' }}
                            >
                              <Mail size={13} />
                            </button>
                          </Tooltip>
                          <Tooltip label="Delete user account" position="top">
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              disabled={actionLoading === `delete-user-${u.id}`}
                              className="w-7 h-7 rounded-lg text-red-400 flex items-center justify-center hover:opacity-80 transition-colors disabled:opacity-50"
                              style={{ background: '#1a0808' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-sm text-center py-4" style={{ color: '#c8b99a' }}>No users yet</p>}
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-4">
              <SectionHeader
                title="Groups"
                count={groups.length}
                expanded={expandedSection === 'groups'}
                onToggle={() => toggleSection('groups')}
              />
              {expandedSection === 'groups' && (
                <div className="mt-3 space-y-3">
                  {groups.map(g => (
                    <div key={g.id} className="p-3 rounded-xl" style={{ background: '#0d0d0d' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold truncate" style={{ color: '#f0ede0' }}>{g.name}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold flex-shrink-0" style={{ background: '#1a1710', color: '#c8b99a' }}>{g.code}</span>
                          </div>
                          <p className="text-xs" style={{ color: '#c8b99a' }}>{g.members.length} member{g.members.length !== 1 ? 's' : ''} · {formatDate(g.createdAt)}</p>
                        </div>
                        <Tooltip label="Delete group" position="top">
                          <button
                            onClick={() => handleDeleteGroup(g.id, g.name)}
                            disabled={actionLoading === `group-${g.id}`}
                            className="ml-2 w-8 h-8 rounded-lg text-red-400 flex items-center justify-center hover:opacity-80 transition-colors disabled:opacity-50 flex-shrink-0"
                            style={{ background: '#1a0808' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </Tooltip>
                      </div>
                      <div className="space-y-1.5">
                        {g.members.map(m => {
                          const isGroupAdmin = g.groupAdminIds?.includes(m.id)
                          return (
                            <div key={m.id} className="flex items-center gap-2 pl-1">
                              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(m.name)} flex items-center justify-center flex-shrink-0`}>
                                <span className="text-white text-[8px] font-bold">{getInitials(m.name)}</span>
                              </div>
                              <span className="text-xs flex-1 truncate" style={{ color: '#c8b99a' }}>{m.name}</span>
                              {isGroupAdmin && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: '#0d1f15', color: '#6fcf97' }}>Group Admin</span>
                              )}
                              <Tooltip label={isGroupAdmin ? 'Revoke group admin' : 'Make group admin'} position="left">
                                <button
                                  onClick={() => handleToggleGroupAdmin(g.id, m.id, isGroupAdmin)}
                                  disabled={actionLoading === `gadmin-${g.id}-${m.id}`}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 hover:opacity-80 flex-shrink-0"
                                  style={isGroupAdmin
                                    ? { background: '#0d1f15', color: '#6fcf97' }
                                    : { background: '#1a1710', color: '#a89060' }
                                  }
                                >
                                  {isGroupAdmin ? <ShieldOff size={11} /> : <ShieldCheck size={11} />}
                                </button>
                              </Tooltip>
                              <Tooltip label="Remove from group" position="left">
                                <button
                                  onClick={() => handleRemoveMember(g.id, m.id, m.name)}
                                  disabled={actionLoading === `member-${g.id}-${m.id}`}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 hover:opacity-80"
                                  style={{ color: '#a89060' }}
                                >
                                  <UserMinus size={12} />
                                </button>
                              </Tooltip>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {groups.length === 0 && <p className="text-sm text-center py-4" style={{ color: '#c8b99a' }}>No groups yet</p>}
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-4">
              <SectionHeader
                title="All Prayers"
                count={prayers.length}
                expanded={expandedSection === 'prayers'}
                onToggle={() => toggleSection('prayers')}
              />
              {expandedSection === 'prayers' && (
                <div className="mt-3 space-y-2">
                  {prayers.map(p => (
                    <div key={p.id} className="p-3 rounded-xl" style={{ background: '#0d0d0d' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold flex-1 truncate" style={{ color: '#f0ede0' }}>{p.title}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                          style={p.status === 'answered'
                            ? { background: '#0f1e14', color: '#a89060' }
                            : { background: '#1a2e22', color: '#c8b99a' }
                          }
                        >
                          {p.status}
                        </span>
                        <Tooltip label="Delete prayer" position="top">
                          <button
                            onClick={() => handleDeletePrayer(p.id, p.title)}
                            disabled={actionLoading === `prayer-${p.id}`}
                            className="w-7 h-7 rounded-lg text-red-400 flex items-center justify-center hover:opacity-80 transition-colors disabled:opacity-50 flex-shrink-0"
                            style={{ background: '#1a0808' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </Tooltip>
                      </div>
                      <p className="text-xs" style={{ color: '#a89060' }}>By {p.ownerName} · {formatDate(p.requestDate)}</p>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: '#c8b99a' }}>{p.request}</p>
                    </div>
                  ))}
                  {prayers.length === 0 && <p className="text-sm text-center py-4" style={{ color: '#c8b99a' }}>No prayers yet</p>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
