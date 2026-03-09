import { useState } from 'react';
import { X, Calendar, Clock, Tag, FileText, ChevronDown } from 'lucide-react';

// Class Timetable Data
const CLASS_TIMETABLE = {
  section: 'D',
  semester: 'II',
  classRoom: 'NC 36',
  schedule: [
    { day: 'MON', time: '09:00-09:55', subject: 'EJAVA', label: 'EJAVA' },
    { day: 'MON', time: '09:55-10:50', subject: 'AWT', label: 'AWT' },
    { day: 'MON', time: '11:10-12:05', subject: 'FSDD/ADSA', label: 'FSDD/ADSA' },
    { day: 'MON', time: '12:05-13:00', subject: 'PCS', label: 'PCS' },
    { day: 'MON', time: '13:00-13:55', subject: 'SET', label: 'SET' },
    { day: 'MON', time: '13:55-14:50', subject: 'DW&DM', label: 'DW&DM' },
    { day: 'MON', time: '14:50-15:40', subject: 'Placement', label: 'Placement' },
    { day: 'TUE', time: '09:00-09:55', subject: 'DW&DM', label: 'DW&DM' },
    { day: 'TUE', time: '09:55-10:50', subject: 'WDR&P', label: 'WDR&P' },
    { day: 'TUE', time: '11:10-12:05', subject: 'FSDD/DIP&PR', label: 'FSDD/DIP&PR' },
    { day: 'TUE', time: '12:05-13:00', subject: 'Japanese Class', label: 'Japanese' },
    { day: 'WED', time: '09:00-09:55', subject: 'Japanese Class', label: 'Japanese' },
    { day: 'WED', time: '09:55-10:50', subject: 'SET', label: 'SET' },
    { day: 'WED', time: '11:10-12:05', subject: 'AWT', label: 'AWT' },
    { day: 'WED', time: '12:05-13:00', subject: 'EJAVA', label: 'EJAVA' },
    { day: 'THU', time: '09:00-09:55', subject: 'SET', label: 'SET' },
    { day: 'THU', time: '09:55-10:50', subject: 'DW&DM', label: 'DW&DM' },
    { day: 'THU', time: '11:10-12:05', subject: 'EJAVA', label: 'EJAVA' },
    { day: 'THU', time: '12:05-13:00', subject: 'AWT', label: 'AWT' },
    { day: 'FRI', time: '09:00-09:55', subject: 'WDR&P/ADSA', label: 'WDR&P/ADSA' },
    { day: 'FRI', time: '09:55-10:50', subject: 'FSDD/DIP&PR', label: 'FSDD/DIP&PR' },
    { day: 'FRI', time: '11:10-12:05', subject: 'SET', label: 'SET' },
    { day: 'FRI', time: '12:05-13:00', subject: 'Japanese Class', label: 'Japanese' },
  ],
};

const SUBJECT_OPTIONS = [
  'EJAVA',
  'AWT',
  'FSDD/ADSA',
  'PCS',
  'SET',
  'DW&DM',
  'WDR&P',
  'DIP&PR',
  'Japanese',
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-emerald-500/20 text-emerald-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-700' },
  { value: 'high', label: 'High', color: 'bg-rose-500/20 text-rose-700' },
];

