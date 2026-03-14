import { Bell, Menu, Moon, Search, Sun, User, X, Zap, LayoutDashboard, Clock, Brain, ShieldCheck, LogOut, Lock, CheckSquare, Calendar, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import UserProfileModal from './UserProfileModal';
import axios from '../../lib/axios';
import { getDaysUntil, isOverdue } from './dashboardUtils';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const notificationRef = useRef(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const persistedUser = localStorage.getItem('student_user') || sessionStorage.getItem('student_user');
        if (!persistedUser) return;

        const parsedUser = JSON.parse(persistedUser);
        const userId = parsedUser?._id || parsedUser?.id || '';
        if (!userId) return;

        const response = await axios.get(`/api/students/${userId}/tasks`);
        const allTasks = Array.isArray(response.data?.data) ? response.data.data : [];

        // Generate notifications from tasks
        const taskNotifications = [];
        const now = new Date();

        allTasks.forEach(task => {
          if (task.status === 'Completed') return;

          const deadline = new Date(task.dueDate);
          const daysUntil = getDaysUntil(deadline);
          const overdue = isOverdue(deadline, false);

          if (overdue) {
            taskNotifications.push({
              id: `overdue-${task._id}`,
              type: 'overdue',
              title: 'Task Overdue',
              message: `"${task.title}" is overdue`,
              task: task.title,
              time: deadline,
              read: false,
              priority: 'high'
            });
          } else if (daysUntil === 0) {
            taskNotifications.push({
              id: `today-${task._id}`,
              type: 'due-today',
              title: 'Due Today',
              message: `"${task.title}" is due today`,
              task: task.title,
              time: deadline,
              read: false,
              priority: 'high'
            });
          } else if (daysUntil === 1) {
            taskNotifications.push({
              id: `tomorrow-${task._id}`,
              type: 'due-soon',
              title: 'Due Tomorrow',
              message: `"${task.title}" is due tomorrow`,
              task: task.title,
              time: deadline,
              read: false,
              priority: 'medium'
            });
          } else if (daysUntil <= 3) {
            taskNotifications.push({
              id: `upcoming-${task._id}`,
              type: 'upcoming',
              title: 'Upcoming Deadline',
              message: `"${task.title}" is due in ${daysUntil} days`,
              task: task.title,
              time: deadline,
              read: false,
              priority: 'low'
            });
          }
        });

        // Sort by priority and time
        taskNotifications.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return a.time - b.time;
        });

        setNotifications(taskNotifications);
        setUnreadCount(taskNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  };

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
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
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
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative rounded-lg p-2 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl ring-1 z-50 max-h-[32rem] overflow-hidden ${isDark ? 'bg-slate-800/95 ring-slate-700/50 backdrop-blur-sm' : 'bg-white/95 ring-slate-200/50 backdrop-blur-sm'
                  }`}>
                  {/* Header */}
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
                    <div>
                      <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                      </p>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${isDark ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-600 hover:bg-blue-50'
                          }`}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto max-h-96">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className={`inline-flex p-3 rounded-full mb-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                          <CheckCircle2 className={`h-8 w-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        </div>
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          No notifications
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          You're all caught up!
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`px-4 py-3 border-b cursor-pointer transition-colors ${notification.read
                              ? isDark ? 'bg-transparent hover:bg-slate-700/30' : 'bg-transparent hover:bg-slate-50'
                              : isDark ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'bg-blue-50/50 hover:bg-blue-50'
                            } ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`flex-shrink-0 p-2 rounded-lg ${notification.type === 'overdue'
                                ? 'bg-red-100 dark:bg-red-500/20'
                                : notification.type === 'due-today'
                                  ? 'bg-orange-100 dark:bg-orange-500/20'
                                  : notification.type === 'due-soon'
                                    ? 'bg-amber-100 dark:bg-amber-500/20'
                                    : 'bg-blue-100 dark:bg-blue-500/20'
                              }`}>
                              {notification.type === 'overdue' ? (
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              ) : notification.type === 'due-today' ? (
                                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              ) : notification.type === 'due-soon' ? (
                                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                                )}
                              </div>
                              <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {notification.message}
                              </p>
                              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                {notification.time.toLocaleDateString()} at {notification.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>

                            {/* Clear button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                              className={`flex-shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-200 text-slate-400'
                                }`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className={`px-4 py-3 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
                      <Link
                        to="/tasks"
                        onClick={() => setShowNotifications(false)}
                        className={`block text-center text-sm font-semibold py-2 rounded-lg transition-colors ${isDark ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-600 hover:bg-blue-50'
                          }`}
                      >
                        View all tasks
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

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
