import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock, AlertCircle, CheckCircle2, ChevronLeft, Zap, Calendar,
  Flag, X, Check, Wind, Plus, TrendingUp, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatTimeLeft = (dueDate) => {
  const now = new Date();
  const diff = new Date(dueDate) - now;
  if (diff < 0) {
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    return `${days}d ${hours}h overdue`;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
};

const getDateCategory = (dueDate) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diff = Math.ceil((due - today) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 7) return 'week';
  return 'future';
};

const PRIORITY_CONFIG = {
  high: { border: '#EF4444', badge: '#EF4444', label: 'HIGH' },
  medium: { border: '#F59E0B', badge: '#F59E0B', label: 'MED' },
  low: { border: '#3B82F6', badge: '#3B82F6', label: 'LOW' },
};

const SUBJECT_COLORS = {
  EJAVA: '#F97316', AWT: '#A855F7', 'FSDD/ADSA': '#3B82F6',
  PCS: '#22C55E', SET: '#10B981', 'DW&DM': '#F43F5E',
  'WDR&P': '#F59E0B', 'DIP&PR': '#06B6D4', Japanese: '#EC4899',
  Mathematics: '#6366F1', Physics: '#8B5CF6', Chemistry: '#22C55E',
  Biology: '#10B981', English: '#F43F5E', History: '#F59E0B',
  Languages: '#06B6D4', 'Computer Science': '#6366F1', Art: '#EC4899',
};

const getSubjectColor = (subject) => SUBJECT_COLORS[subject] || '#64748B';

// ============================================================================
// COUNTDOWN TIMER
// ============================================================================
const CountdownTimer = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(dueDate));
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(formatTimeLeft(dueDate)), 1000);
    return () => clearInterval(interval);
  }, [dueDate]);
  const isOverdue = new Date(dueDate) < new Date();
  return (
    <span className={`font-mono text-xs font-bold tracking-tight ${isOverdue ? 'text-red-500' : 'text-blue-600'}`}>
      {timeLeft}
    </span>
  );
};

