import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Plus, Search, Calendar, Clock, Flag, BookOpen, User,
    CheckCircle, Trash2, AlertCircle, X, Sparkles, Target,
    ListFilter, LayoutGrid, LayoutList, ChevronRight, TrendingUp,
    CalendarDays, CheckCheck, AlertTriangle, Timer
} from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import AddTaskModal from '../components/dashboard/AddTaskModal';
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
    const [viewMode, setViewMode] = useState('grid');
    const [activeTab, setActiveTab] = useState('all');

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

    // Calculate statistics
    const stats = useMemo(() => {
        const allTasks = [...tasks.teacher, ...tasks.personal];
        const total = allTasks.length;
        const completed = allTasks.filter(t => t.completed).length;
        const overdue = allTasks.filter(t => isOverdue(t.deadline, t.completed)).length;
        const dueToday = allTasks.filter(t => getDaysUntil(t.deadline) === 0 && !t.completed).length;
        const upcoming = allTasks.filter(t => getDaysUntil(t.deadline) > 0 && getDaysUntil(t.deadline) <= 7 && !t.completed).length;

        return { total, completed, overdue, dueToday, upcoming, pending: total - completed };
    }, [tasks]);

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

    const handleAddTask = async (newTask) => {
        if (!studentId) {
            alert('Unable to identify the current student. Please log in again.');
            return false;
        }

        try {
            const response = await axios.post(`/api/students/${studentId}/tasks`, {
                title: newTask.title,
                description: newTask.description || 'Self assigned task',
                subject: newTask.subject,
                dueDate: newTask.deadline,
                priority: (newTask.priority || 'medium').charAt(0).toUpperCase() + (newTask.priority || 'medium').slice(1),
            });

            if (response.data?.data) {
                loadTasks();
            }

            setShowAddModal(false);
            return true;
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Unable to save task. Please try again.');
            return false;
        }
    };

    const filterOptions = [
        { id: 'all', label: 'All Tasks', icon: LayoutGrid, count: stats.total },
        { id: 'today', label: 'Due Today', icon: CalendarDays, count: stats.dueToday },
        { id: 'upcoming', label: 'Upcoming', icon: Timer, count: stats.upcoming },
        { id: 'overdue', label: 'Overdue', icon: AlertTriangle, count: stats.overdue },
        { id: 'completed', label: 'Completed', icon: CheckCheck, count: stats.completed },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <DashboardNavbar
                isDark={isDark}
                setIsDark={setIsDark}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showMobileMenu={showMobileMenu}
                setShowMobileMenu={setShowMobileMenu}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Task Manager
                            </h1>
                            <p className={`mt-2 text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Organize and track your assignments and personal tasks
                            </p>
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-[0.98]"
                        >
                            <Plus className="h-5 w-5" />
                            <span>New Task</span>
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        isDark={isDark}
                        icon={Target}
                        label="Total Tasks"
                        value={stats.total}
                        color="blue"
                    />
                    <StatCard
                        isDark={isDark}
                        icon={CheckCircle}
                        label="Completed"
                        value={stats.completed}
                        color="emerald"
                    />
                    <StatCard
                        isDark={isDark}
                        icon={AlertTriangle}
                        label="Overdue"
                        value={stats.overdue}
                        color="red"
                    />
                    <StatCard
                        isDark={isDark}
                        icon={TrendingUp}
                        label="Progress"
                        value={stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'}
                        color="amber"
                    />
                </div>

                {/* Filter Tabs & Search */}
                <div className={`mb-6 p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Filter Tabs */}
                        <div className="flex-1 flex flex-wrap gap-2">
                            {filterOptions.map((option) => {
                                const Icon = option.icon;
                                const isActive = filterType === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setFilterType(option.id)}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : isDark
                                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{option.label}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive
                                            ? 'bg-white/20 text-white'
                                            : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                            {option.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search & View Toggle */}
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg flex-1 lg:flex-initial lg:w-64 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <Search className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`flex-1 bg-transparent border-none outline-none text-sm ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                                />
                            </div>

                            <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                                        ? isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm'
                                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                        ? isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm'
                                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    <LayoutList className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="space-y-6">
                        <LoadingSkeleton isDark={isDark} />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Teacher Assigned Tasks Section */}
                        <TaskSection
                            isDark={isDark}
                            title="Teacher Assigned Tasks"
                            subtitle="Assignments from your instructors"
                            icon={BookOpen}
                            iconColor="from-rose-500 to-orange-500"
                            tasks={filteredTasks.teacher}
                            viewMode={viewMode}
                            type="teacher"
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                            onClick={setSelectedTask}
                        />

                        {/* Personal Tasks Section */}
                        <TaskSection
                            isDark={isDark}
                            title="Personal Tasks"
                            subtitle="Your self-created tasks and goals"
                            icon={User}
                            iconColor="from-blue-500 to-cyan-500"
                            tasks={filteredTasks.personal}
                            viewMode={viewMode}
                            type="personal"
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                            onClick={setSelectedTask}
                            showDelete
                        />
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

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddTask}
                isDark={isDark}
            />

            {/* Floating Action Button (Mobile) */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-6 right-6 lg:hidden p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-2xl shadow-blue-600/40 transition-all active:scale-95 z-40"
            >
                <Plus className="h-6 w-6" />
            </button>
        </div>
    );
}

// Statistics Card Component
function StatCard({ isDark, icon: Icon, label, value, color }) {
    const colorClasses = {
        blue: {
            bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
            icon: 'text-blue-500',
            border: isDark ? 'border-blue-500/20' : 'border-blue-100',
        },
        emerald: {
            bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
            icon: 'text-emerald-500',
            border: isDark ? 'border-emerald-500/20' : 'border-emerald-100',
        },
        red: {
            bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
            icon: 'text-red-500',
            border: isDark ? 'border-red-500/20' : 'border-red-100',
        },
        amber: {
            bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
            icon: 'text-amber-500',
            border: isDark ? 'border-amber-500/20' : 'border-amber-100',
        },
    };

    const colors = colorClasses[color];

    return (
        <div className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>
                <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                </div>
            </div>
        </div>
    );
}

// Task Section Component
function TaskSection({ isDark, title, subtitle, icon: Icon, iconColor, tasks, viewMode, type, onToggle, onDelete, onClick, showDelete }) {
    return (
        <div>
            <div className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconColor}`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {title}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {subtitle} • {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {tasks.length === 0 ? (
                <EmptyState isDark={isDark} message={`No ${title.toLowerCase()}`} />
            ) : (
                <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-3'
                }>
                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            isDark={isDark}
                            viewMode={viewMode}
                            type={type}
                            onToggle={() => onToggle(task.id, type)}
                            onDelete={showDelete ? () => onDelete(task.id, type) : null}
                            onClick={() => onClick(task)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Task Card Component
function TaskCard({ task, isDark, viewMode, type, onToggle, onDelete, onClick }) {
    const daysUntil = getDaysUntil(task.deadline);
    const overdue = isOverdue(task.deadline, task.completed);
    const actualPriority = calculatePriority(task.deadline);

    const priorityConfig = {
        high: {
            bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
            text: isDark ? 'text-red-400' : 'text-red-600',
            border: isDark ? 'border-red-500/30' : 'border-red-200',
        },
        medium: {
            bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
            text: isDark ? 'text-amber-400' : 'text-amber-600',
            border: isDark ? 'border-amber-500/30' : 'border-amber-200',
        },
        low: {
            bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
            text: isDark ? 'text-emerald-400' : 'text-emerald-600',
            border: isDark ? 'border-emerald-500/30' : 'border-emerald-200',
        },
    };

    const priority = priorityConfig[actualPriority];

    if (viewMode === 'list') {
        return (
            <div
                onClick={onClick}
                className={`group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${overdue ? 'border-l-4 border-l-red-500' : ''
                    } ${isDark ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'}`}
            >
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className="flex-shrink-0"
                >
                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-300 hover:border-slate-400'
                        }`}>
                        {task.completed && <CheckCircle className="h-4 w-4 text-white" />}
                    </div>
                </button>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${task.completed ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{task.subject}</span>
                        {task.classSection && (
                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>• {task.classSection}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priority.bg} ${priority.text}`}>
                        {actualPriority.toUpperCase()}
                    </span>

                    <div className={`flex items-center gap-1.5 text-sm ${overdue ? 'text-red-500 font-medium' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {overdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        <span>{overdue ? 'Overdue' : `${daysUntil}d left`}</span>
                    </div>

                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}

                    <ChevronRight className={`h-5 w-5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`group relative rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] ${overdue ? 'border-l-4 border-l-red-500' : ''
                } ${isDark ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${priority.bg} ${priority.text}`}>
                        <Flag className="h-3 w-3" />
                        {actualPriority.toUpperCase()}
                    </span>

                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        className="transition-transform hover:scale-110"
                    >
                        <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : isDark ? 'border-slate-600 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500'
                            }`}>
                            {task.completed && <CheckCircle className="h-4 w-4 text-white" />}
                        </div>
                    </button>
                </div>

                {/* Title */}
                <h3 className={`font-bold text-base mb-3 line-clamp-2 ${task.completed ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {task.title}
                </h3>

                {/* Subject Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <BookOpen className={`h-3.5 w-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{task.subject}</span>
                    {task.classSection && (
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>• {task.classSection}</span>
                    )}
                </div>

                {/* Description */}
                {task.description && (
                    <p className={`text-sm line-clamp-2 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {task.description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-dashed" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                    <div className={`flex items-center gap-2 text-sm ${overdue ? 'text-red-500 font-semibold' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {overdue ? <AlertCircle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                        <span>
                            {overdue ? 'Overdue' : `${task.deadline.toLocaleDateString()} • ${daysUntil}d left`}
                        </span>
                    </div>

                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({ isDark, message }) {
    return (
        <div className={`rounded-2xl p-12 text-center border ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`inline-flex p-4 rounded-2xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                <Sparkles className={`h-8 w-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <p className={`text-base font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {message}
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                Tasks will appear here once they are added
            </p>
        </div>
    );
}

// Loading Skeleton
function LoadingSkeleton({ isDark }) {
    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className={`h-52 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                ))}
            </div>
        </>
    );
}

// Task Detail Modal
function TaskDetailModal({ task, isDark, onClose }) {
    const daysUntil = getDaysUntil(task.deadline);
    const overdue = isOverdue(task.deadline, task.completed);
    const actualPriority = calculatePriority(task.deadline);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 bg-black/60">
            <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                {/* Header */}
                <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${actualPriority === 'high'
                                    ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                                    : actualPriority === 'medium'
                                        ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                                        : isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {actualPriority.toUpperCase()} PRIORITY
                                </span>
                                {task.completed && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                                        COMPLETED
                                    </span>
                                )}
                            </div>
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {task.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <p className={`text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subject</p>
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{task.subject}</p>
                        </div>
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <p className={`text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Deadline</p>
                            <p className={`text-sm font-semibold ${overdue ? 'text-red-500' : isDark ? 'text-white' : 'text-slate-900'}`}>
                                {overdue ? 'Overdue' : `${daysUntil} days left`}
                            </p>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <p className={`text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Due Date & Time</p>
                        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {task.deadline.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            {' at '}
                            {task.deadline.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <div>
                            <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Description</p>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {task.description}
                            </p>
                        </div>
                    )}

                    {/* Assigned By */}
                    {task.createdBy && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Assigned By</p>
                                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{task.createdBy}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl active:scale-[0.98]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
