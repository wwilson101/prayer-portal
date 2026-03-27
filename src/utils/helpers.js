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

// Seed data for demo
export const createSeedData = (userId, userName, userEmail, userPhone) => {
  const now = new Date();
  const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

  const groupId1 = generateId();
  const groupId2 = generateId();

  const groups = [
    {
      id: groupId1,
      name: 'Sunday Morning Small Group',
      description: 'We meet every Sunday at 9am in Room 204.',
      code: 'FAITH1',
      createdBy: userId,
      members: [
        { id: userId, name: userName, email: userEmail, joinedAt: daysAgo(30) },
        { id: generateId(), name: 'Sarah Mitchell', email: 'sarah@example.com', joinedAt: daysAgo(28) },
        { id: generateId(), name: 'James Rivera', email: 'james@example.com', joinedAt: daysAgo(25) },
        { id: generateId(), name: 'Grace Thompson', email: 'grace@example.com', joinedAt: daysAgo(20) },
      ],
      createdAt: daysAgo(30),
    },
    {
      id: groupId2,
      name: 'Women\'s Prayer Circle',
      description: 'A safe space for women to share and lift each other up in prayer.',
      code: 'GRACE2',
      createdBy: generateId(),
      members: [
        { id: userId, name: userName, email: userEmail, joinedAt: daysAgo(14) },
        { id: generateId(), name: 'Lisa Chen', email: 'lisa@example.com', joinedAt: daysAgo(20) },
        { id: generateId(), name: 'Maria Santos', email: 'maria@example.com', joinedAt: daysAgo(18) },
      ],
      createdAt: daysAgo(20),
    },
  ];

  const prayers = [
    {
      id: generateId(),
      title: 'Healing for my mother\'s surgery...',
      request: 'Please pray for my mother who is having heart surgery next Tuesday. We\'re trusting God for a complete healing and that the doctors will have steady hands.',
      requestDate: daysAgo(2),
      status: 'active',
      answeredDate: null,
      answeredNote: null,
      ownerId: userId,
      ownerName: userName,
      ownerEmail: userEmail,
      ownerPhone: userPhone,
      groupIds: [groupId1],
      prayedBy: [generateId(), generateId(), generateId()],
    },
    {
      id: generateId(),
      title: 'Job opportunity and God\'s guidance...',
      request: 'I\'ve been interviewing for a new position that could be a real blessing for our family. Please pray that God opens the right door and that I have clarity about His direction.',
      requestDate: daysAgo(5),
      status: 'active',
      answeredDate: null,
      answeredNote: null,
      ownerId: userId,
      ownerName: userName,
      ownerEmail: userEmail,
      ownerPhone: userPhone,
      groupIds: [groupId1, groupId2],
      prayedBy: [generateId(), generateId()],
    },
    {
      id: generateId(),
      title: 'My son started attending church...',
      request: 'Praising God! After years of prayer, my son walked through the church doors last Sunday. God is so faithful! Please continue to pray for his heart to be opened.',
      requestDate: daysAgo(15),
      status: 'answered',
      answeredDate: daysAgo(3),
      answeredNote: 'He came to Sunday service and loved it! God answered this prayer in the most beautiful way.',
      ownerId: userId,
      ownerName: userName,
      ownerEmail: userEmail,
      ownerPhone: userPhone,
      groupIds: [groupId1],
      prayedBy: [generateId(), generateId(), generateId(), generateId()],
    },
    {
      id: generateId(),
      title: 'Strength through grief and loss...',
      request: 'Sarah\'s father passed away last week. Please pray for peace that surpasses understanding for her and her family during this painful time.',
      requestDate: daysAgo(7),
      status: 'active',
      answeredDate: null,
      answeredNote: null,
      ownerId: generateId(),
      ownerName: 'James Rivera',
      ownerEmail: 'james@example.com',
      ownerPhone: '',
      groupIds: [groupId1],
      prayedBy: [userId, generateId(), generateId()],
    },
    {
      id: generateId(),
      title: 'Marriage restoration and healing...',
      request: 'Please pray for our marriage. We\'ve been going through a very hard season. We both love God and each other — we just need wisdom and a renewed commitment.',
      requestDate: daysAgo(10),
      status: 'active',
      answeredDate: null,
      answeredNote: null,
      ownerId: generateId(),
      ownerName: 'Grace Thompson',
      ownerEmail: 'grace@example.com',
      ownerPhone: '',
      groupIds: [groupId1, groupId2],
      prayedBy: [userId, generateId()],
    },
  ];

  return { groups, prayers };
};
