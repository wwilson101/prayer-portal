import { useState } from 'react';
import { X, Wand as Wand2, ChevronRight, Users, CircleAlert as AlertCircle, Bell, BellOff } from 'lucide-react';
import { generatePrayerTitle } from '../utils/helpers';

export default function AddPrayer({ user, groups, onSave, onClose }) {
  const myGroups = groups.filter(g => g.members.some(m => m.id === user.id));

  const [form, setForm] = useState({
    request: '',
    selectedGroups: myGroups.length > 0 ? [myGroups[0].id] : [],
    notifyOnPray: false,
  });
  const [titlePreview, setTitlePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleRequestChange = (val) => {
    setForm(f => ({ ...f, request: val }));
    setTitlePreview(val.trim() ? generatePrayerTitle(val) : '');
    setErrors(e => ({ ...e, request: '' }));
  };

  const toggleGroup = (gid) => {
    setForm(f => ({
      ...f,
      selectedGroups: f.selectedGroups.includes(gid)
        ? f.selectedGroups.filter(id => id !== gid)
        : [...f.selectedGroups, gid],
    }));
    setErrors(e => ({ ...e, groups: '' }));
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.request.trim()) errs.request = 'Please share your prayer request';
    if (form.selectedGroups.length === 0) errs.groups = 'Select at least one group';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    setSaveError('');
    try {
      await onSave({
        request: form.request.trim(),
        title: generatePrayerTitle(form.request),
        groupIds: form.selectedGroups,
        notifyOnPray: form.notifyOnPray,
      });
    } catch (err) {
      setSaveError('Failed to share your prayer request. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-fade-in" style={{ maxWidth: 430, width: '100%', left: '50%', transform: 'translateX(-50%)' }}>
      {/* Full screen overlay bg */}
      <div
        style={{ background: '#111211' }}
        className="absolute inset-0"
      />

      <div className="relative z-10 flex flex-col flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-5">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#d4e8a0' }}>New Prayer</h2>
            <p className="text-sm" style={{ color: '#5a7a5a' }}>Share your heart with your group</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center shadow-sm"
          >
            <X size={18} style={{ color: '#5a7a5a' }} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-5">
          {/* Prayer request textarea */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: '#7acc7a' }}>
              Your Prayer Request *
            </label>
            <textarea
              rows={6}
              placeholder="Share what's on your heart... Be as specific or general as you'd like. God hears every word."
              value={form.request}
              onChange={e => handleRequestChange(e.target.value)}
              className="input-field"
            />
            {errors.request && <p className="text-xs text-red-500 mt-1">{errors.request}</p>}
          </div>

          {/* Auto-title preview */}
          {titlePreview && (
            <div className="glass-card-purple rounded-xl px-4 py-3 flex items-start gap-2 animate-scale-in">
              <Wand2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#6ee75a' }} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#6ee75a' }}>Auto Title</p>
                <p className="text-sm font-medium" style={{ color: '#c8e090' }}>{titlePreview}</p>
              </div>
            </div>
          )}

          {/* Share with groups */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: '#7acc7a' }}>
              <Users size={12} />
              Share with Group *
            </label>

            {myGroups.length === 0 ? (
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-sm" style={{ color: '#5a7a5a' }}>You haven't joined any groups yet.</p>
                <p className="text-xs mt-1" style={{ color: '#6ee75a' }}>Join a group first to share prayers.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myGroups.map(group => {
                  const selected = form.selectedGroups.includes(group.id);
                  return (
                    <button
                      key={group.id}
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full text-left rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200 border ${
                        selected ? 'glass-card-purple' : 'glass-card'
                      }`}
                      style={selected ? { borderColor: '#2d5a2d' } : { borderColor: 'transparent' }}
                    >
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all`}
                        style={selected
                          ? { background: '#6ee75a', borderColor: '#6ee75a' }
                          : { borderColor: '#2d5a2d' }
                        }
                      >
                        {selected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: selected ? '#6ee75a' : '#c8e090' }}>
                          {group.name}
                        </p>
                        <p className="text-xs" style={{ color: '#4a6a4a' }}>{group.members.length} members</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.groups && <p className="text-xs text-red-500 mt-1">{errors.groups}</p>}
          </div>

          {/* Privacy note */}
          <div className="glass-card-blue rounded-xl p-3 flex items-start gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#1a3020' }}>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <path d="M5 1L1 3v4c0 2.2 1.7 3.9 4 4.5C7.3 10.9 9 9.2 9 7V3L5 1z" fill="#6ee75a"/>
              </svg>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#6ee75a' }}>
              Your request will only be visible to members of your selected groups.
            </p>
          </div>

          {/* Notify on pray toggle */}
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, notifyOnPray: !f.notifyOnPray }))}
            className="w-full rounded-xl p-4 flex items-center gap-3 transition-all duration-200 text-left border"
            style={form.notifyOnPray
              ? { background: '#0f2a0f', borderColor: '#2d5a2d' }
              : { background: 'transparent', borderColor: 'transparent' }
            }
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={form.notifyOnPray
                ? { background: '#1a3a1a' }
                : { background: '#1a2a1a' }
              }
            >
              {form.notifyOnPray
                ? <Bell size={16} style={{ color: '#6ee75a' }} />
                : <BellOff size={16} style={{ color: '#4a6a4a' }} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: form.notifyOnPray ? '#6ee75a' : '#5a7a5a' }}>
                Text me when someone prays
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#4a6a4a' }}>
                {form.notifyOnPray
                  ? 'You\'ll get a text each time someone new prays for this'
                  : 'Tap to receive a text notification when others pray'}
              </p>
            </div>
            <div className="w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 relative"
              style={{ background: form.notifyOnPray ? '#6ee75a' : '#2a3a2a' }}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                form.notifyOnPray ? 'left-5' : 'left-0.5'
              }`} />
            </div>
          </button>
        </div>

        {/* Submit button */}
        <div className="sticky bottom-0 px-5 py-4" style={{ background: 'linear-gradient(to top, #111211 60%, transparent)' }}>
          {saveError && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2.5 rounded-xl border border-red-800" style={{ background: '#2a0f0f' }}>
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-400">{saveError}</p>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base"
          >
            {saving ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                Share Prayer Request
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
