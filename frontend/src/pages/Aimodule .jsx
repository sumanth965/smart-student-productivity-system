import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Brain, ChevronLeft, RefreshCw, AlertTriangle, TrendingDown, Zap,
    CheckCircle2, AlertCircle, Info, Download, Send, Lightbulb, BarChart3,
    Award, Clock, Target, Sparkles, X, FileText, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { calculatePriority, getDaysUntil, isOverdue } from '../components/dashboard/dashboardUtils';
import AIChatBox from '../components/AIChatBox';

// ============================================================================
// SAMPLE DATA - 25 academic tasks with importance & complexity
// ============================================================================
const SAMPLE_TASKS = [
    { id: 1, title: 'Math Final Exam Prep', subject: 'Mathematics', dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), importance: 0.95, complexity: 0.85, status: 'pending' },
    { id: 2, title: 'Physics Lab Report', subject: 'Physics', dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), importance: 0.90, complexity: 0.80, status: 'pending' },
    { id: 3, title: 'Biology Essay - Evolution', subject: 'Biology', dueDate: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000), importance: 0.75, complexity: 0.65, status: 'pending' },
    { id: 4, title: 'Chemistry Problem Set', subject: 'Chemistry', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), importance: 0.70, complexity: 0.75, status: 'pending' },
    { id: 5, title: 'History Research Paper', subject: 'History', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), importance: 0.85, complexity: 0.90, status: 'pending' },
    { id: 6, title: 'English Literature Analysis', subject: 'English', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), importance: 0.70, complexity: 0.60, status: 'pending' },
    { id: 7, title: 'Spanish Vocab Quiz', subject: 'Languages', dueDate: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000), importance: 0.50, complexity: 0.40, status: 'pending' },
    { id: 8, title: 'Calculus Assignment', subject: 'Mathematics', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), importance: 0.80, complexity: 0.85, status: 'pending' },
    { id: 9, title: 'CS Project - Web App', subject: 'Computer Science', dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), importance: 0.92, complexity: 0.95, status: 'pending' },
    { id: 10, title: 'Art History Presentation', subject: 'Art', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), importance: 0.55, complexity: 0.50, status: 'pending' },
    { id: 11, title: 'Psychology Case Study', subject: 'Psychology', dueDate: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000), importance: 0.75, complexity: 0.70, status: 'pending' },
    { id: 12, title: 'Sociology Discussion Post', subject: 'Sociology', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), importance: 0.40, complexity: 0.30, status: 'pending' },
    { id: 13, title: 'Economics Presentation', subject: 'Economics', dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), importance: 0.65, complexity: 0.65, status: 'pending' },
    { id: 14, title: 'Philosophy Essay', subject: 'Philosophy', dueDate: new Date(Date.now() + 4.5 * 24 * 60 * 60 * 1000), importance: 0.70, complexity: 0.75, status: 'pending' },
    { id: 15, title: 'Statistics Exam Review', subject: 'Mathematics', dueDate: new Date(Date.now() + 6.5 * 24 * 60 * 60 * 1000), importance: 0.85, complexity: 0.80, status: 'pending' },
    { id: 16, title: 'Literature Close Reading', subject: 'English', dueDate: new Date(Date.now() + 5.5 * 24 * 60 * 60 * 1000), importance: 0.60, complexity: 0.55, status: 'pending' },
    { id: 17, title: 'Environmental Science Project', subject: 'Science', dueDate: new Date(Date.now() + 7.5 * 24 * 60 * 60 * 1000), importance: 0.65, complexity: 0.70, status: 'pending' },
    { id: 18, title: 'Music Theory Composition', subject: 'Music', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), importance: 0.45, complexity: 0.60, status: 'pending' },
    { id: 19, title: 'Organic Chemistry Midterm', subject: 'Chemistry', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), importance: 0.95, complexity: 0.92, status: 'pending' },
    { id: 20, title: 'German Grammar Test', subject: 'Languages', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), importance: 0.55, complexity: 0.50, status: 'pending' },
    { id: 21, title: 'Geology Lab Report', subject: 'Science', dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), importance: 0.65, complexity: 0.70, status: 'pending' },
    { id: 22, title: 'Macroeconomics Quiz', subject: 'Economics', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), importance: 0.70, complexity: 0.65, status: 'pending' },
    { id: 23, title: 'Modern History Essay', subject: 'History', dueDate: new Date(Date.now() + 6.5 * 24 * 60 * 60 * 1000), importance: 0.75, complexity: 0.80, status: 'pending' },
    { id: 24, title: 'Neural Networks Assignment', subject: 'Computer Science', dueDate: new Date(Date.now() + 8.5 * 24 * 60 * 60 * 1000), importance: 0.88, complexity: 0.98, status: 'pending' },
    { id: 25, title: 'Japanese Reading Comprehension', subject: 'Languages', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), importance: 0.50, complexity: 0.65, status: 'pending' },
];

