import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import {
  Plus, Trash2, CheckCircle, AlertCircle, TrendingUp, Clock, BookOpen, Menu, X, Moon, Sun, LogOut, Settings, Filter, Search,  ChevronDown,  Calendar,  Zap,  Brain,  Award,  User,
  Bell,
  MoreVertical,
} from 'lucide-react';

// ============================================================================
// Mock Data & Utilities
// ============================================================================


const MOCK_TASKS = [
  {
    id: 1,
    title: 'Complete Mathematics Assignment',
    subject: 'Mathematics',
    deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
    priority: 'high',
    completed: false,
    description: 'Chapters 5-7 integration problems',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: 'Physics Lab Report',
    subject: 'Physics',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    priority: 'high',
    completed: false,
    description: 'Oscillations experiment analysis',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: 'Essay on Modern Literature',
    subject: 'English',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    completed: true,
    description: '2000 words on contemporary authors',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    title: 'Chemistry Quiz Preparation',
    subject: 'Chemistry',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    priority: 'high',
    completed: false,
    description: 'Organic chemistry periodic table review',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 5,
    title: 'History Project Presentation',
    subject: 'History',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    completed: false,
    description: 'World War II era research slides',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 6,
    title: 'Programming Project - Database',
    subject: 'Computer Science',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    completed: false,
    description: 'Build student management system',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 7,
    title: 'Biology Exam Study',
    subject: 'Biology',
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    priority: 'low',
    completed: false,
    description: 'Genetics and evolution chapters',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 8,
    title: 'Art Portfolio Submission',
    subject: 'Art',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    priority: 'high',
    completed: true,
    description: '5 digital artwork pieces',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
];

// Rule-based AI priority calculation
const calculatePriority = (deadline) => {
  const now = new Date();
  const diffMs = deadline - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) return 'high';
  if (diffHours < 168) return 'medium'; // 7 days
  return 'low';
};

