import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, Eye, EyeOff, Chrome, Facebook } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setPageLoaded(true);
    }, []);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/users/login`, {
                email,
                password,
            });

            if (rememberMe) {
                localStorage.setItem('student_user', JSON.stringify(data.user));
            } else {
                sessionStorage.setItem('student_user', JSON.stringify(data.user));
            }

            navigate('/dashboard');
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || 'Login failed. Please check your credentials and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        console.log(`Login with ${provider}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 overflow-hidden">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
                        <a href="login" className="px-6 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600">
                            Login
                        </a>
                       <a href="register" className="px-6 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600">
                            Register
                        </a>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">

                        {/* Left Side - Dashboard Preview */}
                        <div className={`hidden lg:flex flex-col items-center justify-center transition-all duration-1000 ${pageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                            {/* Dashboard Card Preview */}
                            <div className="relative w-full max-w-sm">
                                {/* Floating decorative element */}
                                <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-cyan-300/30 to-blue-300/30 dark:from-cyan-600/20 dark:to-blue-600/20 rounded-full blur-2xl"></div>

                                {/* Main Dashboard Card */}
                                <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-slate-700/30 p-6 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>

                                    {/* Dashboard Header */}
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

                                    {/* Task Overview Section */}
                                    <div className="relative z-10 mb-6">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Task Overview</h4>

                                        {/* Pie Chart Visualization */}
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-24 h-24">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" opacity="0.3"></circle>
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="none"
                                                        stroke="#10b981"
                                                        strokeWidth="8"
                                                        strokeDasharray="150.8 251.3"
                                                        className="transition-all duration-700"
                                                    ></circle>
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="none"
                                                        stroke="#f97316"
                                                        strokeWidth="8"
                                                        strokeDasharray="75.4 251.3"
                                                        strokeDashoffset="-150.8"
                                                        className="transition-all duration-700"
                                                    ></circle>
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold text-slate-900 dark:text-white">60%</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">Complete</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Legend */}
                                            <div className="flex flex-col gap-2 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                    <span className="text-slate-600 dark:text-slate-400">Completed</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                                    <span className="text-slate-600 dark:text-slate-400">In Progress</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                                    <span className="text-slate-600 dark:text-slate-400">Pending</span>
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

                                {/* Mobile Phone Mockup - Floating */}
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

                                {/* Floating plants and elements */}
                                <div className="absolute -bottom-12 left-8 text-6xl opacity-20 dark:opacity-10 transform -rotate-12">🌿</div>
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="hidden lg:block absolute left-1/2 top-1/3 bottom-1/3 w-px bg-gradient-to-b from-transparent via-slate-300/50 dark:via-slate-700/50 to-transparent"></div>

                        {/* Right Side - Login Form */}
                        <div className={`flex flex-col items-center justify-center transition-all duration-1000 delay-200 ${pageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                            <div className="w-full max-w-md">
                                {/* Login Card */}
                                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/40 p-8 relative overflow-hidden group">
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-blue-500/0 group-hover:from-cyan-500/5 group-hover:via-transparent group-hover:to-blue-500/5 transition-all duration-500"></div>

                                    {/* Lock Icon */}
                                    <div className={`relative z-10 flex justify-center mb-6 transition-all duration-700 ${pageLoaded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-blue-600/30">
                                            <Lock className="w-8 h-8 text-white" strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h2 className="relative z-10 text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Login</h2>
                                    <p className="relative z-10 text-center text-slate-600 dark:text-slate-400 text-sm mb-8">Welcome back! Please login to your account.</p>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                                        {errorMessage && (
                                            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                                                {errorMessage}
                                            </p>
                                        )}

                                        {/* Email Input */}
                                        <div className="group/email">
                                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Email Address
                                            </label>
                                            <div className={`relative transition-all duration-300 ${focusedInput === 'email' ? 'scale-105' : 'scale-100'}`}>
                                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${focusedInput === 'email' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={1.5} />
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    onFocus={() => setFocusedInput('email')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    placeholder="you@example.com"
                                                    required
                                                    aria-label="Email address"
                                                    className="w-full pl-12 pr-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 hover:border-slate-300 dark:hover:border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Password Input */}
                                        <div className="group/password">
                                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Password
                                            </label>
                                            <div className={`relative transition-all duration-300 ${focusedInput === 'password' ? 'scale-105' : 'scale-100'}`}>
                                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${focusedInput === 'password' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={1.5} />
                                                <input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onFocus={() => setFocusedInput('password')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    placeholder="••••••••"
                                                    required
                                                    aria-label="Password"
                                                    className="w-full pl-12 pr-12 py-3 bg-slate-100/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-300 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 hover:border-slate-300 dark:hover:border-slate-600"
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
                                            </div>
                                        </div>

                                        {/* Remember Me & Forgot Password */}
                                        <div className="flex items-center justify-between pt-2">
                                            <label className="flex items-center gap-2 cursor-pointer group/checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 cursor-pointer accent-blue-600 dark:accent-blue-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50"
                                                    aria-label="Remember me"
                                                />
                                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover/checkbox:text-slate-700 dark:group-hover/checkbox:text-slate-300 transition-colors duration-200">Remember me</span>
                                            </label>
                                            <a href="#" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 hover:underline">
                                                Forgot Password?
                                            </a>
                                        </div>

                                        {/* Login Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/50 dark:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                            aria-label="Login button"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Logging in...</span>
                                                </>
                                            ) : (
                                                'Login'
                                            )}
                                        </button>

                                        {/* Register Link */}
                                        <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                                            Don't have an account?{' '}
                                            <a href="register" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 hover:underline">
                                                Register
                                            </a>
                                        </p>
                                    </form>

                                    {/* Divider */}
                                    <div className="relative z-10 my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-300/50 dark:border-slate-700/50"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">Or continue with</span>
                                        </div>
                                    </div>

                                    {/* Social Login Buttons */}
                                    <div className="relative z-10 space-y-3">
                                        {/* Google Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleSocialLogin('Google')}
                                            className="w-full py-3 px-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl font-semibold text-slate-900 dark:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-md hover:shadow-lg dark:shadow-blue-600/10"
                                            aria-label="Login with Google"
                                        >
                                            <Chrome className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                                            <span>Login with Google</span>
                                        </button>

                                       {/*  Facebook Button */}
                                        {/* <button
                                            type="button"
                                            onClick={() => handleSocialLogin('Facebook')}
                                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-md shadow-blue-600/50 dark:shadow-blue-600/30"
                                            aria-label="Login with Facebook"
                                        >
                                            <Facebook className="w-5 h-5" strokeWidth={1.5} />
                                            <span>Login with Facebook</span>
                                        </button> */}
                                    </div>
                                </div>

                                {/* Bottom Info */}
                                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
                                    By signing in, you agree to our{' '}
                                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