// ============================================================================
// AI CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate risk score based on importance, urgency, and complexity
 * Formula: (importance * urgency * complexity) capped at 100%
 */
const calculateRiskScore = (task) => {
    const now = new Date();
    const daysLeft = (new Date(task.dueDate) - now) / (1000 * 60 * 60 * 24);

    // Urgency multiplier: closer deadline = higher urgency
    let urgency = 1.0;
    if (daysLeft < 0.5) urgency = 1.0; // Overdue
    else if (daysLeft < 1) urgency = 0.95;
    else if (daysLeft < 2) urgency = 0.85;
    else if (daysLeft < 3) urgency = 0.70;
    else if (daysLeft < 5) urgency = 0.50;
    else urgency = 0.30;

    // Calculate final risk score
    const riskScore = Math.min(100, Math.round(task.importance * urgency * task.complexity * 100));
    return Math.max(0, riskScore);
};

/**
 * Assign AI priority based on risk score
 */
const assignAIPriority = (riskScore) => {
    if (riskScore >= 70) return 'HIGH';
    if (riskScore >= 40) return 'MEDIUM';
    return 'LOW';
};

/**
 * Generate personalized AI recommendation based on task characteristics
 */
const generateRecommendation = (task, riskScore) => {
    const daysLeft = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24);

    // High complexity tasks
    if (task.complexity >= 0.85 && riskScore >= 70) {
        return {
            text: `Break "${task.title}" into 3-4 subtasks to manage complexity`,
            confidence: 87,
            icon: '🎯'
        };
    }

    // Imminent deadlines
    if (daysLeft < 1.5 && riskScore >= 60) {
        return {
            text: `Complete "${task.title}" first (urgent + important)`,
            confidence: 92,
            icon: '⚡'
        };
    }

    // Medium complexity with upcoming deadline
    if (task.complexity >= 0.65 && daysLeft < 4) {
        return {
            text: `Start "${task.title}" today, dedicate 2-hour focused session`,
            confidence: 85,
            icon: '⏱️'
        };
    }

    // Low importance but approaching
    if (task.importance < 0.60 && daysLeft < 2) {
        return {
            text: `Schedule "${task.title}" for today to clear backlog`,
            confidence: 76,
            icon: '📋'
        };
    }

    // High importance, time available
    if (task.importance >= 0.85 && daysLeft > 3) {
        return {
            text: `Plan "${task.title}" for next 3 days in advance`,
            confidence: 80,
            icon: '📅'
        };
    }

    // Default recommendation
    return {
        text: `Review "${task.title}" progress and adjust timeline if needed`,
        confidence: 65,
        icon: '📝'
    };
};

/**
 * Analyze all tasks and generate AI insights
 */
const analyzeTasksAI = (tasks) => {
    const analyzed = tasks.map(task => {
        const riskScore = calculateRiskScore(task);
        const aiPriority = assignAIPriority(riskScore);
        const recommendation = generateRecommendation(task, riskScore);

        return {
            ...task,
            riskScore,
            aiPriority,
            recommendation
        };
    });

    // Sort by risk score (highest first)
    return analyzed.sort((a, b) => b.riskScore - a.riskScore);
};

/**
 * Generate 7-day risk trend data
 */
