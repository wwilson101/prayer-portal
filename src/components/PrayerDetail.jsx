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
          <div className="w-10 h-1 rounded-full" style={{ background: '#2d5a2d' }} />
        </div>

        <div className="px-5 pb-8">
          {/* Close button */}
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-lg font-bold" style={{ color: '#d4e8a0' }}>Prayer Request</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center border hover:opacity-80 transition-colors"
              style={{ background: '#1a2a1a', borderColor: '#2a3a2a' }}
            >
              <X size={16} style={{ color: '#5a7a5a' }} />
            </button>
          </div>

          {/* Status badge */}
          {isAnswered && (
            <div className="tag-answered rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} style={{ color: '#6ee75a' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#6ee75a' }}>Prayer Answered!</p>
                {prayer.answeredDate && (
                  <p className="text-xs" style={{ color: '#5aaa5a' }}>{formatDateFull(prayer.answeredDate)}</p>
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
                <p className="font-semibold" style={{ color: '#d4e8a0' }}>{isOwner ? 'You' : prayer.ownerName}</p>
                <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: '#4a6a4a' }}>
                  <Clock size={11} />
                  <span>{formatDateFull(prayer.requestDate)}</span>
                </div>
              </div>
            </div>

            {/* Contact info (only visible to owner) */}
            {isOwner && (
              <div className="mt-3 pt-3 border-t space-y-1.5" style={{ borderColor: '#1e2e1e' }}>
                {prayer.ownerEmail && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#5a7a5a' }}>
                    <Mail size={12} style={{ color: '#5aaa5a' }} />
                    <span>{prayer.ownerEmail}</span>
                  </div>
                )}
                {prayer.ownerPhone && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#5a7a5a' }}>
                    <Phone size={12} style={{ color: '#5aaa5a' }} />
                    <span>{prayer.ownerPhone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prayer title & request */}
          <div className="mb-4">
            <h3 className="text-[17px] font-bold mb-2 leading-snug" style={{ color: '#d4e8a0' }}>
              {prayer.title}
            </h3>
            <p className="text-[14px] leading-relaxed" style={{ color: '#5a7a5a' }}>
              {prayer.request}
            </p>
          </div>

          {/* Answered note */}
          {isAnswered && prayer.answeredNote && (
            <div className="rounded-xl p-4 mb-4 border" style={{ background: '#0f2a0f', borderColor: '#2d5a2d' }}>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: '#6ee75a' }}>Testimony</p>
              <p className="text-sm leading-relaxed" style={{ color: '#7acc7a' }}>{prayer.answeredNote}</p>
            </div>
          )}

          {/* Shared with groups */}
          {groupNames.length > 0 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <Users size={14} style={{ color: '#4a6a4a' }} />
              {groupNames.map(name => (
                <span key={name} className="text-xs px-2.5 py-1 rounded-full font-medium border" style={{ background: '#1a3020', color: '#6ee75a', borderColor: '#2d5a2d' }}>
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Praying count */}
          {prayerCount > 0 && (
            <div className="flex items-center gap-1.5 mb-5 text-sm font-medium" style={{ color: '#6ee75a' }}>
              <Heart size={15} style={{ fill: '#6ee75a', color: '#6ee75a' }} />
              <span>{prayerCount} {prayerCount === 1 ? 'person' : 'people'} praying for this</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => { onPray(prayer.id); }}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 border"
              style={hasPrayed
                ? { background: '#1a3020', color: '#6ee75a', borderColor: '#2d5a2d' }
                : undefined
              }
            >
              {hasPrayed ? (
                <>
                  <Heart size={16} style={{ fill: '#6ee75a', color: '#6ee75a' }} />
                  <span style={{ color: '#6ee75a' }}>You're praying — Tap to remove</span>
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
                style={{ background: '#0f2a0f', color: '#6ee75a', borderColor: '#2d5a2d' }}
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
