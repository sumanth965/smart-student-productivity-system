import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Icons (inline SVG components to avoid import issues) ─────────────────────
const Icon = ({ d, size = 16, stroke = 'currentColor', fill = 'none', strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  clock:       'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 5v5l3 3',
  alert:       'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  check:       'M20 6 9 17l-5-5',
  checkCircle: ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4 12 14.01l-3-3'],
  chevLeft:    'M15 18l-6-6 6-6',
  chevRight:   'M9 18l6-6-6-6',
  chevDown:    'M6 9l6 6 6-6',
  plus:        'M12 5v14M5 12h14',
  x:           'M18 6 6 18M6 6l12 12',
  wind:        ['M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2'],
  trending:    'M23 6l-9.5 9.5-5-5L1 18',
  flag:        'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  calendar:    ['M3 4h18v18H3zM16 2v4M8 2v4M3 10h18'],
  zap:         'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  bar:         ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  home:        ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  bookmark:    'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
  settings:    ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'],
  bell:        ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'],
  user:        ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  search:      ['M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M21 21l-4.35-4.35'],
  edit:        ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z'],
  trash:       ['M3 6h18', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', 'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2'],
  circle:      'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0',
  filter:      ['M22 3H2l8 9.46V19l4 2v-8.54z'],
  moon:        'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  sun:         ['M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42', 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z'],
  grid:        ['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],
  list:        ['M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'],
  more:        ['M12 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M12 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'],
  logout:      ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5M21 12H9'],
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const now = new Date();
const d = (h) => new Date(now.getTime() + h * 3600000);

const MOCK_TASKS = [
  { id: '1', title: 'Submit EJAVA Assignment 3', subject: 'EJAVA', dueDate: d(-5), priority: 'high', status: 'pending', description: 'Complete the multithreading lab and submit via portal', tags: ['lab', 'coding'] },
  { id: '2', title: 'AWT GUI Project Phase 2', subject: 'AWT', dueDate: d(-2), priority: 'high', status: 'pending', description: 'Implement event listeners and layout managers', tags: ['project'] },
  { id: '3', title: 'FSDD Assignment 5', subject: 'FSDD/ADSA', dueDate: d(2), priority: 'medium', status: 'pending', description: 'Dynamic programming problems set', tags: ['assignment'] },
  { id: '4', title: 'PCS Lab Report', subject: 'PCS', dueDate: d(4), priority: 'low', status: 'pending', description: 'Write up the processor simulation results', tags: ['report', 'lab'] },
  { id: '5', title: 'DW&DM Mini Project', subject: 'DW&DM', dueDate: d(6), priority: 'high', status: 'pending', description: 'Data warehousing schema design and ETL pipeline', tags: ['project'] },
  { id: '6', title: 'WDR&P Research Paper', subject: 'WDR&P', dueDate: d(20), priority: 'medium', status: 'pending', description: 'Literature review on web data retrieval techniques', tags: ['research', 'paper'] },
  { id: '7', title: 'Japanese Speaking Test', subject: 'Japanese', dueDate: d(30), priority: 'low', status: 'pending', description: 'Prepare vocabulary and grammar for N4 topics', tags: ['exam'] },
  { id: '8', title: 'SET Practical Exam', subject: 'SET', dueDate: d(48), priority: 'high', status: 'pending', description: 'Software Engineering Tools practical assessment', tags: ['exam'] },
  { id: '9', title: 'DIP Image Processing Task', subject: 'DIP&PR', dueDate: d(72), priority: 'medium', status: 'completed', description: 'Edge detection and histogram equalization', tags: ['lab'] },
  { id: '10', title: 'AWT Mid Semester Exam', subject: 'AWT', dueDate: d(-48), priority: 'high', status: 'completed', description: 'Chapters 1-6 comprehensive examination', tags: ['exam'] },
];

const SUBJECT_PALETTE = {
  EJAVA: { bg: '#FFF7ED', text: '#C2410C', border: '#FB923C', dot: '#F97316' },
  AWT: { bg: '#FAF5FF', text: '#7E22CE', border: '#C084FC', dot: '#A855F7' },
  'FSDD/ADSA': { bg: '#EFF6FF', text: '#1D4ED8', border: '#60A5FA', dot: '#3B82F6' },
  PCS: { bg: '#F0FDF4', text: '#15803D', border: '#4ADE80', dot: '#22C55E' },
  SET: { bg: '#ECFDF5', text: '#047857', border: '#34D399', dot: '#10B981' },
  'DW&DM': { bg: '#FFF1F2', text: '#BE123C', border: '#FB7185', dot: '#F43F5E' },
  'WDR&P': { bg: '#FFFBEB', text: '#B45309', border: '#FBBF24', dot: '#F59E0B' },
  'DIP&PR': { bg: '#ECFEFF', text: '#0E7490', border: '#22D3EE', dot: '#06B6D4' },
  Japanese: { bg: '#FDF2F8', text: '#9D174D', border: '#F472B6', dot: '#EC4899' },
};
const getSubPalette = (s) => SUBJECT_PALETTE[s] || { bg: '#F8FAFC', text: '#475569', border: '#94A3B8', dot: '#64748B' };

const PRIORITY = {
  high:   { label: 'HIGH',   color: '#EF4444', bg: '#FEF2F2', glow: 'rgba(239,68,68,0.15)' },
  medium: { label: 'MED',    color: '#F59E0B', bg: '#FFFBEB', glow: 'rgba(245,158,11,0.15)' },
  low:    { label: 'LOW',    color: '#3B82F6', bg: '#EFF6FF', glow: 'rgba(59,130,246,0.15)' },
};

// ─── Utilities ─────────────────────────────────────────────────────────────────
const fmtTime = (d) => {
  const diff = new Date(d) - new Date();
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hrs = Math.floor((abs % 86400000) / 3600000);
  const mins = Math.floor((abs % 3600000) / 60000);
  const secs = Math.floor((abs % 60000) / 1000);
  if (diff < 0) {
    if (days > 0) return { text: `${days}d ${hrs}h overdue`, overdue: true };
    if (hrs > 0) return { text: `${hrs}h ${mins}m overdue`, overdue: true };
    return { text: `${mins}m ${secs}s overdue`, overdue: true };
  }
  if (days > 0) return { text: `${days}d ${hrs}h`, overdue: false };
  if (hrs > 0) return { text: `${hrs}h ${mins}m`, overdue: false };
  return { text: `${mins}m ${secs}s`, overdue: false };
};

const getCategory = (dueDate) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dueDate); due.setHours(0,0,0,0);
  const diff = Math.ceil((due - today) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 7) return 'week';
  return 'future';
};

// ─── Countdown ─────────────────────────────────────────────────────────────────
const Countdown = ({ dueDate }) => {
  const [state, setState] = useState(() => fmtTime(dueDate));
  useEffect(() => {
    const t = setInterval(() => setState(fmtTime(dueDate)), 1000);
    return () => clearInterval(t);
  }, [dueDate]);
  return (
    <span className={`font-mono text-xs font-bold tabular-nums ${state.overdue ? 'text-red-500' : 'text-indigo-600'}`}>
      {state.text}
    </span>
  );
};

// ─── Add Task Modal ────────────────────────────────────────────────────────────
const AddTaskModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ title: '', subject: 'EJAVA', priority: 'medium', dueDate: '', description: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const subjects = Object.keys(SUBJECT_PALETTE);

  const handle = () => {
    if (!form.title || !form.dueDate) return;
    onAdd({ ...form, id: Date.now().toString(), status: 'pending', dueDate: new Date(form.dueDate), tags: [] });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 10, opacity: 0 }} transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#0F172A,#1E293B)', border: '1px solid rgba(148,163,184,0.12)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
              <Icon d={icons.plus} size={16} stroke="#fff" />
            </div>
            <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Clash Display',sans-serif" }}>New Task</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10">
            <Icon d={icons.x} size={16} stroke="#94A3B8" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">Task Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="What needs to be done?"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(148,163,184,0.15)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'} />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Add details..."
              rows={2} className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(148,163,184,0.15)', fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
          </div>

          {/* Subject + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">Subject</label>
              <select value={form.subject} onChange={e => set('subject', e.target.value)}
                className="w-full px-3 py-3 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(148,163,184,0.15)' }}>
                {subjects.map(s => <option key={s} value={s} style={{ background: '#1E293B' }}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">Priority</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['high','medium','low'].map(p => (
                  <button key={p} onClick={() => set('priority', p)}
                    className="py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: form.priority === p ? PRIORITY[p].color : 'rgba(255,255,255,0.06)',
                      color: form.priority === p ? '#fff' : '#94A3B8',
                      border: `1px solid ${form.priority === p ? PRIORITY[p].color : 'rgba(148,163,184,0.15)'}`,
                    }}>{PRIORITY[p].label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">Due Date & Time *</label>
            <input type="datetime-local" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(148,163,184,0.15)', colorScheme: 'dark' }} />
          </div>

          {/* CTA */}
          <button onClick={handle}
            className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 mt-2"
            style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
            <Icon d={icons.plus} size={16} stroke="#fff" />
            Create Task
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Task Detail Panel ─────────────────────────────────────────────────────────
const TaskDetailPanel = ({ task, onClose, onComplete, onSnooze, onDelete }) => {
  if (!task) return null;
  const pri = PRIORITY[task.priority] || PRIORITY.medium;
  const sub = getSubPalette(task.subject);
  const cat = getCategory(task.dueDate);

  return (
    <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-full sm:w-96 z-40 overflow-y-auto"
      style={{ background: 'linear-gradient(160deg,#0F172A,#1A2744)', borderLeft: '1px solid rgba(148,163,184,0.1)', boxShadow: '-20px 0 60px rgba(0,0,0,0.4)' }}>

      {/* Glow accent */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right,${pri.color},${sub.dot})` }} />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: sub.bg }}>
            <span className="text-sm font-black" style={{ color: sub.text }}>{task.subject.slice(0,2)}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors mt-1 flex-shrink-0">
            <Icon d={icons.x} size={16} stroke="#94A3B8" />
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white leading-tight mb-2" style={{ fontFamily: "'Clash Display',sans-serif" }}>{task.title}</h2>
          {task.description && <p className="text-sm text-slate-400 leading-relaxed">{task.description}</p>}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">Subject</p>
            <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: sub.bg, color: sub.text }}>{task.subject}</span>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">Priority</p>
            <span className="text-xs font-bold px-2 py-1 rounded-lg text-white" style={{ background: pri.color }}>{pri.label}</span>
          </div>
        </div>

        {/* Due Date */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">Due Date</p>
          <p className="text-sm font-semibold text-white">
            {new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{new Date(task.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        {/* Countdown */}
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: cat === 'overdue' ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)', border: `1px solid ${cat === 'overdue' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: cat === 'overdue' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)' }}>
            <Icon d={icons.clock} size={16} stroke={cat === 'overdue' ? '#EF4444' : '#6366F1'} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Time Remaining</p>
            <Countdown dueDate={task.dueDate} />
          </div>
        </div>

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        {task.status !== 'completed' ? (
          <div className="space-y-2.5">
            <button onClick={() => { onComplete(task.id); onClose(); }}
              className="w-full py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
              <Icon d={icons.checkCircle} size={16} stroke="#fff" />
              Mark Complete
            </button>
            <button onClick={() => { onSnooze(task.id); onClose(); }}
              className="w-full py-3 rounded-xl text-slate-300 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Icon d={icons.wind} size={16} stroke="currentColor" />
              Snooze 1 Hour
            </button>
          </div>
        ) : (
          <button onClick={() => { onComplete(task.id); onClose(); }}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Icon d={icons.circle} size={16} stroke="currentColor" />
            Mark Pending
          </button>
        )}

        <button onClick={() => { onDelete(task.id); onClose(); }}
          className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-red-500/10"
          style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}>
          <Icon d={icons.trash} size={14} stroke="currentColor" />
          Delete Task
        </button>
      </div>
    </motion.div>
  );
};

