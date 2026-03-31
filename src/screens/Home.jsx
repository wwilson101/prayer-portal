import { useState, useRef, useEffect } from 'react';
import { Plus, Search, ListFilter as Filter, ChevronDown, Check } from 'lucide-react';
import logo from '../assets/Prayer_Portal_logo.png';
import PrayerCard from '../components/PrayerCard';
import PrayerDetail from '../components/PrayerDetail';

export default function Home({ user, prayers, groups, onPray, onMarkAnswered, onAddPrayer, onDeletePrayer }) {
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active');
  const [groupFilter, setGroupFilter] = useState('all');
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setGroupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupAdminIds = user?.groupAdminIds || []
  const ownedGroupIds = groups.filter(g => g.createdBy === user.id).map(g => g.id)

  const myGroups = groups.filter(g => g.members.some(m => m.id === user.id))
  const myGroupIds = myGroups.map(g => g.id)

  useEffect(() => {
    if (groupFilter !== 'all' && !myGroupIds.includes(groupFilter)) {
      setGroupFilter('all');
    }
  }, [groups]);

  const canDeletePrayer = (prayer) => {
    if (user?.isAdmin) return true
    if (prayer.ownerId === user.id) return true
    return prayer.groupIds?.some(gid => ownedGroupIds.includes(gid) || groupAdminIds.includes(gid))
  };

  const visiblePrayers = prayers
    .filter(p => p.groupIds?.some(gid => myGroupIds.includes(gid)))
    .filter(p => filter === 'all' ? true : p.status === filter)
    .filter(p => groupFilter === 'all' ? true : p.groupIds?.includes(groupFilter))
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.request.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  const activeCount = prayers.filter(p => p.groupIds?.some(gid => myGroupIds.includes(gid)) && p.status === 'active').length;
  const answeredCount = prayers.filter(p => p.groupIds?.some(gid => myGroupIds.includes(gid)) && p.status === 'answered').length;

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="header-bg px-5 pt-6 pb-3 sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-3">
          <img src={logo} alt="Prayer Portal" className="object-contain" style={{ width: '4.5rem', height: '4.5rem' }} />
          <div>
            <p className="text-[11px] font-medium leading-none mb-0.5" style={{ color: '#a89060' }}>Good to see you,</p>
            <h1 className="text-xl font-bold gradient-text leading-none">{user.name.split(' ')[0]}</h1>
          </div>
        </div>

        <div className="relative mb-2.5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#a89060' }} />
          <input
            type="text"
            placeholder="Search prayers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field py-2 text-sm"
            style={{ paddingLeft: '2rem' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            {[['active', 'Active', activeCount], ['answered', 'Answered', answeredCount]].map(([val, label, count]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  filter === val
                    ? 'gradient-bg-deep text-white shadow-sm'
                    : 'border'
                }`}
                style={filter !== val ? { background: '#111111', color: '#c8b99a', borderColor: '#2a2520' } : {}}
              >
                {label}
                <span className={`text-[10px] font-bold ${filter === val ? 'opacity-80' : ''}`}>{count}</span>
              </button>
            ))}
          </div>

          {myGroups.length > 1 && (
            <div className="relative ml-auto" ref={dropdownRef}>
              <button
                onClick={() => setGroupDropdownOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
                style={{
                  background: groupFilter !== 'all' ? undefined : '#111111',
                  color: groupFilter !== 'all' ? '#f0ede0' : '#c8b99a',
                  borderColor: groupFilter !== 'all' ? 'transparent' : '#2a2520',
                  ...(groupFilter !== 'all' ? { background: 'linear-gradient(135deg, #2a6b4f 0%, #1a4a36 100%)' } : {}),
                }}
              >
                <Filter size={11} />
                {groupFilter === 'all' ? 'Group' : myGroups.find(g => g.id === groupFilter)?.name || 'Group'}
                <ChevronDown size={11} className={`transition-transform duration-200 ${groupDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {groupDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 rounded-xl border shadow-xl z-50 overflow-hidden"
                  style={{ background: '#1a1a1a', borderColor: '#2a2520', minWidth: '9rem' }}
                >
                  <button
                    onClick={() => { setGroupFilter('all'); setGroupDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5"
                    style={{ color: groupFilter === 'all' ? '#f0ede0' : '#c8b99a' }}
                  >
                    All Groups
                    {groupFilter === 'all' && <Check size={11} style={{ color: '#4a9e74' }} />}
                  </button>
                  <div style={{ height: '1px', background: '#2a2520', margin: '0 8px' }} />
                  {myGroups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => { setGroupFilter(g.id); setGroupDropdownOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5"
                      style={{ color: groupFilter === g.id ? '#f0ede0' : '#c8b99a' }}
                    >
                      <span className="truncate max-w-[7rem]">{g.name}</span>
                      {groupFilter === g.id && <Check size={11} style={{ color: '#4a9e74' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-3">
        {visiblePrayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <img src={logo} alt="Prayer Portal" className="w-20 h-20 object-contain mb-4" />
            {myGroupIds.length === 0 ? (
              <>
                <p className="text-base font-semibold mb-1" style={{ color: '#f0ede0' }}>Join a group first</p>
                <p className="text-sm max-w-xs" style={{ color: '#c8b99a' }}>Join or create a prayer group to see and share prayer requests with others.</p>
              </>
            ) : search.trim() ? (
              <>
                <p className="text-base font-semibold mb-1" style={{ color: '#f0ede0' }}>No results found</p>
                <p className="text-sm" style={{ color: '#c8b99a' }}>Try a different search term.</p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold mb-1" style={{ color: '#f0ede0' }}>No prayers yet</p>
                <p className="text-sm max-w-xs" style={{ color: '#c8b99a' }}>Be the first to share a prayer request with your group.</p>
              </>
            )}
          </div>
        ) : (
          visiblePrayers.map(prayer => (
            <PrayerCard
              key={prayer.id}
              prayer={prayer}
              groups={groups}
              currentUserId={user.id}
              onPray={onPray}
              onClick={setSelectedPrayer}
            />
          ))
        )}
      </div>

      <button
        onClick={onAddPrayer}
        className="floating-btn fixed bottom-24 right-5 w-14 h-14 rounded-2xl flex items-center justify-center z-30"
        style={{ right: 'max(20px, calc(50% - 215px + 20px))', left: 'auto' }}
      >
        <Plus size={26} className="text-white" />
      </button>

      {selectedPrayer && (
        <PrayerDetail
          prayer={selectedPrayer}
          groups={groups}
          currentUserId={user.id}
          onClose={() => setSelectedPrayer(null)}
          onPray={(id) => { onPray(id); setSelectedPrayer(p => p && p.id === id ? { ...p, prayedBy: p.prayedBy.includes(user.id) ? p.prayedBy.filter(x => x !== user.id) : [...p.prayedBy, user.id] } : p); }}
          onMarkAnswered={(id) => { onMarkAnswered(id); setSelectedPrayer(null); }}
          canDelete={canDeletePrayer(selectedPrayer)}
          onDelete={(id) => { onDeletePrayer(id); setSelectedPrayer(null); }}
        />
      )}
    </div>
  );
}
