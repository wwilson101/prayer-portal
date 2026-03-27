import { useState, useEffect } from 'react'
import { Users, Shield, Trash2, UserMinus, RefreshCw, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { adminGetAllUsers, adminGetAllGroups, adminGetAllPrayers, adminSetAdmin, adminDeleteGroup, adminRemoveUserFromGroup } from '../lib/admin'
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers'

function SectionHeader({ title, count, expanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-700">{title}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">{count}</span>
      </div>
      {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
    </button>
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
        g.id === groupId ? { ...g, members: g.members.filter(m => m.id !== userId) } : g
      ))
    } catch (err) {
      setError('Failed to remove member.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="header-bg px-5 pt-14 pb-5 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-0.5">Admin</h1>
            <p className="text-sm text-slate-500">Manage users, groups & prayers</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            Loading...
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Users', value: users.length, icon: Users },
                { label: 'Groups', value: groups.length, icon: Shield },
                { label: 'Prayers', value: prayers.length, icon: BookOpen },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass-card rounded-xl p-3 text-center">
                  <Icon size={16} className="text-slate-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-slate-700">{value}</p>
                  <p className="text-[11px] text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Users Section */}
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
                    <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(u.name)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{getInitials(u.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-700 truncate">{u.name}</p>
                          {u.is_admin && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-semibold flex-shrink-0">Admin</span>
                          )}
                          {u.id === currentUserId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-500 font-semibold flex-shrink-0">You</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">Joined {formatDate(u.created_at)}</p>
                      </div>
                      {u.id !== currentUserId && (
                        <button
                          onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                          disabled={actionLoading === `admin-${u.id}`}
                          className={`text-[11px] px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex-shrink-0 disabled:opacity-50 ${
                            u.is_admin
                              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                      )}
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No users yet</p>}
                </div>
              )}
            </div>

            {/* Groups Section */}
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
                    <div key={g.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-700 truncate">{g.name}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-500 font-mono font-semibold flex-shrink-0">{g.code}</span>
                          </div>
                          <p className="text-xs text-slate-400">{g.members.length} member{g.members.length !== 1 ? 's' : ''} · {formatDate(g.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteGroup(g.id, g.name)}
                          disabled={actionLoading === `group-${g.id}`}
                          className="ml-2 w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {g.members.map(m => (
                          <div key={m.id} className="flex items-center gap-2 pl-1">
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(m.name)} flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white text-[8px] font-bold">{getInitials(m.name)}</span>
                            </div>
                            <span className="text-xs text-slate-500 flex-1 truncate">{m.name}</span>
                            <button
                              onClick={() => handleRemoveMember(g.id, m.id, m.name)}
                              disabled={actionLoading === `member-${g.id}-${m.id}`}
                              className="w-6 h-6 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <UserMinus size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {groups.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No groups yet</p>}
                </div>
              )}
            </div>

            {/* Prayers Section */}
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
                    <div key={p.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-700 flex-1 truncate">{p.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                          p.status === 'answered'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-500'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">By {p.ownerName} · {formatDate(p.requestDate)}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.request}</p>
                    </div>
                  ))}
                  {prayers.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No prayers yet</p>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
