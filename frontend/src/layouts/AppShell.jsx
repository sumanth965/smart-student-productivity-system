import { LayoutDashboard, CalendarClock, Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/deadline', label: 'Deadlines', icon: CalendarClock },
  { to: '/ai', label: 'AI Assistant', icon: Sparkles },
  { to: '/admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
];

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b bg-white p-4 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-slate-500">Smart Student</p>
          <h1 className="text-xl font-semibold">Productivity System</h1>
        </div>

        <nav className="space-y-2">
          {navItems
            .filter((item) => !item.adminOnly || user?.role === 'admin')
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      <section className="p-4 sm:p-6">
        <header className="mb-6 rounded-2xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Welcome back</p>
          <h2 className="text-lg font-semibold">{user?.name}</h2>
          <p className="text-sm text-slate-500">Role: {user?.role}</p>
        </header>
        <Outlet />
      </section>
    </div>
  );
}
