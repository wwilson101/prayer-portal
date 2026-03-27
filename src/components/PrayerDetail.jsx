import { X, CircleCheck as CheckCircle2, Heart, Clock, Users, Mail, Phone, Calendar } from 'lucide-react';
import { formatDate, formatDateFull, getInitials, getAvatarColor } from '../utils/helpers';

export default function PrayerDetail({ prayer, groups, currentUserId, onClose, onPray, onMarkAnswered }) {
  if (!prayer) return null;

  const isAnswered = prayer.status === 'answered';
  const hasPrayed = prayer.prayedBy?.includes(currentUserId);
  const prayerCount = prayer.prayedBy?.length || 0;
  const isOwner = prayer.ownerId === currentUserId;
  const groupNames = (prayer.groupIds || [])
    .map(gid => groups.find(g => g.id === gid)?.name)
    .filter(Boolean);

  const initials = getInitials(prayer.ownerName);
  const avatarColor = getAvatarColor(prayer.ownerName);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in" style={{ maxWidth: 430, width: '100%', left: '50%', transform: 'translateX(-50%)' }}>
      {/* Overlay */}
      <div className="modal-overlay absolute inset-0" onClick={onClose} />

      {/* Sheet */}
      <div className="modal-sheet relative z-10 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-violet-200" />
        </div>

        <div className="px-5 pb-8">
          {/* Close button */}
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-lg font-bold text-indigo-900">Prayer Request</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          {/* Status badge */}
          {isAnswered && (
            <div className="tag-answered rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <div>
                <p className="text-sm font-bold text-green-800">Prayer Answered!</p>
                {prayer.answeredDate && (
                  <p className="text-xs text-green-600">{formatDateFull(prayer.answeredDate)}</p>
                )}
              </div>
            </div>
          )}

          {/* Requester info */}
          <div className="glass-card rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center shadow-sm`}>
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
              <div>
                <p className="font-semibold text-indigo-900">{isOwner ? 'You' : prayer.ownerName}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <Clock size={11} />
                  <span>{formatDateFull(prayer.requestDate)}</span>
                </div>
              </div>
            </div>

            {/* Contact info (only visible to owner) */}
            {isOwner && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                {prayer.ownerEmail && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={12} className="text-violet-400" />
                    <span>{prayer.ownerEmail}</span>
                  </div>
                )}
                {prayer.ownerPhone && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={12} className="text-violet-400" />
                    <span>{prayer.ownerPhone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prayer title & request */}
          <div className="mb-4">
            <h3 className="text-[17px] font-bold text-indigo-900 mb-2 leading-snug">
              {prayer.title}
            </h3>
            <p className="text-[14px] text-slate-600 leading-relaxed">
              {prayer.request}
            </p>
          </div>

          {/* Answered note */}
          {isAnswered && prayer.answeredNote && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">Testimony</p>
              <p className="text-sm text-green-800 leading-relaxed">{prayer.answeredNote}</p>
            </div>
          )}

          {/* Shared with groups */}
          {groupNames.length > 0 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <Users size={14} className="text-slate-400" />
              {groupNames.map(name => (
                <span key={name} className="text-xs bg-violet-100 text-violet-600 px-2.5 py-1 rounded-full font-medium">
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Praying count */}
          {prayerCount > 0 && (
            <div className="flex items-center gap-1.5 mb-5 text-sm text-violet-500 font-medium">
              <Heart size={15} className="fill-violet-400 text-violet-400" />
              <span>{prayerCount} {prayerCount === 1 ? 'person' : 'people'} praying for this</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => { onPray(prayer.id); }}
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                hasPrayed
                  ? 'bg-violet-100 text-violet-600 border border-violet-200'
                  : 'btn-primary'
              }`}
            >
              <Heart size={16} className={hasPrayed ? 'fill-violet-500' : 'fill-white'} />
              {hasPrayed ? 'You\'re praying — Tap to remove' : 'I\'m Praying for This'}
            </button>

            {isOwner && !isAnswered && (
              <button
                onClick={() => onMarkAnswered(prayer.id)}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
              >
                <CheckCircle2 size={16} />
                Mark as Answered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
