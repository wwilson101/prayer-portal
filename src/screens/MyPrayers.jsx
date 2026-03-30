import { useState, useRef, useEffect } from 'react';
import { Plus, CircleCheck as CheckCircle2, ListFilter as Filter, ChevronDown, Check } from 'lucide-react';
import logo from '../assets/Prayer_Portal_logo.png';
import PrayerCard from '../components/PrayerCard';
import PrayerDetail from '../components/PrayerDetail';
import MarkAnsweredModal from '../components/MarkAnsweredModal';

export default function MyPrayers({ user, prayers, groups, onPray, onMarkAnswered, onAddPrayer, onDeletePrayer }) {
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [markingAnswered, setMarkingAnswered] = useState(null);
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

  const myGroups = groups.filter(g => g.members.some(m => m.id === user.id));

  const myPrayers = prayers
    .filter(p => p.ownerId === user.id)
    .filter(p => p.status === filter)
    .filter(p => groupFilter === 'all' ? true : p.groupIds?.includes(groupFilter))
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  const activeCount = prayers.filter(p => p.ownerId === user.id && p.status === 'active').length;
  const answeredCount = prayers.filter(p => p.ownerId === user.id && p.status === 'answered').length;
  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="header-bg px-5 pt-6 pb-3 sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-2">
          <img src={logo} alt="Prayer Portal" className="object-contain" style={{ width: '4.5rem', height: '4.5rem' }} />
          <h1 className="text-xl font-bold gradient-text">My Prayers</h1>
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
        {myPrayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <img src={logo} alt="Prayer Portal" className="w-20 h-20 object-contain mb-4" />
            <p className="text-base font-semibold mb-1" style={{ color: '#f0ede0' }}>
              No {filter} prayers
            </p>
            <p className="text-sm max-w-xs mb-6" style={{ color: '#c8b99a' }}>
              {filter === 'active' ? 'Share your first prayer request with your group.' : 'Mark a prayer as answered to see it here.'}
            </p>
            {filter === 'active' && (
              <button onClick={onAddPrayer} className="btn-primary flex items-center gap-2">
                <Plus size={16} />
                Add Prayer Request
              </button>
            )}
          </div>
        ) : (
          myPrayers.map(prayer => (
            <div key={prayer.id} className="relative">
              <PrayerCard
                prayer={prayer}
                groups={groups}
                currentUserId={user.id}
                onPray={onPray}
                onClick={setSelectedPrayer}
              />
              {prayer.status === 'active' && (
                <button
                  onClick={() => setMarkingAnswered(prayer)}
                  className="absolute top-3 right-3 text-[11px] border px-2.5 py-1 rounded-full font-medium flex items-center gap-1 hover:opacity-80 transition-colors z-10"
                  style={{ background: '#0f1e14', color: '#a89060', borderColor: '#2d5a3d' }}
                >
                  <CheckCircle2 size={11} />
                  Answered?
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={onAddPrayer}
        className="floating-btn fixed bottom-24 w-14 h-14 rounded-2xl flex items-center justify-center z-30"
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
          onPray={onPray}
          onMarkAnswered={(id) => { setSelectedPrayer(null); setMarkingAnswered(prayers.find(p => p.id === id)); }}
          canDelete={true}
          onDelete={(id) => { onDeletePrayer(id); setSelectedPrayer(null); }}
        />
      )}

      {markingAnswered && (
        <MarkAnsweredModal
          prayer={markingAnswered}
          onConfirm={(id, note) => { onMarkAnswered(id, note); setMarkingAnswered(null); }}
          onClose={() => setMarkingAnswered(null)}
        />
      )}
    </div>
  );
}
