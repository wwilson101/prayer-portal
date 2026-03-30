import { useState } from 'react';
import { Plus, CircleCheck as CheckCircle2, Clock, Sparkles } from 'lucide-react';
import logo from '../assets/Prayer_Portal_logo.png';
import PrayerCard from '../components/PrayerCard';
import PrayerDetail from '../components/PrayerDetail';
import MarkAnsweredModal from '../components/MarkAnsweredModal';

export default function MyPrayers({ user, prayers, groups, onPray, onMarkAnswered, onAddPrayer, onDeletePrayer }) {
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
      <div className="header-bg px-5 pt-6 pb-3 sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-2">
          <img src={logo} alt="Prayer Portal" className="object-contain" style={{ width: '4.5rem', height: '4.5rem' }} />
          <h1 className="text-xl font-bold gradient-text">My Prayers</h1>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="glass-card-blue rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-base font-bold" style={{ color: '#f0ede0' }}>{activeCount}</span>
            <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#c8b99a' }}><Clock size={8} />Active</span>
          </div>
          <div className="glass-card-purple rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-base font-bold" style={{ color: '#f0ede0' }}>{answeredCount}</span>
            <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#c8b99a' }}><Sparkles size={8} />Answered</span>
          </div>
          <div className="glass-card rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-base font-bold" style={{ color: '#f0ede0' }}>{totalPraying}</span>
            <span className="text-[10px]" style={{ color: '#c8b99a' }}>Praying</span>
          </div>
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
        {myPrayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <img src={logo} alt="Prayer Portal" className="w-20 h-20 object-contain mb-4" />
            <p className="text-base font-semibold mb-1" style={{ color: '#f0ede0' }}>
              {filter !== 'all' ? `No ${filter} prayers` : 'No prayers yet'}
            </p>
            <p className="text-sm max-w-xs mb-6" style={{ color: '#c8b99a' }}>
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
