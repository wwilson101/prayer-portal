import { X, CircleCheck as CheckCircle2, Heart, Clock, Users, Mail, Phone, Trash2 } from 'lucide-react';
import { formatDate, formatDateFull, getInitials, getAvatarColor } from '../utils/helpers';

export default function PrayerDetail({ prayer, groups, currentUserId, onClose, onPray, onMarkAnswered, canDelete, onDelete }) {
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
      <div className="modal-overlay absolute inset-0" onClick={onClose} />

      <div className="modal-sheet relative z-10 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#2d5a3d' }} />
        </div>

        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-lg font-bold" style={{ color: '#f0ede0' }}>Prayer Request</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center border hover:opacity-80 transition-colors"
              style={{ background: '#111111', borderColor: '#2a2520' }}
            >
              <X size={16} style={{ color: '#c8b99a' }} />
            </button>
          </div>

          {isAnswered && (
            <div className="tag-answered rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} style={{ color: '#a89060' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#a89060' }}>Prayer Answered!</p>
                {prayer.answeredDate && (
                  <p className="text-xs" style={{ color: '#c8b99a' }}>{formatDateFull(prayer.answeredDate)}</p>
                )}
              </div>
            </div>
          )}

          <div className="glass-card rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center shadow-sm`}>
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#f0ede0' }}>{isOwner ? 'You' : prayer.ownerName}</p>
                <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: '#a89060' }}>
                  <Clock size={11} />
                  <span>{formatDateFull(prayer.requestDate)}</span>
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="mt-3 pt-3 border-t space-y-1.5" style={{ borderColor: '#2a2520' }}>
                {prayer.ownerEmail && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#c8b99a' }}>
                    <Mail size={12} style={{ color: '#a89060' }} />
                    <span>{prayer.ownerEmail}</span>
                  </div>
                )}
                {prayer.ownerPhone && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#c8b99a' }}>
                    <Phone size={12} style={{ color: '#a89060' }} />
                    <span>{prayer.ownerPhone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-[17px] font-bold mb-2 leading-snug" style={{ color: '#f0ede0' }}>
              {prayer.title}
            </h3>
            <p className="text-[14px] leading-relaxed" style={{ color: '#c8b99a' }}>
              {prayer.request}
            </p>
          </div>

          {isAnswered && prayer.answeredNote && (
            <div className="rounded-xl p-4 mb-4 border" style={{ background: '#0f1e14', borderColor: '#2d5a3d' }}>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: '#a89060' }}>Testimony</p>
              <p className="text-sm leading-relaxed" style={{ color: '#c8b99a' }}>{prayer.answeredNote}</p>
            </div>
          )}

          {groupNames.length > 0 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <Users size={14} style={{ color: '#a89060' }} />
              {groupNames.map(name => (
                <span key={name} className="text-xs px-2.5 py-1 rounded-full font-medium border" style={{ background: '#1a2e22', color: '#a89060', borderColor: '#2d5a3d' }}>
                  {name}
                </span>
              ))}
            </div>
          )}

          {prayerCount > 0 && (
            <div className="flex items-center gap-1.5 mb-5 text-sm font-medium" style={{ color: '#a89060' }}>
              <Heart size={15} style={{ fill: '#a89060', color: '#a89060' }} />
              <span>{prayerCount} {prayerCount === 1 ? 'person' : 'people'} praying for this</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => { onPray(prayer.id); }}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 border"
              style={hasPrayed
                ? { background: '#1a2e22', color: '#a89060', borderColor: '#2d5a3d' }
                : undefined
              }
            >
              {hasPrayed ? (
                <>
                  <Heart size={16} style={{ fill: '#a89060', color: '#a89060' }} />
                  <span style={{ color: '#a89060' }}>You're praying — Tap to remove</span>
                </>
              ) : (
                <span className="btn-primary flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm">
                  <Heart size={16} style={{ fill: 'white' }} />
                  I'm Praying for This
                </span>
              )}
            </button>

            {isOwner && !isAnswered && (
              <button
                onClick={() => onMarkAnswered(prayer.id)}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border hover:opacity-80 transition-colors"
                style={{ background: '#0f1e14', color: '#a89060', borderColor: '#2d5a3d' }}
              >
                <CheckCircle2 size={16} />
                Mark as Answered
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => onDelete(prayer.id)}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border hover:opacity-80 transition-colors"
                style={{ background: '#1a0808', color: '#f87171', borderColor: '#7f1d1d' }}
              >
                <Trash2 size={16} />
                Delete Prayer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
