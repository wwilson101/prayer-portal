export const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export const generateGroupCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const generatePrayerTitle = (text) => {
  if (!text || text.trim().length === 0) return 'Prayer Request';
  const cleaned = text.trim().replace(/\s+/g, ' ');
  const words = cleaned.split(' ');
  if (words.length <= 6) return capitalize(cleaned);
  const title = words.slice(0, 7).join(' ');
  return capitalize(title) + '...';
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

export const formatDateFull = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

export const avatarColors = [
  'from-sky-300 to-blue-400',
  'from-violet-300 to-purple-400',
  'from-indigo-300 to-blue-400',
  'from-teal-300 to-sky-400',
  'from-fuchsia-300 to-violet-400',
  'from-blue-300 to-indigo-400',
];

export const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
};

