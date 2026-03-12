import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Plus, Search, Calendar, Clock, Flag, BookOpen, User,
    CheckCircle, Trash2, AlertCircle, X, Sparkles, Target,
    ListFilter, LayoutGrid, LayoutList, ChevronRight, TrendingUp,
    CalendarDays, CheckCheck, AlertTriangle, Timer, Bell, List
} from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import AddTaskModal from '../components/dashboard/AddTaskModal';
import { calculatePriority, getDaysUntil, isOverdue } from '../components/dashboard/dashboardUtils';
import axios from '../lib/axios';

export default function Tasks() {
    const [isDark, setIsDark] = useState(true); // Default to dark mode per design
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [tasks, setTasks] = useState({ teacher: [], personal: [] });
    const [filterType, setFilterType] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState('');
    const [viewMode, setViewMode] = useState('list'); // Default to list view per design

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
        const dueThisWeek = allTasks.filter(t => getDaysUntil(t.deadline) >= 0 && getDaysUntil(t.deadline) <= 7 && !t.completed).length;

        return { total, completed, overdue, dueToday, upcoming, pending: total - completed, dueThisWeek };
    }, [tasks]);

    // Get upcoming deadlines for sidebar
    const upcomingDeadlines = useMemo(() => {
        const allTasks = [...tasks.teacher, ...tasks.personal];
        return allTasks
            .filter(t => !t.completed && getDaysUntil(t.deadline) >= 0)
            .sort((a, b) => a.deadline - b.deadline)
            .slice(0, 3);
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
        { id: 'all', label: 'All' },
        { id: 'today', label: 'Today' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'overdue', label: 'Overdue' },
        { id: 'completed', label: 'Completed' },
    ];

    const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0f1419]' : 'bg-slate-100'}`}>
            {/* Top Search Bar */}
            <header className={`sticky top-0 z-40 px-4 py-3 ${isDark ? 'bg-[#0f1419]' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className={`flex-1 max-w-xl flex items-center gap-3 px-4 py-2.5 rounded-full ${isDark ? 'bg-[#1a1f26]' : 'bg-slate-100'}`}>
                        <Search className={`h-5 w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="Search tasks, subjects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`flex-1 bg-transparent border-none outline-none text-sm ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className={`relative p-2.5 rounded-full ${isDark ? 'bg-[#1a1f26] text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}>
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500"></span>
                        </button>
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-emerald-500">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                                alt="User"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className={`text-4xl font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                Academic Workspace
                            </h1>
                            <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Task Manager in DM Sans
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
                            >
                                <Plus className="h-5 w-5" />
                                <span>New Task</span>
                            </button>
                        </div>

                        {/* Statistics Row */}
                        <div className={`flex items-center gap-4 p-4 rounded-2xl mb-6 ${isDark ? 'bg-[#1a1f26]' : 'bg-white shadow-sm'}`}>
                            <div className="flex items-center gap-3 pr-4 border-r border-slate-700">
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Tasks</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.total}</p>
                                </div>
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                    <List className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pr-4 border-r border-slate-700">
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Completed</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.completed}</p>
                                </div>
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                    <CheckCheck className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pr-4 border-r border-slate-700">
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Overdue</p>
                                    <p className="text-2xl font-bold text-orange-500">{stats.overdue}</p>
                                </div>
                                {/* Progress Circle */}
                                <div className="relative h-12 w-12">
                                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke={isDark ? '#374151' : '#e5e7eb'}
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="3"
                                            strokeDasharray={`${progressPercent}, 100`}
                                        />
                                    </svg>
                                    <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {progressPercent}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Due this Week</p>
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.dueThisWeek}</p>
                                </div>
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                    <Calendar className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                </div>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-1">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setFilterType(option.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === option.id
                                            ? isDark ? 'bg-slate-700 text-white' : 'bg-slate-900 text-white'
                                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                        ? isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900'
                                        : isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                                        }`}
                                >
                                    <LayoutList className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                        ? isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900'
                                        : isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                                        }`}
                                >
                                    <LayoutGrid className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <LoadingSkeleton isDark={isDark} />
                        ) : (
                            <div className="space-y-8">
                                {/* Instructor Assigned Section */}
                                <TaskTableSection
                                    isDark={isDark}
                                    title="Instructor Assigned"
                                    tasks={filteredTasks.teacher}
                                    viewMode={viewMode}
                                    type="teacher"
                                    onToggle={handleToggleTask}
                                    onDelete={handleDeleteTask}
                                    onClick={setSelectedTask}
                                />

                                {/* Personal Section */}
                                <TaskTableSection
                                    isDark={isDark}
                                    title="Personal"
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
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-72 space-y-6">
                        {/* Upcoming Deadlines */}
                        <div className={`rounded-2xl p-5 ${isDark ? 'bg-[#1a1f26]' : 'bg-white shadow-sm'}`}>
                            <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Upcoming Deadlines
                            </h3>
                            <div className="space-y-3">
                                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((task) => (
                                    <div key={task.id} className="flex items-start gap-3">
                                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {task.title}
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                                {task.subject}
                                            </p>
                                        </div>
                                        <p className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {task.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                )) : (
                                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>No upcoming deadlines</p>
                                )}
                            </div>
                        </div>

                        {/* Productivity Insights */}
                        <div className={`rounded-2xl p-5 ${isDark ? 'bg-[#1a1f26]' : 'bg-white shadow-sm'}`}>
                            <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Productivity Insights
                            </h3>
                            {/* Mini Chart */}
                            <div className="flex items-end gap-2 h-20 mb-3">
                                {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-blue-500 rounded-t-sm"
                                        style={{ height: `${height}%` }}
                                    />
                                ))}
                            </div>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Your study was in about study habits and of your morning.
                            </p>
                        </div>
                    </div>
                </div>
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

