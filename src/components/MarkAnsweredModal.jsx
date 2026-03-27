import { useState } from 'react';
import { CircleCheck as CheckCircle2, X, Sparkles } from 'lucide-react';

export default function MarkAnsweredModal({ prayer, onConfirm, onClose }) {
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in" style={{ maxWidth: 430, width: '100%', left: '50%', transform: 'translateX(-50%)' }}>
      <div className="modal-overlay absolute inset-0" onClick={onClose} />
      <div className="modal-sheet relative z-10 animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-violet-200" />
        </div>

        <div className="px-5 pb-8 pt-4">
          {/* Icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <Sparkles size={22} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-900">Praise God!</h3>
              <p className="text-sm text-slate-500">Mark this prayer as answered</p>
            </div>
          </div>

          {/* Prayer title */}
          <div className="glass-card rounded-xl p-3 mb-4">
            <p className="text-sm font-medium text-indigo-800 line-clamp-2">{prayer.title}</p>
          </div>

          {/* Testimony note */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2 block">
              Share Your Testimony <span className="text-slate-400 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="How did God answer this prayer? Share to encourage your group..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(prayer.id, note.trim())}
              className="flex-1 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-green-100"
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