export default function TaskModal({ isOpen, onClose, onAdd, isDark }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'EJAVA',
    deadline: '',
    priority: 'medium',
    description: '',
  });
  const [showTimetable, setShowTimetable] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const isSaved = await onAdd({
      id: Date.now(),
      ...formData,
      deadline: new Date(formData.deadline),
      completed: false,
      createdAt: new Date(),
    });

    if (isSaved) {
      setFormData({
        title: '',
        subject: 'EJAVA',
        deadline: '',
        priority: 'medium',
        description: '',
      });
    }
  };

  if (!isOpen) return null;

  const groupedSchedule = CLASS_TIMETABLE.schedule.reduce((acc, item) => {
    const dayIndex = acc.findIndex((d) => d.day === item.day);
    if (dayIndex >= 0) {
      acc[dayIndex].slots.push(item);
    } else {
      acc.push({ day: item.day, slots: [item] });
    }
    return acc;
  }, []);

  const priorityOption = PRIORITY_OPTIONS.find((p) => p.value === formData.priority);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 ${isDark ? 'bg-black/60' : 'bg-black/40'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Geist:wght@400;500;700&display=swap');
        
        .modal-container {
          font-family: 'Geist', sans-serif;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .modal-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .modal-container::-webkit-scrollbar-thumb {
          background: ${isDark ? '#4b5563' : '#cbd5e1'};
          border-radius: 3px;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .input-field {
          transition: all 0.2s ease;
        }
        
        .input-field:focus {
          box-shadow: 0 0 0 3px ${isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)'};
        }
      `}</style>

      <div className={`modal-container w-full max-w-xl rounded-2xl shadow-2xl ${isDark ? 'bg-slate-950 border border-slate-800' : 'bg-white border border-slate-100'}`}>
        {/* Header */}
        <div className={`relative px-8 py-6 border-b ${isDark ? 'border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950' : 'border-slate-100 bg-gradient-to-r from-slate-50 to-white'}`}>
          <button
            onClick={onClose}
            className={`absolute right-6 top-6 p-2 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <FileText className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Create New Task</h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Add a new task to your schedule</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6">
          {/* Timetable Toggle */}
          <button
            onClick={() => setShowTimetable(!showTimetable)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'}`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Class Timetable (Semester {CLASS_TIMETABLE.semester}, Section {CLASS_TIMETABLE.section})</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${showTimetable ? 'rotate-180' : ''}`} />
          </button>

          {/* Timetable Section */}
          {showTimetable && (
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Weekly Schedule</h3>
                <span className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                  Room {CLASS_TIMETABLE.classRoom}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedSchedule.map((dayData) => (
                  <div
                    key={dayData.day}
                    className={`rounded-lg p-4 border ${isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-slate-200'}`}
                  >
                    <h4 className={`font-semibold text-sm mb-3 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{dayData.day}</h4>
                    <div className="space-y-2">
                      {dayData.slots.map((slot, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-2 p-2 rounded text-xs ${isDark ? 'bg-slate-700/40 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                        >
                          <Clock className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-60" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold">{slot.time}</div>
                            <div className="opacity-75">{slot.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="Enter task title"
                className={`input-field w-full px-4 py-3 rounded-lg border text-sm transition-all ${errors.title
                    ? isDark
                      ? 'border-rose-500/50 bg-slate-800 text-white'
                      : 'border-rose-300 bg-rose-50 text-slate-900'
                    : isDark
                      ? 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500'
                  }`}
              />
              {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
            </div>

            {/* Subject & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject Select */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`input-field w-full px-4 py-3 rounded-lg border text-sm appearance-none bg-no-repeat bg-right-4 pr-10 transition-all ${isDark
                      ? 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500'
                    }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDark ? '%236b7280' : '%23666'}'%0A d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  }}
                >
                  {SUBJECT_OPTIONS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Select */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Priority <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className={`input-field w-full px-4 py-3 rounded-lg border text-sm appearance-none bg-no-repeat bg-right-4 pr-10 transition-all ${isDark
                      ? 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500'
                    }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDark ? '%236b7280' : '%23666'}'%0A d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  }}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deadline Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Deadline <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className={`absolute left-4 top-3.5 h-4 w-4 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => {
                    setFormData({ ...formData, deadline: e.target.value });
                    if (errors.deadline) setErrors({ ...errors, deadline: '' });
                  }}
                  className={`input-field w-full pl-11 pr-4 py-3 rounded-lg border text-sm transition-all ${errors.deadline
                      ? isDark
                        ? 'border-rose-500/50 bg-slate-800 text-white'
                        : 'border-rose-300 bg-rose-50 text-slate-900'
                      : isDark
                        ? 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500'
                    }`}
                />
              </div>
              {errors.deadline && <p className="text-xs text-rose-500 mt-1">{errors.deadline}</p>}
            </div>

            {/* Description Textarea */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add any additional notes or details..."
                rows="4"
                className={`input-field w-full px-4 py-3 rounded-lg border text-sm resize-none transition-all ${isDark
                    ? 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                    : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500'
                  }`}
              />
            </div>

            {/* Priority Badge Preview */}
            {formData.priority && (
              <div className="pt-2">
                <span className={`text-xs font-medium px-3 py-1 rounded-full inline-block ${priorityOption.color}`}>
                  {priorityOption.label} Priority
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t" style={{ borderColor: isDark ? '#1e293b' : '#f1f5f9' }}>
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/30 active:scale-95"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}