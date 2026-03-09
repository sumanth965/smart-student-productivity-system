import { Bell, Menu, Moon, Search, Sun, User, X, Zap, LayoutDashboard, Clock, Brain, ShieldCheck, LogOut, Lock } from 'lucide-react';
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
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    sessionStorage.removeItem('student_token');
    sessionStorage.removeItem('student_user');
    navigate('/login');
  };

  const handleAdminClick = () => {
    setShowAdminAuth(true);
    setAdminError('');
    setAdminName('');
    setAdminPassword('');
  };

  const handleAdminAuth = () => {
    if ((adminName === 'admin1' && adminPassword === '123') || (adminName === 'admin2' && adminPassword === '321')) {
      setShowAdminAuth(false);
      setAdminName('');
      setAdminPassword('');
      navigate('/admin');
    } else {
      setAdminError('Invalid admin name or password');
      setAdminPassword('');
    }
  };

  const handleAdminModalClose = () => {
    setShowAdminAuth(false);
    setAdminName('');
    setAdminPassword('');
    setAdminError('');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/deadline', label: 'Deadlines', icon: Clock },
    { to: '/ai', label: 'AI Insights', icon: Brain },
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
            {/* Admin Button */}
            <button
              onClick={handleAdminClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${location.pathname === '/admin'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </button>
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
            {/* Mobile Admin Button */}
            <button
              onClick={() => {
                setShowMobileMenu(false);
                handleAdminClick();
              }}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all w-full text-left
                ${location.pathname === '/admin'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                  : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </button>
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

      {/* Admin Authentication Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Lock className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Access</h2>
            </div>

            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Please enter admin credentials to proceed
            </p>

            {/* Error message */}
            {adminError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{adminError}</p>
              </div>
            )}

            {/* Admin Name Input */}
            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Admin Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Enter admin name"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
              />
            </div>

            {/* Admin Password Input */}
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAdminAuth}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                Sign In
              </button>
              <button
                onClick={handleAdminModalClose}
                className={`flex-1 border font-semibold py-2 rounded-lg transition-all ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} isDark={isDark} />
    </nav>
  );
}