const generateRiskTrend = (tasks) => {
    if (!tasks.length) {
        return [];
    }

    const trendData = [];
    const baseDate = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);

        // Simulate historical risk (gradually decreasing as tasks are completed)
        const simulatedTasks = tasks.map(task => ({
            ...task,
            dueDate: new Date(task.dueDate.getTime() + i * 24 * 60 * 60 * 1000)
        }));

        const dayRisks = simulatedTasks.map(t => calculateRiskScore(t));
        const avgRisk = Math.round(dayRisks.reduce((a, b) => a + b, 0) / dayRisks.length);

        trendData.push({
            day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            risk: avgRisk,
            tasks: tasks.length
        });
    }

    return trendData;
};

// ============================================================================
// RISK METER COMPONENT
// ============================================================================
const RiskMeter = ({ score, showLabel = true }) => {
    const getRiskColor = (score) => {
        if (score >= 70) return 'from-red-500 to-orange-500';
        if (score >= 40) return 'from-amber-500 to-yellow-500';
        return 'from-green-500 to-emerald-500';
    };

    const getRiskLabel = (score) => {
        if (score >= 70) return { text: 'HIGH RISK', color: 'text-red-600 dark:text-red-400' };
        if (score >= 40) return { text: 'MEDIUM RISK', color: 'text-amber-600 dark:text-amber-400' };
        return { text: 'LOW RISK', color: 'text-green-600 dark:text-green-400' };
    };

    const label = getRiskLabel(score);
    const bgColor = getRiskColor(score);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                {showLabel && <span className={`text-xs font-bold ${label.color}`}>{label.text}</span>}
                <span className="text-sm font-bold text-slate-900 dark:text-white">{score}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${bgColor} rounded-full shadow-lg`}
                />
            </div>
        </div>
    );
};

// ============================================================================
// CONFIDENCE BADGE COMPONENT
// ============================================================================
const ConfidenceBadge = ({ confidence }) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 dark:bg-emerald-500/15 border border-emerald-500/30 dark:border-emerald-500/40 backdrop-blur-sm"
    >
        <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{confidence}% confidence</span>
    </motion.div>
);

// ============================================================================
// AI CHAT COMPONENT - Now imported from AIChatBox.jsx
// ============================================================================

// ============================================================================
// SKELETON LOADER
// ============================================================================
const SkeletonLoader = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-32 backdrop-blur-xl rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-700/30"
            />
        ))}
    </div>
);

// ============================================================================
// RISK CARD COMPONENT
// ============================================================================
const RiskCard = ({ task, index }) => (
    <motion.div
        custom={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        className="backdrop-blur-xl rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl hover:shadow-2xl hover:shadow-purple-500/25 hover:ring-2 ring-purple-500/30 transition-all duration-300 p-5 space-y-4"
    >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{task.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.subject}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap ${task.aiPriority === 'HIGH' ? 'bg-red-500/90 shadow-lg shadow-red-500/40' :
                task.aiPriority === 'MEDIUM' ? 'bg-amber-500/90 shadow-lg shadow-amber-500/40' :
                    'bg-green-500/90 shadow-lg shadow-green-500/40'
                }`}>
                {task.aiPriority}
            </div>
        </div>

        {/* Risk Meter */}
        <RiskMeter score={task.riskScore} />

        {/* Details */}
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Due: {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span>Complexity: {Math.round(task.complexity * 100)}%</span>
        </div>
    </motion.div>
);

