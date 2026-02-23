import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    TrendingUp,
    AlertCircle,
    LogOut,
    Search,
    Download,
    Mail,
    ChevronDown,
    BarChart3,
    Calendar,
    Clock,
    Zap,
    Eye,
    Filter,
    RefreshCw,
    BookOpen,
    Award,
    Target,
    Activity,
    Bell,
    Settings,
    Grid,
} from 'lucide-react';

// Production mock data - 47 students across 5 classes
const MOCK_STUDENTS = [
    { id: 1, name: 'Anjali Sharma', class: '12A', productivity: 98, overdue: 0, subject: 'Physics', lastActive: '2 mins', tasksCompleted: 45, avatar: '👩‍🦰' },
    { id: 2, name: 'Ravi Kumar', class: '12A', productivity: 92, overdue: 1, subject: 'Math', lastActive: '5 mins', tasksCompleted: 42, avatar: '👨‍💼' },
    { id: 3, name: 'Priya Singh', class: '12A', productivity: 45, overdue: 4, subject: 'Chemistry', lastActive: '2 hours', tasksCompleted: 18, avatar: '👩‍🦱' },
    { id: 4, name: 'Aditya Patel', class: '12A', productivity: 88, overdue: 0, subject: 'Physics', lastActive: '10 mins', tasksCompleted: 41, avatar: '👨‍🎓' },
    { id: 5, name: 'Vikram Kumar', class: '12A', productivity: 42, overdue: 6, subject: 'English', lastActive: '1 day', tasksCompleted: 15, avatar: '👨‍🦲' },
    { id: 6, name: 'Neha Desai', class: '12A', productivity: 85, overdue: 2, subject: 'Biology', lastActive: '3 mins', tasksCompleted: 39, avatar: '👩‍🎨' },
    { id: 7, name: 'Karan Singh', class: '12A', productivity: 79, overdue: 3, subject: 'Math', lastActive: '20 mins', tasksCompleted: 36, avatar: '👨‍🚀' },
    { id: 8, name: 'Divya Nair', class: '12A', productivity: 91, overdue: 0, subject: 'Physics', lastActive: '8 mins', tasksCompleted: 43, avatar: '👩‍⚕️' },
    { id: 9, name: 'Rohan Verma', class: '12A', productivity: 38, overdue: 5, subject: 'Chemistry', lastActive: '3 days', tasksCompleted: 12, avatar: '👨‍💻' },
    { id: 10, name: 'Sneha Gupta', class: '12A', productivity: 89, overdue: 1, subject: 'Biology', lastActive: '4 mins', tasksCompleted: 40, avatar: '👩‍🔬' },
    { id: 11, name: 'Arjun Das', class: '12B', productivity: 84, overdue: 2, subject: 'Math', lastActive: '12 mins', tasksCompleted: 38, avatar: '👨‍⚖️' },
    { id: 12, name: 'Pooja Sharma', class: '12B', productivity: 76, overdue: 4, subject: 'English', lastActive: '1 hour', tasksCompleted: 34, avatar: '👩‍💼' },
    { id: 13, name: 'Sameer Khan', class: '12B', productivity: 52, overdue: 7, subject: 'Physics', lastActive: '6 hours', tasksCompleted: 20, avatar: '👨‍🏫' },
    { id: 14, name: 'Shreya Menon', class: '12B', productivity: 93, overdue: 0, subject: 'Chemistry', lastActive: '1 min', tasksCompleted: 44, avatar: '👩‍🎓' },
    { id: 15, name: 'Nikhil Joshi', class: '12B', productivity: 67, overdue: 5, subject: 'Biology', lastActive: '2 hours', tasksCompleted: 28, avatar: '👨‍🎨' },
    { id: 16, name: 'Isha Reddy', class: '12B', productivity: 87, overdue: 1, subject: 'Math', lastActive: '7 mins', tasksCompleted: 39, avatar: '👩‍🚀' },
    { id: 17, name: 'Deepak Singh', class: '12B', productivity: 55, overdue: 8, subject: 'English', lastActive: '1 day', tasksCompleted: 22, avatar: '👨‍🔬' },
    { id: 18, name: 'Tanvi Kumar', class: '12B', productivity: 81, overdue: 2, subject: 'Physics', lastActive: '15 mins', tasksCompleted: 37, avatar: '👩‍⚕️' },
    { id: 19, name: 'Arun Patel', class: '12B', productivity: 48, overdue: 6, subject: 'Chemistry', lastActive: '2 days', tasksCompleted: 16, avatar: '👨‍💻' },
    { id: 20, name: 'Kavya Iyer', class: '12B', productivity: 86, overdue: 1, subject: 'Biology', lastActive: '5 mins', tasksCompleted: 40, avatar: '👩‍🏫' },
    { id: 21, name: 'Manish Gupta', class: '11A', productivity: 79, overdue: 3, subject: 'Math', lastActive: '25 mins', tasksCompleted: 35, avatar: '👨‍🎓' },
    { id: 22, name: 'Ritika Sinha', class: '11A', productivity: 88, overdue: 1, subject: 'Physics', lastActive: '6 mins', tasksCompleted: 40, avatar: '👩‍🎨' },
    { id: 23, name: 'Prakash Rao', class: '11A', productivity: 61, overdue: 6, subject: 'Chemistry', lastActive: '4 hours', tasksCompleted: 24, avatar: '👨‍🚀' },
    { id: 24, name: 'Nidhi Verma', class: '11A', productivity: 92, overdue: 0, subject: 'English', lastActive: '2 mins', tasksCompleted: 43, avatar: '👩‍⚕️' },
    { id: 25, name: 'Bhavesh Kumar', class: '11A', productivity: 44, overdue: 7, subject: 'Biology', lastActive: '2 days', tasksCompleted: 14, avatar: '👨‍💼' },
    { id: 26, name: 'Shreya Nair', class: '11A', productivity: 85, overdue: 2, subject: 'Math', lastActive: '9 mins', tasksCompleted: 38, avatar: '👩‍🔬' },
    { id: 27, name: 'Harish Reddy', class: '11A', productivity: 73, overdue: 4, subject: 'Physics', lastActive: '30 mins', tasksCompleted: 32, avatar: '👨‍🏫' },
    { id: 28, name: 'Ananya Singh', class: '11A', productivity: 90, overdue: 0, subject: 'Chemistry', lastActive: '3 mins', tasksCompleted: 42, avatar: '👩‍💻' },
    { id: 29, name: 'Sanjay Verma', class: '11A', productivity: 56, overdue: 5, subject: 'English', lastActive: '5 hours', tasksCompleted: 21, avatar: '👨‍🎨' },
    { id: 30, name: 'Pooja Desai', class: '11A', productivity: 84, overdue: 2, subject: 'Biology', lastActive: '11 mins', tasksCompleted: 38, avatar: '👩‍🚀' },
    { id: 31, name: 'Vikram Singh', class: '11B', productivity: 77, overdue: 3, subject: 'Math', lastActive: '18 mins', tasksCompleted: 34, avatar: '👨‍⚖️' },
    { id: 32, name: 'Anita Gupta', class: '11B', productivity: 87, overdue: 1, subject: 'Physics', lastActive: '4 mins', tasksCompleted: 39, avatar: '👩‍🎓' },
    { id: 33, name: 'Rajesh Kumar', class: '11B', productivity: 58, overdue: 7, subject: 'Chemistry', lastActive: '1 day', tasksCompleted: 23, avatar: '👨‍💻' },
    { id: 34, name: 'Divya Sharma', class: '11B', productivity: 91, overdue: 0, subject: 'English', lastActive: '1 min', tasksCompleted: 43, avatar: '👩‍🏫' },
    { id: 35, name: 'Mohan Singh', class: '11B', productivity: 46, overdue: 8, subject: 'Biology', lastActive: '3 days', tasksCompleted: 13, avatar: '👨‍🔬' },
    { id: 36, name: 'Neha Sharma', class: '11B', productivity: 83, overdue: 2, subject: 'Math', lastActive: '13 mins', tasksCompleted: 37, avatar: '👩‍⚕️' },
    { id: 37, name: 'Arjun Nair', class: '11B', productivity: 71, overdue: 4, subject: 'Physics', lastActive: '35 mins', tasksCompleted: 31, avatar: '👨‍🎨' },
    { id: 38, name: 'Swati Verma', class: '11B', productivity: 89, overdue: 0, subject: 'Chemistry', lastActive: '2 mins', tasksCompleted: 41, avatar: '👩‍💼' },
    { id: 39, name: 'Ashok Kumar', class: '11B', productivity: 54, overdue: 6, subject: 'English', lastActive: '4 hours', tasksCompleted: 20, avatar: '👨‍🚀' },
    { id: 40, name: 'Priya Nair', class: '11B', productivity: 82, overdue: 3, subject: 'Biology', lastActive: '8 mins', tasksCompleted: 36, avatar: '👩‍🔬' },
    { id: 41, name: 'Rohan Patel', class: '11C', productivity: 75, overdue: 4, subject: 'Math', lastActive: '22 mins', tasksCompleted: 33, avatar: '👨‍⚖️' },
    { id: 42, name: 'Sneha Kumar', class: '11C', productivity: 86, overdue: 2, subject: 'Physics', lastActive: '6 mins', tasksCompleted: 38, avatar: '👩‍🎓' },
    { id: 43, name: 'Karan Desai', class: '11C', productivity: 59, overdue: 5, subject: 'Chemistry', lastActive: '2 hours', tasksCompleted: 22, avatar: '👨‍💻' },
    { id: 44, name: 'Anjali Reddy', class: '11C', productivity: 94, overdue: 0, subject: 'English', lastActive: '30 seconds', tasksCompleted: 45, avatar: '👩‍🏫' },
    { id: 45, name: 'Nitin Sharma', class: '11C', productivity: 41, overdue: 9, subject: 'Biology', lastActive: '1 day', tasksCompleted: 11, avatar: '👨‍🔬' },
    { id: 46, name: 'Disha Verma', class: '11C', productivity: 81, overdue: 2, subject: 'Math', lastActive: '14 mins', tasksCompleted: 36, avatar: '👩‍⚕️' },
    { id: 47, name: 'Sumit Singh', class: '11C', productivity: 68, overdue: 5, subject: 'Physics', lastActive: '40 mins', tasksCompleted: 29, avatar: '👨‍🎨' },
];

