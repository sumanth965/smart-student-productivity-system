import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, BookOpen, Calendar, Check, CheckCircle2,
  Clock, Filter, LayoutGrid, List, Plus, Search,
  TrendingUp, Wind, X, ChevronRight, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import axios from '../lib/axios';
import { useTheme } from '../contexts/ThemeContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const resolveUserId = (u) => u?._id || u?.id || '';

const mapApiTask = (task, currentStudentId) => ({
  id: task._id,
  title: task.title,
  subject: task.subject,
  description: task.description,
  dueDate: new Date(task.dueDate),
  completed: task.status === 'Completed',
  priority: task.priority?.toLowerCase() || 'medium',
  sourceType: task.createdBy?._id === currentStudentId ? 'self' : 'teacher',
});

const getTaskState = (task) => {
  if (task.completed) return 'completed';
  const diff = task.dueDate.getTime() - Date.now();
  if (diff < 0) return 'overdue';
  if (diff <= 1000 * 60 * 60 * 24 * 3) return 'upcoming';
  return 'later';
};

const formatDueDate = (date) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);

const fmtCountdown = (dueDate) => {
  const diff = new Date(dueDate) - new Date();
  const abs = Math.abs(diff);
  const d = Math.floor(abs / 86400000);
  const h = Math.floor((abs % 86400000) / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const s = Math.floor((abs % 60000) / 1000);
  if (diff < 0) {
    if (d > 0) return { text: `${d}d ${h}h overdue`, overdue: true };
    if (h > 0) return { text: `${h}h ${m}m overdue`, overdue: true };
    return { text: `${m}m ${s}s overdue`, overdue: true };
  }
  if (d > 0) return { text: `${d}d ${h}h left`, overdue: false };
  if (h > 0) return { text: `${h}h ${m}m left`, overdue: false };
  return { text: `${m}m ${s}s left`, overdue: false };
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  high: { label: 'HIGH', color: '#EF4444', softBg: 'bg-red-50', softText: 'text-red-600', darkBg: 'bg-red-500/15', darkText: 'text-red-400', dot: 'bg-red-500' },
  medium: { label: 'MED', color: '#F59E0B', softBg: 'bg-amber-50', softText: 'text-amber-700', darkBg: 'bg-amber-500/15', darkText: 'text-amber-400', dot: 'bg-amber-500' },
  low: { label: 'LOW', color: '#10B981', softBg: 'bg-emerald-50', softText: 'text-emerald-700', darkBg: 'bg-emerald-500/15', darkText: 'text-emerald-400', dot: 'bg-emerald-500' },
};

const STATE_CFG = {
  overdue: { label: 'Overdue', Icon: AlertCircle, softBg: 'bg-red-50', softText: 'text-red-600', darkBg: 'bg-red-500/15', darkText: 'text-red-400' },
  upcoming: { label: 'Upcoming', Icon: Clock, softBg: 'bg-amber-50', softText: 'text-amber-700', darkBg: 'bg-amber-500/15', darkText: 'text-amber-400' },
  later: { label: 'Later', Icon: Calendar, softBg: 'bg-blue-50', softText: 'text-blue-700', darkBg: 'bg-blue-500/15', darkText: 'text-blue-400' },
  completed: { label: 'Done', Icon: CheckCircle2, softBg: 'bg-emerald-50', softText: 'text-emerald-700', darkBg: 'bg-emerald-500/15', darkText: 'text-emerald-400' },
};

const SUBJECT_COLORS = {
  EJAVA: '#F97316', AWT: '#A855F7', 'FSDD/ADSA': '#3B82F6',
  PCS: '#22C55E', SET: '#10B981', 'DW&DM': '#F43F5E',
  'WDR&P': '#F59E0B', 'DIP&PR': '#06B6D4', Japanese: '#EC4899',
};
const subjectColor = (s) => SUBJECT_COLORS[s] || '#64748B';

// ─── Countdown ────────────────────────────────────────────────────────────────
const Countdown = ({ dueDate }) => {
  const [state, setState] = useState(() => fmtCountdown(dueDate));
  useEffect(() => {
    const t = setInterval(() => setState(fmtCountdown(dueDate)), 1000);
    return () => clearInterval(t);
  }, [dueDate]);
  return (
    <span className={`font-mono text-xs font-bold tabular-nums tracking-tight ${state.overdue ? 'text-red-500' : 'text-sky-500'}`}>
      {state.text}
    </span>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, change, bgGradient, isDark, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className={`relative overflow-hidden rounded-2xl backdrop-blur-md p-6 shadow-xl ring-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/10 cursor-default
      ${isDark
        ? 'bg-slate-800/80 ring-slate-700/50 hover:bg-slate-800/90'
        : 'bg-white/80 ring-slate-200/50 hover:bg-white/95'}`}
  >
    {/* Gradient wash background */}
    <div className={`absolute inset-0 opacity-[0.07] ${bgGradient}`} style={{ pointerEvents: 'none' }} />

    <div className="relative z-10 flex items-start justify-between">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className={`mt-2 text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        {change && (
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-500">{change} this month</span>
          </div>
        )}
      </div>
      <div className={`rounded-2xl p-3.5 ${bgGradient} shadow-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </motion.div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ collapsed, setCollapsed, activeTab, setActiveTab, stats, isDark }) => {
  const items = [
    { key: 'all', label: 'All Tasks', Icon: BookOpen, badge: stats.total },
    { key: 'overdue', label: 'Overdue', Icon: AlertCircle, badge: stats.overdue },
    { key: 'upcoming', label: 'Upcoming', Icon: Clock, badge: stats.upcoming },
    { key: 'later', label: 'Later', Icon: Calendar, badge: null },
    { key: 'completed', label: 'Completed', Icon: CheckCircle2, badge: stats.completed },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 224 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className={`flex-shrink-0 flex flex-col h-full z-30 border-r transition-colors
        ${isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200/70'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl p-2 flex-shrink-0 shadow-lg shadow-blue-500/20">
          <Clock className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
            <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Deadlines</p>
            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Task Manager</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-hidden">
        {items.map(({ key, label, Icon: NavIcon, badge }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group
                ${active
                  ? isDark
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-blue-50 text-blue-700'
                  : isDark
                    ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full" />}
              <NavIcon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium flex-1 text-left truncate">{label}</span>
              )}
              {!collapsed && badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                  ${key === 'overdue' ? 'bg-red-500 text-white' : active ? 'bg-blue-500 text-white' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              {collapsed && badge > 0 && (
                <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${key === 'overdue' ? 'bg-red-500' : 'bg-blue-500'}`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse */}
      <div className={`px-2 pb-4 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all
            ${isDark ? 'text-slate-600 hover:text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        >
          <Filter className="h-3.5 w-3.5 flex-shrink-0" />
          {!collapsed && <span>{collapsed ? 'Expand' : 'Collapse'}</span>}
        </button>
      </div>
    </motion.aside>
  );
};

// ─── Add Task Modal ────────────────────────────────────────────────────────────
const AddTaskModal = ({ onClose, onAdd, isDark }) => {
  const subjects = Object.keys(SUBJECT_COLORS);
  const [form, setForm] = useState({ title: '', subject: subjects[0], priority: 'medium', dueDate: '', description: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handle = () => {
    if (!form.title.trim() || !form.dueDate) return;
    onAdd({ ...form, id: Date.now().toString(), completed: false, sourceType: 'self', dueDate: new Date(form.dueDate) });
    onClose();
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm outline-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-slate-700/60 ring-slate-600/60 text-white placeholder-slate-500' : 'bg-slate-50 ring-slate-200 text-slate-900 placeholder-slate-400'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.94, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 340 }}
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'
          }`}
      >
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>New Task</h2>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Add a deadline reminder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="What needs to be done?" className={inputClass} />
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Add details…"
              className={`${inputClass} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Subject</label>
              <select value={form.subject} onChange={e => set('subject', e.target.value)} className={inputClass}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Priority</label>
              <div className="grid grid-cols-3 gap-1">
                {['high', 'medium', 'low'].map(p => {
                  const cfg = PRIORITY_CFG[p];
                  const isActive = form.priority === p;
                  return (
                    <button key={p} onClick={() => set('priority', p)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                        ? p === 'high' ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                          : p === 'medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                            : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : isDark ? `${cfg.darkBg} ${cfg.darkText}` : `${cfg.softBg} ${cfg.softText}`
                        }`}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Due Date & Time *</label>
            <input type="datetime-local" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
              className={inputClass} style={{ colorScheme: isDark ? 'dark' : 'light' }} />
          </div>

          <button onClick={handle}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-blue-500/35 active:scale-[0.98]">
            <Plus className="h-4 w-4" /> Create Task
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Task Detail Panel ────────────────────────────────────────────────────────
const TaskDetailPanel = ({ task, onClose, onToggleComplete, onSnooze, onDelete, isDark }) => {
  if (!task) return null;
  const pri = PRIORITY_CFG[task.priority] || PRIORITY_CFG.medium;
  const state = getTaskState(task);
  const stCfg = STATE_CFG[state];
  const StateIcon = stCfg.Icon;
  const sCol = subjectColor(task.subject);

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className={`fixed right-0 top-0 h-full w-full sm:w-[380px] z-40 overflow-y-auto border-l shadow-2xl transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
    >
      <div className="h-1 bg-gradient-to-r from-blue-600 to-cyan-400" />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-lg"
              style={{ background: `linear-gradient(135deg,${sCol},${sCol}99)` }}>
              {task.subject.slice(0, 2)}
            </div>
            <div>
              <p className={`text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Task Detail</p>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{task.subject}</p>
            </div>
          </div>
          <button onClick={onClose}
            className={`p-2 rounded-xl transition-colors flex-shrink-0 ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title + description */}
        <div className={`rounded-2xl p-4 border ${isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
          <h2 className={`text-lg font-bold leading-snug ${task.completed ? 'line-through opacity-50' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {task.title}
          </h2>
          {task.description && (
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{task.description}</p>
          )}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: 'Subject',
              value: <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block" style={{ background: `${sCol}18`, color: sCol }}>{task.subject}</span>,
            },
            {
              label: 'Priority',
              value: <span className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${isDark ? `${pri.darkBg} ${pri.darkText}` : `${pri.softBg} ${pri.softText}`}`}>{pri.label}</span>,
            },
            {
              label: 'Status',
              value: <span className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block ${isDark ? `${stCfg.darkBg} ${stCfg.darkText}` : `${stCfg.softBg} ${stCfg.softText}`}`}>{stCfg.label}</span>,
            },
            {
              label: 'Source',
              value: <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg inline-block ${isDark ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{task.sourceType === 'self' ? 'Self' : 'Teacher'}</span>,
            },
          ].map(({ label, value }) => (
            <div key={label} className={`rounded-xl p-3.5 border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
              <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{label}</p>
              {value}
            </div>
          ))}
        </div>

        {/* Due date */}
        <div className={`rounded-xl p-4 border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
          <p className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Due Date</p>
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatDueDate(task.dueDate)}</p>
        </div>

        {/* Countdown */}
        <div className={`rounded-xl p-4 flex items-center gap-3.5 border ${state === 'overdue'
          ? isDark ? 'bg-red-500/10 border-red-500/25' : 'bg-red-50 border-red-100'
          : isDark ? 'bg-sky-500/10 border-sky-500/25' : 'bg-sky-50 border-sky-100'
          }`}>
          <div className={`rounded-xl p-2 ${state === 'overdue' ? 'bg-red-500/15' : 'bg-sky-500/15'}`}>
            <Clock className={`h-4 w-4 ${state === 'overdue' ? 'text-red-500' : 'text-sky-500'}`} />
          </div>
          <div>
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Time Remaining</p>
            <Countdown dueDate={task.dueDate} />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button onClick={() => { onToggleComplete(task.id); onClose(); }}
            className={`w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${task.completed
              ? 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 shadow-slate-500/20'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25'
              }`}>
            <CheckCircle2 className="h-4 w-4" />
            {task.completed ? 'Mark as Pending' : 'Mark as Complete'}
          </button>

          {!task.completed && (
            <button onClick={() => { onSnooze(task.id); onClose(); }}
              className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${isDark ? 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-700/80' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}>
              <Wind className="h-4 w-4" /> Snooze 1 Hour
            </button>
          )}

          <button onClick={() => { onDelete(task.id); onClose(); }}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${isDark ? 'border-red-500/25 text-red-400 hover:bg-red-500/10' : 'border-red-100 text-red-500 hover:bg-red-50'
              }`}>
            <X className="h-3.5 w-3.5" /> Delete Task
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onClick, onToggleComplete, onSnooze, isDark, viewMode }) => {
  const pri = PRIORITY_CFG[task.priority] || PRIORITY_CFG.medium;
  const state = getTaskState(task);
  const stCfg = STATE_CFG[state];
  const StateIcon = stCfg.Icon;
  const sCol = subjectColor(task.subject);
  const isDone = task.completed;
  const isOverdue = state === 'overdue';

  if (viewMode === 'list') {
    return (
      <motion.li
        layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        onClick={() => onClick(task)}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer group transition-all border ${isDark
          ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/90 hover:border-slate-600/60'
          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
          }`}
      >
        <button onClick={e => { e.stopPropagation(); onToggleComplete(task.id); }}
          className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all border-2 ${isDone ? 'bg-emerald-500 border-emerald-500' : isDark ? 'border-slate-600 hover:border-slate-400' : 'border-slate-300 hover:border-slate-400'
            }`}>
          {isDone && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
        </button>

        <span className="w-2 h-2 rounded-full flex-shrink-0 ring-2 ring-white/10" style={{ background: sCol }} />

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isDone ? 'line-through opacity-40' : isDark ? 'text-white' : 'text-slate-900'}`}>{task.title}</p>
          <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{task.subject}</p>
        </div>

        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${isDark ? `${stCfg.darkBg} ${stCfg.darkText}` : `${stCfg.softBg} ${stCfg.softText}`}`}>{stCfg.label}</span>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${isDark ? `${pri.darkBg} ${pri.darkText}` : `${pri.softBg} ${pri.softText}`}`}>{pri.label}</span>
        <Countdown dueDate={task.dueDate} />

        <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
      </motion.li>
    );
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.35)' : '0 16px 40px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.18 }}
      onClick={() => onClick(task)}
      className={`relative rounded-2xl cursor-pointer overflow-hidden transition-all border group ${isDone ? 'opacity-65' : ''
        } ${isOverdue && !isDone
          ? isDark ? 'bg-slate-800/80 border-red-500/30' : 'bg-white border-red-200/80'
          : isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-100'
        }`}
    >
      {/* Priority color stripe */}
      <div className="h-0.5" style={{ background: `linear-gradient(to right, ${PRIORITY_CFG[task.priority]?.color || '#64748B'}, ${sCol})` }} />

      {/* Subtle gradient wash tied to subject */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${sCol}, transparent 70%)` }} />

      {isOverdue && !isDone && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20" />
      )}

      <div className="relative p-4 space-y-3.5">
        {/* Subject + Priority row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-wide" style={{ background: `${sCol}15`, color: sCol }}>
            {task.subject}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${isDark ? `${pri.darkBg} ${pri.darkText}` : `${pri.softBg} ${pri.softText}`}`}>
            {pri.label}
          </span>
        </div>

        {/* Title */}
        <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${isDone ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {task.title}
        </h3>

        {task.description && (
          <p className={`text-xs line-clamp-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{task.description}</p>
        )}

        {/* Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg ${isDark ? `${stCfg.darkBg} ${stCfg.darkText}` : `${stCfg.softBg} ${stCfg.softText}`}`}>
            <StateIcon className="h-2.5 w-2.5" />{stCfg.label}
          </span>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${isDark ? 'bg-slate-700/60 text-slate-400' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
            {task.sourceType === 'self' ? 'Self' : 'Teacher'}
          </span>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <Countdown dueDate={task.dueDate} />
          <span className={`text-[10px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Action buttons */}
        {!isDone ? (
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button onClick={e => { e.stopPropagation(); onToggleComplete(task.id); }}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/20 transition-all active:scale-95">
              <Check className="h-3 w-3" strokeWidth={2.5} /> Done
            </button>
            <button onClick={e => { e.stopPropagation(); onSnooze(task.id); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all border active:scale-95 ${isDark ? 'bg-sky-500/10 border-sky-500/25 text-sky-400 hover:bg-sky-500/20' : 'bg-sky-50 border-sky-100 text-sky-600 hover:bg-sky-100'
                }`}>
              <Wind className="h-3 w-3" /> Snooze
            </button>
          </div>
        ) : (
          <button onClick={e => { e.stopPropagation(); onToggleComplete(task.id); }}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all border active:scale-95 ${isDark ? 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}>
            ↩ Mark Pending
          </button>
        )}
      </div>
    </motion.li>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ isDark }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
    {[...Array(8)].map((_, i) => (
      <motion.div key={i}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.1 }}
        className={`h-52 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/40' : 'bg-slate-50 border-slate-100'}`}
      />
    ))}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => (
  <AnimatePresence>
    {toast && (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.94 }}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl text-sm font-semibold text-white shadow-2xl pointer-events-none flex items-center gap-2.5 whitespace-nowrap ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25'
          : toast.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500 shadow-red-500/25'
            : 'bg-gradient-to-r from-sky-500 to-blue-500 shadow-sky-500/25'
          }`}>
        {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" />
          : toast.type === 'error' ? <X className="h-4 w-4" />
            : <Wind className="h-4 w-4" />}
        {toast.msg}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ label, Icon, gradient, count, isOverdue, isDark }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2.5">
      <div className={`bg-gradient-to-r ${gradient} p-2 rounded-xl shadow-lg`}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</h3>
      {isOverdue && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
    </div>
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${isDark ? 'bg-slate-800 border-slate-700/60 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
      {count} {count === 1 ? 'task' : 'tasks'}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DeadlineReminder() {
  const { isDark, setIsDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [toast, setToast] = useState(null);

  const fireToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const persisted = localStorage.getItem('student_user') || sessionStorage.getItem('student_user');
      if (!persisted) { setTasks([]); setError('Please log in to view your deadline reminders.'); return; }
      const parsed = JSON.parse(persisted);
      const studentId = resolveUserId(parsed);
      if (!studentId) { setTasks([]); setError('Unable to identify the student account. Please log in again.'); return; }
      const response = await axios.get(`/api/students/${studentId}/tasks`);
      const loaded = Array.isArray(response.data?.data)
        ? response.data.data.map(t => mapApiTask(t, studentId)) : [];
      setTasks(loaded);
    } catch (err) {
      console.error('Failed to load deadline reminders:', err);
      setError('Unable to fetch reminders from the server right now.');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    const handleRefresh = () => loadTasks();
    window.addEventListener('tasks:refresh', handleRefresh);
    window.addEventListener('focus', handleRefresh);
    return () => {
      window.removeEventListener('tasks:refresh', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [loadTasks]);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) setIsDark(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const summary = useMemo(() => ({
    total: tasks.length,
    overdue: tasks.filter(t => getTaskState(t) === 'overdue').length,
    upcoming: tasks.filter(t => getTaskState(t) === 'upcoming').length,
    completed: tasks.filter(t => t.completed).length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    const byTab = activeTab === 'all' ? tasks : tasks.filter(t => getTaskState(t) === activeTab);
    return byTab
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice().sort((a, b) => a.dueDate - b.dueDate);
  }, [activeTab, searchQuery, tasks]);

  const grouped = useMemo(() => {
    if (activeTab !== 'all') return null;
    const g = { overdue: [], upcoming: [], later: [], completed: [] };
    filteredTasks.forEach(t => { const s = getTaskState(t); g[s]?.push(t); });
    return g;
  }, [activeTab, filteredTasks]);

  const handleToggleComplete = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    const nowCompleted = !task?.completed;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: nowCompleted } : t));
    fireToast(nowCompleted ? 'Task completed!' : 'Task marked pending');
    try {
      await axios.put(`/api/tasks/${id}`, { status: nowCompleted ? 'Completed' : 'Pending' });
      window.dispatchEvent(new Event('tasks:refresh'));
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !nowCompleted } : t));
      fireToast('Failed to update task', 'error');
    }
  }, [tasks, fireToast]);

  const handleSnooze = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, dueDate: new Date(t.dueDate.getTime() + 3600000) } : t));
    fireToast('Snoozed for 1 hour', 'info');
  }, [fireToast]);

  const handleDelete = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    fireToast('Task deleted', 'error');
  }, [fireToast]);

  const handleAdd = useCallback((task) => {
    setTasks(prev => [task, ...prev]);
    fireToast('Task created!');
  }, [fireToast]);

  const handleCompleteAllOverdue = useCallback(() => {
    const ids = tasks.filter(t => getTaskState(t) === 'overdue').map(t => t.id);
    if (!ids.length) return;
    setTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, completed: true } : t));
    fireToast(`${ids.length} overdue tasks completed!`);
  }, [tasks, fireToast]);

  const sectionMeta = [
    { key: 'overdue', label: 'Overdue', Icon: AlertCircle, gradient: 'from-red-500 to-rose-500' },
    { key: 'upcoming', label: 'Upcoming', Icon: Clock, gradient: 'from-amber-500 to-orange-500' },
    { key: 'later', label: 'Later', Icon: Calendar, gradient: 'from-blue-600 to-cyan-500' },
    { key: 'completed', label: 'Completed', Icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
  ];

  const gridClass = viewMode === 'list'
    ? 'space-y-1.5'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3';

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0B0F1A]' : 'bg-slate-50/80'}`}>

      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.06] ${isDark ? 'bg-blue-500' : 'bg-blue-400'}`} />
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.05] ${isDark ? 'bg-cyan-500' : 'bg-cyan-400'}`} />
      </div>

      {/* Navbar */}
      <div className="flex-shrink-0 relative z-10">
        <DashboardNavbar
          isDark={isDark} setIsDark={setIsDark}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu}
        />
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileSidebar && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebar(false)}
              className="fixed inset-0 z-50 sm:hidden bg-black/60 backdrop-blur-sm" />
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <div className="hidden sm:flex flex-shrink-0">
          <Sidebar
            collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}
            activeTab={activeTab} setActiveTab={setActiveTab}
            stats={summary} isDark={isDark}
          />
        </div>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {mobileSidebar && (
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 h-full z-50 w-60 sm:hidden">
              <Sidebar collapsed={false} setCollapsed={() => { }}
                activeTab={activeTab} setActiveTab={t => { setActiveTab(t); setMobileSidebar(false); }}
                stats={summary} isDark={isDark} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Sub-topbar */}
          <div className={`flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 h-14 border-b transition-colors ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200/70'
            } backdrop-blur-md`}>

            <button onClick={() => setMobileSidebar(true)}
              className={`sm:hidden p-2 rounded-xl ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => <div key={i} className={`w-4 h-0.5 rounded ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`} />)}
              </div>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className={`h-3.5 w-3.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              <motion.h1 key={activeTab} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Deadline Reminders
              </motion.h1>
            </div>

            <div className="flex-1" />

            {/* Search */}
            <div className={`items-center gap-2 rounded-xl px-3 py-2 border hidden md:flex ${isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-slate-50 border-slate-200'
              }`}>
              <Search className={`h-3.5 w-3.5 flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tasks…"
                className={`bg-transparent border-none outline-none text-xs w-28 ${isDark ? 'text-white placeholder-slate-600' : 'text-slate-900 placeholder-slate-400'}`} />
            </div>

            {/* View toggle */}
            <div className={`hidden sm:flex items-center rounded-xl p-1 gap-0.5 border ${isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-slate-50 border-slate-200'
              }`}>
              {[{ mode: 'grid', Ic: LayoutGrid }, { mode: 'list', Ic: List }].map(({ mode, Ic }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === mode
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                    : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                  <Ic className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            {/* New Task button */}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Task</span>
            </motion.button>
          </div>

          {/* Scroll area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Page heading */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    Dashboard / Deadlines
                  </p>
                  <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Deadline Reminders
                  </h2>
                  <p className={`mt-1.5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Live task reminders synced from your dashboard. Updates automatically.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={BookOpen} label="Total Tasks" value={summary.total} bgGradient="bg-gradient-to-r from-blue-600 to-cyan-500" isDark={isDark} delay={0} />
              <StatCard icon={AlertCircle} label="Overdue" value={summary.overdue} bgGradient="bg-gradient-to-r from-red-500 to-rose-500" isDark={isDark} delay={0.07} />
              <StatCard icon={Clock} label="Due in 3 Days" value={summary.upcoming} bgGradient="bg-gradient-to-r from-amber-500 to-orange-500" isDark={isDark} delay={0.14} />
              <StatCard icon={CheckCircle2} label="Completed" value={summary.completed} bgGradient="bg-gradient-to-r from-emerald-500 to-teal-500" isDark={isDark} delay={0.21} />
            </div>

            {/* Overdue alert banner */}
            {summary.overdue > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 flex items-center gap-3 border ${isDark ? 'bg-red-500/8 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-700'
                  }`}>
                <div className="bg-red-500/15 rounded-xl p-2 flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {summary.overdue} overdue {summary.overdue === 1 ? 'task' : 'tasks'} need your attention
                  </p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-red-500/70' : 'text-red-500/80'}`}>
                    Use the sidebar to filter overdue tasks and prioritize accordingly.
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-default ${isDark ? 'bg-red-500/15 border-red-500/25 text-red-400' : 'bg-red-100 border-red-200 text-red-600'
                  }`}>
                  {summary.overdue} overdue
                </span>
              </motion.div>
            )}

            {/* Tasks content */}
            {isLoading ? (
              <Skeleton isDark={isDark} />
            ) : error ? (
              <div className={`rounded-2xl p-10 text-center border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                <div className="bg-red-500/10 rounded-2xl p-3.5 w-fit mx-auto mb-4">
                  <AlertCircle className="h-7 w-7 text-red-500" />
                </div>
                <p className={`text-sm font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Please check your connection or try again.</p>
              </div>
            ) : grouped ? (
              <div className="space-y-10">
                {sectionMeta.map(({ key, label, Icon: SIcon, gradient }) => {
                  const sec = grouped[key];
                  if (!sec || sec.length === 0) return null;
                  return (
                    <motion.section key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <SectionHeader label={label} Icon={SIcon} gradient={gradient} count={sec.length} isOverdue={key === 'overdue'} isDark={isDark} />

                      <ul className={`list-none p-0 m-0 ${gridClass}`}>
                        <AnimatePresence>
                          {sec.map(t => (
                            <TaskCard key={t.id} task={t} onClick={setSelectedTask}
                              onToggleComplete={handleToggleComplete} onSnooze={handleSnooze}
                              isDark={isDark} viewMode={viewMode} />
                          ))}
                        </AnimatePresence>
                      </ul>

                      {key === 'overdue' && sec.length > 1 && (
                        <button onClick={handleCompleteAllOverdue}
                          className={`mt-4 w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all active:scale-[0.99] ${isDark
                            ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            }`}>
                          <CheckCircle2 className="h-4 w-4" />
                          Mark All Overdue as Complete ({sec.length})
                        </button>
                      )}
                    </motion.section>
                  );
                })}

                {Object.values(grouped).every(g => g.length === 0) && (
                  <div className={`rounded-2xl p-14 text-center border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-500/20">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>All Clear!</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>You're fully caught up. Excellent work staying ahead of your deadlines.</p>
                  </div>
                )}
              </div>
            ) : (
              filteredTasks.length === 0 ? (
                <div className={`rounded-2xl p-14 text-center border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-100'}`}>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/20">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No tasks found</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Try adjusting your search query or filter.</p>
                </div>
              ) : (
                <ul className={`list-none p-0 m-0 ${gridClass}`}>
                  <AnimatePresence>
                    {filteredTasks.map(t => (
                      <TaskCard key={t.id} task={t} onClick={setSelectedTask}
                        onToggleComplete={handleToggleComplete} onSnooze={handleSnooze}
                        isDark={isDark} viewMode={viewMode} />
                    ))}
                  </AnimatePresence>
                </ul>
              )
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Panel */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)}
            onToggleComplete={handleToggleComplete} onSnooze={handleSnooze}
            onDelete={handleDelete} isDark={isDark} />
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={handleAdd} isDark={isDark} />}
      </AnimatePresence>

      {/* Toast */}
      <Toast toast={toast} />

      {/* Mobile FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
        onClick={() => setShowAdd(true)}
        className="sm:hidden fixed right-5 bottom-7 z-30 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-cyan-500">
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  );
}