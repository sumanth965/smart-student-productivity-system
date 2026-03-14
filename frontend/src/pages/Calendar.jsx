import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import axios from '../lib/axios';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Edit3, 
  Trash2, 
  Download, 
  Filter, 
  List, 
  Grid3X3,
  Bell,
  BookOpen,
  GraduationCap,
  Target,
  Sparkles
} from 'lucide-react';

// Confetti component for celebrations
function Confetti({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full animate-confetti"
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

export default function CalendarPage() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'agenda'
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'teacher', 'personal'
  const [showConfetti, setShowConfetti] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [studentId, setStudentId] = useState('');
  
  // Form state for new/edit event
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'personal',
    priority: 'medium',
    category: 'study'
  });

  const [events, setEvents] = useState([]);

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
      type: (task.createdBy?._id === currentStudentId || task.createdBy === currentStudentId) ? 'personal' : 'teacher',
      priority: task.priority?.toLowerCase() || 'medium',
      category: 'assignment',
      completed: task.status === 'Completed',
      subject: task.subject,
    };
  };

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Theme persistence
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);


  const loadCalendarEvents = async () => {
    try {
      setLoadingEvents(true);
      const persistedUser = localStorage.getItem('student_user') || sessionStorage.getItem('student_user');
      if (!persistedUser) {
        setEvents([]);
        return;
      }

      const parsedUser = JSON.parse(persistedUser);
      const resolvedStudentId = parsedUser?._id || parsedUser?.id || '';
      if (!resolvedStudentId) {
        setEvents([]);
        return;
      }

      setStudentId(resolvedStudentId);
      const response = await axios.get(`/api/students/${resolvedStudentId}/tasks`);
      const incomingTasks = Array.isArray(response.data?.data) ? response.data.data : [];
      setEvents(incomingTasks.map((task) => mapTaskToCalendarEvent(task, resolvedStudentId)));
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push({ date: day, isCurrentMonth: true });
    }
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date) => isSameDay(date, new Date());

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  useEffect(() => {
    loadCalendarEvents();

    const handleRefresh = () => loadCalendarEvents();
    const handleFocus = () => loadCalendarEvents();

    window.addEventListener('tasks:refresh', handleRefresh);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('tasks:refresh', handleRefresh);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const matchesDate = isSameDay(event.date, date);
      const matchesFilter = filterType === 'all' || event.type === filterType;
      return matchesDate && matchesFilter;
    });
  };

  // Stats calculations
  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const filteredEvents = filterType === 'all' 
      ? events 
      : events.filter(e => e.type === filterType);
    
    return {
      total: filteredEvents.length,
      completed: filteredEvents.filter(e => e.completed).length,
      dueToday: filteredEvents.filter(e => isSameDay(e.date, new Date()) && !e.completed).length,
      overdue: filteredEvents.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < now && !e.completed;
      }).length
    };
  }, [events, filterType]);

  // Navigation
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction * 7));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Event handlers
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleAddEvent = () => {
    setEventForm({
      title: '',
      description: '',
      date: selectedDate.toISOString().split('T')[0],
      time: '12:00',
      type: 'personal',
      priority: 'medium',
      category: 'study'
    });
    setShowAddModal(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title.trim() || !studentId) return;

    const dueDate = new Date(`${eventForm.date}T${eventForm.time || '12:00'}`);

    try {
      const response = await axios.post(`/api/students/${studentId}/tasks`, {
        title: eventForm.title,
        description: eventForm.description || 'Self assigned task',
        subject: eventForm.category || 'General',
        dueDate,
        priority: eventForm.priority.charAt(0).toUpperCase() + eventForm.priority.slice(1),
      });

      const savedTask = response.data?.data;
      if (savedTask) {
        setEvents((prev) => [mapTaskToCalendarEvent(savedTask, studentId), ...prev]);
      }
      setShowAddModal(false);
      window.dispatchEvent(new Event('tasks:refresh'));
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Unable to save event. Please try again.');
    }
  };

  const handleToggleComplete = async (eventId) => {
    const targetEvent = events.find((event) => event.id === eventId);
    if (!targetEvent) return;

    const nextCompleted = !targetEvent.completed;

    setEvents((prev) => prev.map((event) => (
      event.id === eventId ? { ...event, completed: nextCompleted } : event
    )));

    if (nextCompleted) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    try {
      await axios.put(`/api/tasks/${eventId}`, {
        status: nextCompleted ? 'Completed' : 'Pending',
        ...(nextCompleted && studentId ? { completedBy: studentId } : {}),
      });
      window.dispatchEvent(new Event('tasks:refresh'));
    } catch (error) {
      console.error('Failed to update event status:', error);
      setEvents((prev) => prev.map((event) => (
        event.id === eventId ? { ...event, completed: !nextCompleted } : event
      )));
      alert('Unable to update event status. Please try again.');
    }

    setShowEventModal(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    const previousEvents = events;
    setEvents((prev) => prev.filter((event) => event.id !== eventId));

    try {
      await axios.delete(`/api/tasks/${eventId}`);
      window.dispatchEvent(new Event('tasks:refresh'));
    } catch (error) {
      console.error('Failed to delete event:', error);
      setEvents(previousEvents);
      alert('Unable to delete event. Please try again.');
    }

    setShowEventModal(false);
  };

  const handleExport = (format) => {
    if (format === 'json') {
      const dataStr = JSON.stringify(events, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'calendar-events.json';
      a.click();
    } else if (format === 'ics') {
      let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyFlow//Calendar//EN\n';
      events.forEach(event => {
        const dateStr = event.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        icsContent += `BEGIN:VEVENT\nDTSTART:${dateStr}\nSUMMARY:${event.title}\nDESCRIPTION:${event.description}\nEND:VEVENT\n`;
      });
      icsContent += 'END:VCALENDAR';
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'calendar-events.ics';
      a.click();
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'assignment': return BookOpen;
      case 'quiz': return Target;
      case 'presentation': return GraduationCap;
      case 'study': return Sparkles;
      default: return CalendarIcon;
    }
  };

  const days = viewMode === 'week' ? getWeekDays(currentDate) : getDaysInMonth(currentDate);
  const todayEvents = getEventsForDate(selectedDate);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Confetti show={showConfetti} />
      
      <DashboardNavbar
        isDark={isDark}
        setIsDark={setIsDark}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Calendar
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage your schedule and deadlines
              {loadingEvents && ' • syncing tasks...'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Export dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 text-slate-700'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <Download className="h-4 w-4" />
                Export
              </button>
              <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <button onClick={() => handleExport('json')} className={`w-full px-4 py-2 text-left text-sm rounded-t-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                  Export as JSON
                </button>
                <button onClick={() => handleExport('ics')} className={`w-full px-4 py-2 text-left text-sm rounded-b-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                  Export as ICS
                </button>
              </div>
            </div>
            
            {/* Add event button */}
            <button
              onClick={handleAddEvent}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-teal-600 transition-all shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`rounded-xl p-4 ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.total}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Events</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 ${isDark ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.completed}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Completed</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 ${isDark ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.dueToday}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Due Today</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 ${isDark ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20' : 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.overdue}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateMonth(-1)}
                className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className={`text-lg font-semibold min-w-[180px] text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatMonthYear(currentDate)}
              </h2>
              <button
                onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateMonth(1)}
                className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={goToToday}
                className={`ml-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                Today
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Filter chips */}
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === 'all' ? 'bg-blue-500 text-white' : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('teacher')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === 'teacher' ? 'bg-red-500 text-white' : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Teacher
                </button>
                <button
                  onClick={() => setFilterType('personal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === 'personal' ? 'bg-blue-500 text-white' : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Personal
                </button>
              </div>
              
              {/* View toggle */}
              <div className={`flex items-center rounded-lg p-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <button
                  onClick={() => setViewMode('month')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'month' ? 'bg-blue-500 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  title="Month view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'week' ? 'bg-blue-500 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  title="Week view"
                >
                  <CalendarIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('agenda')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'agenda' ? 'bg-blue-500 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  title="Agenda view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className={`lg:col-span-2 rounded-xl p-4 ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            {viewMode === 'agenda' ? (
              // Agenda View
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Upcoming Events</h3>
                {events
                  .filter(e => filterType === 'all' || e.type === filterType)
                  .sort((a, b) => a.date - b.date)
                  .map(event => {
                    const CategoryIcon = getCategoryIcon(event.category);
                    const isOverdue = isPast(event.date) && !event.completed;
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                          isDark 
                            ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600' 
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                        } ${event.completed ? 'opacity-60' : ''}`}
                      >
                        <div className={`p-3 rounded-xl ${event.type === 'teacher' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                          <CategoryIcon className={`h-5 w-5 ${event.type === 'teacher' ? 'text-red-500' : 'text-blue-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold truncate ${event.completed ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {event.title}
                            </h4>
                            {isOverdue && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-500 animate-pulse">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.time}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                      </div>
                    );
                  })}
              </div>
            ) : (
              // Month/Week View
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={`text-center text-xs font-semibold py-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);
                    const isSelected = isSameDay(day.date, selectedDate);
                    const isTodayDate = isToday(day.date);
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day.date)}
                        className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 rounded-lg cursor-pointer transition-all border ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : isDark
                              ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        } ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isTodayDate 
                            ? 'w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white mx-auto sm:mx-0'
                            : isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {day.date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer transition-all hover:opacity-80 ${
                                event.type === 'teacher'
                                  ? 'bg-red-500/20 text-red-500'
                                  : 'bg-blue-500/20 text-blue-500'
                              } ${event.completed ? 'line-through opacity-60' : ''}`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
          </div>

          {/* Selected Day Events Sidebar */}
          <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isToday(selectedDate) ? "Today's Events" : formatDate(selectedDate).split(',')[0]}
              </h3>
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            {todayEvents.length === 0 ? (
              <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No events scheduled</p>
                <button
                  onClick={handleAddEvent}
                  className="mt-3 text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  Add an event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map(event => {
                  const CategoryIcon = getCategoryIcon(event.category);
                  const isOverdue = isPast(event.date) && !event.completed;
                  
                  return (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        isDark 
                          ? 'bg-slate-700/50 hover:bg-slate-700' 
                          : 'bg-slate-50 hover:bg-slate-100'
                      } ${event.completed ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${event.type === 'teacher' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                          <CategoryIcon className={`h-4 w-4 ${event.type === 'teacher' ? 'text-red-500' : 'text-blue-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-semibold truncate ${event.completed ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {event.title}
                            </h4>
                            {isOverdue && (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className={`h-3 w-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{event.time}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(event.priority)}`} />
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(event.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all ${
                            event.completed
                              ? 'bg-green-500/20 text-green-500'
                              : isDark
                                ? 'hover:bg-slate-600 text-slate-400'
                                : 'hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Legend */}
            <div className={`mt-6 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Legend</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-500/30" />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Teacher</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-500/30" />
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Personal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} max-h-[80vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${selectedEvent.type === 'teacher' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                    {(() => {
                      const CategoryIcon = getCategoryIcon(selectedEvent.category);
                      return <CategoryIcon className={`h-6 w-6 ${selectedEvent.type === 'teacher' ? 'text-red-500' : 'text-blue-500'}`} />;
                    })()}
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${selectedEvent.type === 'teacher' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                      {selectedEvent.type === 'teacher' ? 'Teacher Assigned' : 'Personal'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <h2 className={`text-xl font-bold mb-2 ${selectedEvent.completed ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedEvent.title}
              </h2>
              
              {selectedEvent.description && (
                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {selectedEvent.description}
                </p>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CalendarIcon className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {formatDate(selectedEvent.date)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {selectedEvent.time}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className={`text-sm capitalize ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {selectedEvent.priority} Priority
                  </span>
                  <span className={`w-2 h-2 rounded-full ${getPriorityColor(selectedEvent.priority)}`} />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleToggleComplete(selectedEvent.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                    selectedEvent.completed
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {selectedEvent.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                {selectedEvent.type === 'personal' && (
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Add New Event</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Event title"
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description (optional)"
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'}`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map(priority => (
                      <button
                        key={priority}
                        onClick={() => setEventForm(prev => ({ ...prev, priority }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                          eventForm.priority === priority
                            ? priority === 'high'
                              ? 'bg-red-500 text-white'
                              : priority === 'medium'
                                ? 'bg-amber-500 text-white'
                                : 'bg-green-500 text-white'
                            : isDark
                              ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['study', 'assignment', 'quiz', 'presentation'].map(category => (
                      <button
                        key={category}
                        onClick={() => setEventForm(prev => ({ ...prev, category }))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                          eventForm.category === category
                            ? 'bg-blue-500 text-white'
                            : isDark
                              ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEvent}
                  disabled={!eventForm.title.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Event
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white z-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Confetti animation styles */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
