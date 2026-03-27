import { useState, useEffect, useCallback } from 'react'
import './index.css'

import Welcome from './screens/Welcome'
import Home from './screens/Home'
import MyPrayers from './screens/MyPrayers'
import Groups from './screens/Groups'
import Profile from './screens/Profile'
import AddPrayer from './screens/AddPrayer'
import BottomNav from './components/BottomNav'
import { generateId, generateGroupCode, generatePrayerTitle, createSeedData } from './utils/helpers'

// ── localStorage helpers ─────────────────────────────────────────────────
const KEYS = { user: 'pp_user', prayers: 'pp_prayers', groups: 'pp_groups' }

const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data))

// ── Splash shown while loading ──────────────────────────────────────────
function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse-soft">
        <div className="w-20 h-20 rounded-3xl gradient-bg-deep flex items-center justify-center shadow-xl shadow-violet-200">
          <svg width="30" height="36" viewBox="0 0 52 60" fill="none">
            <rect x="22" y="0" width="8" height="60" rx="4" fill="white" opacity="0.95"/>
            <rect x="8" y="12" width="36" height="8" rx="4" fill="white" opacity="0.95"/>
          </svg>
        </div>
        <p className="gradient-text font-bold text-xl">Prayer Portal</p>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser]           = useState(null)
  const [prayers, setPrayers]     = useState([])
  const [groups, setGroups]       = useState([])
  const [ready, setReady]         = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showAddPrayer, setShowAddPrayer] = useState(false)

  // ── Load from localStorage on mount ────────────────────────────────────
  useEffect(() => {
    const savedUser = load(KEYS.user)
    if (savedUser) {
      setUser(savedUser)
      setPrayers(load(KEYS.prayers) || [])
      setGroups(load(KEYS.groups) || [])
    }
    setReady(true)
  }, [])

  // ── Persist whenever data changes ──────────────────────────────────────
  useEffect(() => {
    if (user) save(KEYS.user, user)
  }, [user])

  useEffect(() => {
    if (user) save(KEYS.prayers, prayers)
  }, [prayers, user])

  useEffect(() => {
    if (user) save(KEYS.groups, groups)
  }, [groups, user])

  // ── Auth handlers ──────────────────────────────────────────────────────
  const handleSignUp = (formData) => {
    const newUser = {
      id: generateId(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      createdAt: new Date().toISOString(),
    }
    // Create seed data for demo
    const seed = createSeedData(newUser.id, newUser.name, newUser.email, newUser.phone)
    setUser(newUser)
    setPrayers(seed.prayers)
    setGroups(seed.groups)
    save(KEYS.user, newUser)
    save(KEYS.prayers, seed.prayers)
    save(KEYS.groups, seed.groups)
  }

  const handleSignIn = ({ email }) => {
    // In localStorage mode, check if a user exists with that email
    const savedUser = load(KEYS.user)
    if (savedUser && savedUser.email === email) {
      setUser(savedUser)
      setPrayers(load(KEYS.prayers) || [])
      setGroups(load(KEYS.groups) || [])
    } else {
      throw new Error('No account found with that email. Please sign up first.')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setPrayers([])
    setGroups([])
    setActiveTab('home')
  }

  // ── Prayer handlers ────────────────────────────────────────────────────
  const handlePray = (prayerId) => {
    if (!user) return
    setPrayers(prev => prev.map(p => {
      if (p.id !== prayerId) return p
      const hasPrayed = p.prayedBy?.includes(user.id)
      return {
        ...p,
        prayedBy: hasPrayed
          ? p.prayedBy.filter(id => id !== user.id)
          : [...(p.prayedBy || []), user.id],
      }
    }))
  }

  const handleMarkAnswered = (prayerId, note = '') => {
    setPrayers(prev => prev.map(p =>
      p.id === prayerId
        ? { ...p, status: 'answered', answeredDate: new Date().toISOString(), answeredNote: note }
        : p
    ))
  }

  const handleAddPrayer = (data) => {
    const newPrayer = {
      id: generateId(),
      title: data.title,
      request: data.request,
      requestDate: new Date().toISOString(),
      status: 'active',
      answeredDate: null,
      answeredNote: null,
      ownerId: user.id,
      ownerName: user.name,
      ownerEmail: user.email,
      ownerPhone: user.phone,
      groupIds: data.groupIds,
      prayedBy: [],
    }
    setPrayers(prev => [newPrayer, ...prev])
    setShowAddPrayer(false)
    setActiveTab('home')
  }

  // ── Group handlers ─────────────────────────────────────────────────────
  const handleCreateGroup = (data) => {
    const newGroup = {
      id: generateId(),
      name: data.name,
      description: data.description || '',
      code: generateGroupCode(),
      createdBy: user.id,
      members: [{ id: user.id, name: user.name, email: user.email, joinedAt: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    }
    setGroups(prev => [...prev, newGroup])
  }

  const handleJoinGroup = (code) => {
    const group = groups.find(g => g.code === code)
    if (!group) return { success: false, message: 'No group found with that code.' }
    if (group.members.some(m => m.id === user.id)) return { success: false, message: 'You\'re already in this group.' }
    const updated = {
      ...group,
      members: [...group.members, { id: user.id, name: user.name, email: user.email, joinedAt: new Date().toISOString() }],
    }
    setGroups(prev => prev.map(g => g.id === group.id ? updated : g))
    return { success: true }
  }

  const handleLeaveGroup = (groupId) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, members: g.members.filter(m => m.id !== user.id) }
        : g
    ).filter(g => g.members.length > 0))
  }

  // ── Profile handler ────────────────────────────────────────────────────
  const handleUpdateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }))
    // Also update ownerName on existing prayers
    if (data.name) {
      setPrayers(prev => prev.map(p =>
        p.ownerId === user.id ? { ...p, ownerName: data.name } : p
      ))
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (!ready) return <Splash />

  if (!user) {
    return <Welcome onSignUp={handleSignUp} onSignIn={handleSignIn} />
  }

  const screenProps = { user, prayers, groups }

  return (
    <div className="relative min-h-screen">
      {activeTab === 'home' && (
        <Home
          {...screenProps}
          onPray={handlePray}
          onMarkAnswered={handleMarkAnswered}
          onAddPrayer={() => setShowAddPrayer(true)}
        />
      )}
      {activeTab === 'my-prayers' && (
        <MyPrayers
          {...screenProps}
          onPray={handlePray}
          onMarkAnswered={handleMarkAnswered}
          onAddPrayer={() => setShowAddPrayer(true)}
        />
      )}
      {activeTab === 'groups' && (
        <Groups
          {...screenProps}
          onCreateGroup={handleCreateGroup}
          onJoinGroup={handleJoinGroup}
          onLeaveGroup={handleLeaveGroup}
        />
      )}
      {activeTab === 'profile' && (
        <Profile
          {...screenProps}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
        />
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showAddPrayer && (
        <AddPrayer
          user={user}
          groups={groups}
          onSave={handleAddPrayer}
          onClose={() => setShowAddPrayer(false)}
        />
      )}
    </div>
  )
}