// ─── Task Card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onClick, onComplete, onSnooze, viewMode }) => {
  const pri = PRIORITY[task.priority] || PRIORITY.medium;
  const sub = getSubPalette(task.subject);
  const isOverdue = getCategory(task.dueDate) === 'overdue';
  const isCompleted = task.status === 'completed';

  if (viewMode === 'list') {
    return (
      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
        onClick={() => onClick(task)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer group transition-all"
        style={{ background: isCompleted ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.07)'}` }}>

        <button onClick={e => { e.stopPropagation(); onComplete(task.id); }}
          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
          style={{ background: isCompleted ? '#10B981' : 'transparent', border: `2px solid ${isCompleted ? '#10B981' : '#475569'}` }}>
          {isCompleted && <Icon d={icons.check} size={10} stroke="#fff" strokeWidth={3} />}
        </button>

        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sub.dot }} />

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</p>
        </div>

        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: pri.bg, color: pri.color }}>{pri.label}</span>
        <Countdown dueDate={task.dueDate} />
        <span className="text-xs text-slate-500 hidden sm:block flex-shrink-0">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </motion.div>
    );
  }

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
      whileHover={{ y: -3, boxShadow: isOverdue ? `0 16px 40px rgba(239,68,68,0.2)` : `0 16px 40px rgba(99,102,241,0.2)` }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(task)}
      className="relative rounded-2xl cursor-pointer overflow-hidden"
      style={{
        background: isCompleted ? 'rgba(16,185,129,0.04)' : 'linear-gradient(145deg,rgba(30,41,59,0.9),rgba(15,23,42,0.95))',
        border: `1px solid ${isOverdue && !isCompleted ? 'rgba(239,68,68,0.3)' : isCompleted ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isOverdue && !isCompleted ? '0 4px 20px rgba(239,68,68,0.1)' : '0 4px 16px rgba(0,0,0,0.3)',
      }}>

      {/* Priority stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(to right,${pri.color},${sub.dot})` }} />

      {/* Overdue badge */}
      {isOverdue && !isCompleted && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}

      <div className={`p-4 space-y-3 ${isCompleted ? 'opacity-60' : ''}`}>
        {/* Subject + priority */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: sub.bg, color: sub.text }}>{task.subject}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: pri.bg, color: pri.color }}>{pri.label}</span>
        </div>

        {/* Title */}
        <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {task.title}
        </h3>

        {task.description && <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">{task.description}</p>}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {task.tags.slice(0,2).map(t => (
              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>#{t}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Countdown dueDate={task.dueDate} />
          <span className="text-[10px] text-slate-500">
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Quick actions */}
        {!isCompleted && (
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={e => { e.stopPropagation(); onComplete(task.id); }}
              className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-emerald-400 text-xs font-semibold transition-all hover:bg-emerald-400/10"
              style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Icon d={icons.check} size={11} stroke="currentColor" strokeWidth={2.5} />Done
            </button>
            <button onClick={e => { e.stopPropagation(); onSnooze(task.id); }}
              className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-blue-400 text-xs font-semibold transition-all hover:bg-blue-400/10"
              style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <Icon d={icons.wind} size={11} stroke="currentColor" />Snooze
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = ({ collapsed, setCollapsed, activeView, setActiveView, stats }) => {
  const navItems = [
    { id: 'dashboard', icon: icons.home,     label: 'Dashboard' },
    { id: 'overdue',   icon: icons.alert,    label: 'Overdue',   badge: stats.overdue },
    { id: 'today',     icon: icons.zap,      label: 'Today',     badge: stats.today },
    { id: 'upcoming',  icon: icons.calendar, label: 'Upcoming' },
    { id: 'completed', icon: icons.checkCircle, label: 'Completed' },
  ];

  return (
    <motion.aside animate={{ width: collapsed ? 64 : 220 }} transition={{ type: 'spring', damping: 25, stiffness: 280 }}
      className="flex-shrink-0 flex flex-col h-full relative z-30"
      style={{ background: 'linear-gradient(180deg,#0B1120,#0F172A)', borderRight: '1px solid rgba(148,163,184,0.08)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
          <Icon d={icons.clock} size={16} stroke="#fff" />
        </div>
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-white font-black text-sm tracking-tight whitespace-nowrap" style={{ fontFamily: "'Clash Display',sans-serif" }}>
            DeadlineOS
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(item => {
          const active = activeView === item.id;
          return (
            <button key={item.id} onClick={() => setActiveView(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group"
              style={{
                background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
              }}>
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <Icon d={item.icon} size={16} stroke={active ? '#818CF8' : '#64748B'} />
              </div>
              {!collapsed && (
                <span className="text-sm font-semibold flex-1 text-left truncate" style={{ color: active ? '#C7D2FE' : '#64748B', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center text-white"
                  style={{ background: item.id === 'overdue' ? '#EF4444' : '#6366F1' }}>
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge > 0 && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-1" style={{ borderTop: '1px solid rgba(148,163,184,0.08)', paddingTop: 12 }}>
        {[{ icon: icons.bell, label: 'Notifications' }, { icon: icons.settings, label: 'Settings' }].map(item => (
          <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
            <Icon d={item.icon} size={16} stroke="#475569" />
            {!collapsed && <span className="text-sm text-slate-500 font-medium" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{item.label}</span>}
          </button>
        ))}
        <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <Icon d={collapsed ? icons.chevRight : icons.chevLeft} size={16} stroke="#475569" />
          {!collapsed && <span className="text-xs text-slate-600 font-medium">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
};

// ─── Progress Ring ─────────────────────────────────────────────────────────────
const ProgressRing = ({ value, max, color, size = 56 }) => {
  const r = 22; const c = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
        transform="rotate(-90 28 28)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
};

// ─── Stats Widget ──────────────────────────────────────────────────────────────
const StatWidget = ({ label, value, total, color, icon, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
    className="relative rounded-2xl p-4 overflow-hidden"
    style={{ background: 'linear-gradient(145deg,rgba(30,41,59,0.8),rgba(15,23,42,0.9))', border: '1px solid rgba(255,255,255,0.07)' }}>
    <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top right,${color},transparent 60%)` }} />
    <div className="relative flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <ProgressRing value={value} max={total} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon d={icon} size={14} stroke={color} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black leading-none" style={{ color, fontFamily: "'Clash Display',sans-serif" }}>{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: `${color}80` }}>{label}</p>
      </div>
    </div>
  </motion.div>
);

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function DeadlineTracker() {
  const [tasks, setTasks] = useState(MOCK_TASKS.map(t => ({ ...t, dueDate: new Date(t.dueDate) })));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleComplete = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
    showToast('Task updated!');
  }, [showToast]);

  const handleSnooze = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, dueDate: new Date(t.dueDate.getTime() + 3600000) } : t));
    showToast('Snoozed 1 hour', 'info');
  }, [showToast]);

  const handleDelete = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('Task deleted', 'error');
  }, [showToast]);

  const handleAdd = useCallback((task) => {
    setTasks(prev => [task, ...prev]);
    showToast('Task created!');
  }, [showToast]);

  const stats = useMemo(() => {
    const active = tasks.filter(t => t.status !== 'completed');
    return {
      total: tasks.length,
      overdue: active.filter(t => getCategory(t.dueDate) === 'overdue').length,
      today: active.filter(t => getCategory(t.dueDate) === 'today').length,
      upcoming: active.filter(t => ['tomorrow','week','future'].includes(getCategory(t.dueDate))).length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let list = tasks;

    // View filter
    if (activeView === 'overdue') list = list.filter(t => getCategory(t.dueDate) === 'overdue' && t.status !== 'completed');
    else if (activeView === 'today') list = list.filter(t => getCategory(t.dueDate) === 'today' && t.status !== 'completed');
    else if (activeView === 'upcoming') list = list.filter(t => ['tomorrow','week','future'].includes(getCategory(t.dueDate)) && t.status !== 'completed');
    else if (activeView === 'completed') list = list.filter(t => t.status === 'completed');
    else {
      // dashboard - tab filter
      if (filter === 'overdue') list = list.filter(t => getCategory(t.dueDate) === 'overdue' && t.status !== 'completed');
      else if (filter === 'today') list = list.filter(t => getCategory(t.dueDate) === 'today' && t.status !== 'completed');
      else if (filter === 'week') list = list.filter(t => ['today','tomorrow','week'].includes(getCategory(t.dueDate)) && t.status !== 'completed');
      else if (filter === 'completed') list = list.filter(t => t.status === 'completed');
    }

    // Search
    if (search) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));

    return list;
  }, [tasks, activeView, filter, search]);

  // Group by category for dashboard
  const grouped = useMemo(() => {
    if (activeView !== 'dashboard') return null;
    const groups = { overdue: [], today: [], tomorrow: [], week: [], future: [], completed: [] };
    filteredTasks.forEach(t => {
      const cat = t.status === 'completed' ? 'completed' : getCategory(t.dueDate);
      groups[cat]?.push(t);
    });
    return groups;
  }, [filteredTasks, activeView]);

  const sectionMeta = [
    { key: 'overdue',   label: 'Overdue',    icon: icons.alert,    color: '#EF4444' },
    { key: 'today',     label: 'Today',      icon: icons.zap,      color: '#F59E0B' },
    { key: 'tomorrow',  label: 'Tomorrow',   icon: icons.calendar, color: '#A855F7' },
    { key: 'week',      label: 'This Week',  icon: icons.flag,     color: '#3B82F6' },
    { key: 'future',    label: 'Upcoming',   icon: icons.trending, color: '#6366F1' },
    { key: 'completed', label: 'Completed',  icon: icons.checkCircle, color: '#10B981' },
  ];

  const FILTER_TABS = ['all','overdue','today','week','completed'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @font-face { font-family:'Clash Display'; src:url('https://fonts.cdnfonts.com/css/clash-display') format('truetype'); }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 4px; }
        .scrollbar-none { scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.5); }
      `}</style>

      <div className="flex h-screen overflow-hidden" style={{ background: '#060C1A', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileSidebar && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebar(false)}
              className="fixed inset-0 z-50 bg-black/60 sm:hidden" />
          )}
        </AnimatePresence>

        {/* Sidebar — hidden on mobile, shown as overlay */}
        <div className={`hidden sm:flex`}>
          <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}
            activeView={activeView} setActiveView={(v) => { setActiveView(v); setFilter('all'); }}
            stats={stats} />
        </div>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {mobileSidebar && (
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 h-full z-50 w-56 sm:hidden">
              <Sidebar collapsed={false} setCollapsed={() => {}} activeView={activeView}
                setActiveView={(v) => { setActiveView(v); setMobileSidebar(false); }} stats={stats} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Topbar */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 h-16"
            style={{ background: 'rgba(6,12,26,0.95)', borderBottom: '1px solid rgba(148,163,184,0.08)', backdropFilter: 'blur(12px)' }}>

            {/* Mobile menu btn */}
            <button onClick={() => setMobileSidebar(true)} className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="space-y-1">
                {[...Array(3)].map((_,i) => <div key={i} className="w-4 h-0.5 bg-slate-400" />)}
              </div>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-sm relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Icon d={icons.search} size={14} stroke="#64748B" />
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-slate-300 placeholder-slate-600 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }} />
            </div>

            <div className="flex-1" />

            {/* View toggle */}
            <div className="hidden sm:flex items-center rounded-lg p-0.5 gap-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {[{ mode: 'grid', icon: icons.grid }, { mode: 'list', icon: icons.list }].map(({ mode, icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
                  style={{ background: viewMode === mode ? 'rgba(99,102,241,0.2)' : 'transparent' }}>
                  <Icon d={icon} size={13} stroke={viewMode === mode ? '#818CF8' : '#64748B'} />
                </button>
              ))}
            </div>

            {/* Add task */}
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-white text-xs font-bold transition-all"
              style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
              <Icon d={icons.plus} size={14} stroke="#fff" />
              <span className="hidden sm:inline">New Task</span>
            </motion.button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1E40AF,#3B82F6)' }}>
              <Icon d={icons.user} size={14} stroke="#fff" />
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">

            {/* Page title */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <motion.h1 key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Clash Display',sans-serif" }}>
                  {activeView === 'dashboard' ? 'Dashboard' :
                   activeView === 'overdue' ? 'Overdue Tasks' :
                   activeView === 'today' ? "Today's Tasks" :
                   activeView === 'upcoming' ? 'Upcoming' : 'Completed'}
                </motion.h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Stats summary */}
              <div className="hidden md:flex items-center gap-1.5 text-xs">
                {[
                  { label: 'overdue', val: stats.overdue, color: '#EF4444' },
                  { label: 'today',   val: stats.today,   color: '#F59E0B' },
                  { label: 'done',    val: stats.completed, color: '#10B981' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="font-bold" style={{ color }}>{val}</span>
                    <span className="text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats widgets — dashboard only */}
            {activeView === 'dashboard' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatWidget label="Overdue" value={stats.overdue} total={stats.total} color="#EF4444" icon={icons.alert} delay={0} />
                <StatWidget label="Today" value={stats.today} total={stats.total} color="#F59E0B" icon={icons.zap} delay={0.06} />
                <StatWidget label="Upcoming" value={stats.upcoming} total={stats.total} color="#6366F1" icon={icons.calendar} delay={0.12} />
                <StatWidget label="Completed" value={stats.completed} total={stats.total} color="#10B981" icon={icons.checkCircle} delay={0.18} />
              </div>
            )}

            {/* Filter tabs — dashboard only */}
            {activeView === 'dashboard' && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {FILTER_TABS.map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0"
                    style={{
                      background: filter === f ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                      color: filter === f ? '#C7D2FE' : '#64748B',
                      border: `1px solid ${filter === f ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === 'overdue' && stats.overdue > 0 && (
                      <span className="ml-1.5 px-1 rounded-full text-[9px] font-black bg-red-500 text-white">{stats.overdue}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Task grid — grouped (dashboard) */}
            {activeView === 'dashboard' && grouped && filter === 'all' ? (
              <div className="space-y-8">
                {sectionMeta.map(({ key, label, icon, color }) => {
                  const sec = grouped[key];
                  if (!sec || sec.length === 0) return null;
                  return (
                    <motion.section key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                      {/* Section header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                            <Icon d={icon} size={15} stroke={color} />
                          </div>
                          <h2 className="text-sm font-black uppercase tracking-widest" style={{ color, fontFamily: "'Clash Display',sans-serif" }}>{label}</h2>
                          {key === 'overdue' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                          {sec.length} {sec.length === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>

                      <div className={viewMode === 'list' ? 'space-y-1.5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'}>
                        <AnimatePresence>
                          {sec.map(t => (
                            <TaskCard key={t.id} task={t} onClick={setSelectedTask}
                              onComplete={handleComplete} onSnooze={handleSnooze} viewMode={viewMode} />
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Complete all overdue */}
                      {key === 'overdue' && sec.length > 1 && (
                        <button onClick={() => sec.forEach(t => handleComplete(t.id))}
                          className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                          style={{ background: 'rgba(16,185,129,0.07)', color: '#34D399', border: '1px solid rgba(16,185,129,0.15)' }}>
                          <Icon d={icons.checkCircle} size={14} stroke="currentColor" />
                          Complete All Overdue ({sec.length})
                        </button>
                      )}
                    </motion.section>
                  );
                })}
                {Object.values(grouped).every(g => g.length === 0) && (
                  <div className="flex flex-col items-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(16,185,129,0.1)' }}>
                      <Icon d={icons.checkCircle} size={28} stroke="#10B981" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Clash Display',sans-serif" }}>All Clear!</h3>
                    <p className="text-sm text-slate-500">You're all caught up. Great work!</p>
                  </div>
                )}
              </div>
            ) : (
              // Flat list (filtered or non-dashboard views)
              <div>
                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <Icon d={icons.checkCircle} size={24} stroke="#6366F1" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Nothing here</h3>
                    <p className="text-sm text-slate-500">No tasks match your current filter.</p>
                  </div>
                ) : (
                  <div className={viewMode === 'list' ? 'space-y-1.5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'}>
                    <AnimatePresence>
                      {filteredTasks.map(t => (
                        <TaskCard key={t.id} task={t} onClick={setSelectedTask}
                          onComplete={handleComplete} onSnooze={handleSnooze} viewMode={viewMode} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Task Detail Panel */}
        <AnimatePresence>
          {selectedTask && (
            <TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)}
              onComplete={handleComplete} onSnooze={handleSnooze} onDelete={handleDelete} />
          )}
        </AnimatePresence>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-2xl flex items-center gap-2 pointer-events-none"
              style={{
                background: toast.type === 'success' ? 'linear-gradient(135deg,#10B981,#059669)' : toast.type === 'error' ? 'linear-gradient(135deg,#EF4444,#DC2626)' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}>
              <Icon d={toast.type === 'success' ? icons.check : toast.type === 'error' ? icons.x : icons.wind} size={14} stroke="#fff" />
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating add button — mobile */}
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          onClick={() => setShowAdd(true)}
          className="sm:hidden fixed right-5 bottom-7 z-30 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 8px 32px rgba(99,102,241,0.5)' }}>
          <Icon d={icons.plus} size={22} stroke="#fff" />
        </motion.button>
      </div>
    </>
  );
}