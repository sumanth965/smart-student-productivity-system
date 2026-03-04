import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Shield, Eye, EyeOff, Chrome, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        studentId: '',
        rememberMe: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setPageLoaded(true);
    }, []);

    // Calculate password strength
    useEffect(() => {
        const password = formData.password;
        let strength = 0;

        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        setPasswordStrength(Math.min(strength, 5));
    }, [formData.password]);

    // Validation functions
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password) => {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        );
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters with uppercase, number, and symbol';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setApiSuccess('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/users/register`, {
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                usn: formData.studentId,
            });

            // Store token and user data
            if (formData.rememberMe) {
                localStorage.setItem('student_token', data.token);
                localStorage.setItem('student_user', JSON.stringify(data.user));
            } else {
                sessionStorage.setItem('student_token', data.token);
                sessionStorage.setItem('student_user', JSON.stringify(data.user));
            }

            setApiSuccess('Account created successfully! Redirecting to login...');

            setFormData({
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                studentId: '',
                rememberMe: false,
            });

            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            setApiError(
                error.response?.data?.message || 'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        console.log(`Sign up with ${provider}`);
        alert(`${provider} sign up initiated. Check console for details.`);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
            },
        },
    };

    const shakeVariants = {
        shake: {
            x: [0, -10, 10, -10, 0],
            transition: { duration: 0.4 },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 -left-32 w-72 h-72 bg-indigo-400/15 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navigation Bar */}
            <nav className={`relative z-50 border-b border-white/20 dark:border-slate-700/50 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 transition-all duration-500 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">ST</span>
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent hidden sm:inline">
                            Smart Student
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-6 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600">
                            Login
                        </Link>
                        <button className="px-6 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors duration-200 border-b-2 border-blue-600 dark:border-blue-400">
                            Register
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">

                        {/* Left Side - Dashboard Preview */}
                        <motion.div
                            className="hidden lg:flex flex-col items-center justify-center"
                            initial={{ opacity: 0, x: -30 }}
                            animate={pageLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                            transition={{ duration: 1 }}
                        >
                            <div className="relative w-full max-w-sm">
                                <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-cyan-300/30 to-blue-300/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-2xl"></div>

                                {/* Dashboard Card */}
                                <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-slate-700/30 p-6 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>

                                    <div className="relative z-10 flex items-center justify-between mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                                        <h3 className="font-bold text-slate-900 dark:text-white">Smart Student Task Management</h3>
                                        <div className="flex gap-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                        </div>
                                    </div>

                                    {/* Task Stats */}
                                    <div className="relative z-10 grid grid-cols-3 gap-3 mb-6">
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                                            <div className="text-2xl font-bold">23</div>
                                            <div className="text-xs text-blue-100">Total Tasks</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                                            <div className="text-2xl font-bold">15</div>
                                            <div className="text-xs text-green-100">Completed</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                                            <div className="text-2xl font-bold">10</div>
                                            <div className="text-xs text-orange-100">In Progress</div>
                                        </div>
                                    </div>

                                    {/* Task Overview */}
                                    <div className="relative z-10 mb-6">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Task Overview</h4>
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-24 h-24">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" opacity="0.3"></circle>
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="150.8 251.3" className="transition-all duration-700"></circle>
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="8" strokeDasharray="75.4 251.3" strokeDashoffset="-150.8" className="transition-all duration-700"></circle>
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold text-slate-900 dark:text-white">60%</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">Complete</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                    <span className="text-slate-600 dark:text-slate-400">Completed</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                                    <span className="text-slate-600 dark:text-slate-400">In Progress</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Task List Preview */}
                                    <div className="relative z-10 space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <div className="flex-1 h-2 bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600 dark:to-transparent rounded"></div>
                                                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{50 + i * 5}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Mockup */}
                                <div className="absolute -bottom-16 -right-8 w-32 h-56 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border-8 border-slate-900 overflow-hidden transform rotate-12 hover:rotate-6 transition-transform duration-300">
                                    <div className="bg-white/20 w-full h-8 flex items-center justify-center border-b border-slate-600">
                                        <div className="text-white text-xs font-semibold">9:41</div>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <div className="w-full h-3 bg-white/30 rounded"></div>
                                        <div className="w-2/3 h-2 bg-white/20 rounded"></div>
                                        <div className="w-full h-3 bg-blue-500/50 rounded mt-3"></div>
                                        <div className="w-full h-3 bg-green-500/50 rounded"></div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-12 left-8 text-6xl opacity-20 dark:opacity-10 transform -rotate-12">🌿</div>
                            </div>
                        </motion.div>

                        {/* Vertical Divider */}
                        <div className="hidden lg:block absolute left-1/2 top-1/3 bottom-1/3 w-px bg-gradient-to-b from-transparent via-slate-300/50 dark:via-slate-700/50 to-transparent"></div>

                        {/* Right Side - Register Form */}
                        <motion.div
                            className="flex flex-col items-center justify-center"
                            initial={{ opacity: 0, x: 30 }}
                            animate={pageLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        >
                            <div className="w-full max-w-md">
                                {/* Register Card */}
                                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/40 p-8 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-blue-500/0 group-hover:from-cyan-500/5 group-hover:via-transparent group-hover:to-blue-500/5 transition-all duration-500"></div>

                                    {/* Shield Icon */}
                                    <motion.div
                                        className="relative z-10 flex justify-center mb-6"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={pageLoaded ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                                        transition={{ duration: 0.7 }}
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-blue-600/30">
                                            <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />
                                        </div>
                                    </motion.div>

                                    {/* Titles */}
                                    <h2 className="relative z-10 text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Create Account</h2>
                                    <p className="relative z-10 text-center text-slate-600 dark:text-slate-400 text-sm mb-8">Join thousands of students managing their tasks efficiently</p>

                                    {/* Form */}
                                    <motion.form
                                        onSubmit={handleSubmit}
                                        className="relative z-10 space-y-4"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate={pageLoaded ? "visible" : "hidden"}
                                    >
                                        {apiError && (
                                            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">{apiError}</p>
                                        )}
                                        {apiSuccess && (
                                            <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg px-3 py-2">{apiSuccess}</p>
                                        )}
                                        {/* Full Name */}
                                        <motion.div className="form-group" variants={itemVariants}>
                                            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Full Name
                                            </label>
                                            <motion.div
                                                className={`relative transition-all duration-300 ${focusedInput === 'fullName' ? 'scale-105' : 'scale-100'}`}
                                                animate={errors.fullName ? { x: [0, -5, 5, 0] } : { x: 0 }}
                                            >
                                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${focusedInput === 'fullName' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={1.5} />
                                                <input
                                                    id="fullName"
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedInput('fullName')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    placeholder="John Doe"
                                                    required
                                                    aria-label="Full name"
                                                    aria-invalid={!!errors.fullName}
                                                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                                                    className={`w-full pl-12 pr-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 border-2 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300 focus:outline-none ${errors.fullName ? 'border-red-500 dark:border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20'}`}
                                                />
                                            </motion.div>
                                            {errors.fullName && (
                                                <motion.p
                                                    id="fullName-error"
                                                    className="text-sm text-red-500 dark:text-red-400 mt-1 flex items-center gap-1"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle className="w-4 h-4" /> {errors.fullName}
                                                </motion.p>
                                            )}
                                        </motion.div>

                                        {/* Email */}
                                        <motion.div className="form-group" variants={itemVariants}>
                                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Email Address
                                            </label>
                                            <motion.div
                                                className={`relative transition-all duration-300 ${focusedInput === 'email' ? 'scale-105' : 'scale-100'}`}
                                                animate={errors.email ? { x: [0, -5, 5, 0] } : { x: 0 }}
                                            >
                                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${focusedInput === 'email' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={1.5} />
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedInput('email')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    placeholder="student@university.edu"
                                                    required
                                                    aria-label="Email address"
                                                    aria-invalid={!!errors.email}
                                                    aria-describedby={errors.email ? 'email-error' : undefined}
                                                    className={`w-full pl-12 pr-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 border-2 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300 focus:outline-none ${errors.email ? 'border-red-500 dark:border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20'}`}
                                                />
                                            </motion.div>
                                            {errors.email && (
                                                <motion.p
                                                    id="email-error"
                                                    className="text-sm text-red-500 dark:text-red-400 mt-1 flex items-center gap-1"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle className="w-4 h-4" /> {errors.email}
                                                </motion.p>
                                            )}
                                        </motion.div>

                                        {/* Password */}
                                        <motion.div className="form-group" variants={itemVariants}>
                                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Password
                                            </label>
                                            <motion.div
                                                className={`relative transition-all duration-300 ${focusedInput === 'password' ? 'scale-105' : 'scale-100'}`}
                                                animate={errors.password ? { x: [0, -5, 5, 0] } : { x: 0 }}
                                            >
                                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${focusedInput === 'password' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={1.5} />
                                                <input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedInput('password')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    placeholder="••••••••"
                                                    required
                                                    aria-label="Password"
                                                    aria-invalid={!!errors.password}
                                                    aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                                                    className={`w-full pl-12 pr-12 py-3 bg-slate-100/50 dark:bg-slate-900/50 border-2 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300 focus:outline-none ${errors.password ? 'border-red-500 dark:border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 p-1"
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                                                    ) : (
                                                        <Eye className="w-5 h-5" strokeWidth={1.5} />
                                                    )}
                                                </button>
                                            </motion.div>

                                            {/* Password Strength Indicator */}
                                            {formData.password && (
                                                <motion.div
                                                    className="mt-3 space-y-2"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                >
                                                    <div className="flex gap-1" id="password-strength">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-2 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength
                                                                    ? passwordStrength <= 2
                                                                        ? 'bg-red-500'
                                                                        : passwordStrength <= 3
                                                                            ? 'bg-orange-500'
                                                                            : 'bg-green-500'
                                                                    : 'bg-slate-300 dark:bg-slate-600'
                                                                    }`}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        {passwordStrength <= 2 && 'Weak password'}
                                                        {passwordStrength === 3 && 'Fair password'}
                                                        {passwordStrength === 4 && 'Good password'}
                                                        {passwordStrength === 5 && 'Strong password ✓'}
                                                    </p>
                                                </motion.div>
                                            )}

                                            {errors.password && (
                                                <motion.p
                                                    id="password-error"
                                                    className="text-sm text-red-500 dark:text-red-400 mt-1 flex items-center gap-1"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle className="w-4 h-4" /> {errors.password}
                                                </motion.p>
                                            )}
                                        </motion.div>

                                        {/* Confirm Password */}
                                        <motion.div className="form-group" variants={itemVariants}>
                                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Confirm Password
                                            </label>
                                            <motion.div
                                                className={`relative transition-all duration-300 ${focusedInput === 'confirmPassword' ? 'scale-105' : 'scale-100'}`}
                                                animate={errors.confirmPassword ? { x: [0, -5, 5, 0] } : { x: 0 }}
                                            >
                                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${focusedInput === 'confirmPassword' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={1.5} />
                                                <input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedInput('confirmPassword')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    placeholder="••••••••"
                                                    required
                                                    aria-label="Confirm password"
                                                    aria-invalid={!!errors.confirmPassword}
                                                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                                                    className={`w-full pl-12 pr-12 py-3 bg-slate-100/50 dark:bg-slate-900/50 border-2 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300 focus:outline-none ${errors.confirmPassword ? 'border-red-500 dark:border-red-400' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 p-1"
                                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                                                    ) : (
                                                        <Eye className="w-5 h-5" strokeWidth={1.5} />
                                                    )}
                                                </button>
                                            </motion.div>

                                            {/* Password Match Indicator */}
                                            {formData.password && formData.confirmPassword && (
                                                <motion.div
                                                    className="mt-2 flex items-center gap-2"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                >
                                                    {formData.password === formData.confirmPassword ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            <span className="text-xs text-green-600 dark:text-green-400">Passwords match</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="w-4 h-4 text-orange-500" />
                                                            <span className="text-xs text-orange-600 dark:text-orange-400">Passwords don't match</span>
                                                        </>
                                                    )}
                                                </motion.div>
                                            )}

                                            {errors.confirmPassword && (
                                                <motion.p
                                                    id="confirmPassword-error"
                                                    className="text-sm text-red-500 dark:text-red-400 mt-1 flex items-center gap-1"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
                                                </motion.p>
                                            )}
                                        </motion.div>

                                        {/* Student ID (Optional) */}
                                        <motion.div className="form-group" variants={itemVariants}>
                                            <label htmlFor="studentId" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Student ID <span className="text-slate-500 dark:text-slate-400 text-xs font-normal">(Optional)</span>
                                            </label>
                                            <div className={`relative transition-all duration-300 ${focusedInput === 'studentId' ? 'scale-105' : 'scale-100'}`}>
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-semibold">#</span>
                                                <input
                                                    id="studentId"
                                                    type="text"
                                                    name="studentId"
                                                    value={formData.studentId}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedInput('studentId')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    placeholder="2024001"
                                                    aria-label="Student ID"
                                                    className="w-full pl-8 pr-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 hover:border-slate-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </motion.div>

                                        {/* Remember Me */}
                                        <motion.div className="flex items-center pt-2" variants={itemVariants}>
                                            <label className="flex items-center gap-2 cursor-pointer group/checkbox">
                                                <input
                                                    type="checkbox"
                                                    name="rememberMe"
                                                    checked={formData.rememberMe}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 cursor-pointer accent-blue-600 dark:accent-blue-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50"
                                                    aria-label="Remember me"
                                                />
                                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover/checkbox:text-slate-700 dark:group-hover/checkbox:text-slate-300 transition-colors duration-200">I agree to Terms & Privacy Policy</span>
                                            </label>
                                        </motion.div>

                                        {/* Create Account Button */}
                                        <motion.button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/50 dark:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-6"
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            aria-label="Create account button"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Creating Account...</span>
                                                </>
                                            ) : (
                                                'Create Account'
                                            )}
                                        </motion.button>

                                        {/* Already have account link */}
                                        <motion.p className="text-center text-slate-600 dark:text-slate-400 text-sm" variants={itemVariants}>
                                            Already have an account?{' '}
                                            <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 hover:underline">
                                                Login
                                            </Link>
                                        </motion.p>
                                    </motion.form>

                                    {/* Divider */}
                                    <motion.div className="relative z-10 my-6" variants={itemVariants}>
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-300/50 dark:border-slate-700/50"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">Or sign up with</span>
                                        </div>
                                    </motion.div>

                                    {/* Google Sign Up Button */}
                                    <motion.button
                                        type="button"
                                        onClick={() => handleSocialLogin('Google')}
                                        className="w-full py-3 px-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl font-semibold text-slate-900 dark:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-md hover:shadow-lg dark:shadow-blue-600/10 relative z-10"
                                        variants={itemVariants}
                                        aria-label="Sign up with Google"
                                    >
                                        <Chrome className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                                        <span>Sign up with Google</span>
                                    </motion.button>
                                </div>

                                {/* Terms Text */}
                                <motion.p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6" variants={itemVariants}>
                                    By creating an account, you accept our{' '}
                                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
                                </motion.p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
