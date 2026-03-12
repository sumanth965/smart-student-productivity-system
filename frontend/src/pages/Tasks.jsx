import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Plus, Search, Filter, Calendar, Clock, Flag, BookOpen, User,
    CheckCircle, Edit2, Trash2, AlertCircle, ChevronDown, X,
    GripVertical, Sparkles, Target, TrendingUp, MoreVertical
} from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import { calculatePriority, getDaysUntil, isOverdue } from '../components/dashboard/dashboardUtils';
import axios from '../lib/axios';

export default function Tasks() {
    const [isDark, setIsDark] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [tasks, setTasks] = useState({ teacher: [], personal: [] });
    const [filterType, setFilterType] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState('');

    // Load dark mode preference
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) setIsDark(JSON.parse(savedMode));
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDark));
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    // Load tasks from API
    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            const persistedUser = localStorage.getItem('student_user') || sessionStorage.getItem('student_user');

            if (!persistedUser) {
                setLoading(false);
                return;
            }

            const parsedUser = JSON.parse(persistedUser);
            const userId = parsedUser?._id || parsedUser?.id || '';
            setStudentId(userId);

            const response = await axios.get(`/api/students/${userId}/tasks`);
            const allTasks = Array.isArray(response.data?.data) ? response.data.data : [];

            const teacherTasks = allTasks
                .filter(task => task.createdBy?._id !== userId)
                .map(task => ({
                    id: task._id,
                    title: task.title,
                    subject: task.subject,
                    deadline: new Date(task.dueDate),
                    priority: task.priority?.toLowerCase() || calculatePriority(new Date(task.dueDate)),
                    completed: task.status === 'Completed',
                    description: task.description,
                    createdBy: task.createdBy?.name || 'Teacher',
                    classSection: task.classSection || 'General',
                }));

            const personalTasks = allTasks
                .filter(task => task.createdBy?._id === userId)
                .map(task => ({
                    id: task._id,
                    title: task.title,
                    subject: task.subject,
                    deadline: new Date(task.dueDate),
                    priority: task.priority?.toLowerCase() || calculatePriority(new Date(task.dueDate)),
                    completed: task.status === 'Completed',
                    description: task.description,
                    estimatedTime: '2h',
                }));

            setTasks({ teacher: teacherTasks, personal: personalTasks });
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        const filterTask = (task) => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.subject.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            switch (filterType) {
                case 'overdue':
                    return isOverdue(task.deadline, task.completed);
                case 'today':
                    return getDaysUntil(task.deadline) === 0 && !task.completed;
                case 'upcoming':
                    return getDaysUntil(task.deadline) > 0 && getDaysUntil(task.deadline) <= 7 && !task.completed;
                case 'completed':
                    return task.completed;
                default:
                    return true;
            }
        };

        return {
            teacher: tasks.teacher.filter(filterTask),
            personal: tasks.personal.filter(filterTask),
        };
    }, [tasks, searchQuery, filterType]);

    const handleToggleTask = async (taskId, type) => {
        const taskList = type === 'teacher' ? tasks.teacher : tasks.personal;
        const task = taskList.find(t => t.id === taskId);
        if (!task) return;

        const nextCompleted = !task.completed;

        setTasks(prev => ({
            ...prev,
            [type]: prev[type].map(t => t.id === taskId ? { ...t, completed: nextCompleted } : t)
        }));

        try {
            await axios.put(`/api/tasks/${taskId}`, {
                status: nextCompleted ? 'Completed' : 'Pending',
                ...(nextCompleted && studentId ? { completedBy: studentId } : {}),
            });
        } catch (error) {
            console.error('Failed to update task:', error);
            setTasks(prev => ({
                ...prev,
                [type]: prev[type].map(t => t.id === taskId ? { ...t, completed: !nextCompleted } : t)
            }));
        }
    };

    const handleDeleteTask = (taskId, type) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setTasks(prev => ({
                ...prev,
                [type]: prev[type].filter(t => t.id !== taskId)
            }));
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
            <DashboardNavbar
                isDark={isDark}
                setIsDark={setIsDark}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showMobileMenu={showMobileMenu}
                setShowMobileMenu={setShowMobileMenu}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                My Tasks
                            </h1>
                            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Manage your assignments and personal tasks
                            </p>
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-95"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Add Task</span>
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className={`mb-6 p-4 rounded-xl backdrop-blur-md shadow-lg ring-1 ${isDark ? 'bg-slate-800/80 ring-slate-700/50' : 'bg-white/80 ring-slate-200/50'}`}>
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                <Search className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Filter Dropdown */}
                        <div className="flex gap-2">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium appearance-none cursor-pointer transition-all ${isDark ? 'bg-slate-700/50 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                            >
                                <option value="all">All Tasks</option>
                                <option value="overdue">Overdue</option>
                                <option value="today">Due Today</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={`h-48 rounded-xl animate-pulse ${isDark ? 'bg-slate-800/50' : 'bg-slate-200/50'}`} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Teacher Assigned Tasks - Takes 2 columns */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                                    <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Teacher Assigned Tasks
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {filteredTasks.teacher.length} task{filteredTasks.teacher.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {filteredTasks.teacher.length === 0 ? (
                                <EmptyState isDark={isDark} message="No teacher assigned tasks" />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredTasks.teacher.map(task => (
                                        <TeacherTaskCard
                                            key={task.id}
                                            task={task}
                                            isDark={isDark}
                                            onToggle={() => handleToggleTask(task.id, 'teacher')}
                                            onClick={() => setSelectedTask(task)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Personal Tasks - Takes 1 column */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        My Personal Tasks
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {filteredTasks.personal.length} task{filteredTasks.personal.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {filteredTasks.personal.length === 0 ? (
                                <EmptyState isDark={isDark} message="No personal tasks" />
                            ) : (
                                <div className="space-y-3">
                                    {filteredTasks.personal.map(task => (
                                        <PersonalTaskCard
                                            key={task.id}
                                            task={task}
                                            isDark={isDark}
                                            onToggle={() => handleToggleTask(task.id, 'personal')}
                                            onDelete={() => handleDeleteTask(task.id, 'personal')}
                                            onClick={() => setSelectedTask(task)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    isDark={isDark}
                    onClose={() => setSelectedTask(null)}
                />
            )}

            {/* Floating Action Button (Mobile) */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-6 right-6 lg:hidden p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all active:scale-95 z-40"
            >
                <Plus className="h-6 w-6" />
            </button>
        </div>
    );
}

// Teacher Task Card Component
function TeacherTaskCard({ task, isDark, onToggle, onClick }) {
    const daysUntil = getDaysUntil(task.deadline);
    const overdue = isOverdue(task.deadline, task.completed);
    const actualPriority = calculatePriority(task.deadline);

    const priorityColors = {
        high: isDark
            ? 'from-red-950/40 to-rose-950/40 border-red-800/50'
            : 'from-red-50 to-rose-50 border-red-200',
        medium: isDark
            ? 'from-amber-950/40 to-orange-950/40 border-amber-800/50'
            : 'from-amber-50 to-orange-50 border-amber-200',
        low: isDark
            ? 'from-emerald-950/40 to-teal-950/40 border-emerald-800/50'
            : 'from-emerald-50 to-teal-50 border-emerald-200',
    };

    return (
        <div
            onClick={onClick}
            className={`group relative rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer
        border-l-4 hover:shadow-xl hover:scale-102 active:scale-98 p-5
        ${overdue ? 'border-l-red-500' : 'border-l-transparent'}
        ring-1 bg-gradient-to-br ${priorityColors[actualPriority]}
        ${isDark ? 'ring-slate-700/30 hover:ring-slate-600/50' : 'ring-slate-200/30 hover:ring-slate-300/50'}
      `}
        >
            {/* Priority Badge */}
            <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
          ${actualPriority === 'high' ? isDark ? 'bg-red-900/60 text-red-300' : 'bg-red-100 text-red-700' : ''}
          ${actualPriority === 'medium' ? isDark ? 'bg-amber-900/60 text-amber-300' : 'bg-amber-100 text-amber-700' : ''}
          ${actualPriority === 'low' ? isDark ? 'bg-emerald-900/60 text-emerald-300' : 'bg-emerald-100 text-emerald-700' : ''}
        `}>
                    <Flag className="h-3 w-3" />
                    {actualPriority.toUpperCase()}
                </span>

                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className="transition-transform hover:scale-110"
                >
                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all
            ${task.completed
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-600'
                            : isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-300 bg-white/50'
                        }
          `}>
                        {task.completed && <CheckCircle className="h-4 w-4 text-white" />}
                    </div>
                </button>
            </div>

            {/* Title */}
            <h3 className={`font-bold text-base mb-2 line-clamp-2 ${task.completed ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {task.title}
            </h3>

            {/* Metadata */}
            <div className="space-y-2 text-sm">
                <div className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">{task.subject}</span>
                    <span className="text-xs opacity-60">• {task.classSection}</span>
                </div>

                <div className={`flex items-center gap-2 ${overdue ? 'text-red-500 font-semibold' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {overdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    <span className="text-xs">
                        {overdue ? 'Overdue' : `Due: ${task.deadline.toLocaleDateString()} • ${daysUntil}d left`}
                    </span>
                </div>
            </div>

            {/* Description Preview */}
            {task.description && (
                <p className={`mt-3 text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    "{task.description}"
                </p>
            )}
        </div>
    );
}

// Personal Task Card Component
function PersonalTaskCard({ task, isDark, onToggle, onDelete, onClick }) {
    const daysUntil = getDaysUntil(task.deadline);
    const overdue = isOverdue(task.deadline, task.completed);

    return (
        <div
            onClick={onClick}
            className={`group relative rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer
        border-l-4 hover:shadow-lg hover:scale-102 active:scale-98 p-4
        ${overdue ? 'border-l-red-500' : 'border-l-blue-500'}
        ring-1
        ${isDark ? 'bg-slate-800/60 ring-slate-700/30 hover:ring-slate-600/50' : 'bg-white/60 ring-slate-200/30 hover:ring-slate-300/50'}
      `}
        >
            <div className="flex items-start gap-3">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className="mt-0.5 transition-transform hover:scale-110"
                >
                    <div className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all
            ${task.completed
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-600'
                            : isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-300 bg-white/50'
                        }
          `}>
                        {task.completed && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                    </div>
                </button>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm mb-2 line-clamp-2 ${task.completed ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {task.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                            {task.subject}
                        </span>

                        <span className={`flex items-center gap-1 ${overdue ? 'text-red-500' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <Clock className="h-3 w-3" />
                            {overdue ? 'Overdue' : `${daysUntil}d`}
                        </span>

                        {task.estimatedTime && (
                            <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                <Target className="h-3 w-3" />
                                {task.estimatedTime}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all
            ${isDark ? 'hover:bg-red-900/30 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'}
          `}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({ isDark, message }) {
    return (
        <div className={`rounded-xl p-12 text-center ${isDark ? 'bg-slate-800/40' : 'bg-white/40'}`}>
            <div className={`inline-flex p-4 rounded-full mb-4 ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                <Sparkles className={`h-8 w-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {message}
            </p>
        </div>
    );
}

// Task Detail Modal
function TaskDetailModal({ task, isDark, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 bg-black/50">
            <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100'}`}>
                <div className={`p-6 border-b ${isDark ? 'border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950' : 'border-slate-100 bg-gradient-to-r from-slate-50 to-white'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {task.title}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                    {task.subject}
                                </span>
                                {task.classSection && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                        {task.classSection}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Deadline</p>
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {task.deadline.toLocaleDateString()} {task.deadline.toLocaleTimeString()}
                            </p>
                        </div>
                        <div>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Priority</p>
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {calculatePriority(task.deadline).toUpperCase()}
                            </p>
                        </div>
                    </div>

                    {task.description && (
                        <div>
                            <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Description</p>
                            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {task.description}
                            </p>
                        </div>
                    )}

                    {task.createdBy && (
                        <div>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Assigned By</p>
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {task.createdBy}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
