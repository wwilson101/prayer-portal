import { useState } from 'react';
import { Plus, Users, ChevronRight, X, Copy, Check, LogIn, Lock } from 'lucide-react';
import { generateId, generateGroupCode, getInitials, getAvatarColor, formatDate } from '../utils/helpers';

function GroupCard({ group, userId, onClick }) {
  const isMember = group.members.some(m => m.id === userId);
  const isOwner = group.createdBy === userId;
  const memberCount = group.members.length;

  return (
    <button
      onClick={() => onClick(group)}
      className="prayer-card glass-card rounded-2xl p-4 w-full text-left animate-slide-up"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-bg-deep flex items-center justify-center shadow-md flex-shrink-0">
          <Users size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-indigo-900 truncate">{group.name}</h3>
            {isOwner && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-semibold flex-shrink-0">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{group.description || 'No description'}</p>
        </div>
        <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
      </div>

      {/* Members row */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <div className="flex -space-x-2">
          {group.members.slice(0, 4).map((member, i) => (
            <div
              key={member.id}
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(member.name)} flex items-center justify-center border-2 border-white shadow-sm`}
              style={{ zIndex: 10 - i }}
            >
              <span className="text-white text-[9px] font-bold">{getInitials(member.name)}</span>
            </div>
          ))}
          {memberCount > 4 && (
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white text-[9px] text-slate-500 font-bold">
              +{memberCount - 4}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400">{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
        <span className="ml-auto text-xs text-slate-300 flex items-center gap-1">
          <Lock size={10} />
          {group.code}
        </span>
      </div>
    </button>
  );
}

function GroupDetail({ group, userId, onClose, onLeave }) {
  const [copied, setCopied] = useState(false);
  const isOwner = group.createdBy === userId;

  const copyCode = () => {
    navigator.clipboard?.writeText(group.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in" style={{ maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}>
      <div className="modal-overlay absolute inset-0" onClick={onClose} />
      <div className="modal-sheet relative z-10 max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-violet-200" />
        </div>

        <div className="px-5 pb-8 pt-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-indigo-900">Group Details</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center border border-slate-200">
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          {/* Group info */}
          <div className="glass-card rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl gradient-bg-deep flex items-center justify-center shadow-md">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900">{group.name}</h3>
                {isOwner && <span className="text-xs text-violet-500">You created this group</span>}
              </div>
            </div>
            {group.description && (
              <p className="text-sm text-slate-500 leading-relaxed">{group.description}</p>
            )}
          </div>

          {/* Join code */}
          <div className="glass-card-purple rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">Invite Code</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-[0.3em] text-indigo-900 flex-1">{group.code}</span>
              <button
                onClick={copyCode}
                className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  copied ? 'bg-green-100 text-green-600' : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Share this code with others to join your group</p>
          </div>

          {/* Members list */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
              Members ({group.members.length})
            </p>
            <div className="space-y-2">
              {group.members.map(member => {
                const isMe = member.id === userId;
                return (
                  <div key={member.id} className="flex items-center gap-3 glass-card rounded-xl p-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(member.name)} flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-xs font-bold">{getInitials(member.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-indigo-800 truncate">
                        {isMe ? `${member.name} (You)` : member.name}
                      </p>
                      <p className="text-xs text-slate-400">Joined {formatDate(member.joinedAt)}</p>
                    </div>
                    {member.id === group.createdBy && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-semibold">Admin</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave button */}
          {!isOwner && (
            <button
              onClick={() => onLeave(group.id)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Leave Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateGroupModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Group name is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onCreate({ name: form.name.trim(), description: form.description.trim() });
    } catch {
      setErrors({ name: 'Failed to create group. You may not have permission.' });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in" style={{ maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}>
      <div className="modal-overlay absolute inset-0" onClick={onClose} />
      <div className="modal-sheet relative z-10 animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-violet-200" />
        </div>
        <div className="px-5 pb-8 pt-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-indigo-900">Create a Group</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center border border-slate-200">
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5 block">Group Name *</label>
              <input
                type="text"
                placeholder="e.g. Sunday Small Group"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(e2 => ({ ...e2, name: '' })); }}
                className="input-field"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5 block">
                Description <span className="text-slate-400 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="When & where you meet..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} disabled={loading} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Creating...' : <><Plus size={16} />Create Group</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function JoinGroupModal({ onClose, onJoin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError('Enter a group code'); return; }
    if (trimmed.length < 4) { setError('Code must be at least 4 characters'); return; }
    setLoading(true);
    setError('');
    const result = await onJoin(trimmed);
    setLoading(false);
    if (result?.success) {
      onClose();
    } else {
      setError(result?.message || 'Failed to join group.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in" style={{ maxWidth: 430, left: '50%', transform: 'translateX(-50%)' }}>
      <div className="modal-overlay absolute inset-0" onClick={onClose} />
      <div className="modal-sheet relative z-10 animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-violet-200" />
        </div>
        <div className="px-5 pb-8 pt-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-indigo-900">Join a Group</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center border border-slate-200">
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          <p className="text-sm text-slate-500 mb-5">Enter the 6-character code shared by your group admin.</p>

          <div className="mb-5">
            <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5 block">Group Code</label>
            <input
              type="text"
              placeholder="e.g. FAITH1"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              className="input-field text-2xl tracking-[0.4em] font-bold text-center uppercase"
              maxLength={8}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} disabled={loading} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleJoin} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Joining...' : <><LogIn size={16} />Join Group</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Groups({ user, groups, onCreateGroup, onJoinGroup, onLeaveGroup }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const isAdmin = !!user?.isAdmin;
  const myGroups = groups.filter(g => g.members.some(m => m.id === user.id));

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="header-bg px-5 pt-14 pb-5 sticky top-0 z-30">
        <h1 className="text-2xl font-bold gradient-text mb-1">Groups</h1>
        <p className="text-sm text-slate-500">Your prayer communities</p>
      </div>

      {/* Action buttons */}
      <div className="px-5 pt-4 flex gap-3">
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-sm"
          >
            <Plus size={16} />
            Create Group
          </button>
        )}
        <button
          onClick={() => setShowJoin(true)}
          className={`btn-ghost flex items-center justify-center gap-2 text-sm py-3 ${isAdmin ? 'flex-1' : 'w-full'}`}
        >
          <LogIn size={16} />
          Join Group
        </button>
      </div>

      {/* Groups list */}
      <div className="flex-1 px-4 pt-4 space-y-3">
        {myGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mb-4 shadow-lg">
              <Users size={32} className="text-white/90" />
            </div>
            <p className="text-base font-semibold text-indigo-800 mb-1">No groups yet</p>
            <p className="text-sm text-slate-500 max-w-xs">Create your own prayer group or join an existing one with a group code.</p>
          </div>
        ) : (
          myGroups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              userId={user.id}
              onClick={setSelectedGroup}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreate={async (data) => { await onCreateGroup(data); setShowCreate(false); }}
        />
      )}
      {showJoin && (
        <JoinGroupModal
          onClose={() => setShowJoin(false)}
          onJoin={onJoinGroup}
        />
      )}
      {selectedGroup && (
        <GroupDetail
          group={selectedGroup}
          userId={user.id}
          onClose={() => setSelectedGroup(null)}
          onLeave={(gid) => { onLeaveGroup(gid); setSelectedGroup(null); }}
        />
      )}
    </div>
  );
}
