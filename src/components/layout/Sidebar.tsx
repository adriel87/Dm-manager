'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, MapIcon, UserIcon, UsersIcon } from '@/components/icons';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: <HomeIcon />,
  },
  {
    href: '/campaigns',
    label: 'Campaigns',
    icon: <MapIcon />,
  },
  {
    href: '/characters',
    label: 'Characters',
    icon: <UserIcon size={18} />,
  },
  {
    href: '/groups',
    label: 'Groups',
    icon: <UsersIcon />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-zinc-900 flex flex-col border-r border-zinc-800 z-40">
      {/* Logo / App title */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-800">
        <span className="text-2xl" role="img" aria-label="Dice">
          🎲
        </span>
        <span className="text-white font-bold text-lg tracking-tight leading-none">
          DM Manager
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-1" role="list">
          {navItems.map(({ href, label, icon }) => {
            /**
             * Exact match for root, prefix match for nested routes.
             * Characters at /characters should not highlight when on /characters/123.
             * Root should only highlight at exact '/'.
             */
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={isActive ? 'text-white' : 'text-zinc-500'}>
                    {icon}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-zinc-800">
        <p className="text-zinc-600 text-xs">DM Manager v0.1</p>
      </div>
    </aside>
  );
}