const CLASSES = [
    { name: '12A', students: 10, avgScore: 84, overdue: 2 },
    { name: '12B', students: 10, avgScore: 76, overdue: 8 },
    { name: '11A', students: 10, avgScore: 79, overdue: 4 },
    { name: '11B', students: 10, avgScore: 80, overdue: 5 },
    { name: '11C', students: 7, avgScore: 72, overdue: 4 },
];

const OVERDUE_TASKS = [
    { studentId: 3, studentName: 'Priya Singh', task: 'Chemistry Lab Report', daysOverdue: 3, subject: 'Chemistry', priority: 'high' },
    { studentId: 5, studentName: 'Vikram Kumar', task: 'English Essay', daysOverdue: 5, subject: 'English', priority: 'critical' },
    { studentId: 9, studentName: 'Rohan Verma', task: 'Physics Project', daysOverdue: 4, subject: 'Physics', priority: 'critical' },
    { studentId: 13, studentName: 'Sameer Khan', task: 'Math Assignment', daysOverdue: 6, subject: 'Math', priority: 'critical' },
    { studentId: 15, studentName: 'Nikhil Joshi', task: 'Biology Worksheet', daysOverdue: 4, subject: 'Biology', priority: 'high' },
    { studentId: 17, studentName: 'Deepak Singh', task: 'Chemistry Quiz', daysOverdue: 7, subject: 'Chemistry', priority: 'critical' },
    { studentId: 19, studentName: 'Arun Patel', task: 'Physics Lab', daysOverdue: 5, subject: 'Physics', priority: 'critical' },
    { studentId: 23, studentName: 'Prakash Rao', task: 'English Reading', daysOverdue: 3, subject: 'English', priority: 'high' },
    { studentId: 25, studentName: 'Bhavesh Kumar', task: 'Math Project', daysOverdue: 6, subject: 'Math', priority: 'critical' },
    { studentId: 29, studentName: 'Sanjay Verma', task: 'Biology Presentation', daysOverdue: 4, subject: 'Biology', priority: 'high' },
    { studentId: 33, studentName: 'Rajesh Kumar', task: 'Chemistry Experiment', daysOverdue: 5, subject: 'Chemistry', priority: 'critical' },
    { studentId: 35, studentName: 'Mohan Singh', task: 'Physics HW', daysOverdue: 7, subject: 'Physics', priority: 'critical' },
    { studentId: 39, studentName: 'Ashok Kumar', task: 'English Homework', daysOverdue: 4, subject: 'English', priority: 'high' },
    { studentId: 43, studentName: 'Karan Desai', task: 'Biology Report', daysOverdue: 3, subject: 'Biology', priority: 'high' },
    { studentId: 45, studentName: 'Nitin Sharma', task: 'Math Homework', daysOverdue: 8, subject: 'Math', priority: 'critical' },
];

