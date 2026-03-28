import { useState, useEffect, useCallback } from 'react'
import './index.css'
import logo from './assets/ChatGPT_Image_Mar_27,_2026_at_03_24_46_PM.png'

import Welcome from './screens/Welcome'
import Home from './screens/Home'
import MyPrayers from './screens/MyPrayers'
import Groups from './screens/Groups'
import Profile from './screens/Profile'
import Admin from './screens/Admin'
import AddPrayer from './screens/AddPrayer'
import UpdatePassword from './screens/UpdatePassword'
import BottomNav from './components/BottomNav'

import { onAuthStateChange, signOut } from './lib/auth'
import { supabase } from './lib/supabase'
import { getMyProfile, updateProfile, updateEmail } from './lib/profile'
import { getMyGroups, createGroup, joinGroupByCode, leaveGroup } from './lib/groups'
import { getPrayers, addPrayer, markAnswered, addPray, removePray, sendPrayNotification } from './lib/prayers'

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
      <div className="flex flex-col items-center gap-4 animate-pulse-soft">
        <img src={logo} alt="Prayer Portal" className="w-24 h-24 object-contain" />
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
  const [showUpdatePassword, setShowUpdatePassword] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const profile = await getMyProfile()
      if (!profile) return
      setUser(profile)
      const myGroups = await getMyGroups()
      setGroups(myGroups)
      const groupIds = myGroups.map(g => g.id)
      const myPrayers = await getPrayers(groupIds)
      setPrayers(myPrayers)
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'PASSWORD_RECOVERY') {
          setShowUpdatePassword(true)
          setReady(true)
          return
        }
        if (session) {
          await loadData()
        } else {
          setUser(null)
          setPrayers([])
          setGroups([])
        }
        setReady(true)
      })()
    })
    return unsub
  }, [loadData])

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setPrayers([])
    setGroups([])
    setActiveTab('home')
  }

  const handlePray = async (prayerId) => {
    if (!user) return
    const prayer = prayers.find(p => p.id === prayerId)
    if (!prayer) return
    const hasPrayed = prayer.prayedBy?.includes(user.id)
    setPrayers(prev => prev.map(p => {
      if (p.id !== prayerId) return p
      return {
        ...p,
        prayedBy: hasPrayed
          ? p.prayedBy.filter(id => id !== user.id)
          : [...(p.prayedBy || []), user.id],
      }
    }))
    try {
      if (hasPrayed) {
        await removePray(prayerId, user.id)
      } else {
        await addPray(prayerId, user.id)
        if (prayer.notifyOnPray && prayer.ownerId !== user.id) {
          sendPrayNotification({
            prayerId: prayer.id,
            prayerOwnerId: prayer.ownerId,
            prayerOwnerPhone: prayer.ownerPhone,
            prayerOwnerName: prayer.ownerName,
            prayerTitle: prayer.title,
            prayerByName: user.name,
          })
        }
      }
    } catch (err) {
      console.error('Failed to update pray:', err)
      setPrayers(prev => prev.map(p => {
        if (p.id !== prayerId) return p
        return {
          ...p,
          prayedBy: hasPrayed
            ? [...(p.prayedBy || []), user.id]
            : p.prayedBy.filter(id => id !== user.id),
        }
      }))
    }
  }

  const handleMarkAnswered = async (prayerId, note = '') => {
    setPrayers(prev => prev.map(p =>
      p.id === prayerId
        ? { ...p, status: 'answered', answeredDate: new Date().toISOString(), answeredNote: note }
        : p
    ))
    try {
      await markAnswered(prayerId, note)
    } catch (err) {
      console.error('Failed to mark answered:', err)
    }
  }

  const handleAddPrayer = async (data) => {
    if (!user) return
    try {
      const newPrayer = await addPrayer({
        title: data.title,
        request: data.request,
        groupIds: data.groupIds,
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        notifyOnPray: data.notifyOnPray || false,
      })
      setPrayers(prev => [newPrayer, ...prev])
      setShowAddPrayer(false)
      setActiveTab('home')
    } catch (err) {
      console.error('Failed to add prayer:', err)
      throw err
    }
  }

  const handleCreateGroup = async (data) => {
    if (!user || !user.isAdmin) return
    try {
      const newGroup = await createGroup(data, user.id, user.name)
      setGroups(prev => [...prev, newGroup])
    } catch (err) {
      console.error('Failed to create group:', err)
      throw err
    }
  }

  const handleJoinGroup = async (code) => {
    try {
      const result = await joinGroupByCode(code)
      if (result?.success) {
        const updatedGroups = await getMyGroups()
        setGroups(updatedGroups)
        const groupIds = updatedGroups.map(g => g.id)
        const updatedPrayers = await getPrayers(groupIds)
        setPrayers(updatedPrayers)
      }
      return result
    } catch (err) {
      console.error('Failed to join group:', err)
      return { success: false, message: err.message || 'Failed to join group.' }
    }
  }

  const handleLeaveGroup = async (groupId) => {
    try {
      await leaveGroup(groupId)
      setGroups(prev => prev.filter(g => g.id !== groupId))
    } catch (err) {
      console.error('Failed to leave group:', err)
    }
  }

  const handleUpdateUser = async (data) => {
    try {
      await updateProfile({ name: data.name, phone: data.phone })
      const emailChanged = data.email && data.email.trim().toLowerCase() !== user.email?.toLowerCase()
      if (emailChanged) {
        await updateEmail(data.email.trim())
      }
      setUser(prev => ({ ...prev, ...data }))
      if (data.name) {
        setPrayers(prev => prev.map(p =>
          p.ownerId === user.id ? { ...p, ownerName: data.name } : p
        ))
      }
      return { emailChanged }
    } catch (err) {
      console.error('Failed to update profile:', err)
      throw err
    }
  }

  if (!ready) return <Splash />

  if (showUpdatePassword) {
    return <UpdatePassword onDone={() => { setShowUpdatePassword(false); loadData() }} />
  }

  if (!user) {
    return <Welcome onAuthSuccess={() => {}} />
  }

  const screenProps = { user, prayers, groups }

  return (
    <div className="relative min-h-screen" style={{ background: '#000000' }}>
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
          onGroupsChange={(groupId, memberId) => {
            setGroups(prev => prev.map(g =>
              g.id === groupId ? { ...g, members: g.members.filter(m => m.id !== memberId) } : g
            ))
          }}
        />
      )}
      {activeTab === 'profile' && (
        <Profile
          {...screenProps}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
        />
      )}
      {activeTab === 'admin' && user?.isAdmin && (
        <Admin currentUserId={user.id} />
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} isAdmin={!!user?.isAdmin} />

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
