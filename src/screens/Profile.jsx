import { useState } from 'react';
import { User, Mail, Phone, Edit3, Check, Bell, Shield, Heart, Users, ChevronRight, LogOut } from 'lucide-react';
import { getInitials, getAvatarColor } from '../utils/helpers';

export default function Profile({ user, prayers, groups, onUpdateUser, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
  const [saved, setSaved] = useState(false);

  const myPrayers = prayers.filter(p => p.ownerId === user.id);
  const answeredPrayers = myPrayers.filter(p => p.status === 'answered');
  const myGroups = groups.filter(g => g.members.some(m => m.id === user.id));
  const totalPraying = myPrayers.reduce((sum, p) => sum + (p.prayedBy?.length || 0), 0);

  const initials = getInitials(user.name);
  const avatarColor = getAvatarColor(user.name);

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    onUpdateUser({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="header-bg px-5 pt-14 pb-6 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-text">Profile</h1>
          {saved && (
            <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full flex items-center gap-1 font-medium animate-scale-in">
              <Check size={12} />
              Saved!
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Profile card */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field text-base font-bold py-2"
                  placeholder="Your name"
                />
              ) : (
                <>
                  <h2 className="text-lg font-bold text-indigo-900">{user.name}</h2>
                  <p className="text-sm text-slate-500">Prayer Portal Member</p>
                </>
              )}
            </div>
            <button
              onClick={editing ? handleSave : () => setEditing(true)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                editing
                  ? 'bg-green-100 text-green-600 border border-green-200'
                  : 'bg-violet-100 text-violet-600 border border-violet-200'
              }`}
            >
              {editing ? <Check size={16} /> : <Edit3 size={16} />}
            </button>
          </div>

          {/* Contact fields */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            {editing ? (
              <>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-violet-400 flex-shrink-0" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field text-sm py-2 flex-1"
                    placeholder="Email"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-violet-400 flex-shrink-0" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="input-field text-sm py-2 flex-1"
                    placeholder="Phone (for prayer reminders)"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={14} className="text-violet-400 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={14} className="text-violet-400 flex-shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: myPrayers.length, label: 'Prayers', icon: '🙏' },
            { value: answeredPrayers.length, label: 'Answered', icon: '✨' },
            { value: myGroups.length, label: 'Groups', icon: '👥' },
          ].map(({ value, label, icon }) => (
            <div key={label} className="glass-card rounded-xl p-3 text-center">
              <div className="text-lg mb-0.5">{icon}</div>
              <p className="text-xl font-bold text-indigo-800">{value}</p>
              <p className="text-[11px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Settings items */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {[
            { icon: Bell, label: 'Prayer Reminders', sub: user.phone ? 'Text reminders enabled' : 'Add phone to enable', color: 'text-sky-500' },
            { icon: Shield, label: 'Privacy', sub: 'Your data stays in your groups', color: 'text-violet-500' },
            { icon: Heart, label: 'Prayed for Others', sub: `${totalPraying} prayers lifted up`, color: 'text-rose-400' },
          ].map(({ icon: Icon, label, sub, color }, i) => (
            <div key={label} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
              <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center ${color}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-800">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
              <ChevronRight size={14} className="text-slate-300" />
            </div>
          ))}
        </div>

        {/* App info */}
        <div className="glass-card-purple rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg-deep flex items-center justify-center shadow-md">
            <svg width="16" height="20" viewBox="0 0 52 60" fill="none">
              <rect x="22" y="0" width="8" height="60" rx="4" fill="white"/>
              <rect x="8" y="12" width="36" height="8" rx="4" fill="white"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-800">Prayer Portal</p>
            <p className="text-xs text-slate-400">Version 1.0 · Built with love & faith</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 bg-red-50/80 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