// ============================================================================
// TASK CARD — responsive, correct sizing
// ============================================================================
const TaskCard = ({ task, onComplete, onSnooze, isOverdue }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const subjectColor = getSubjectColor(task.subject);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        onClick={() => setShowDetail(true)}
        onMouseEnter={() => setActionsVisible(true)}
        onMouseLeave={() => setActionsVisible(false)}
        className="relative bg-white rounded-xl cursor-pointer overflow-hidden w-full"
        style={{
          borderLeft: `4px solid ${priority.border}`,
          boxShadow: isOverdue
            ? '0 0 0 1px #FEE2E2, 0 4px 16px rgba(239,68,68,0.10)'
            : '0 2px 8px rgba(0,0,0,0.07), 0 0 0 1px #F1F5F9',
        }}
      >
        {isOverdue && <div className="absolute inset-0 bg-red-50/60 pointer-events-none" />}

        <div className="relative p-3 sm:p-4 flex flex-col gap-2.5">
          {/* Top row: title + priority badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">{task.description}</p>
              )}
            </div>
            <span
              className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: priority.badge }}
            >
              {priority.label}
            </span>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: subjectColor }} />
            <span className="text-xs font-medium text-slate-500 truncate">{task.subject}</span>
          </div>

          {/* Time row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 min-w-0">
              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <CountdownTimer dueDate={task.dueDate} />
            </div>
            <span className="text-[10px] text-slate-400 flex-shrink-0">
              {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' · '}
              {task.dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Action buttons — visible on hover (desktop) or always on mobile */}
          <AnimatePresence>
            {(actionsVisible) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-2 overflow-hidden"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 text-xs font-semibold transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Complete
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSnooze(task.id); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-xs font-semibold transition-colors"
                >
                  <Wind className="w-3.5 h-3.5" /> Snooze
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Always-visible action buttons on mobile (touch devices) */}
          <div className="flex gap-2 sm:hidden">
            <button
              onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 active:bg-emerald-100 text-emerald-700 text-xs font-semibold"
            >
              <Check className="w-3.5 h-3.5" /> Complete
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSnooze(task.id); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 active:bg-blue-100 text-blue-700 text-xs font-semibold"
            >
              <Wind className="w-3.5 h-3.5" /> Snooze
            </button>
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetail(false)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Drag handle — mobile only */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              {/* Color bar */}
              <div className="h-1" style={{ background: `linear-gradient(to right, ${priority.border}, ${subjectColor})` }} />

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {task.title}
                    </h2>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{task.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Subject', value: task.subject, color: subjectColor },
                    { label: 'Priority', value: priority.label, color: priority.border },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</p>
                      <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: color }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Due Date</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {task.dueDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    {' at '}
                    {task.dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-3">
                  <Clock className={`w-4 h-4 flex-shrink-0 ${isOverdue ? 'text-red-500' : 'text-blue-500'}`} />
                  <CountdownTimer dueDate={task.dueDate} />
                </div>

                <div className="flex gap-3 pt-1 pb-safe">
                  <button
                    onClick={() => { onComplete(task.id); setShowDetail(false); }}
                    className="flex-1 py-3 rounded-xl text-white text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Complete
                  </button>
                  <button
                    onClick={() => { onSnooze(task.id); setShowDetail(false); }}
                    className="flex-1 py-3 rounded-xl text-slate-700 text-sm font-semibold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Wind className="w-4 h-4" /> Snooze 1h
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// SECTION HEADER
// ============================================================================
const SectionHeader = ({ icon: Icon, title, count, accentColor, isOverdue }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accentColor}20` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
      </div>
      <h2 className="text-sm font-bold tracking-wide uppercase"
        style={{ color: accentColor, fontFamily: "'DM Sans', sans-serif" }}>
        {title}
      </h2>
      {isOverdue && (
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
      )}
    </div>
    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
      {count} {count === 1 ? 'task' : 'tasks'}
    </span>
  </div>
);

// ============================================================================
// SKELETON
// ============================================================================
const SkeletonLoader = () => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
        className="h-24 bg-slate-100 rounded-xl border-l-4 border-slate-200"
      />
    ))}
  </div>
);

// ============================================================================
// STATS BAR
// ============================================================================
const StatsBar = ({ overdue, today, upcoming, completed }) => {
  const stats = [
    { label: 'Overdue', value: overdue, color: '#EF4444', bg: '#FEF2F2' },
    { label: 'Today', value: today, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Upcoming', value: upcoming, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Done', value: completed, color: '#10B981', bg: '#ECFDF5' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-8">
      {stats.map(({ label, value, color, bg }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="rounded-xl p-3 sm:p-4 text-center"
          style={{ backgroundColor: bg }}
        >
          <p className="text-2xl sm:text-3xl font-bold leading-none"
            style={{ color, fontFamily: "'DM Sans', sans-serif" }}>{value}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1.5"
            style={{ color: `${color}99` }}>{label}</p>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================
const EmptyState = ({ title, description }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4"
  >
    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
    </div>
    <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</h3>
    <p className="text-sm text-slate-400 mt-1 max-w-xs leading-relaxed">{description}</p>
  </motion.div>
);

// ============================================================================
// FILTER TABS — scrollable on mobile
// ============================================================================
const FilterTabs = ({ filter, setFilter, overdueCount }) => {
  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'future', label: 'Future' },
  ];

  return (
    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5 overflow-x-auto scrollbar-none">
      {FILTERS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setFilter(id)}
          className="relative px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
          style={{
            backgroundColor: filter === id ? '#fff' : 'transparent',
            color: filter === id ? '#1E40AF' : '#64748B',
            boxShadow: filter === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {label}
          {id === 'overdue' && overdueCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
              {overdueCount > 9 ? '9+' : overdueCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function DeadlineReminder({ isDark = false }) {
  const navigate = useNavigate();
  const onNavigateBack = () => navigate('/dashboard');

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const persistedUser = localStorage.getItem('student_user') || sessionStorage.getItem('student_user');
      if (!persistedUser) { setError('User not found. Please log in again.'); return; }
      const parsedUser = JSON.parse(persistedUser);
      const userId = parsedUser._id || parsedUser.id;
      if (!userId) { setError('Invalid user information'); return; }
      setStudentId(userId);

      const response = await axios.get(`/api/students/${userId}/tasks`);
      if (response.data.success && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map((t) => ({
          id: t._id, title: t.title, subject: t.subject,
          dueDate: new Date(t.dueDate),
          priority: t.priority?.toLowerCase() || 'medium',
          status: t.status?.toLowerCase() || 'pending',
          description: t.description,
          createdAt: new Date(t.createdAt),
          completed: t.status === 'Completed',
        }));
        setTasks(mapped);
        setCompletedTasks(mapped.filter((t) => t.completed).map((t) => t.id));
        setError(null);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    const refresh = () => loadTasks();
    window.addEventListener('tasks:refresh', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('tasks:refresh', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [loadTasks]);

  const urgencyCategories = useMemo(() => {
    const active = tasks.filter((t) => !completedTasks.includes(t.id));
    return {
      overdue: active.filter((t) => getDateCategory(t.dueDate) === 'overdue'),
      today: active.filter((t) => getDateCategory(t.dueDate) === 'today'),
      tomorrow: active.filter((t) => getDateCategory(t.dueDate) === 'tomorrow'),
      week: active.filter((t) => getDateCategory(t.dueDate) === 'week'),
      future: active.filter((t) => getDateCategory(t.dueDate) === 'future'),
    };
  }, [tasks, completedTasks]);

  const completed = tasks.filter((t) => completedTasks.includes(t.id));

  const handleComplete = useCallback(async (taskId) => {
    const wasCompleted = completedTasks.includes(taskId);
    const next = wasCompleted
      ? completedTasks.filter((id) => id !== taskId)
      : [...completedTasks, taskId];
    setCompletedTasks(next);
    setShowToast({ type: wasCompleted ? 'info' : 'success', message: wasCompleted ? 'Task marked pending' : 'Task completed!' });
    setTimeout(() => setShowToast(null), 3000);
    try {
      await axios.put(`/api/tasks/${taskId}`, {
        status: wasCompleted ? 'Pending' : 'Completed',
        ...(!wasCompleted && studentId ? { completedBy: studentId } : {}),
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completed: !wasCompleted, status: !wasCompleted ? 'completed' : 'pending' }
            : t
        )
      );
      window.dispatchEvent(new Event('tasks:refresh'));
    } catch {
      setCompletedTasks(completedTasks);
      setShowToast({ type: 'error', message: 'Failed to update task. Try again.' });
      setTimeout(() => setShowToast(null), 3000);
    }
  }, [completedTasks, studentId]);

  const handleSnooze = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, dueDate: new Date(t.dueDate.getTime() + 3600000) } : t
      )
    );
    setShowToast({ type: 'info', message: 'Snoozed for 1 hour' });
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  const handleCompleteAllOverdue = useCallback(() => {
    const ids = urgencyCategories.overdue.map((t) => t.id);
    setCompletedTasks((prev) => [...new Set([...prev, ...ids])]);
    setShowToast({ type: 'success', message: `${ids.length} overdue tasks completed!` });
    setTimeout(() => setShowToast(null), 3500);
  }, [urgencyCategories.overdue]);

  const displayData = useMemo(() => {
    switch (filter) {
      case 'overdue': return { overdue: urgencyCategories.overdue };
      case 'today': return { today: urgencyCategories.today };
      case 'week': return { today: urgencyCategories.today, tomorrow: urgencyCategories.tomorrow, week: urgencyCategories.week };
      case 'future': return { future: urgencyCategories.future };
      default: return urgencyCategories;
    }
  }, [filter, urgencyCategories]);

  const SECTIONS = [
    { key: 'overdue', icon: AlertCircle, title: 'Overdue', color: '#EF4444', isOverdue: true },
    { key: 'today', icon: Zap, title: 'Today', color: '#F59E0B', isOverdue: false },
    { key: 'tomorrow', icon: Calendar, title: 'Tomorrow', color: '#8B5CF6', isOverdue: false },
    { key: 'week', icon: Flag, title: 'This Week', color: '#3B82F6', isOverdue: false },
    { key: 'future', icon: TrendingUp, title: 'Upcoming', color: '#6366F1', isOverdue: false },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .pb-safe { padding-bottom: max(12px, env(safe-area-inset-bottom)); }
        @media (max-width: 640px) {
          .task-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div
        className="min-h-screen w-full"
        style={{ backgroundColor: '#F8FAFC', fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ===== NAVBAR ===== */}
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200"
          style={{ boxShadow: '0 1px 0 #E2E8F0' }}>
          <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-5 lg:px-8">
            <div className="flex items-center h-14 gap-2 sm:gap-4">

              {/* Back button */}
              <button
                onClick={onNavigateBack}
                className="p-1.5 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                aria-label="Go back"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>

              {/* Brand */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-800 text-sm hidden xs:block sm:block">
                  Deadline Tracker
                </span>
              </div>

              {/* Filter — grows to fill center space */}
              <div className="flex-1 flex justify-center overflow-hidden px-1">
                <FilterTabs
                  filter={filter}
                  setFilter={setFilter}
                  overdueCount={urgencyCategories.overdue.length}
                />
              </div>

              {/* New Task */}
              <button
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===== TOAST ===== */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-xl pointer-events-none whitespace-nowrap"
              style={{
                background:
                  showToast.type === 'success' ? '#10B981'
                    : showToast.type === 'error' ? '#EF4444'
                      : '#3B82F6',
              }}
            >
              {showToast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== MAIN CONTENT ===== */}
        <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-5 lg:px-8 py-5 sm:py-7 space-y-7">
          {isLoading ? (
            <SkeletonLoader />
          ) : error ? (
            <EmptyState title="Error Loading Tasks" description={error} />
          ) : (
            <>
              {SECTIONS.map(({ key, icon, title, color, isOverdue }) => {
                const sectionTasks = displayData[key];
                if (!sectionTasks || sectionTasks.length === 0) return null;

                return (
                  <motion.section
                    key={key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SectionHeader
                      icon={icon}
                      title={title}
                      count={sectionTasks.length}
                      accentColor={color}
                      isOverdue={isOverdue}
                    />

                    {/* Responsive grid:
                        - mobile (< sm):  1 col
                        - tablet (sm):    2 col
                        - desktop (lg):   3 col
                        - wide (xl):      4 col              */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                      <AnimatePresence>
                        {sectionTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onComplete={handleComplete}
                            onSnooze={handleSnooze}
                            isOverdue={isOverdue}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Complete All overdue */}
                    {isOverdue && sectionTasks.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        onClick={handleCompleteAllOverdue}
                        className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete All Overdue ({sectionTasks.length})
                      </motion.button>
                    )}
                  </motion.section>
                );
              })}

              {/* Completed section */}
              {completed.length > 0 && filter === 'all' && (
                <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SectionHeader
                    icon={CheckCircle2}
                    title="Completed"
                    count={completed.length}
                    accentColor="#10B981"
                    isOverdue={false}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                    {completed.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-xl p-3 sm:p-4 opacity-60 border-l-4 border-emerald-300 w-full"
                        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-600 line-through line-clamp-2 leading-snug">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                            )}
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-3">
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getSubjectColor(task.subject) }} />
                          <span className="text-xs text-slate-400 truncate">{task.subject}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* All empty */}
              {Object.values(displayData).every((arr) => arr.length === 0) && completed.length === 0 && (
                <EmptyState
                  title="All Clear!"
                  description="You're all caught up. Great job staying on top of your deadlines."
                />
              )}

              {/* Stats Bar */}
              <StatsBar
                overdue={urgencyCategories.overdue.length}
                today={urgencyCategories.today.length}
                upcoming={urgencyCategories.tomorrow.length + urgencyCategories.week.length + urgencyCategories.future.length}
                completed={completed.length}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}