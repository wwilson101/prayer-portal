import { useState } from 'react';
import { CircleCheck as CheckCircle2, X, Sparkles } from 'lucide-react';

export default function MarkAnsweredModal({ prayer, onConfirm, onClose }) {
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in" style={{ maxWidth: 430, width: '100%', left: '50%', transform: 'translateX(-50%)' }}>
      <div className="modal-overlay absolute inset-0" onClick={onClose} />
      <div className="modal-sheet relative z-10 animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#2d5a3d' }} />
        </div>

        <div className="px-5 pb-8 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#1a2e22' }}>
              <Sparkles size={22} style={{ color: '#a89060' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: '#f0ede0' }}>Praise God!</h3>
              <p className="text-sm" style={{ color: '#c8b99a' }}>Mark this prayer as answered</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 mb-4">
            <p className="text-sm font-medium line-clamp-2" style={{ color: '#f0ede0' }}>{prayer.title}</p>
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: '#a89060' }}>
              Share Your Testimony <span className="normal-case font-normal" style={{ color: '#c8b99a' }}>(optional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="How did God answer this prayer? Share to encourage your group..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(prayer.id, note.trim())}
              className="flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
              style={{ background: '#2d5a3d', color: '#c8b99a', boxShadow: '0 4px 12px rgba(45,90,61,0.4)' }}
            >
              <CheckCircle2 size={16} />
              Mark Answered
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