const isOverdue = (deadline, completed) => {
  return !completed && new Date() > deadline;
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getDaysUntil = (deadline) => {
  const diffMs = deadline - new Date();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
};

// ============================================================================
// Stat Card Component
// ============================================================================

const StatCard = ({ icon: Icon, label, value, change, bgGradient, isDark }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md p-6 shadow-2xl ring-1 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20 ${isDark
        ? 'bg-slate-800/80 ring-slate-700/50 hover:bg-slate-800/90'
        : 'bg-white/80 ring-slate-200/50 hover:bg-white/90'
        }`}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 opacity-10 ${bgGradient}`}
        style={{ pointerEvents: 'none' }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {label}
          </p>
          <p
            className={`mt-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >
            {value}
          </p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">
                {change} this month
              </span>
            </div>
          )}
        </div>
        <div
          className={`rounded-xl p-3 ${bgGradient}`}
          style={{ opacity: 0.2 }}
        >
          <Icon className="h-6 w-6 text-red-900" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Task Item Component
// ============================================================================

const TaskItem = ({ task, onToggle, onDelete, isDark }) => {
  const daysUntil = getDaysUntil(task.deadline);
  const isOverdueTask = isOverdue(task.deadline, task.completed);
  const actualPriority = calculatePriority(task.deadline);

  const priorityColor = {
    high: isDark ? 'bg-red-900/30 text-red-400 border-red-700/50' : 'bg-red-50 text-red-700 border-red-200',
    medium: isDark ? 'bg-amber-900/30 text-amber-400 border-amber-700/50' : 'bg-amber-50 text-amber-700 border-amber-200',
    low: isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const subjectColor = {
    Mathematics: isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700',
    Physics: isDark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700',
    English: isDark ? 'bg-pink-900/40 text-pink-300' : 'bg-pink-100 text-pink-700',
    Chemistry: isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700',
    History: isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700',
    'Computer Science': isDark ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
    Biology: isDark ? 'bg-cyan-900/40 text-cyan-300' : 'bg-cyan-100 text-cyan-700',
    Art: isDark ? 'bg-rose-900/40 text-rose-300' : 'bg-rose-100 text-rose-700',
  };

  return (
    <div
      className={`group rounded-xl backdrop-blur-md p-4 shadow-lg ring-1 transition-all duration-300 hover:shadow-blue-500/15 ${isDark
        ? 'bg-slate-800/60 ring-slate-700/50 hover:bg-slate-800/80'
        : 'bg-white/60 ring-slate-200/40 hover:bg-white/80'
        } ${isOverdueTask ? (isDark ? 'border-l-4 border-red-500' : 'border-l-4 border-red-500') : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            className="mt-1 flex-shrink-0 focus:outline-none"
            aria-label={`Toggle completion for ${task.title}`}
          >
            <div
              className={`h-5 w-5 rounded-md border-2 transition-all duration-200 ${task.completed
                ? 'border-emerald-500 bg-emerald-500/20'
                : isDark
                  ? 'border-slate-600 hover:border-blue-500'
                  : 'border-slate-300 hover:border-blue-500'
                }`}
            >
              {task.completed && (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              )}
            </div>
          </button>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <h4
              className={`font-semibold line-clamp-1 ${task.completed
                ? isDark
                  ? 'line-through text-slate-500'
                  : 'line-through text-slate-400'
                : isDark
                  ? 'text-white'
                  : 'text-slate-900'
                }`}
            >
              {task.title}
            </h4>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${subjectColor[task.subject] ||
                  (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700')
                  }`}
              >
                {task.subject}
              </span>
              <span
                className={`inline-block rounded-full border px-2 py-1 text-xs font-semibold ${priorityColor[actualPriority]
                  }`}
              >
                {actualPriority}
              </span>
              <span
                className={`text-xs ${isOverdueTask
                  ? 'font-bold text-red-500'
                  : isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
                  }`}
              >
                {isOverdueTask ? '⚠️ Overdue' : `${daysUntil}d left`}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => onDelete(task.id)}
          className={`flex-shrink-0 rounded-lg p-2 transition-all duration-200 hover:scale-110 ${isDark
            ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400'
            : 'hover:bg-red-50 text-slate-400 hover:text-red-600'
            }`}
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// AI Insights Panel
// ============================================================================

const AIInsightsPanel = ({ tasks, isDark }) => {
  const highPriorityTodayCount = tasks.filter(
    (t) =>
      !t.completed &&
      calculatePriority(t.deadline) === 'high' &&
      getDaysUntil(t.deadline) === 0
  ).length;

  const overdueTasks = tasks.filter((t) => isOverdue(t.deadline, t.completed));
  const completed = tasks.filter((t) => t.completed).length;
  const productivity = Math.round((completed / tasks.length) * 100);

  return (
    <div
      className={`rounded-2xl backdrop-blur-md p-6 shadow-2xl ring-1 ${isDark
        ? 'bg-gradient-to-br from-slate-800/80 to-blue-900/40 ring-blue-700/30'
        : 'bg-gradient-to-br from-white/80 to-blue-50/80 ring-blue-200/30'
        }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-blue-500" />
        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
          AI-Powered Insights
        </h3>
      </div>

      <div className="space-y-3">
        {highPriorityTodayCount > 0 && (
          <div
            className={`rounded-lg border-l-4 border-red-500 p-3 ${isDark ? 'bg-red-900/20' : 'bg-red-50'
              }`}
          >
            <p className={`text-sm font-semibold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              ⚡ {highPriorityTodayCount} high-priority task{highPriorityTodayCount > 1 ? 's' : ''} due TODAY
            </p>
          </div>
        )}

        {overdueTasks.length > 0 && (
          <div
            className={`rounded-lg border-l-4 border-orange-500 p-3 ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'
              }`}
          >
            <p className={`text-sm font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
              ⚠️ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''} - Complete ASAP!
            </p>
          </div>
        )}

        <div
          className={`rounded-lg border-l-4 border-emerald-500 p-3 ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'
            }`}
        >
          <p className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
            ✨ Productivity: {productivity}% - Keep the momentum!
          </p>
        </div>

        <div
          className={`rounded-lg border-l-4 border-blue-500 p-3 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'
            }`}
        >
          <p className={`text-sm font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            💡 Tip: Focus on high-priority tasks first for maximum impact
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Add Task Modal
// ============================================================================

const AddTaskModal = ({ isOpen, onClose, onAdd, isDark }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Mathematics',
    deadline: '',
    priority: 'medium',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) {
      alert('Please fill in title and deadline');
      return;
    }

    onAdd({
      id: Date.now(),
      ...formData,
      deadline: new Date(formData.deadline),
      completed: false,
      createdAt: new Date(),
    });

    setFormData({
      title: '',
      subject: 'Mathematics',
      deadline: '',
      priority: 'medium',
      description: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl ${isDark
          ? 'bg-gradient-to-br from-slate-900 to-blue-900'
          : 'bg-gradient-to-br from-white to-blue-50'
          }`}
      >
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 hover:bg-slate-200/20"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <h2
            className={`mb-6 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Create New Task
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className={`mb-2 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Task Title
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Complete Math Assignment"
                className={`w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                  ? 'border-slate-700 bg-slate-800/50 text-white placeholder-slate-500'
                  : 'border-slate-200 bg-white/50 text-slate-900 placeholder-slate-400'
                  }`}
              />
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className={`mb-2 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Subject
              </label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                  ? 'border-slate-700 bg-slate-800/50 text-white'
                  : 'border-slate-200 bg-white/50 text-slate-900'
                  }`}
              >
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
                <option>English</option>
                <option>History</option>
                <option>Computer Science</option>
                <option>Art</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label
                htmlFor="deadline"
                className={`mb-2 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Deadline
              </label>
              <input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={`w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                  ? 'border-slate-700 bg-slate-800/50 text-white'
                  : 'border-slate-200 bg-white/50 text-slate-900'
                  }`}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className={`mb-2 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add task details..."
                rows="3"
                className={`w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                  ? 'border-slate-700 bg-slate-800/50 text-white placeholder-slate-500'
                  : 'border-slate-200 bg-white/50 text-slate-900 placeholder-slate-400'
                  }`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 rounded-lg px-4 py-2 font-semibold transition-all ${isDark
                  ? 'hover:bg-slate-700/50 text-slate-300'
                  : 'hover:bg-slate-100 text-slate-700'
                  }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-2 font-semibold text-white transition-all hover:scale-105 active:scale-95"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Dashboard Component
// ============================================================================

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [filter, setFilter] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist dark mode to localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setIsDark(JSON.parse(savedMode));
    }
    // Console log for MERN API integration
    console.log('[MERN Integration] Dashboard mounted - Ready for API calls');
    console.log('[API Hook] GET /api/tasks - Fetch all user tasks');
    console.log('[API Hook] GET /api/user - Fetch user profile data');
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Task CRUD Operations
  const handleAddTask = useCallback((newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    setShowAddModal(false);
    // Console log for API integration
    console.log('[API Hook] POST /api/tasks - Create new task', newTask);
  }, []);

  const handleToggleTask = useCallback((taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    // Console log for API integration
    console.log('[API Hook] PATCH /api/tasks/:id - Update task completion status');
  }, []);

  const handleDeleteTask = useCallback((taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      // Console log for API integration
      console.log('[API Hook] DELETE /api/tasks/:id - Delete task with id:', taskId);
    }
  }, []);

  // Filter tasks based on selected filter
  const getFilteredTasks = () => {
    let filtered = tasks;

    // Apply filter
    if (filter === 'pending') {
      filtered = filtered.filter((t) => !t.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter((t) => t.completed);
    } else if (filter === 'overdue') {
      filtered = filtered.filter((t) => isOverdue(t.deadline, t.completed));
    } else if (filter === 'high-priority') {
      filtered = filtered.filter(
        (t) => !t.completed && calculatePriority(t.deadline) === 'high'
      );
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const recentTasks = filteredTasks.slice(0, 5);

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);
  const pendingPercentage = 100 - completionPercentage;
  const productivity = Math.round((completedTasks / totalTasks) * 100);
  const productivityChange = '+12%';

  // Chart data
  const priorityData = [
    {
      name: 'High',
      value: tasks.filter((t) => !t.completed && calculatePriority(t.deadline) === 'high').length,
    },
    {
      name: 'Medium',
      value: tasks.filter((t) => !t.completed && calculatePriority(t.deadline) === 'medium').length,
    },
    {
      name: 'Low',
      value: tasks.filter((t) => !t.completed && calculatePriority(t.deadline) === 'low').length,
    },
  ];

  const deadlineData = [
    {
      name: 'Overdue',
      count: tasks.filter((t) => isOverdue(t.deadline, t.completed)).length,
    },
    {
      name: 'Critical (< 24h)',
      count: tasks.filter((t) => !t.completed && getDaysUntil(t.deadline) <= 1).length,
    },
    {
      name: 'Upcoming (< 7d)',
      count: tasks.filter((t) => !t.completed && getDaysUntil(t.deadline) <= 7).length,
    },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div
      className={`min-h-screen ${isDark
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 to-blue-50'
        }`}
    >
      {/* ========== NAVBAR ========== */}
      <nav
        className={`sticky top-0 z-40 backdrop-blur-md shadow-lg ring-1 ${isDark
          ? 'bg-slate-900/80 ring-slate-700/50'
          : 'bg-white/80 ring-slate-200/50'
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg p-2">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1
                className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'
                  } hidden sm:block`}
              >
                StudyFlow
              </h1>
            </div>

            {/* Date - Hidden on mobile */}
            <div
              className={`hidden sm:block text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
            >
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Search - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 bg-slate-200/30 dark:bg-slate-700/30 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-32"
                />
              </div>

              {/* Notifications */}
              <button
                className={`relative rounded-lg p-2 transition-all hover:scale-110 ${isDark
                  ? 'hover:bg-slate-800 text-slate-400'
                  : 'hover:bg-slate-100 text-slate-600'
                  }`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`rounded-lg p-2 transition-all hover:scale-110 ${isDark
                  ? 'hover:bg-slate-800 text-slate-400'
                  : 'hover:bg-slate-100 text-slate-600'
                  }`}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Profile Dropdown - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`md:hidden rounded-lg p-2 ${isDark
                  ? 'hover:bg-slate-800 text-slate-400'
                  : 'hover:bg-slate-100 text-slate-600'
                  }`}
                aria-label="Toggle menu"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========== MAIN CONTENT ========== */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >
            Welcome back! 👋
          </h1>
          <p
            className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
          >
            Track your academic progress and manage tasks efficiently
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Total Tasks"
            value={totalTasks}
            bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
            isDark={isDark}
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={`${completedTasks}/${totalTasks}`}
            change={`${completionPercentage}%`}
            bgGradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            isDark={isDark}
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={`${pendingTasks}/${totalTasks}`}
            change={`${pendingPercentage}%`}
            bgGradient="bg-gradient-to-br from-amber-500 to-orange-600"
            isDark={isDark}
          />
          <StatCard
            icon={Award}
            label="Productivity Score"
            value={`${productivity}%`}
            change={productivityChange}
            bgGradient="bg-gradient-to-br from-purple-500 to-pink-600"
            isDark={isDark}
          />
        </div>

        {/* Charts and Tasks Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Priority Distribution Chart */}
            <div
              className={`rounded-2xl backdrop-blur-md p-6 shadow-2xl ring-1 ${isDark
                ? 'bg-slate-800/80 ring-slate-700/50'
                : 'bg-white/80 ring-slate-200/50'
                }`}
            >
              <h3
                className={`mb-4 font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'
                  }`}
              >
                📊 Task Priority Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Deadline Status Chart */}
            <div
              className={`rounded-2xl backdrop-blur-md p-6 shadow-2xl ring-1 ${isDark
                ? 'bg-slate-800/80 ring-slate-700/50'
                : 'bg-white/80 ring-slate-200/50'
                }`}
            >
              <h3
                className={`mb-4 font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'
                  }`}
              >
                ⏰ Deadline Status
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deadlineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#475569' : '#e2e8f0'}
                  />
                  <XAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="lg:col-span-1">
            <AIInsightsPanel tasks={tasks} isDark={isDark} />
          </div>
        </div>

        {/* Recent Tasks Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-3">
            <div
              className={`rounded-2xl backdrop-blur-md p-6 shadow-2xl ring-1 ${isDark
                ? 'bg-slate-800/80 ring-slate-700/50'
                : 'bg-white/80 ring-slate-200/50'
                }`}
            >
              {/* Header with Actions */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3
                  className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'
                    }`}
                >
                  📋 Recent Tasks
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-2 font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    aria-label="Add new task"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Task</span>
                  </button>
                  {/* Filter Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpen(!open)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${isDark
                        ? 'hover:bg-slate-700/50 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      aria-label="Filter tasks"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>

                      {/* Arrow Rotate */}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <div
                      className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl ring-1 z-50 transform transition-all duration-200 origin-top ${open
                        ? 'scale-100 opacity-100'
                        : 'scale-95 opacity-0 pointer-events-none'
                        } ${isDark
                          ? 'bg-slate-800 ring-slate-700'
                          : 'bg-white ring-slate-200'
                        }`}
                    >
                      {[
                        { label: 'All Tasks', value: 'all' },
                        { label: 'Pending', value: 'pending' },
                        { label: 'Completed', value: 'completed' },
                        { label: 'Overdue', value: 'overdue' },
                        { label: 'High Priority', value: 'high-priority' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilter(option.value);
                            setOpen(false); // Close after click
                          }}
                          className={`block w-full px-4 py-2 text-left text-sm transition-all ${filter === option.value
                            ? isDark
                              ? 'bg-blue-900/50 text-blue-300'
                              : 'bg-blue-50 text-blue-700'
                            : isDark
                              ? 'text-slate-300 hover:bg-slate-700/50'
                              : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Search */}
              <div className="mb-4 md:hidden">
                <div className="flex items-center gap-2 bg-slate-200/30 dark:bg-slate-700/30 rounded-lg px-3 py-2">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full"
                  />
                </div>
              </div>

              {/* Tasks List */}
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      isDark={isDark}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className={`h-12 w-12 mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                  <p
                    className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                  >
                    {searchQuery
                      ? 'No tasks matching your search'
                      : 'No tasks to display'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ========== ADD TASK MODAL ========== */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
        isDark={isDark}
      />

      {/* ========== Footer ========== */}
      <footer
        className={`border-t py-8 ${isDark
          ? 'border-slate-700/50 bg-slate-900/50'
          : 'border-slate-200/50 bg-white/30'
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p
            className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            Smart Student Productivity System © 2024. Build with ❤️ for academic success.
          </p>
        </div>
      </footer>
    </div>
  );
}