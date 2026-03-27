import { useState } from 'react';
import { Plus, CircleCheck as CheckCircle2, Clock, Sparkles } from 'lucide-react';
import PrayerCard from '../components/PrayerCard';
import PrayerDetail from '../components/PrayerDetail';
import MarkAnsweredModal from '../components/MarkAnsweredModal';

export default function MyPrayers({ user, prayers, groups, onPray, onMarkAnswered, onAddPrayer }) {
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [markingAnswered, setMarkingAnswered] = useState(null);
  const [filter, setFilter] = useState('all');

  const myPrayers = prayers
    .filter(p => p.ownerId === user.id)
    .filter(p => filter === 'all' ? true : p.status === filter)
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  const activeCount = prayers.filter(p => p.ownerId === user.id && p.status === 'active').length;
  const answeredCount = prayers.filter(p => p.ownerId === user.id && p.status === 'answered').length;
  const totalPraying = prayers
    .filter(p => p.ownerId === user.id)
    .reduce((sum, p) => sum + (p.prayedBy?.length || 0), 0);

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="header-bg px-5 pt-14 pb-5 sticky top-0 z-30">
        <h1 className="text-2xl font-bold gradient-text mb-1">My Prayers</h1>
        <p className="text-sm mb-4" style={{ color: '#5a7a5a' }}>Your personal prayer journey</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="glass-card-blue rounded-xl p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: '#6ee75a' }}>{activeCount}</p>
            <p className="text-[10px] font-medium flex items-center justify-center gap-1 mt-0.5" style={{ color: '#5aaa5a' }}>
              <Clock size={9} />
              Active
            </p>
          </div>
          <div className="glass-card-purple rounded-xl p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: '#6ee75a' }}>{answeredCount}</p>
            <p className="text-[10px] font-medium flex items-center justify-center gap-1 mt-0.5" style={{ color: '#5aaa5a' }}>
              <Sparkles size={9} />
              Answered
            </p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: '#6ee75a' }}>{totalPraying}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: '#5aaa5a' }}>Praying</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[['all', 'All'], ['active', 'Active'], ['answered', 'Answered ✨']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === val
                  ? 'gradient-bg-deep text-white shadow-sm'
                  : 'border'
              }`}
              style={filter !== val ? { background: '#1a2a1a', color: '#5a7a5a', borderColor: '#2a3a2a' } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Prayer list */}
      <div className="flex-1 px-4 pt-4 space-y-3">
        {myPrayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mb-4 shadow-lg">
              <svg width="28" height="32" viewBox="0 0 52 60" fill="none">
                <rect x="22" y="0" width="8" height="60" rx="4" fill="white" opacity="0.9"/>
                <rect x="8" y="12" width="36" height="8" rx="4" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <p className="text-base font-semibold mb-1" style={{ color: '#c8e090' }}>
              {filter !== 'all' ? `No ${filter} prayers` : 'No prayers yet'}
            </p>
            <p className="text-sm max-w-xs mb-6" style={{ color: '#5a7a5a' }}>
              {filter !== 'all' ? 'Try changing the filter above.' : 'Share your first prayer request with your group.'}
            </p>
            {filter === 'all' && (
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
                  style={{ background: '#0f2a0f', color: '#6ee75a', borderColor: '#2d5a2d' }}
                >
                  <CheckCircle2 size={11} />
                  Answered?
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onAddPrayer}
        className="floating-btn fixed bottom-24 w-14 h-14 rounded-2xl flex items-center justify-center z-30"
        style={{ right: 'max(20px, calc(50% - 215px + 20px))', left: 'auto' }}
      >
        <Plus size={26} className="text-white" />
      </button>

      {/* Prayer detail modal */}
      {selectedPrayer && (
        <PrayerDetail
          prayer={selectedPrayer}
          groups={groups}
          currentUserId={user.id}
          onClose={() => setSelectedPrayer(null)}
          onPray={onPray}
          onMarkAnswered={(id) => { setSelectedPrayer(null); setMarkingAnswered(prayers.find(p => p.id === id)); }}
        />
      )}

      {/* Mark answered modal */}
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
