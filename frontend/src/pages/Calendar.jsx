import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import axios from '../lib/axios';
import {
  TrendingUp,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Download,
  List,
  Grid3X3,
  Bell,
  BookOpen,
  GraduationCap,
  Target,
  Sparkles,
  LayersIcon,
} from 'lucide-react';

/* ─────────────────────────────────────────
   StatCard – shared design token component
───────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, change, bgGradient, iconColor, isDark }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md p-6 shadow-2xl ring-1 transition-all duration-300 hover:scale-[1.03] hover:shadow-blue-500/20 cursor-default ${isDark
          ? 'bg-slate-800/80 ring-slate-700/50 hover:bg-slate-800/90'
          : 'bg-white/80 ring-slate-200/50 hover:bg-white/90'
        }`}
    >
      {/* background tint */}
      <div className={`absolute inset-0 opacity-10 ${bgGradient}`} style={{ pointerEvents: 'none' }} />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
          <p className={`mt-2 text-4xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-500">{change}</span>
            </div>
          )}
        </div>
        {/* icon bubble */}
        <div className={`rounded-2xl p-3.5 ${bgGradient} bg-opacity-20 shadow-inner`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Confetti
───────────────────────────────────────── */
function Confetti({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Section wrapper – same glass card style
───────────────────────────────────────── */
function GlassCard({ isDark, className = '', children }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md ring-1 shadow-xl transition-all duration-200 ${isDark
          ? 'bg-slate-800/80 ring-slate-700/50'
          : 'bg-white/80 ring-slate-200/50'
        } ${className}`}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function CalendarPage() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [studentId, setStudentId] = useState('');

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'personal',
    priority: 'medium',
    category: 'study',
  });

  const [events, setEvents] = useState([]);

  /* ── helpers ── */
  const mapTaskToCalendarEvent = (task, currentStudentId) => {
    const dueDate = new Date(task.dueDate);
    const hasValidTime = !Number.isNaN(dueDate.getTime());
    return {
      id: task._id,
      title: task.title,
      description: task.description,
      date: hasValidTime ? dueDate : new Date(),
      time: hasValidTime
        ? `${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}`
        : '12:00',
      type:
        task.createdBy?._id === currentStudentId || task.createdBy === currentStudentId
          ? 'personal'
          : 'teacher',
      priority: task.priority?.toLowerCase() || 'medium',
      category: 'assignment',
      completed: task.status === 'Completed',
      subject: task.subject,
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token');
    if (!token) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const loadCalendarEvents = async () => {
    try {
      setLoadingEvents(true);
      const persisted = localStorage.getItem('student_user') || sessionStorage.getItem('student_user');
      if (!persisted) { setEvents([]); return; }
      const parsed = JSON.parse(persisted);
      const id = parsed?._id || parsed?.id || '';
      if (!id) { setEvents([]); return; }
      setStudentId(id);
      const res = await axios.get(`/api/students/${id}/tasks`);
      const tasks = Array.isArray(res.data?.data) ? res.data.data : [];
      setEvents(tasks.map((t) => mapTaskToCalendarEvent(t, id)));
    } catch (e) {
      console.error('Failed to load calendar events:', e);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadCalendarEvents();
    const onRefresh = () => loadCalendarEvents();
    window.addEventListener('tasks:refresh', onRefresh);
    window.addEventListener('focus', onRefresh);
    return () => {
      window.removeEventListener('tasks:refresh', onRefresh);
      window.removeEventListener('focus', onRefresh);
    };
  }, []);

  /* ── calendar math ── */
  const getDaysInMonth = (date) => {
    const y = date.getFullYear(), m = date.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const days = [];
    const prev = new Date(y, m, 0).getDate();
    for (let i = firstDay.getDay() - 1; i >= 0; i--)
      days.push({ date: new Date(y, m - 1, prev - i), isCurrentMonth: false });
    for (let i = 1; i <= lastDay.getDate(); i++)
      days.push({ date: new Date(y, m, i), isCurrentMonth: true });
    const rem = 42 - days.length;
    for (let i = 1; i <= rem; i++)
      days.push({ date: new Date(y, m + 1, i), isCurrentMonth: false });
    return days;
  };

  const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { date: d, isCurrentMonth: true };
    });
  };

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isToday = (d) => isSameDay(d, new Date());

  const isPast = (d) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const check = new Date(d); check.setHours(0, 0, 0, 0);
    return check < today;
  };

  const formatDate = (d) =>
    d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatMonthYear = (d) =>
    d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  /* ── stats ── */
  const stats = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const filtered = filterType === 'all' ? events : events.filter((e) => e.type === filterType);
    return {
      total: filtered.length,
      completed: filtered.filter((e) => e.completed).length,
      dueToday: filtered.filter((e) => isSameDay(e.date, new Date()) && !e.completed).length,
      overdue: filtered.filter((e) => {
        const d = new Date(e.date); d.setHours(0, 0, 0, 0);
        return d < now && !e.completed;
      }).length,
    };
  }, [events, filterType]);

  /* ── navigation ── */
  const navigateMonth = (dir) => setCurrentDate((p) => { const d = new Date(p); d.setMonth(d.getMonth() + dir); return d; });
  const navigateWeek = (dir) => setCurrentDate((p) => { const d = new Date(p); d.setDate(d.getDate() + dir * 7); return d; });
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  /* ── event ops ── */
  const getEventsForDate = (date) =>
    events.filter((e) => isSameDay(e.date, date) && (filterType === 'all' || e.type === filterType));

  const handleAddEvent = () => {
    setEventForm({
      title: '', description: '',
      date: selectedDate.toISOString().split('T')[0],
      time: '12:00', type: 'personal', priority: 'medium', category: 'study',
    });
    setShowAddModal(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim() || !studentId) return;
    const dueDate = new Date(`${eventForm.date}T${eventForm.time || '12:00'}`);
    try {
      const res = await axios.post(`/api/students/${studentId}/tasks`, {
        title: eventForm.title,
        description: eventForm.description || 'Self assigned task',
        subject: eventForm.category || 'General',
        dueDate,
        priority: eventForm.priority.charAt(0).toUpperCase() + eventForm.priority.slice(1),
      });
      const saved = res.data?.data;
      if (saved) setEvents((p) => [mapTaskToCalendarEvent(saved, studentId), ...p]);
      setShowAddModal(false);
      window.dispatchEvent(new Event('tasks:refresh'));
    } catch (e) {
      console.error(e);
      alert('Unable to save event. Please try again.');
    }
  };

  const handleToggleComplete = async (id) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;
    const next = !target.completed;
    setEvents((p) => p.map((e) => (e.id === id ? { ...e, completed: next } : e)));
    if (next) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }
    try {
      await axios.put(`/api/tasks/${id}`, {
        status: next ? 'Completed' : 'Pending',
        ...(next && studentId ? { completedBy: studentId } : {}),
      });
      window.dispatchEvent(new Event('tasks:refresh'));
    } catch (e) {
      console.error(e);
      setEvents((p) => p.map((ev) => (ev.id === id ? { ...ev, completed: !next } : ev)));
      alert('Unable to update event status.');
    }
    setShowEventModal(false);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    const prev = events;
    setEvents((p) => p.filter((e) => e.id !== id));
    try {
      await axios.delete(`/api/tasks/${id}`);
      window.dispatchEvent(new Event('tasks:refresh'));
    } catch (e) {
      console.error(e);
      setEvents(prev);
      alert('Unable to delete event.');
    }
    setShowEventModal(false);
  };

  const handleExport = (format) => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'calendar-events.json'; a.click();
    } else {
      let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyFlow//Calendar//EN\n';
      events.forEach((e) => {
        const ds = e.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        ics += `BEGIN:VEVENT\nDTSTART:${ds}\nSUMMARY:${e.title}\nDESCRIPTION:${e.description}\nEND:VEVENT\n`;
      });
      ics += 'END:VCALENDAR';
      const blob = new Blob([ics], { type: 'text/calendar' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'calendar-events.ics'; a.click();
    }
  };

  /* ── style helpers ── */
  const priorityDot = (p) =>
    p === 'high' ? 'bg-rose-500' : p === 'medium' ? 'bg-amber-400' : 'bg-emerald-500';

  const priorityPill = (p) =>
    p === 'high' ? 'bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/30'
      : p === 'medium' ? 'bg-amber-400/15 text-amber-500 ring-1 ring-amber-400/30'
        : 'bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30';

  const getCategoryIcon = (cat) =>
    cat === 'assignment' ? BookOpen
      : cat === 'quiz' ? Target
        : cat === 'presentation' ? GraduationCap
          : cat === 'study' ? Sparkles
            : CalendarIcon;

  const days = viewMode === 'week' ? getWeekDays(currentDate) : getDaysInMonth(currentDate);
  const todayEvents = getEventsForDate(selectedDate);

  /* ── stat card configs ── */
  const statCards = [
    { icon: LayersIcon, label: 'Total Events', value: stats.total, change: null, bgGradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', iconColor: 'text-blue-400' },
    { icon: CheckCircle2, label: 'Completed', value: stats.completed, change: 'great progress', bgGradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', iconColor: 'text-emerald-400' },
    { icon: Bell, label: 'Due Today', value: stats.dueToday, change: null, bgGradient: 'bg-gradient-to-br from-amber-400 to-orange-500', iconColor: 'text-amber-400' },
    { icon: AlertCircle, label: 'Overdue', value: stats.overdue, change: null, bgGradient: 'bg-gradient-to-br from-rose-500 to-pink-600', iconColor: 'text-rose-400' },
  ];

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}>
      <Confetti show={showConfetti} />

      <DashboardNavbar
        isDark={isDark} setIsDark={setIsDark}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Academic Planner
            </p>
            <h1 className={`text-3xl sm:text-4xl font-extrabold leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              My Calendar
            </h1>
            {loadingEvents && (
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                ⟳ Syncing tasks…
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Export */}
            <div className="relative group">
              <button className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ring-1 transition-all ${isDark ? 'bg-slate-800/80 ring-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white/80 ring-slate-200 text-slate-700 hover:bg-white'
                }`}>
                <Download className="h-4 w-4" /> Export
              </button>
              <div className={`absolute right-0 mt-2 w-44 rounded-xl shadow-2xl ring-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden ${isDark ? 'bg-slate-800 ring-slate-700' : 'bg-white ring-slate-200'
                }`}>
                <button onClick={() => handleExport('json')} className={`w-full px-4 py-2.5 text-left text-sm font-medium ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                  Export as JSON
                </button>
                <button onClick={() => handleExport('ics')} className={`w-full px-4 py-2.5 text-left text-sm font-medium ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'}`}>
                  Export as ICS
                </button>
              </div>
            </div>

            {/* Add */}
            <button
              onClick={handleAddEvent}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" /> Add Event
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} isDark={isDark} />
          ))}
        </div>

        {/* ── Calendar controls ── */}
        <GlassCard isDark={isDark} className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Month nav */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateMonth(-1)}
                className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className={`text-lg font-bold min-w-[190px] text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatMonthYear(currentDate)}
              </span>
              <button
                onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateMonth(1)}
                className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={goToToday}
                className={`ml-1 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter pills */}
              <div className="flex items-center gap-1">
                {[
                  { key: 'all', label: 'All', active: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30' },
                  { key: 'teacher', label: 'Teacher', active: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30' },
                  { key: 'personal', label: 'Personal', active: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30' },
                ].map(({ key, label, active }) => (
                  <button
                    key={key}
                    onClick={() => setFilterType(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === key
                        ? active
                        : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className={`flex items-center rounded-xl p-1 gap-0.5 ${isDark ? 'bg-slate-700/60' : 'bg-slate-100'}`}>
                {[
                  { mode: 'month', Icon: Grid3X3, title: 'Month' },
                  { mode: 'week', Icon: CalendarIcon, title: 'Week' },
                  { mode: 'agenda', Icon: List, title: 'Agenda' },
                ].map(({ mode, Icon: Ico, title }) => (
                  <button
                    key={mode}
                    title={title}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-lg transition-all ${viewMode === mode
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    <Ico className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Calendar pane */}
          <GlassCard isDark={isDark} className="lg:col-span-2 p-5">
            {viewMode === 'agenda' ? (
              /* ─ Agenda ─ */
              <div className="space-y-3">
                <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  All Upcoming Events
                </h3>
                {events
                  .filter((e) => filterType === 'all' || e.type === filterType)
                  .sort((a, b) => a.date - b.date)
                  .map((event) => {
                    const Ico = getCategoryIcon(event.category);
                    const overdue = isPast(event.date) && !event.completed;
                    return (
                      <div
                        key={event.id}
                        onClick={() => { setSelectedEvent(event); setShowEventModal(true); }}
                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer ring-1 transition-all hover:scale-[1.01] hover:shadow-lg ${isDark
                            ? 'bg-slate-700/50 ring-slate-600/50 hover:bg-slate-700'
                            : 'bg-slate-50 ring-slate-200/70 hover:bg-white'
                          } ${event.completed ? 'opacity-50' : ''}`}
                      >
                        <div className={`p-3 rounded-2xl ${event.type === 'teacher' ? 'bg-rose-500/15' : 'bg-blue-500/15'}`}>
                          <Ico className={`h-5 w-5 ${event.type === 'teacher' ? 'text-rose-500' : 'text-blue-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-semibold truncate text-sm ${event.completed ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {event.title}
                            </h4>
                            {overdue && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-500 animate-pulse ring-1 ring-rose-500/30">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {event.time}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${priorityPill(event.priority)}`}>
                          {event.priority}
                        </span>
                      </div>
                    );
                  })}
                {events.length === 0 && (
                  <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No events yet</p>
                  </div>
                )}
              </div>
            ) : (
              /* ─ Month / Week grid ─ */
              <>
                <div className="grid grid-cols-7 mb-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className={`text-center text-[11px] font-bold uppercase tracking-wider py-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, idx) => {
                    const dayEvents = getEventsForDate(day.date);
                    const isSelected = isSameDay(day.date, selectedDate);
                    const todayDate = isToday(day.date);
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDate(day.date)}
                        className={`min-h-[76px] sm:min-h-[96px] p-1.5 rounded-xl cursor-pointer transition-all border ${isSelected
                            ? isDark
                              ? 'border-blue-500/60 bg-blue-600/15 shadow-inner shadow-blue-500/10'
                              : 'border-blue-400/60 bg-blue-50 shadow-inner shadow-blue-400/10'
                            : isDark
                              ? 'border-slate-700/60 hover:border-slate-600 hover:bg-slate-700/30'
                              : 'border-slate-200/70 hover:border-slate-300 hover:bg-slate-50'
                          } ${!day.isCurrentMonth ? 'opacity-30' : ''}`}
                      >
                        <div className={`text-[13px] font-bold mb-1 w-7 h-7 flex items-center justify-center rounded-full mx-auto sm:mx-0 ${todayDate
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md'
                            : isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}>
                          {day.date.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map((evt) => (
                            <div
                              key={evt.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedEvent(evt); setShowEventModal(true); }}
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold truncate cursor-pointer hover:opacity-80 transition-opacity ${evt.type === 'teacher'
                                  ? 'bg-rose-500/20 text-rose-500'
                                  : 'bg-blue-500/20 text-blue-400'
                                } ${evt.completed ? 'line-through opacity-50' : ''}`}
                            >
                              {evt.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className={`text-[10px] font-semibold pl-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </GlassCard>

          {/* Sidebar – selected day */}
          <GlassCard isDark={isDark} className="p-5 flex flex-col">
            {/* header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {isToday(selectedDate) ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </h3>
              </div>
              <button
                onClick={handleAddEvent}
                className={`p-2 rounded-xl transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* event list */}
            <div className="flex-1 space-y-2 overflow-y-auto">
              {todayEvents.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-full py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <CalendarIcon className="h-10 w-10 mb-3 opacity-25" />
                  <p className="text-sm font-medium">No events</p>
                  <button onClick={handleAddEvent} className="mt-2 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                    + Add one
                  </button>
                </div>
              ) : (
                todayEvents.map((evt) => {
                  const Ico = getCategoryIcon(evt.category);
                  const overdue = isPast(evt.date) && !evt.completed;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => { setSelectedEvent(evt); setShowEventModal(true); }}
                      className={`p-3.5 rounded-2xl cursor-pointer ring-1 transition-all hover:scale-[1.02] ${isDark
                          ? 'bg-slate-700/50 ring-slate-600/50 hover:bg-slate-700'
                          : 'bg-slate-50 ring-slate-200/60 hover:bg-white'
                        } ${evt.completed ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl flex-shrink-0 ${evt.type === 'teacher' ? 'bg-rose-500/15' : 'bg-blue-500/15'}`}>
                          <Ico className={`h-4 w-4 ${evt.type === 'teacher' ? 'text-rose-500' : 'text-blue-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`text-sm font-semibold truncate ${evt.completed ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {evt.title}
                            </h4>
                            {overdue && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className={`h-3 w-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{evt.time}</span>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot(evt.priority)}`} />
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleComplete(evt.id); }}
                          className={`p-1.5 rounded-xl transition-all flex-shrink-0 ${evt.completed
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : isDark ? 'hover:bg-slate-600 text-slate-500' : 'hover:bg-slate-200 text-slate-400'
                            }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* legend */}
            <div className={`mt-5 pt-4 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Legend
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded bg-rose-500/40 ring-1 ring-rose-500/40" />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Teacher</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded bg-blue-500/40 ring-1 ring-blue-500/40" />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Personal</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* ════════════════════════════════
          EVENT DETAIL MODAL
      ════════════════════════════════ */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl ring-1 ${isDark ? 'bg-slate-800 ring-slate-700/60' : 'bg-white ring-slate-200'
            } max-h-[85vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${selectedEvent.type === 'teacher' ? 'bg-rose-500/15' : 'bg-blue-500/15'}`}>
                    {(() => { const I = getCategoryIcon(selectedEvent.category); return <I className={`h-6 w-6 ${selectedEvent.type === 'teacher' ? 'text-rose-500' : 'text-blue-500'}`} />; })()}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ring-1 ${selectedEvent.type === 'teacher'
                      ? 'bg-rose-500/15 text-rose-500 ring-rose-500/30'
                      : 'bg-blue-500/15 text-blue-500 ring-blue-500/30'
                    }`}>
                    {selectedEvent.type === 'teacher' ? 'Teacher Assigned' : 'Personal'}
                  </span>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className={`text-2xl font-extrabold mb-2 ${selectedEvent.completed ? 'line-through opacity-50' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedEvent.title}
              </h2>
              {selectedEvent.description && (
                <p className={`text-sm mb-5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {selectedEvent.description}
                </p>
              )}

              <div className={`space-y-3 mb-6 p-4 rounded-2xl ${isDark ? 'bg-slate-700/40' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <CalendarIcon className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium capitalize px-2.5 py-0.5 rounded-full ${priorityPill(selectedEvent.priority)}`}>
                    {selectedEvent.priority} Priority
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleToggleComplete(selectedEvent.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all shadow-lg ${selectedEvent.completed
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30 hover:shadow-amber-500/50'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50'
                    }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {selectedEvent.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                {selectedEvent.type === 'personal' && (
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="p-3 rounded-2xl bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 ring-1 ring-rose-500/30 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          ADD EVENT MODAL
      ════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl ring-1 ${isDark ? 'bg-slate-800 ring-slate-700/60' : 'bg-white ring-slate-200'
            } max-h-[92vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>New</p>
                  <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Event</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Event title"
                    className={`w-full px-4 py-3 rounded-2xl ring-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all ${isDark ? 'bg-slate-700/60 ring-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 ring-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Optional notes…"
                    rows={3}
                    className={`w-full px-4 py-3 rounded-2xl ring-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none transition-all ${isDark ? 'bg-slate-700/60 ring-slate-600 text-white placeholder-slate-500' : 'bg-slate-50 ring-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                  />
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm((p) => ({ ...p, date: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-2xl ring-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${isDark ? 'bg-slate-700/60 ring-slate-600 text-white' : 'bg-slate-50 ring-slate-200 text-slate-900'
                        }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Time</label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm((p) => ({ ...p, time: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-2xl ring-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${isDark ? 'bg-slate-700/60 ring-slate-600 text-white' : 'bg-slate-50 ring-slate-200 text-slate-900'
                        }`}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Priority</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'low', active: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30' },
                      { key: 'medium', active: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-400/30' },
                      { key: 'high', active: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30' },
                    ].map(({ key, active }) => (
                      <button
                        key={key}
                        onClick={() => setEventForm((p) => ({ ...p, priority: key }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${eventForm.priority === key
                            ? active
                            : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category</label>
                  <div className="flex flex-wrap gap-2">
                    {['study', 'assignment', 'quiz', 'presentation'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setEventForm((p) => ({ ...p, category: cat }))}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${eventForm.category === cat
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                            : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  onClick={handleSaveEvent}
                  disabled={!eventForm.title.trim()}
                  className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add Event
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-6 py-3.5 rounded-2xl font-bold text-sm transition-all ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={handleAddEvent}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center justify-center text-white z-40 hover:scale-110 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>

      <style>{`
        @keyframes confetti {
          0%   { transform: translateY(0) rotate(0deg);    opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
      `}</style>
    </div>
  );
}