// Task Table Section Component
function TaskTableSection({ isDark, title, tasks, viewMode, type, onToggle, onDelete, onClick, showDelete }) {
    if (viewMode === 'grid') {
        return (
            <div>
                <h2 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-blue-500 inline-block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {title}
                </h2>
                {tasks.length === 0 ? (
                    <EmptyState isDark={isDark} message={`No ${title.toLowerCase()} tasks`} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {tasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                isDark={isDark}
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

    return (
        <div>
            <h2 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-blue-500 inline-block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {title}
            </h2>

            {tasks.length === 0 ? (
                <EmptyState isDark={isDark} message={`No ${title.toLowerCase()} tasks`} />
            ) : (
                <div className="mt-4">
                    {/* Table Header */}
                    <div className={`grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-5">Task Name</div>
                        <div className="col-span-2">Priority</div>
                        <div className="col-span-3">Due Date</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Task Rows */}
                    <div className="space-y-2">
                        {tasks.map(task => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                isDark={isDark}
                                type={type}
                                onToggle={() => onToggle(task.id, type)}
                                onDelete={showDelete ? () => onDelete(task.id, type) : null}
                                onClick={() => onClick(task)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Task Row Component (for table view)
function TaskRow({ task, isDark, type, onToggle, onDelete, onClick }) {
    const daysUntil = getDaysUntil(task.deadline);
    const overdue = isOverdue(task.deadline, task.completed);
    const actualPriority = calculatePriority(task.deadline);

    const priorityColors = {
        high: 'bg-red-500',
        medium: 'bg-amber-500',
        low: 'bg-emerald-500',
    };

    const formatDueDate = (date) => {
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div
            onClick={onClick}
            className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                }`}
        >
            {/* Checkbox */}
            <div className="col-span-1 flex items-center">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${task.completed
                        ? 'bg-blue-600 border-blue-600'
                        : isDark ? 'border-slate-600 hover:border-blue-500' : 'border-slate-300 hover:border-blue-500'
                        }`}
                >
                    {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
                </button>
            </div>

            {/* Task Name */}
            <div className="col-span-5">
                <p className={`text-sm font-medium truncate ${task.completed ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {task.title}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {task.subject}
                </p>
            </div>

            {/* Priority */}
            <div className="col-span-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${priorityColors[actualPriority]}`} />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {actualPriority === 'high' ? 'high-red' : actualPriority}
                </span>
            </div>

            {/* Due Date */}
            <div className="col-span-3 flex items-center">
                <span className={`text-sm ${overdue ? 'text-red-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {formatDueDate(task.deadline)}
                </span>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center justify-end">
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
    );
}

// Task Card Component (for grid view)
function TaskCard({ task, isDark, type, onToggle, onDelete, onClick }) {
    const daysUntil = getDaysUntil(task.deadline);
    const overdue = isOverdue(task.deadline, task.completed);
    const actualPriority = calculatePriority(task.deadline);

    const priorityConfig = {
        high: {
            bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
            text: isDark ? 'text-red-400' : 'text-red-600',
        },
        medium: {
            bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
            text: isDark ? 'text-amber-400' : 'text-amber-600',
        },
        low: {
            bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
            text: isDark ? 'text-emerald-400' : 'text-emerald-600',
        },
    };

    const priority = priorityConfig[actualPriority];

    return (
        <div
            onClick={onClick}
            className={`group relative rounded-2xl cursor-pointer transition-all hover:shadow-lg ${isDark ? 'bg-[#1a1f26] hover:bg-[#1f252d]' : 'bg-white hover:shadow-md'
                }`}
        >
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${priority.bg} ${priority.text}`}>
                        <Flag className="h-3 w-3" />
                        {actualPriority.toUpperCase()}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        className={`h-6 w-6 rounded border-2 flex items-center justify-center transition-all ${task.completed
                            ? 'bg-blue-600 border-blue-600'
                            : isDark ? 'border-slate-600 hover:border-blue-500' : 'border-slate-300 hover:border-blue-500'
                            }`}
                    >
                        {task.completed && <CheckCircle className="h-4 w-4 text-white" />}
                    </button>
                </div>

                <h3 className={`font-bold text-base mb-2 line-clamp-2 ${task.completed ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {task.title}
                </h3>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <BookOpen className={`h-3.5 w-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{task.subject}</span>
                </div>

                <div className={`flex items-center gap-2 text-sm ${overdue ? 'text-red-500' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {overdue ? <AlertCircle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                    <span>{overdue ? 'Overdue' : `${daysUntil}d left`}</span>
                </div>
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({ isDark, message }) {
    return (
        <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-[#1a1f26]' : 'bg-slate-50'}`}>
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
        <div className="space-y-6">
            <div className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-16 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                ))}
            </div>
        </div>
    );
}

// Task Detail Modal
function TaskDetailModal({ task, isDark, onClose }) {
    const daysUntil = getDaysUntil(task.deadline);
    const overdue = isOverdue(task.deadline, task.completed);
    const actualPriority = calculatePriority(task.deadline);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 bg-black/60">
            <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1a1f26]' : 'bg-white'}`}>
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

                    <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <p className={`text-xs font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Due Date & Time</p>
                        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {task.deadline.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            {' at '}
                            {task.deadline.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {task.description && (
                        <div>
                            <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Description</p>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {task.description}
                            </p>
                        </div>
                    )}

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