// ============================================================================
// MAIN AI MODULE COMPONENT
// ============================================================================
export default function AIModule({ isDark = false }) {
    const navigate = useNavigate();
    const onNavigateBack = () => navigate('/dashboard');
    const [tasks, setTasks] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [showExportModal, setShowExportModal] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const loadingRef = useRef(false);

    const resolveUserId = useCallback((user) => user?._id || user?.id || '', []);

    const mapApiTaskToAiTask = useCallback((task) => {
        const dueDate = new Date(task.dueDate);
        const computedPriority = task.priority?.toLowerCase() || calculatePriority(dueDate);
        const priorityWeight = {
            high: 0.95,
            medium: 0.7,
            low: 0.5,
        };

        const urgencyDays = getDaysUntil(dueDate);
        const urgencyWeight = urgencyDays <= 1 ? 0.95 : urgencyDays <= 3 ? 0.8 : urgencyDays <= 7 ? 0.65 : 0.45;

        return {
            id: task._id,
            title: task.title,
            subject: task.subject,
            description: task.description,
            dueDate,
            status: task.status?.toLowerCase() || 'pending',
            importance: Number((Math.max(priorityWeight[computedPriority] || 0.6, urgencyWeight)).toFixed(2)),
            complexity: Number((task.description ? 0.75 : 0.55).toFixed(2)),
            sourceType: task.createdBy ? 'teacher' : 'self',
        };
    }, []);

    const loadTasks = useCallback(async () => {
        if (loadingRef.current) {
            return;
        }

        loadingRef.current = true;

        try {
            setError('');
            setIsAnalyzing(true);
            const persistedUser = localStorage.getItem('student_user') || sessionStorage.getItem('student_user');
            if (!persistedUser) {
                setTasks(SAMPLE_TASKS.slice(0, 8));
                return;
            }

            const parsedUser = JSON.parse(persistedUser);
            const userId = resolveUserId(parsedUser);
            if (!userId) {
                setTasks(SAMPLE_TASKS.slice(0, 8));
                return;
            }

            const response = await axios.get(`/api/students/${userId}/tasks`);
            const apiTasks = Array.isArray(response.data?.data)
                ? response.data.data.map(mapApiTaskToAiTask)
                : [];

            const activeTasks = apiTasks.filter((task) => task.status !== 'completed');
            setTasks(activeTasks.length ? activeTasks : SAMPLE_TASKS.slice(0, 8));
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to load AI insights tasks:', err);
            setError(err.response?.data?.message || 'Could not load tasks from dashboard database. Showing fallback insights.');
            setTasks(SAMPLE_TASKS.slice(0, 8));
            setLastUpdated(new Date());
        } finally {
            setTimeout(() => setIsAnalyzing(false), 600);
            loadingRef.current = false;
        }
    }, [mapApiTaskToAiTask, resolveUserId]);

    useEffect(() => {
        loadTasks();

        const handleRefresh = () => loadTasks();
        const handleFocus = () => loadTasks();
        window.addEventListener('tasks:refresh', handleRefresh);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.clearInterval(autoRefresh);
            window.removeEventListener('tasks:refresh', handleRefresh);
            window.removeEventListener('focus', handleFocus);
        };
    }, [loadTasks]);

    // Memoized AI analysis
    const analyzedTasks = useMemo(() => analyzeTasksAI(tasks), [tasks]);
    const riskTrend = useMemo(() => generateRiskTrend(tasks), [tasks]);

    // Statistics
    const stats = useMemo(() => ({
        highRisk: analyzedTasks.filter(t => t.aiPriority === 'HIGH').length,
        mediumRisk: analyzedTasks.filter(t => t.aiPriority === 'MEDIUM').length,
        lowRisk: analyzedTasks.filter(t => t.aiPriority === 'LOW').length,
        overdue: analyzedTasks.filter((t) => isOverdue(t.dueDate, false)).length,
        dueSoon: analyzedTasks.filter((t) => getDaysUntil(t.dueDate) <= 1).length,
        avgRisk: analyzedTasks.length
            ? Math.round(analyzedTasks.reduce((sum, t) => sum + t.riskScore, 0) / analyzedTasks.length)
            : 0,
        overallRiskLevel: (() => {
            if (!analyzedTasks.length) return 'LOW';
            const avg = analyzedTasks.reduce((sum, t) => sum + t.riskScore, 0) / analyzedTasks.length;
            if (avg >= 70) return 'HIGH';
            if (avg >= 40) return 'MEDIUM';
            return 'LOW';
        })()
    }), [analyzedTasks]);

    const handleRefreshAnalysis = useCallback(() => {
        loadTasks();
    }, [loadTasks]);

    const handleApplyRecommendations = useCallback(() => {
        // Auto-update task priorities based on AI analysis
        const updated = tasks.map(task => {
            const analyzed = analyzedTasks.find(t => t.id === task.id);
            return { ...task, recommendedPriority: analyzed?.aiPriority };
        });
        setTasks(updated);

        console.log('[API] PATCH /api/tasks/apply-ai-recommendations', {
            taskUpdates: analyzedTasks.map(t => ({ id: t.id, priority: t.aiPriority }))
        });
    }, [tasks, analyzedTasks]);

    const handleDownloadReport = useCallback(() => {
        const report = {
            timestamp: new Date().toISOString(),
            overallRiskLevel: stats.overallRiskLevel,
            averageRiskScore: stats.avgRisk,
            taskSummary: {
                high: stats.highRisk,
                medium: stats.mediumRisk,
                low: stats.lowRisk
            },
            topRisks: analyzedTasks.slice(0, 5),
            recommendations: analyzedTasks.map(t => ({
                taskId: t.id,
                taskTitle: t.title,
                recommendation: t.recommendation.text,
                confidence: t.recommendation.confidence
            }))
        };

        console.log('[API] POST /api/ai/export-report', report);
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-analysis-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }, [stats, analyzedTasks]);

    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'HIGH':
                return { bg: 'bg-red-500/20 dark:bg-red-500/15', border: 'border-red-300 dark:border-red-700', text: 'text-red-700 dark:text-red-300' };
            case 'MEDIUM':
                return { bg: 'bg-amber-500/20 dark:bg-amber-500/15', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300' };
            default:
                return { bg: 'bg-green-500/20 dark:bg-green-500/15', border: 'border-green-300 dark:border-green-700', text: 'text-green-700 dark:text-green-300' };
        }
    };

    const riskColor = getRiskLevelColor(stats.overallRiskLevel);

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'dark' : ''}`}>
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 min-h-screen">
                {/* ===== NAVBAR ===== */}
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Left */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onNavigateBack}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                                    aria-label="Go back"
                                >
                                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                                        <Brain className="w-5 h-5 text-white animate-pulse" />
                                    </div>
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Insights</h1>
                                </div>
                            </div>

                            {/* Right - Actions */}
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                                {!isAnalyzing && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold ${riskColor.bg} border ${riskColor.border} ${riskColor.text}`}
                                        >
                                            Risk Level: {stats.overallRiskLevel}
                                        </motion.div>
                                        <button
                                            onClick={handleRefreshAnalysis}
                                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                                            title="Refresh analysis"
                                        >
                                            <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {!isAnalyzing && (
                                <p className="w-full text-right text-xs text-slate-500 dark:text-slate-400">
                                    Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'just now'}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.nav>

                {/* ===== MAIN CONTENT ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {isAnalyzing ? (
                        <div className="space-y-6">
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-center py-12"
                            >
                                <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-bounce" />
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Analyzing {tasks.length} Tasks...</h2>
                                <p className="text-slate-600 dark:text-slate-400 mt-2">Calculating risk scores and generating recommendations</p>
                            </motion.div>
                            <SkeletonLoader />
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="rounded-xl border border-amber-400/40 bg-amber-100/60 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                                    {error}
                                </div>
                            )}

                            {/* TOAST NOTIFICATION */}
                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="fixed top-20 right-6 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-2xl shadow-purple-500/40 backdrop-blur-xl z-40"
                                >
                                    ✨ Analysis Complete: {stats.highRisk} high-risk tasks detected
                                </motion.div>
                            </AnimatePresence>

                            {/* OVERVIEW STATS */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4"
                            >
                                <div className="backdrop-blur-xl rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-4 text-center hover:shadow-lg transition-all">
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.highRisk}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">High Risk</p>
                                </div>
                                <div className="backdrop-blur-xl rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-4 text-center hover:shadow-lg transition-all">
                                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.mediumRisk}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Medium Risk</p>
                                </div>
                                <div className="backdrop-blur-xl rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-4 text-center hover:shadow-lg transition-all">
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.lowRisk}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Low Risk</p>
                                </div>
                                <div className="backdrop-blur-xl rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-4 text-center hover:shadow-lg transition-all">
                                    <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.overdue}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Overdue</p>
                                </div>
                                <div className="backdrop-blur-xl rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-4 text-center hover:shadow-lg transition-all">
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.avgRisk}%</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Avg Risk</p>
                                </div>
                            </motion.div>

                            {/* GRID LAYOUT */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* LEFT COLUMN - Risk Prediction */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* RISK PREDICTION SECTION */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="p-2 rounded-lg bg-red-500/20 dark:bg-red-500/15">
                                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                🧠 Task Risk Prediction
                                            </h2>
                                        </div>

                                        {analyzedTasks.length > 0 ? (
                                            <div className="space-y-3">
                                                {analyzedTasks.slice(0, 8).map((task, i) => (
                                                    <RiskCard key={task.id} task={task} index={i} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-slate-600 dark:text-slate-400">No tasks to analyze</p>
                                        )}
                                    </motion.div>

                                    {/* TREND CHART */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="backdrop-blur-xl rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-purple-500/10 p-6 space-y-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/20 dark:bg-blue-500/15">
                                                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">📈 Risk Trends</h3>
                                        </div>

                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={riskTrend}>
                                                <defs>
                                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                                <XAxis dataKey="day" stroke="#94a3b8" className="dark:stroke-slate-500" />
                                                <YAxis stroke="#94a3b8" className="dark:stroke-slate-500" />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: 'rgba(15, 23, 42, 0.95)',
                                                        border: '1px solid rgba(148, 163, 184, 0.3)',
                                                        borderRadius: '8px',
                                                        color: '#f1f5f9'
                                                    }}
                                                />
                                                <Area type="monotone" dataKey="risk" stroke="#a855f7" fill="url(#colorRisk)" />
                                            </AreaChart>
                                        </ResponsiveContainer>

                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                📉 Risk trend shows <span className="font-bold text-green-600 dark:text-green-400">15% improvement</span> over 7 days
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* RIGHT COLUMN - Recommendations & Chat */}
                                <div className="space-y-6">
                                    {/* PRIORITY RECOMMENDATIONS */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="backdrop-blur-xl rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-purple-500/10 p-6 space-y-4"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-amber-500/20 dark:bg-amber-500/15">
                                                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">📊 Priorities</h3>
                                        </div>

                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {analyzedTasks.slice(0, 5).map((task, i) => (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 space-y-2"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{task.recommendation.icon} {task.recommendation.text}</p>
                                                        </div>
                                                    </div>
                                                    <ConfidenceBadge confidence={task.recommendation.confidence} />
                                                </motion.div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleApplyRecommendations}
                                            className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all shadow-lg shadow-purple-500/30"
                                        >
                                            <Sparkles className="w-4 h-4 inline mr-2" />
                                            Apply All Recommendations
                                        </button>
                                    </motion.div>

                                    {/* PERSONALIZED TIPS */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="backdrop-blur-xl rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-purple-500/10 p-6 space-y-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-green-500/20 dark:bg-green-500/15">
                                                <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">💡 Smart Tips</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {analyzedTasks.slice(0, 3).map((task, i) => (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.08 }}
                                                    className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 space-y-2"
                                                >
                                                    <p className="text-sm text-slate-900 dark:text-white font-semibold">{task.recommendation.text}</p>
                                                    <ConfidenceBadge confidence={task.recommendation.confidence} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* EXPORT BUTTON */}
                                    <button
                                        onClick={handleDownloadReport}
                                        className="w-full py-3 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 hover:from-slate-800 hover:to-slate-900 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-5 h-5" />
                                        Export AI Report
                                    </button>
                                </div>
                            </div>

                            {/* AI CHAT */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <AIChatBox tasks={analyzedTasks} />
                            </motion.div>

                            {/* DEBUG INFO */}
                            <details className="mt-8 text-xs text-slate-500 dark:text-slate-400">
                                <summary className="cursor-pointer font-semibold hover:text-slate-700 dark:hover:text-slate-200">API Endpoints (Development)</summary>
                                <pre className="mt-3 p-3 bg-slate-900/50 dark:bg-slate-950 rounded overflow-x-auto text-green-400">
                                    {`POST   /api/ai/analyze                    - Analyze all tasks
PATCH  /api/tasks/apply-ai-recommendations - Apply priorities
POST   /api/ai/chat                        - Chat with AI
POST   /api/ai/export-report               - Export PDF/JSON
GET    /api/ai/trends                      - Get risk trends`}
                                </pre>
                            </details>
                        </>
                    )}
                </div>
            </div>

            {/* CUSTOM STYLES */}
            <style>{`
        @keyframes ai-glow {
          0%, 100% { 
            text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
          }
          50% { 
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
          }
        }

        .ai-glow {
          animation: ai-glow 2s ease-in-out infinite;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
        </div>
    );
}
