import { useState } from 'react';
import { User, Mail, Phone, CreditCard as Edit3, Check, Bell, Shield, Heart, Users, ChevronRight, LogOut } from 'lucide-react';
import logo from '../assets/Prayer_Portal_logo.png';
import { getInitials, getAvatarColor } from '../utils/helpers';

export default function Profile({ user, prayers, groups, onUpdateUser, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
  const [saved, setSaved] = useState(false);
  const [emailPending, setEmailPending] = useState(false);
  const [saveError, setSaveError] = useState('');

  const myPrayers = prayers.filter(p => p.ownerId === user.id);
  const answeredPrayers = myPrayers.filter(p => p.status === 'answered');
  const myGroups = groups.filter(g => g.members.some(m => m.id === user.id));
  const totalPraying = myPrayers.reduce((sum, p) => sum + (p.prayedBy?.length || 0), 0);

  const initials = getInitials(user.name);
  const avatarColor = getAvatarColor(user.name);

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaveError('');
    try {
      const result = await onUpdateUser({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      setEditing(false);
      if (result?.emailChanged) {
        setEmailPending(true);
        setTimeout(() => setEmailPending(false), 6000);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="header-bg px-5 pt-12 pb-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Prayer Portal" className="object-contain" style={{ width: '4.5rem', height: '4.5rem' }} />
            <h1 className="text-xl font-bold gradient-text">Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium animate-scale-in border" style={{ background: '#1a2e22', color: '#a89060', borderColor: '#2d5a3d' }}>
                <Check size={12} />
                Saved!
              </span>
            )}
            {emailPending && (
              <span className="text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium animate-scale-in border" style={{ background: '#1a2010', color: '#e8a040', borderColor: '#5a3a10' }}>
                <Mail size={12} />
                Check your email
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
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
                  <h2 className="text-lg font-bold" style={{ color: '#f0ede0' }}>{user.name}</h2>
                  <p className="text-sm" style={{ color: '#c8b99a' }}>Prayer Portal Member</p>
                </>
              )}
            </div>
            <button
              onClick={editing ? handleSave : () => setEditing(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border"
              style={editing
                ? { background: '#1a2e22', color: '#a89060', borderColor: '#2d5a3d' }
                : { background: '#1a2e22', color: '#a89060', borderColor: '#2d5a3d' }
              }
            >
              {editing ? <Check size={16} /> : <Edit3 size={16} />}
            </button>
          </div>

          <div className="space-y-3 pt-3 border-t" style={{ borderColor: '#2a2520' }}>
            {editing ? (
              <>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="flex-shrink-0" style={{ color: '#a89060' }} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field text-sm py-2 flex-1"
                    placeholder="Email"
                  />
                </div>
                {form.email.trim().toLowerCase() !== user.email?.toLowerCase() && form.email.trim() && (
                  <p className="text-xs pl-5" style={{ color: '#e8a040' }}>A confirmation link will be sent to the new email address.</p>
                )}
                {saveError && (
                  <p className="text-xs pl-5 text-red-400">{saveError}</p>
                )}
                <div className="flex items-center gap-2">
                  <Phone size={14} className="flex-shrink-0" style={{ color: '#a89060' }} />
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
                <div className="flex items-center gap-2 text-sm" style={{ color: '#c8b99a' }}>
                  <Mail size={14} className="flex-shrink-0" style={{ color: '#a89060' }} />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#c8b99a' }}>
                    <Phone size={14} className="flex-shrink-0" style={{ color: '#a89060' }} />
                    <span>{user.phone}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: myPrayers.length, label: 'Prayers', icon: '🙏' },
            { value: answeredPrayers.length, label: 'Answered', icon: '✨' },
            { value: myGroups.length, label: 'Groups', icon: '👥' },
          ].map(({ value, label, icon }) => (
            <div key={label} className="glass-card rounded-xl p-3 text-center">
              <div className="text-lg mb-0.5">{icon}</div>
              <p className="text-xl font-bold" style={{ color: '#f0ede0' }}>{value}</p>
              <p className="text-[11px]" style={{ color: '#c8b99a' }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          {[
            { icon: Bell, label: 'Prayer Reminders', sub: user.phone ? 'Text reminders enabled' : 'Add phone to enable', color: '#a89060' },
            { icon: Shield, label: 'Privacy', sub: 'Your data stays in your groups', color: '#a89060' },
            { icon: Heart, label: 'Prayed for Others', sub: `${totalPraying} prayers lifted up`, color: '#f87171' },
          ].map(({ icon: Icon, label, sub, color }, i) => (
            <div key={label} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t' : ''}`} style={i > 0 ? { borderColor: '#2a2520' } : {}}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#111111', color }}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#f0ede0' }}>{label}</p>
                <p className="text-xs" style={{ color: '#c8b99a' }}>{sub}</p>
              </div>
              <ChevronRight size={14} style={{ color: '#a89060' }} />
            </div>
          ))}
        </div>

        <div className="glass-card-purple rounded-xl p-4 flex items-center gap-3">
          <img src={logo} alt="Prayer Portal" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: '#f0ede0' }}>Prayer Portal</p>
            <p className="text-xs" style={{ color: '#c8b99a' }}>Version 1.0 · Built with love & faith</p>
          </div>
          <a
            href="mailto:wwilson101@gmail.com?subject=Prayer Portal Support"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: '#111111', color: '#a89060' }}
          >
            <Mail size={12} />
            Support
          </a>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-red-400 border border-red-800 hover:opacity-80 transition-colors flex items-center justify-center gap-2"
          style={{ background: '#1a0808' }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
