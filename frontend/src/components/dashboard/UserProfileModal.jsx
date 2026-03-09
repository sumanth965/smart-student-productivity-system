import { X, Mail, Phone, BookOpen, Calendar, Award, MapPin, User as UserIcon, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '../../lib/axios';

export default function UserProfileModal({ isOpen, onClose, isDark }) {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchUserData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const persistedUser = localStorage.getItem('student_user') || sessionStorage.getItem('student_user');
                if (!persistedUser) {
                    setError('User information not found');
                    setIsLoading(false);
                    return;
                }

                const parsedUser = JSON.parse(persistedUser);
                const userId = parsedUser._id || parsedUser.id;

                if (!userId) {
                    setError('Invalid user information');
                    setIsLoading(false);
                    return;
                }

                // Fetch full user data from database
                const response = await axios.get(`/api/students/${userId}`);
                if (response.data.success) {
                    setUserData(response.data.data);
                } else {
                    setError('Failed to fetch user data');
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [isOpen]);

    if (!isOpen) return null;

    const profileFields = userData ? [
        { label: 'Full Name', value: userData.name, icon: UserIcon },
        { label: 'Email', value: userData.email || 'N/A', icon: Mail },
        { label: 'Phone', value: userData.phone || 'N/A', icon: Phone },
        { label: 'USN', value: userData.usn || 'N/A', icon: Award },
        { label: 'Roll No', value: userData.rollNo || 'N/A', icon: MapPin },
        { label: 'Class', value: userData.class || 'N/A', icon: BookOpen },
        { label: 'Section', value: userData.section || 'N/A', icon: BookOpen },
        { label: 'Join Year', value: userData.joinYear || 'N/A', icon: Calendar },
        { label: 'Passout Year', value: userData.passoutYear || 'N/A', icon: Calendar },
        { label: 'Parent Phone', value: userData.parentPhone || 'N/A', icon: Phone },
        { label: 'Status', value: userData.status || 'N/A', icon: Award },
        { label: 'Role', value: userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1) || 'N/A', icon: Award },
    ] : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm min-h-screen">
            <div className={`w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                {/* Header - Fixed */}
                <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        My Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className={`rounded-lg p-2 transition-colors flex-shrink-0 ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto flex-1 p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading profile...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                                {error}
                            </div>
                        </div>
                    ) : userData ? (
                        <>
                            {/* Profile Avatar Section */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg flex-shrink-0">
                                    <span className="text-2xl font-bold text-white">
                                        {userData.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {userData.name || 'Student'}
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1) || 'Student'} Account
                                </p>
                            </div>

                            {/* Profile Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profileFields.map((field, index) => {
                                    const Icon = field.icon;
                                    return (
                                        <div
                                            key={index}
                                            className={`rounded-lg p-4 flex items-start gap-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                                                }`}
                                        >
                                            <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {field.label}
                                                </p>
                                                <p className={`text-sm font-semibold mt-1 break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {field.value}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer - Fixed */}
                <div className={`flex justify-end gap-3 p-6 border-t flex-shrink-0 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex-shrink-0 ${isDark
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                            }`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}