import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, AlertCircle, CheckCircle2, ChevronLeft, Zap, Calendar, Flag, X, Check, Wind } from 'lucide-react';
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
    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h overdue`;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const getDateCategory = (dueDate) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diffTime = dueDay - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays <= 7) return 'week';
  return 'future';
};

const getUrgencyColor = (dueDate) => {
  const now = new Date();
  const diffMs = new Date(dueDate) - now;
  const daysLeft = diffMs / (1000 * 60 * 60 * 24);

  if (daysLeft < 0) return 'from-red-500 via-red-500 to-red-600';
  if (daysLeft < 1) return 'from-red-500 via-orange-500 to-red-600';
  if (daysLeft < 2) return 'from-orange-500 via-orange-500 to-amber-500';
  if (daysLeft < 3) return 'from-amber-500 via-amber-500 to-yellow-500';
  if (daysLeft < 5) return 'from-yellow-500 via-yellow-500 to-lime-500';
  return 'from-lime-500 via-green-500 to-emerald-500';
};

const getPriorityBadgeColor = (priority) => {
  const colors = {
    high: 'bg-red-500/90 shadow-lg shadow-red-500/40',
    medium: 'bg-amber-500/90 shadow-lg shadow-amber-500/40',
    low: 'bg-blue-500/90 shadow-lg shadow-blue-500/40',
  };
  return colors[priority] || 'bg-slate-500/90';
};

const getSubjectColor = (subject) => {
  const colors = {
    EJAVA: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    AWT: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'FSDD/ADSA': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    PCS: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    SET: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'DW&DM': 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    'WDR&P': 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'DIP&PR': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    Japanese: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    Mathematics: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    Physics: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    Chemistry: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    Biology: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    English: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    History: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Languages: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    'Computer Science': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    Art: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  };
  return colors[subject] || 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
};

// ============================================================================
// COUNTDOWN TIMER COMPONENT
// ============================================================================

const CountdownTimer = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(dueDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(dueDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [dueDate]);

  const isOverdue = new Date(dueDate) < new Date();

  return (
    <span
      className={`font-mono text-sm font-bold animate-pulse ${
        isOverdue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
      }`}
    >
      {timeLeft}
    </span>
  );
};

// ============================================================================
// TASK CARD COMPONENT
// ============================================================================

const TaskCard = ({ task, onComplete, onSnooze, isOverdue, isDark }) => {
  const [showDetail, setShowDetail] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
    hover: { scale: 1.02, y: -4 },
  };

  return (
    <>
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={isOverdue ? undefined : 'hover'}
        className={`relative group backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer h-full
          ${
            isOverdue
              ? 'bg-red-500/10 border border-red-300/50 dark:border-red-700/50 shadow-2xl shadow-red-500/20 animate-shake'
              : 'bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 hover:ring-2 ring-blue-500/30'
          }`}
        onClick={() => setShowDetail(true)}
      >
        {/* Urgency Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getUrgencyColor(task.dueDate)}`} />

        <div className="p-4 sm:p-5 space-y-3 flex flex-col h-full">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {task.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            </div>
            <div
              className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap flex-shrink-0 ${getPriorityBadgeColor(
                task.priority
              )}`}
            >
              {task.priority.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Subject Badge */}
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border w-fit ${getSubjectColor(task.subject)}`}>
            {task.subject}
          </div>

          {/* Timer & Date Row - Spacer to push to bottom */}
          <div className="flex-grow" />

          {/* Timer & Date Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <Clock
                className={`w-4 h-4 flex-shrink-0 ${
                  isOverdue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                }`}
              />
              <CountdownTimer dueDate={task.dueDate} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 text-right sm:text-left">
              {task.dueDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg bg-green-500/90 hover:bg-green-600 text-white text-xs font-semibold transition-all shadow-lg shadow-green-500/30"
              title="Mark task complete"
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Complete</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSnooze(task.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg bg-blue-500/90 hover:bg-blue-600 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-500/30"
              title="Snooze for 1 hour"
            >
              <Wind className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Snooze</span>
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white break-words">
                    {task.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {task.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Subject
                    </p>
                    <p
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getSubjectColor(
                        task.subject
                      )}`}
                    >
                      {task.subject}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Priority
                    </p>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getPriorityBadgeColor(
                        task.priority
                      )}`}
                    >
                      {task.priority.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    Due Date & Time
                  </p>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold break-words">
                    {task.dueDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    Time Remaining
                  </p>
                  <p
                    className={`text-lg font-bold font-mono ${
                      isOverdue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    <CountdownTimer dueDate={task.dueDate} />
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    onComplete(task.id);
                    setShowDetail(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-500/30 transition-all text-sm sm:text-base"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  Mark Complete
                </button>
                <button
                  onClick={() => {
                    onSnooze(task.id);
                    setShowDetail(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold transition-all text-sm sm:text-base"
                >
                  <Wind className="w-5 h-5 flex-shrink-0" />
                  Snooze 1h
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

const EmptyState = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/50 border border-slate-200/50 dark:border-slate-700/50"
  >
    <Icon className="w-12 sm:w-16 h-12 sm:h-16 text-blue-400 dark:text-blue-500 mb-4 opacity-60" />
    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 text-center">
      {title}
    </h3>
    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">{description}</p>
  </motion.div>
);

// ============================================================================
// SECTION HEADER COMPONENT
// ============================================================================

const SectionHeader = ({ icon: Icon, title, count, color, isOverdue }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-2 sm:gap-3 mb-5 sticky top-16 sm:top-20 z-10 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 py-3 px-4 rounded-xl"
  >
    <div className={`p-2 rounded-lg flex-shrink-0 ${color}`}>
      <Icon
        className={`w-5 h-5 ${
          isOverdue ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-white'
        }`}
      />
    </div>
    <div className="min-w-0 flex-1">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
        {title}
      </h2>
      <p className="text-xs text-slate-600 dark:text-slate-400">{count} tasks</p>
    </div>
  </motion.div>
);

// ============================================================================
// SKELETON LOADER COMPONENT
// ============================================================================

const SkeletonLoader = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-24 sm:h-32 backdrop-blur-xl rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-700/30"
      />
    ))}
  </div>
);

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

const StatsCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="backdrop-blur-xl rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-4 text-center"
  >
    <div className={`flex justify-center mb-2 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{label}</p>
  </motion.div>
);

// ============================================================================
// MAIN DEADLINE REMINDER COMPONENT
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

      if (!persistedUser) {
        setError('User not found. Please log in again.');
        return;
      }

      const parsedUser = JSON.parse(persistedUser);
      const userId = parsedUser._id || parsedUser.id;

      if (!userId) {
        setError('Invalid user information');
        return;
      }

      setStudentId(userId);

      // Fetch tasks from API
      const response = await axios.get(`/api/students/${userId}/tasks`);
      if (response.data.success && Array.isArray(response.data.data)) {
        const mappedTasks = response.data.data.map((task) => ({
          id: task._id,
          title: task.title,
          subject: task.subject,
          dueDate: new Date(task.dueDate),
          priority: task.priority?.toLowerCase() || 'medium',
          status: task.status?.toLowerCase() || 'pending',
          description: task.description,
          createdAt: new Date(task.createdAt),
          completed: task.status === 'Completed',
        }));
        setTasks(mappedTasks);
        setCompletedTasks(mappedTasks.filter((task) => task.completed).map((task) => task.id));
        setError(null);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    const handleRefresh = () => loadTasks();
    const handleFocus = () => loadTasks();

    window.addEventListener('tasks:refresh', handleRefresh);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('tasks:refresh', handleRefresh);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadTasks]);

  // Auto-sort tasks by urgency
  const urgencyCategories = useMemo(() => {
    const filteredTasks = tasks.filter((t) => !completedTasks.includes(t.id));

    return {
      overdue: filteredTasks.filter((t) => getDateCategory(t.dueDate) === 'overdue'),
      today: filteredTasks.filter((t) => getDateCategory(t.dueDate) === 'today'),
      tomorrow: filteredTasks.filter((t) => getDateCategory(t.dueDate) === 'tomorrow'),
      week: filteredTasks.filter((t) => getDateCategory(t.dueDate) === 'week'),
      future: filteredTasks.filter((t) => getDateCategory(t.dueDate) === 'future'),
    };
  }, [tasks, completedTasks]);

  const completed = tasks.filter((t) => completedTasks.includes(t.id));

  const handleComplete = useCallback(
    async (taskId) => {
      const wasCompleted = completedTasks.includes(taskId);
      const nextCompletedTasks = wasCompleted
        ? completedTasks.filter((id) => id !== taskId)
        : [...completedTasks, taskId];

      setCompletedTasks(nextCompletedTasks);
      setShowToast({
        type: 'success',
        message: wasCompleted ? '↺ Task marked pending' : '✓ Task completed!',
      });
      setTimeout(() => setShowToast(null), 3000);

      try {
        await axios.put(`/api/tasks/${taskId}`, {
          status: wasCompleted ? 'Pending' : 'Completed',
          ...(!wasCompleted && studentId ? { completedBy: studentId } : {}),
        });

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed: !wasCompleted,
                  status: !wasCompleted ? 'completed' : 'pending',
                }
              : task
          )
        );
        window.dispatchEvent(new Event('tasks:refresh'));
      } catch (error) {
        console.error('Failed to update task completion state:', error);
        setCompletedTasks(completedTasks);
        setShowToast({
          type: 'error',
          message: 'Failed to update task status. Please try again.',
        });
        setTimeout(() => setShowToast(null), 3000);
      }
    },
    [completedTasks, studentId]
  );

  const handleSnooze = useCallback((taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, dueDate: new Date(new Date(t.dueDate).getTime() + 60 * 60 * 1000) }
            : t
        )
      );
      setShowToast({ type: 'info', message: '⏱ Snoozed for 1 hour' });
      setTimeout(() => setShowToast(null), 3000);

      console.log(`[API] PATCH /api/tasks/${taskId}/snooze`, { duration: '1h' });
    }
  }, [tasks]);

  const handleCompleteAllOverdue = useCallback(() => {
    urgencyCategories.overdue.forEach((task) => {
      setCompletedTasks((prev) => [...prev, task.id]);
    });
    setShowToast({
      type: 'success',
      message: `✓ ${urgencyCategories.overdue.length} overdue tasks completed!`,
    });
    setTimeout(() => setShowToast(null), 4000);

    console.log('[API] POST /api/tasks/complete-bulk', {
      taskIds: urgencyCategories.overdue.map((t) => t.id),
    });
  }, [urgencyCategories.overdue]);

  // Filter display based on selected filter
  const displayData = (() => {
    switch (filter) {
      case 'overdue':
        return { overdue: urgencyCategories.overdue };
      case 'today':
        return { today: urgencyCategories.today };
      case 'week':
        return {
          today: urgencyCategories.today,
          tomorrow: urgencyCategories.tomorrow,
          week: urgencyCategories.week,
        };
      case 'future':
        return { future: urgencyCategories.future };
      default:
        return urgencyCategories;
    }
  })();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 min-h-screen">
        {/* ===== NAVBAR ===== */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Left Section */}
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={onNavigateBack}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex-shrink-0">
                  <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-white animate-bounce" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                  Deadline Tracker
                </h1>
              </div>

              {/* Right Section - Filter Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-0 scrollbar-hide">
                {['all', 'overdue', 'today', 'week', 'future'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-3 sm:px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                      filter === filterOption
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                        : 'bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.nav>

        {/* ===== MAIN CONTENT ===== */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12">
          {/* Toast Notification */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-white shadow-2xl backdrop-blur-xl z-50 ${
                  showToast.type === 'success'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/40'
                    : showToast.type === 'error'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/40'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-600 shadow-blue-500/40'
                }`}
              >
                {showToast.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {isLoading ? (
            <SkeletonLoader />
          ) : error ? (
            <EmptyState
              icon={AlertCircle}
              title="⚠️ Error Loading Tasks"
              description={error}
            />
          ) : (
            <>
              {/* OVERDUE SECTION */}
              {displayData.overdue && displayData.overdue.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <SectionHeader
                    icon={AlertCircle}
                    title="🔴 OVERDUE"
                    count={displayData.overdue.length}
                    color="bg-red-500/20"
                    isOverdue={true}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayData.overdue.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={handleComplete}
                        onSnooze={handleSnooze}
                        isOverdue={true}
                        isDark={isDark}
                      />
                    ))}
                  </div>

                  {/* Complete All Overdue Button */}
                  {displayData.overdue.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCompleteAllOverdue}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Complete All Overdue Tasks ({displayData.overdue.length})
                    </motion.button>
                  )}

                  <div className="h-px bg-gradient-to-r from-transparent via-red-200 dark:via-red-800/30 to-transparent my-4" />
                </motion.div>
              )}

              {/* TODAY SECTION */}
              {displayData.today && displayData.today.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <SectionHeader
                    icon={Zap}
                    title="🟠 TODAY"
                    count={displayData.today.length}
                    color="bg-orange-500/20"
                    isOverdue={false}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayData.today.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={handleComplete}
                        onSnooze={handleSnooze}
                        isOverdue={false}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-200 dark:via-orange-800/30 to-transparent my-4" />
                </motion.div>
              )}

              {/* TOMORROW SECTION */}
              {displayData.tomorrow && displayData.tomorrow.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <SectionHeader
                    icon={Calendar}
                    title="🟡 TOMORROW"
                    count={displayData.tomorrow.length}
                    color="bg-yellow-500/20"
                    isOverdue={false}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayData.tomorrow.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={handleComplete}
                        onSnooze={handleSnooze}
                        isOverdue={false}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-yellow-200 dark:via-yellow-800/30 to-transparent my-4" />
                </motion.div>
              )}

              {/* THIS WEEK SECTION */}
              {displayData.week && displayData.week.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <SectionHeader
                    icon={Flag}
                    title="🔵 THIS WEEK"
                    count={displayData.week.length}
                    color="bg-blue-500/20"
                    isOverdue={false}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayData.week.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={handleComplete}
                        onSnooze={handleSnooze}
                        isOverride={false}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-800/30 to-transparent my-4" />
                </motion.div>
              )}

              {/* UPCOMING SECTION */}
              {displayData.future && displayData.future.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <SectionHeader
                    icon={Calendar}
                    title="🟣 UPCOMING"
                    count={displayData.future.length}
                    color="bg-violet-500/20"
                    isOverdue={false}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayData.future.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={handleComplete}
                        onSnooze={handleSnooze}
                        isOverride={false}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-violet-200 dark:via-violet-800/30 to-transparent my-4" />
                </motion.div>
              )}

              {/* COMPLETED SECTION */}
              {completed.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <SectionHeader
                    icon={CheckCircle2}
                    title="✅ COMPLETED"
                    count={completed.length}
                    color="bg-green-500/20"
                    isOverdue={false}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completed.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="backdrop-blur-xl rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/50 dark:border-green-700/30 p-4 sm:p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white line-through opacity-70 break-words text-sm sm:text-base">
                              {task.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.description}</p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        </div>
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getSubjectColor(
                            task.subject
                          )}`}
                        >
                          {task.subject}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* EMPTY STATE */}
              {Object.values(displayData).every((arr) => arr.length === 0) && completed.length === 0 && (
                <EmptyState
                  icon={CheckCircle2}
                  title="🎉 No Pending Tasks"
                  description="You're all caught up! Great job managing your deadlines."
                />
              )}

              {/* STATS FOOTER */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
              >
                <StatsCard icon={AlertCircle} label="Overdue" value={urgencyCategories.overdue.length} color="text-red-600 dark:text-red-400" />
                <StatsCard icon={Zap} label="Today" value={urgencyCategories.today.length} color="text-orange-600 dark:text-orange-400" />
                <StatsCard
                  icon={Calendar}
                  label="Upcoming"
                  value={urgencyCategories.tomorrow.length + urgencyCategories.week.length}
                  color="text-yellow-600 dark:text-yellow-400"
                />
                <StatsCard icon={CheckCircle2} label="Completed" value={completed.length} color="text-green-600 dark:text-green-400" />
              </motion.div>
            </>
          )}

          {/* DEBUG INFO - API Endpoints */}
          <details className="mt-8 sm:mt-12 text-xs text-slate-500 dark:text-slate-400">
            <summary className="cursor-pointer font-semibold hover:text-slate-700 dark:hover:text-slate-200">
              API Endpoints (Development)
            </summary>
            <pre className="mt-3 p-3 bg-slate-900/50 dark:bg-slate-950 rounded overflow-x-auto text-green-400 text-xs">{`GET    /api/tasks                    - Fetch all tasks
POST   /api/tasks                    - Create new task
PATCH  /api/tasks/:id                - Update task
PATCH  /api/tasks/:id/complete       - Mark task complete
PATCH  /api/tasks/:id/snooze         - Snooze task
POST   /api/tasks/complete-bulk      - Complete multiple tasks
DELETE /api/tasks/:id                - Delete task
GET    /api/tasks/stats              - Get dashboard stats`}</pre>
          </details>
        </div>
      </div>

      {/* Global Styles for Custom Animations */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-3px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(3px);
          }
        }

        .animate-shake {
          animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) 2s infinite;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @supports (backdrop-filter: blur(1px)) {
          .backdrop-blur-xl {
            backdrop-filter: blur(12px);
          }
        }
      `}</style>
    </div>
  );
}