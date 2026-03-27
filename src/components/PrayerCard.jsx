import { Heart, CheckCircle2, Users, Clock } from 'lucide-react';
import { formatDate, getInitials, getAvatarColor } from '../utils/helpers';

export default function PrayerCard({ prayer, groups, currentUserId, onPray, onClick, compact = false }) {
  const isAnswered = prayer.status === 'answered';
  const hasPrayed = prayer.prayedBy?.includes(currentUserId);
  const prayerCount = prayer.prayedBy?.length || 0;
  const groupNames = (prayer.groupIds || [])
    .map(gid => groups.find(g => g.id === gid)?.name)
    .filter(Boolean);

  const initials = getInitials(prayer.ownerName);
  const avatarColor = getAvatarColor(prayer.ownerName);
  const isOwner = prayer.ownerId === currentUserId;

  return (
    <div
      onClick={() => onClick && onClick(prayer)}
      className={`prayer-card glass-card rounded-2xl p-4 cursor-pointer animate-slide-up ${
        isAnswered ? 'answered-glow' : ''
      }`}
      style={{ borderLeft: isAnswered ? '3px solid #4ade80' : '3px solid transparent' }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center shadow-sm`}>
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </div>

        {/* Name + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-indigo-900 truncate">
              {isOwner ? 'You' : prayer.ownerName}
            </span>
            {isAnswered && (
              <span className="tag-answered text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={10} />
                Answered
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
            <Clock size={10} />
            <span>{formatDate(prayer.requestDate)}</span>
            {groupNames.length > 0 && (
              <>
                <span>·</span>
                <Users size={10} />
                <span className="truncate">{groupNames[0]}{groupNames.length > 1 ? ` +${groupNames.length - 1}` : ''}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-indigo-900 mb-1 leading-snug">
        {prayer.title}
      </h3>

      {/* Request text */}
      {!compact && (
        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-3 mb-3">
          {prayer.request}
        </p>
      )}

      {/* Answered note */}
      {isAnswered && prayer.answeredNote && !compact && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
          <p className="text-[12px] text-green-700 font-medium flex items-start gap-1.5">
            <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0 text-green-500" />
            {prayer.answeredNote}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPray && onPray(prayer.id);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 ${
            hasPrayed
              ? 'bg-violet-100 text-violet-600 border border-violet-200'
              : 'bg-white/60 text-slate-500 border border-slate-200 hover:bg-violet-50 hover:text-violet-500'
          }`}
        >
          <Heart
            size={13}
            className={hasPrayed ? 'fill-violet-500 text-violet-500' : ''}
          />
          {prayerCount > 0 ? `${prayerCount} praying` : 'Pray'}
        </button>

        {isAnswered && (
          <span className="text-[11px] text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 size={12} />
            God answered!
          </span>
        )}
      </div>
    </div>
  );
}
