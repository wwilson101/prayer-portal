import { Hop as Home, Heart, Users, User, ShieldCheck } from 'lucide-react';

const baseTabs = [
  { id: 'home', label: 'Feed', Icon: Home },
  { id: 'my-prayers', label: 'My Prayers', Icon: Heart },
  { id: 'groups', label: 'Groups', Icon: Users },
  { id: 'profile', label: 'Profile', Icon: User },
];

const adminTab = { id: 'admin', label: 'Admin', Icon: ShieldCheck };

export default function BottomNav({ activeTab, onTabChange, isAdmin }) {
  const tabs = isAdmin ? [...baseTabs, adminTab] : baseTabs;

  return (
    <nav className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40">
      <div className="flex items-center justify-around px-2 py-2 pb-safe" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          const isAdminTab = id === 'admin';
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                active ? 'nav-item-active' : ''
              }`}
            >
              <Icon
                size={22}
                className={`transition-all duration-200 ${
                  active
                    ? isAdminTab ? 'text-amber-500 stroke-[2.5]' : 'text-violet-600 stroke-[2.5]'
                    : 'text-slate-400 stroke-[1.5]'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-all duration-200 ${
                  active
                    ? isAdminTab ? 'text-amber-500' : 'text-violet-600'
                    : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
