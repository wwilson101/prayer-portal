import { useState } from 'react';
import { Plus, Search, ListFilter as Filter, Sparkles } from 'lucide-react';
import PrayerCard from '../components/PrayerCard';
import PrayerDetail from '../components/PrayerDetail';

export default function Home({ user, prayers, groups, onPray, onMarkAnswered, onAddPrayer }) {
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const myGroupIds = groups
    .filter(g => g.members.some(m => m.id === user.id))
    .map(g => g.id);

  const visiblePrayers = prayers
    .filter(p => p.groupIds?.some(gid => myGroupIds.includes(gid)))
    .filter(p => filter === 'all' ? true : p.status === filter)
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
      <div className="header-bg px-5 pt-14 pb-4 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium" style={{ color: '#a89060' }}>Good to see you,</p>
            <h1 className="text-2xl font-bold gradient-text">{user.name.split(' ')[0]}</h1>
          </div>
          <div className="w-10 h-10 rounded-full gradient-bg-deep flex items-center justify-center shadow-md">
            <svg width="16" height="20" viewBox="0 0 52 60" fill="none">
              <rect x="22" y="0" width="8" height="60" rx="4" fill="white"/>
              <rect x="8" y="12" width="36" height="8" rx="4" fill="white"/>
            </svg>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="glass-card-blue rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: '#f0ede0' }}>{activeCount}</span>
            <span className="text-xs font-medium" style={{ color: '#c8b99a' }}>Active</span>
          </div>
          <div className="glass-card-purple rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: '#f0ede0' }}>{answeredCount}</span>
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: '#c8b99a' }}>
              <Sparkles size={10} />
              Answered
            </span>
          </div>
        </div>

        <div className="relative mb-3">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#a89060' }} />
          <input
            type="text"
            placeholder="Search prayers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field py-2.5 text-sm"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        <div className="flex gap-2">
          {[['all', 'All'], ['active', 'Active'], ['answered', 'Answered']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === val
                  ? 'gradient-bg-deep text-white shadow-sm'
                  : 'border'
              }`}
              style={filter !== val ? { background: '#111111', color: '#c8b99a', borderColor: '#2a2520' } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-3">
        {visiblePrayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mb-4 shadow-lg">
              <svg width="28" height="32" viewBox="0 0 52 60" fill="none">
                <rect x="22" y="0" width="8" height="60" rx="4" fill="white" opacity="0.9"/>
                <rect x="8" y="12" width="36" height="8" rx="4" fill="white" opacity="0.9"/>
              </svg>
            </div>
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
        />
      )}
    </div>
  );
}
