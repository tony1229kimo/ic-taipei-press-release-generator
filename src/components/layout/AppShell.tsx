import { NavLink, Outlet } from 'react-router-dom';
import { Newspaper, Settings, History, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/', icon: Newspaper, label: '新聞稿產生器' },
  { to: '/history', icon: History, label: '歷史記錄' },
  { to: '/admin', icon: Settings, label: '後台管理' },
];

export default function AppShell() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">
                臺北洲際酒店
              </h1>
              <p className="text-xs text-muted-foreground">新聞稿產生器</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>InterContinental Taipei</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