export default function AdminTeacher() {
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [selectedClass, setSelectedClass] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [analyticsView, setAnalyticsView] = useState('overview');

    // Calculate analytics
    const totalStudents = students.length;
    const avgProductivity = Math.round(
        students.reduce((sum, s) => sum + s.productivity, 0) / students.length
    );
    const totalOverdue = students.reduce((sum, s) => sum + s.overdue, 0);
    const classLeader = useMemo(() => {
        const classAvgs = CLASSES.map(cls => ({
            name: cls.name,
            avg: Math.round(
                students
                    .filter(s => s.class === cls.name)
                    .reduce((sum, s) => sum + s.productivity, 0) /
                students.filter(s => s.class === cls.name).length
            ),
        })).sort((a, b) => b.avg - a.avg);
        return classAvgs[0];
    }, []);

    // Filters
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesClass = selectedClass === 'All' || s.class === selectedClass;
            const matchesSearch =
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.subject.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesClass && matchesSearch;
        });
    }, [selectedClass, searchTerm]);

    // Risk detection
    const highRiskStudents = useMemo(() => {
        return students
            .filter(s => s.overdue > 3 || s.productivity < 60)
            .sort((a, b) => (b.overdue || 0) - (a.overdue || 0))
            .slice(0, 5);
    }, [students]);

    // Top performers
    const topPerformers = useMemo(() => {
        return students
            .filter(s => s.productivity >= 85)
            .sort((a, b) => b.productivity - a.productivity)
            .slice(0, 5);
    }, [students]);

    // Weekly heatmap data (days x classes)
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const heatmapData = useMemo(() => {
        return weekDays.map((day, idx) => ({
            day,
            data: CLASSES.map(cls => {
                const classStudents = students.filter(s => s.class === cls.name);
                const baseAvg = classStudents.reduce((sum, s) => sum + s.productivity, 0) / classStudents.length;
                const variation = Math.sin(idx * 0.5) * 10;
                return Math.min(100, Math.max(0, baseAvg + variation));
            }),
        }));
    }, []);

    // Productivity trend (weekly)
    const weeklyTrend = [
        { week: 'Week 1', avg: 75 },
        { week: 'Week 2', avg: 78 },
        { week: 'Week 3', avg: 81 },
        { week: 'Week 4', avg: 78 },
        { week: 'Week 5', avg: 80 },
    ];

    const getProductivityColor = (score) => {
        if (score >= 85) return 'from-emerald-500 to-teal-500';
        if (score >= 70) return 'from-blue-500 to-cyan-500';
        if (score >= 60) return 'from-amber-500 to-orange-500';
        return 'from-red-500 to-pink-500';
    };

    const getHeatmapColor = (value) => {
        if (value >= 85) return 'bg-emerald-500';
        if (value >= 75) return 'bg-blue-400';
        if (value >= 65) return 'bg-amber-400';
        if (value >= 50) return 'bg-orange-400';
        return 'bg-red-500';
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            critical: 'bg-red-500/20 text-red-700 border-red-500/30',
            high: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
            medium: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
        };
        return styles[priority] || styles.medium;
    };

    const handleExportCSV = () => {
        const csv = [
            ['Student', 'Class', 'Productivity %', 'Overdue Count', 'Subject', 'Tasks Completed'],
            ...filteredStudents.map(s => [
                s.name,
                s.class,
                s.productivity,
                s.overdue,
                s.subject,
                s.tasksCompleted,
            ]),
        ]
            .map(row => row.join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `teacher_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const bg = darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 to-blue-50';
    const cardBg = darkMode
        ? 'bg-slate-900/40 backdrop-blur-md border border-slate-700/30'
        : 'bg-white/40 backdrop-blur-xl border border-white/20';
    const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';

    return (
        <div className={`min-h-screen ${bg} transition-colors duration-500`}>
            {/* Navbar */}
            <nav className={`sticky top-0 z-50 ${cardBg} border-b border-white/10 backdrop-blur-2xl`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">👩‍🏫</div>
                        <h1 className={`text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent`}>
                            Teacher Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className={`font-semibold ${textPrimary}`}>{totalStudents} Students</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                <Grid className="w-4 h-4 text-purple-600" />
                                <span className={`font-semibold ${textPrimary}`}>{CLASSES.length} Classes</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-lg transition-all ${darkMode
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-slate-700/20 text-slate-600'
                                } hover:scale-110`}
                            title="Toggle dark mode"
                        >
                            {darkMode ? '🌙' : '☀️'}
                        </button>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-lg hover:bg-white/10 transition-all"
                            title="Notifications"
                        >
                            <Bell className="w-5 h-5 text-amber-500" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </button>
                        <button
                            onClick={() => alert('Logging out...')}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-all text-red-600"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Stats - 4 KPI Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Students */}
                    <div className={`${cardBg} rounded-2xl p-6 group hover:shadow-2xl hover:shadow-blue-500/10 transition-all`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-sm font-bold text-emerald-600 bg-emerald-500/20 px-2 py-1 rounded-lg">
                                ↑ 12% this month
                            </span>
                        </div>
                        <h3 className={`${textSecondary} text-sm font-medium mb-1`}>Total Students</h3>
                        <p className={`text-3xl font-bold ${textPrimary}`}>{totalStudents}</p>
                        <p className={`${textSecondary} text-xs mt-2`}>Across 5 classes</p>
                    </div>

                    {/* Average Productivity */}
                    <div className={`${cardBg} rounded-2xl p-6 group hover:shadow-2xl hover:shadow-amber-500/10 transition-all`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6 text-amber-600" />
                            </div>
                            <span className="text-sm font-bold text-red-600 bg-red-500/20 px-2 py-1 rounded-lg">
                                ↓ 3% week
                            </span>
                        </div>
                        <h3 className={`${textSecondary} text-sm font-medium mb-1`}>Avg Productivity</h3>
                        <p className={`text-3xl font-bold ${textPrimary}`}>{avgProductivity}%</p>
                        <div className="w-full bg-slate-700/20 rounded-full h-1.5 mt-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                style={{ width: `${avgProductivity}%` }}
                            />
                        </div>
                    </div>

                    {/* Overdue Tasks */}
                    <div className={`${cardBg} rounded-2xl p-6 group hover:shadow-2xl hover:shadow-red-500/10 transition-all`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 group-hover:scale-110 transition-transform">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-600 bg-slate-500/20 px-2 py-1 rounded-lg">
                                8% of total
                            </span>
                        </div>
                        <h3 className={`${textSecondary} text-sm font-medium mb-1`}>Overdue Tasks</h3>
                        <p className={`text-3xl font-bold ${textPrimary}`}>{totalOverdue}</p>
                        <p className={`${textSecondary} text-xs mt-2`}>Requires immediate action</p>
                    </div>

                    {/* Class Leader */}
                    <div className={`${cardBg} rounded-2xl p-6 group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="text-sm font-bold text-emerald-600 bg-emerald-500/20 px-2 py-1 rounded-lg">
                                Leading
                            </span>
                        </div>
                        <h3 className={`${textSecondary} text-sm font-medium mb-1`}>Class Leader</h3>
                        <p className={`text-3xl font-bold ${textPrimary}`}>{classLeader.avg}%</p>
                        <p className={`${textSecondary} text-xs mt-2`}>{classLeader.name} - {classLeader.avg}% avg</p>
                    </div>
                </section>

                {/* Filter Bar */}
                <div className={`${cardBg} rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center`}>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by student name, subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/20 ${darkMode ? 'bg-slate-800/50 text-white' : 'bg-white/50 text-slate-900'
                                } placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
                        />
                    </div>
                    <div className="relative group">
                        <button className={`${cardBg} rounded-xl px-4 py-2.5 flex items-center gap-2 hover:shadow-lg transition-all border border-white/20 font-medium`}>
                            <Filter className="w-4 h-4" />
                            {selectedClass === 'All' ? 'All Classes' : selectedClass}
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col bg-slate-900 rounded-xl shadow-2xl z-50 border border-slate-700/50 overflow-hidden min-w-max">
                            <button
                                onClick={() => setSelectedClass('All')}
                                className="px-4 py-2 text-left hover:bg-amber-500/20 transition-colors font-medium"
                            >
                                All Classes
                            </button>
                            {CLASSES.map(cls => (
                                <button
                                    key={cls.name}
                                    onClick={() => setSelectedClass(cls.name)}
                                    className="px-4 py-2 text-left hover:bg-amber-500/20 transition-colors"
                                >
                                    {cls.name} ({cls.students} students)
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 font-medium text-emerald-600"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setAnalyticsView(analyticsView === 'overview' ? 'detailed' : 'overview')}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 font-medium text-blue-600"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                    </button>
                </div>

                {/* Main Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Class Overview Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                            <Grid className="w-5 h-5 text-amber-500" />
                            Class Overview
                        </h2>
                        <div className="space-y-3">
                            {CLASSES.map(cls => {
                                const classStudents = students.filter(s => s.class === cls.name);
                                const avgScore = Math.round(
                                    classStudents.reduce((sum, s) => sum + s.productivity, 0) / classStudents.length
                                );
                                return (
                                    <div
                                        key={cls.name}
                                        onClick={() => setSelectedClass(cls.name)}
                                        className={`${cardBg} rounded-xl p-4 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:scale-105 border-2 ${selectedClass === cls.name ? 'border-amber-500/50' : 'border-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className={`font-bold text-lg ${textPrimary}`}>{cls.name}</h3>
                                                <p className={`${textSecondary} text-sm`}>{cls.students} students</p>
                                            </div>
                                            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                                {avgScore}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-700/20 rounded-full h-2 overflow-hidden mb-2">
                                            <div
                                                className={`h-full bg-gradient-to-r ${getProductivityColor(avgScore)} rounded-full transition-all`}
                                                style={{ width: `${avgScore}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className={textSecondary}>Overdue: {cls.overdue}</span>
                                            <span className="text-amber-600 font-bold">{cls.overdue > 5 ? '⚠️ High' : '✓ OK'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top/Bottom Performers */}
                    <div className="space-y-4">
                        <h2 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Student Performance
                        </h2>

                        {/* Top Performers */}
                        <div className={`${cardBg} rounded-xl p-4`}>
                            <h3 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                                <Award className="w-4 h-4 text-yellow-500" />
                                Top 5 Performers
                            </h3>
                            <div className="space-y-2">
                                {topPerformers.map((student, idx) => (
                                    <div
                                        key={student.id}
                                        className={`p-2 rounded-lg flex items-center justify-between hover:bg-white/20 transition-all ${darkMode ? 'bg-slate-800/20' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-lg">{student.avatar}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold ${textPrimary} text-sm truncate`}>
                                                    {idx + 1}. {student.name}
                                                </p>
                                                <p className={`${textSecondary} text-xs`}>{student.class}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-600 font-bold text-sm">{student.productivity}%</p>
                                            <p className={`${textSecondary} text-xs`}>📈</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* High Risk Students */}
                        <div className={`${cardBg} rounded-xl p-4`}>
                            <h3 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                At-Risk Students
                            </h3>
                            <div className="space-y-2">
                                {highRiskStudents.slice(0, 5).map((student, idx) => (
                                    <div
                                        key={student.id}
                                        className={`p-2 rounded-lg flex items-center justify-between hover:bg-red-500/10 transition-all ${darkMode ? 'bg-slate-800/20' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-lg">{student.avatar}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold ${textPrimary} text-sm truncate`}>
                                                    {student.name}
                                                </p>
                                                <p className={`${textSecondary} text-xs`}>{student.productivity}% · {student.overdue} overdue</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-red-600 font-bold text-sm">⚠️ {student.productivity}%</p>
                                            <p className={`${textSecondary} text-xs`}>{student.class}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Overdue Report Table */}
                    <div className="space-y-4">
                        <h2 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Overdue Tasks ({totalOverdue})
                        </h2>
                        <div className={`${cardBg} rounded-xl overflow-hidden`}>
                            <div className="overflow-y-auto max-h-96">
                                <table className="w-full text-sm">
                                    <thead className={`sticky top-0 ${darkMode ? 'bg-slate-800/50' : 'bg-white/50'} border-b border-white/10`}>
                                        <tr>
                                            <th className={`px-4 py-3 text-left font-bold ${textPrimary}`}>Student</th>
                                            <th className={`px-4 py-3 text-center font-bold ${textPrimary}`}>Days</th>
                                            <th className={`px-4 py-3 text-left font-bold ${textPrimary}`}>Priority</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {OVERDUE_TASKS.map((task, idx) => (
                                            <tr
                                                key={idx}
                                                className={`border-b border-white/10 hover:bg-white/30 transition-all ${darkMode ? 'hover:bg-slate-700/20' : ''
                                                    }`}
                                            >
                                                <td className={`px-4 py-3 ${textPrimary}`}>
                                                    <div className="flex flex-col">
                                                        <p className="font-semibold text-xs">{task.studentName.split(' ')[0]}</p>
                                                        <p className={`${textSecondary} text-xs`}>{task.subject}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="font-bold text-red-600">{task.daysOverdue}d</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`text-xs font-bold px-2 py-1 rounded-full border ${getPriorityBadge(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Analytics Section */}
                {analyticsView === 'detailed' && (
                    <section className="space-y-6">
                        <h2 className={`text-2xl font-bold ${textPrimary} flex items-center gap-2`}>
                            <BarChart3 className="w-6 h-6 text-indigo-500" />
                            Detailed Analytics
                        </h2>

                        {/* Productivity Heatmap */}
                        <div className={`${cardBg} rounded-2xl p-6`}>
                            <h3 className={`text-lg font-bold ${textPrimary} mb-6 flex items-center gap-2`}>
                                <Calendar className="w-5 h-5 text-blue-500" />
                                Weekly Productivity Heatmap
                            </h3>
                            <div className="space-y-3">
                                {heatmapData.map((dayData, dayIdx) => (
                                    <div key={dayData.day}>
                                        <p className={`${textSecondary} text-sm font-semibold mb-2`}>{dayData.day}</p>
                                        <div className="flex gap-2 h-12">
                                            {dayData.data.map((value, classIdx) => (
                                                <div
                                                    key={`${dayIdx}-${classIdx}`}
                                                    className={`flex-1 rounded-lg ${getHeatmapColor(value)} hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center relative group`}
                                                    title={`${CLASSES[classIdx].name}: ${Math.round(value)}%`}
                                                >
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {CLASSES[classIdx].name}: {Math.round(value)}%
                                                    </div>
                                                    <span className="text-white font-bold text-sm">{Math.round(value)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex gap-3 justify-center flex-wrap text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-emerald-500" />
                                    <span className={textSecondary}>85%+</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-blue-400" />
                                    <span className={textSecondary}>75-84%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-amber-400" />
                                    <span className={textSecondary}>65-74%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-orange-400" />
                                    <span className={textSecondary}>50-64%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-red-500" />
                                    <span className={textSecondary}>Below 50%</span>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Trend Chart */}
                        <div className={`${cardBg} rounded-2xl p-6`}>
                            <h3 className={`text-lg font-bold ${textPrimary} mb-6 flex items-center gap-2`}>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                Productivity Trend (Last 5 Weeks)
                            </h3>
                            <div className="h-48 flex items-end justify-around gap-2">
                                {weeklyTrend.map((week, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1">
                                        <div className="relative w-full h-32 mb-2">
                                            <div
                                                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400 hover:shadow-lg hover:shadow-blue-500/50 transition-all`}
                                                style={{ height: `${(week.avg / 100) * 100}%` }}
                                                title={`${week.week}: ${week.avg}%`}
                                            />
                                        </div>
                                        <p className={`${textSecondary} text-xs font-semibold`}>{week.week}</p>
                                        <p className={`${textPrimary} text-sm font-bold`}>{week.avg}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Student List View */}
                <section className="space-y-4">
                    <h2 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                        <Users className="w-5 h-5 text-indigo-500" />
                        Student List ({filteredStudents.length} results)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStudents.map(student => (
                            <div
                                key={student.id}
                                className={`${cardBg} rounded-xl p-4 hover:shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-1`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{student.avatar}</span>
                                        <div>
                                            <h3 className={`font-bold ${textPrimary}`}>{student.name}</h3>
                                            <p className={`${textSecondary} text-sm`}>{student.class} · {student.subject}</p>
                                        </div>
                                    </div>
                                    {student.productivity >= 85 && <span className="text-xl">⭐</span>}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className={`${textSecondary} text-sm`}>Productivity</span>
                                        <span className={`font-bold text-sm ${student.productivity >= 85 ? 'text-emerald-600' :
                                                student.productivity >= 70 ? 'text-blue-600' :
                                                    student.productivity >= 60 ? 'text-amber-600' : 'text-red-600'
                                            }`}>
                                            {student.productivity}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700/20 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${getProductivityColor(student.productivity)} rounded-full`}
                                            style={{ width: `${student.productivity}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="p-3 rounded-lg bg-slate-700/10">
                                        <p className={`${textSecondary} text-xs mb-1`}>Tasks Done</p>
                                        <p className={`font-bold ${textPrimary}`}>{student.tasksCompleted}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-500/10">
                                        <p className={`${textSecondary} text-xs mb-1`}>Overdue</p>
                                        <p className={`font-bold text-red-600`}>{student.overdue}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className={`${textSecondary}`}>Active: {student.lastActive}</span>
                                    <button className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Contact">
                                        <Mail className="w-4 h-4 text-amber-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Toast Notification */}
            {showNotifications && (
                <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
                    <div className={`${cardBg} rounded-xl p-4 border-l-4 border-emerald-500 shadow-2xl animate-pulse`}>
                        <p className={`${textPrimary} font-semibold`}>✅ Anjali Reddy completed Math Quiz</p>
                        <p className={`${textSecondary} text-sm`}>Just now</p>
                    </div>
                    <div className={`${cardBg} rounded-xl p-4 border-l-4 border-blue-500 shadow-2xl animate-pulse`}>
                        <p className={`${textPrimary} font-semibold`}>📝 New assignment posted in Class 12A</p>
                        <p className={`${textSecondary} text-sm`}>2 minutes ago</p>
                    </div>
                </div>
            )}

            {/* API Endpoints Console Logs */}
            {useEffect(() => {
                console.log('📊 Admin API Endpoints:');
                console.log('GET /api/admin/students - Fetch all 47 students');
                console.log('GET /api/admin/classes - Fetch class analytics');
                console.log('GET /api/admin/overdue - Fetch overdue tasks');
                console.log('POST /api/admin/email-students - Send bulk emails');
                console.log('POST /api/admin/reset-overdue - Reset overdue counts');
                console.log('GET /api/admin/heatmap - Fetch productivity heatmap');
                console.log('POST /api/admin/export - Export reports (PDF/CSV)');
                console.log('GET /api/admin/audit-log - View admin actions');
                console.log('🔐 Teacher-only routes - Role-based access active');
            }, [])}

            {/* Floating Action Button */}
            <button
                className="fixed bottom-6 left-6 z-40 p-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:shadow-2xl hover:shadow-amber-500/40 transition-all transform hover:scale-110 text-white font-bold flex items-center gap-2 shadow-xl"
                title="Refresh data"
            >
                <RefreshCw className="w-5 h-5" />
                <span className="hidden sm:inline">Refresh</span>
            </button>
        </div>
    );
}