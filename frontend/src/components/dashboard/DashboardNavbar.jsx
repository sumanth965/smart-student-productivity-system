import { Bell, Menu, Moon, Search, Sun, User, X, Zap, LayoutDashboard, Clock, Brain, ShieldCheck, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import UserProfileModal from './UserProfileModal';

export default function DashboardNavbar({
  isDark,
  setIsDark,
  searchQuery,
  setSearchQuery,
  showMobileMenu,
  setShowMobileMenu,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    sessionStorage.removeItem('student_token');
    sessionStorage.removeItem('student_user');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/deadline', label: 'Deadlines', icon: Clock },
    { to: '/ai', label: 'AI Insights', icon: Brain },
    { to: '/admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-md shadow-lg ring-1 ${isDark ? 'bg-slate-900/80 ring-slate-700/50' : 'bg-white/80 ring-slate-200/50'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg p-2">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} hidden sm:block`}>StudyFlow</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                    ${active
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-200/30 dark:bg-slate-700/30 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-28"
              />
            </div>

            {/* Notifications */}
            <button
              className={`relative rounded-lg p-2 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`rounded-lg p-2 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User avatar */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200/50">
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition-all"
                title="Click to view profile"
              >
                <User className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all
                ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`md:hidden rounded-lg p-2 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav menu */}
        {showMobileMenu && (
          <div className={`md:hidden py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all
                  ${location.pathname === to
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                    : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg w-full text-left transition-all mt-1"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} isDark={isDark} />
    </nav>
  );
}
