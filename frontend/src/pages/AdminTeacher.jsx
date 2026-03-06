import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    Users, Plus, Upload, Search, Filter, LogOut, Eye, Edit3, Trash2,
    Mail, Copy, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronLeft,
    ClipboardCopy, Download, X, User, Phone, BookOpen, Hash, Calendar,
    Shield, FileText, Key, ChevronDown, Check, Loader2, Bell, MoreVertical,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../lib/axios';

// ─── Constants ───────────────────────────────────────────────────────────────
const CLASS_OPTIONS = ['11A', '11B', '12A', '12B'];
const SECTION_OPTIONS = ['A', 'B', 'C'];
const JOIN_YEARS = ['2023', '2024', '2025', '2026'];
const PASSOUT_YEARS = ['2025', '2026', '2027', '2028'];
const STATUS_OPTIONS = ['Active', 'Suspended'];

const INITIAL_FORM = {
    name: '', usn: '', phone: '', email: '', class: '12A', section: 'A',
    rollNo: '', joinYear: '2026', passoutYear: '2027', parentPhone: '',
    status: 'Active', notes: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateLoginId(usn) { return usn ? usn.toUpperCase() : ''; }
function generatePassword(usn) { return usn ? `${usn.toUpperCase()}@2026` : ''; }

function validateStudent(data, existingStudents, editingId) {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Full name is required';
    if (!data.usn.trim()) {
        errors.usn = 'USN is required';
    } else {
        const dup = existingStudents.find(
            s => s.usn.toUpperCase() === data.usn.toUpperCase() && s.id !== editingId
        );
        if (dup) errors.usn = 'USN already exists';
    }
    if (!data.rollNo.trim()) errors.rollNo = 'Roll No is required';
    if (data.phone && !/^\d{10}$/.test(data.phone.replace(/\D/g, '')))
        errors.phone = 'Enter valid 10-digit phone';
    if (data.parentPhone && !/^\d{10}$/.test(data.parentPhone.replace(/\D/g, '')))
        errors.parentPhone = 'Enter valid 10-digit phone';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        errors.email = 'Enter valid email address';
    return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Toast notification
function Toast({ toasts, dismiss }) {
    return (
        <div className="fixed bottom-6 right-6 z-[100] space-y-3 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl
            border backdrop-blur-xl min-w-[300px] max-w-sm
            ${t.type === 'success'
                            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
                            : t.type === 'error'
                                ? 'bg-red-50/95 border-red-200 text-red-800'
                                : 'bg-blue-50/95 border-blue-200 text-blue-800'}
            animate-[slideIn_0.3s_ease]`}
                >
                    {t.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" />
                        : t.type === 'error' ? <XCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
                            : <Bell className="w-5 h-5 mt-0.5 shrink-0 text-blue-500" />}
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{t.title}</p>
                        {t.message && <p className="text-xs opacity-80 mt-0.5">{t.message}</p>}
                    </div>
                    <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

// Status badge
function StatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap
      ${status === 'Active'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700'
                : 'bg-red-500/15 border-red-500/40 text-red-700'}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {status}
        </span>
    );
}

// Login credential badge with copy
function LoginBadge({ usn, onCopy }) {
    const [copied, setCopied] = useState(false);
    const loginId = generateLoginId(usn);
    const password = generatePassword(usn);

    const handleCopy = () => {
        navigator.clipboard.writeText(`Login: ${loginId} | Pass: ${password}`).then(() => {
            setCopied(true);
            onCopy?.();
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            title={`Login: ${loginId} | Pass: ${password} (click to copy)`}
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold
        transition-all duration-200 hover:scale-105
        ${copied
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 ring-2 ring-emerald-300/40'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:shadow-md'}`}
        >
            {copied ? <Check className="w-3 h-3" /> : <Key className="w-3 h-3" />}
            {loginId || '—'}
        </button>
    );
}

// Field component
function Field({ label, required, error, icon: Icon, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 tracking-wide uppercase">
                {Icon && <Icon className="inline w-3 h-3 mr-1 opacity-70" />}
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{error}
                </p>
            )}
        </div>
    );
}

// Input wrapper
function Input({ className = '', ...props }) {
    return (
        <input
            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none transition-all text-sm
        border-slate-200 bg-white/80 text-slate-900 placeholder-slate-400
        focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
        hover:border-slate-300 ${className}`}
            {...props}
        />
    );
}

// Select wrapper
function Select({ className = '', children, ...props }) {
    return (
        <select
            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none transition-all text-sm
        border-slate-200 bg-white/80 text-slate-900
        focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}

// Confirm Delete Modal
function DeleteModal({ student, onConfirm, onCancel }) {
    if (!student) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-red-100">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-7 h-7 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Student?</h3>
                    <p className="text-slate-600 text-sm">
                        This will permanently remove <strong>{student.name}</strong> ({student.usn}) and their login credentials.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(student.id)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// View Tasks Modal
function ViewTasksModal({ student, onClose }) {
    if (!student) return null;
    const mockTasks = [
        { id: 1, title: 'Math Assignment #3', status: 'Pending', due: '2026-03-10' },
        { id: 2, title: 'English Essay', status: 'Submitted', due: '2026-03-05' },
        { id: 3, title: 'Physics Lab Report', status: 'Overdue', due: '2026-03-01' },
    ];
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full mx-4 border border-blue-100">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{student.name}'s Tasks</h3>
                        <p className="text-sm text-slate-500">{student.class}-{student.section} · USN: {student.usn}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {mockTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                                <p className="font-semibold text-sm text-slate-800">{task.title}</p>
                                <p className="text-xs text-slate-500">Due: {task.due}</p>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                ${task.status === 'Submitted' ? 'bg-emerald-100 text-emerald-700'
                                    : task.status === 'Overdue' ? 'bg-red-100 text-red-700'
                                        : 'bg-amber-100 text-amber-700'}`}>
                                {task.status}
                            </span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

// CSV Import Modal
function CSVImportModal({ onClose, onImport }) {
    const [step, setStep] = useState('upload'); // upload | preview | success
    const [preview, setPreview] = useState([]);
    const [dragging, setDragging] = useState(false);
    const fileRef = useRef(null);

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
        return lines.slice(1).map((line, idx) => {
            const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const obj = {};
            headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
            return {
                id: `csv-${Date.now()}-${idx}`,
                name: obj.name || obj.fullname || '',
                usn: obj.usn || '',
                phone: obj.phone || '',
                email: obj.email || '',
                class: obj.class || '12A',
                section: obj.section || 'A',
                rollNo: obj.rollno || obj.roll || '',
                joinYear: obj.joinyear || '2026',
                passoutYear: obj.passoutyear || '2027',
                parentPhone: obj.parentphone || '',
                status: obj.status || 'Active',
                notes: obj.notes || '',
                loginId: (obj.usn || '').toUpperCase(),
                password: `${(obj.usn || '').toUpperCase()}@2026`,
                createdAt: new Date().toISOString(),
            };
        }).filter(s => s.name && s.usn);
    };

    const handleFile = (file) => {
        if (!file || !file.name.endsWith('.csv')) return;
        const reader = new FileReader();
        reader.onload = e => {
            setPreview(parseCSV(e.target.result));
            setStep('preview');
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-7 max-w-2xl w-full mx-4 border border-indigo-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                        {step === 'upload' ? '📋 Import Students via CSV'
                            : step === 'preview' ? `👀 Preview — ${preview.length} students found`
                                : '🎉 Import Successful!'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 'upload' && (
                    <>
                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                            onClick={() => fileRef.current?.click()}
                            className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                ${dragging
                                    ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
                                    : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                        >
                            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="font-semibold text-slate-700 mb-1">Drop CSV file here or click to browse</p>
                            <p className="text-sm text-slate-400">Supports: name, usn, phone, email, class, section, rollNo, joinYear, passoutYear, status</p>
                            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                        </div>
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 font-mono">
                            <p className="font-bold mb-1">CSV Format (headers):</p>
                            name, usn, phone, email, class, section, rollNo, joinYear, passoutYear, parentPhone, status, notes
                        </div>
                    </>
                )}

                {step === 'preview' && (
                    <>
                        <div className="overflow-auto max-h-[40vh] rounded-xl border border-slate-100 mb-4">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        {['Name', 'USN', 'Class', 'Section', 'Phone', 'Login ID', 'Password'].map(h => (
                                            <th key={h} className="px-3 py-2.5 text-left font-semibold text-slate-600 text-xs whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map(s => (
                                        <tr key={s.id} className="border-t border-slate-100 hover:bg-blue-50/30 transition-colors">
                                            <td className="px-3 py-2 font-medium text-slate-800">{s.name}</td>
                                            <td className="px-3 py-2 font-mono text-indigo-700">{s.usn}</td>
                                            <td className="px-3 py-2">{s.class}</td>
                                            <td className="px-3 py-2">{s.section}</td>
                                            <td className="px-3 py-2 text-slate-500">{s.phone || '—'}</td>
                                            <td className="px-3 py-2 font-mono text-xs bg-indigo-50 rounded">{s.loginId}</td>
                                            <td className="px-3 py-2 font-mono text-xs bg-emerald-50 rounded">{s.password}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('upload')} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all">Back</button>
                            <button
                                onClick={() => { onImport(preview); setStep('success'); }}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
                            >
                                ✅ Confirm Import ({preview.length} students)
                            </button>
                        </div>
                    </>
                )}

                {step === 'success' && (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 mb-2">{preview.length} Students Imported!</h4>
                        <p className="text-slate-500 mb-6">All login credentials have been auto-generated.</p>
                        <button onClick={onClose} className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:shadow-lg transition-all">
                            Done 🎉
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Task Assignment Modal ────────────────────────────────────────────────────
function TaskAssignmentModal({ onClose, onAssign, taskForm, setTaskForm, errors, assigning }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            // Clear error when user starts typing
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full mx-4 border border-blue-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Assign New Task 📝</h3>
                        <p className="text-sm text-slate-500">Create and assign tasks to students by class/section</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Task Title */}
                    <Field label="Task Title" required error={errors.title}>
                        <Input
                            name="title"
                            value={taskForm.title}
                            onChange={handleChange}
                            placeholder="e.g., Complete Math Assignment #5"
                            className={errors.title ? 'border-red-400 focus:ring-red-200' : ''}
                        />
                    </Field>

                    {/* Subject */}
                    <Field label="Subject" required error={errors.subject}>
                        <Input
                            name="subject"
                            value={taskForm.subject}
                            onChange={handleChange}
                            placeholder="e.g., Mathematics, Physics, Chemistry"
                            className={errors.subject ? 'border-red-400 focus:ring-red-200' : ''}
                        />
                    </Field>

                    {/* Description */}
                    <Field label="Description" required error={errors.description}>
                        <textarea
                            name="description"
                            value={taskForm.description}
                            onChange={handleChange}
                            placeholder="Detailed task description and instructions..."
                            rows={3}
                            className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none transition-all text-sm resize-none
                                ${errors.description
                                    ? 'border-red-400 focus:ring-red-200 bg-red-50/50'
                                    : 'border-slate-200 bg-white/80 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400'
                                }`}
                        />
                    </Field>

                    {/* Class and Section Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Target Class" required error={errors.assignment}>
                            <select
                                name="class"
                                value={taskForm.class}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            >
                                <option value="All">All Classes</option>
                                {['11A', '11B', '12A', '12B'].map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Target Section" required>
                            <select
                                name="section"
                                value={taskForm.section}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            >
                                <option value="All">All Sections</option>
                                {['A', 'B', 'C'].map(sec => (
                                    <option key={sec} value={sec}>Section {sec}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Due Date and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Due Date" required error={errors.dueDate}>
                            <Input
                                name="dueDate"
                                type="date"
                                value={taskForm.dueDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={errors.dueDate ? 'border-red-400 focus:ring-red-200' : ''}
                            />
                        </Field>

                        <Field label="Priority" required>
                            <select
                                name="priority"
                                value={taskForm.priority}
                                onChange={handleChange}
                                className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                                    ${taskForm.priority === 'High' ? 'border-red-300 bg-red-50/50 text-red-700' :
                                        taskForm.priority === 'Medium' ? 'border-amber-300 bg-amber-50/50 text-amber-700' :
                                            'border-slate-200 bg-white/80 text-slate-700'}`}
                            >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority</option>
                            </select>
                        </Field>
                    </div>

                    {/* Assignment Preview */}
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">📊 Assignment Preview</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p><strong>Class:</strong> {taskForm.class === 'All' ? 'All Classes' : taskForm.class}</p>
                            <p><strong>Section:</strong> {taskForm.section === 'All' ? 'All Sections' : `Section ${taskForm.section}`}</p>
                            <p><strong>Target Students:</strong> {taskForm.class === 'All' && taskForm.section === 'All' ? 'All students' :
                                `${taskForm.class === 'All' ? 'Multiple classes' : taskForm.class}${taskForm.section !== 'All' ? `-${taskForm.section}` : ''} students`}</p>
                            <p><strong>Due:</strong> {taskForm.dueDate || 'Not set'}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onAssign}
                            disabled={assigning}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
                        >
                            {assigning ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Assign Task
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminTeacher() {
    const navigate = useNavigate();

    // ── State ──────────────────────────────────────────────────────────────────
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [deleteModal, setDeleteModal] = useState(null); // student object
    const [viewTasksModal, setViewTasksModal] = useState(null);
    const [showCSVModal, setShowCSVModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('All');
    const [filterSection, setFilterSection] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [submitting, setSubmitting] = useState(false);
    const [newRowId, setNewRowId] = useState(null);  // for success animation
    const formRef = useRef(null);

    // ── Task Assignment State ──────────────────────────────────────────────────
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        subject: '',
        class: 'All',
        section: 'All',
        dueDate: '',
        priority: 'Medium',
        assignedStudents: [],
    });
    const [taskErrors, setTaskErrors] = useState({});
    const [assigningTask, setAssigningTask] = useState(false);

    // ── Toast helpers ──────────────────────────────────────────────────────────
    const addToast = useCallback((type, title, message) => {
        const id = Date.now();
        setToasts(t => [...t, { id, type, title, message }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(t => t.filter(x => x.id !== id));
    }, []);

    // ── Load students from backend ─────────────────────────────────────────────
    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const resp = await axios.get('/api/students');
                const data = Array.isArray(resp.data) ? resp.data
                    : Array.isArray(resp.data?.data) ? resp.data.data
                        : [];
                // Map MongoDB _id to id for compatibility
                const mappedData = data.map(student => ({
                    ...student,
                    id: student._id || student.id,
                }));
                setStudents(mappedData);
                console.log('✅ GET /api/students ─ loaded', mappedData.length, 'students');
            } catch (err) {
                // Backend offline or endpoint missing — start with empty list
                console.warn('⚠️ Could not fetch students from backend (offline?). Starting fresh.', err?.message || '');
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // ── Derived state ──────────────────────────────────────────────────────────
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const term = searchTerm.toLowerCase();
            const matchSearch = !term ||
                s.name.toLowerCase().includes(term) ||
                s.usn.toLowerCase().includes(term) ||
                (s.phone || '').includes(term) ||
                (s.email || '').toLowerCase().includes(term);
            const matchClass = filterClass === 'All' || s.class === filterClass;
            const matchSection = filterSection === 'All' || s.section === filterSection;
            const matchStatus = filterStatus === 'All' || s.status === filterStatus;
            return matchSearch && matchClass && matchSection && matchStatus;
        });
    }, [students, searchTerm, filterClass, filterSection, filterStatus]);

    // ── Form handlers ──────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM);
        setErrors({});
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validateStudent(formData, students, editingId);
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSubmitting(true);
        const studentPayload = {
            ...formData,
            loginId: generateLoginId(formData.usn),
            password: generatePassword(formData.usn),
            createdBy: 'teacher',
        };

        try {
            if (editingId) {
                // ── UPDATE
                const updatePayload = { ...studentPayload };
                delete updatePayload.password; // Don't send password in UPDATE
                console.log(`🔄 PUT /api/students/${editingId}`, updatePayload);
                const resp = await axios.put(`/api/students/${editingId}`, updatePayload);
                const updatedStudent = resp.data?.data || resp.data;
                setStudents(prev => prev.map(s => s.id === editingId || s._id === editingId ? { ...s, ...updatedStudent, id: updatedStudent._id || updatedStudent.id } : s));
                addToast('success', 'Student Updated ✏️', `${formData.name} has been updated.`);
                setEditingId(null);
            } else {
                // ── CREATE
                console.log('➕ POST /api/students', studentPayload);
                const resp = await axios.post('/api/students', studentPayload);
                const newStudent = resp.data?.data || resp.data;
                const mappedStudent = { ...newStudent, id: newStudent._id || newStudent.id };
                setStudents(prev => [mappedStudent, ...prev]);
                setNewRowId(mappedStudent.id);
                setTimeout(() => setNewRowId(null), 2000);
                addToast('success', `Student Created! 🎉`, `${formData.name} → Login: ${mappedStudent.loginId} | Pass: ${studentPayload.password}`);
            }
            resetForm();
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Could not save student';
            addToast('error', 'Error ❌', errMsg);
            console.error('Student save error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (student) => {
        setFormData({
            name: student.name, usn: student.usn, phone: student.phone || '',
            email: student.email || '', class: student.class, section: student.section,
            rollNo: student.rollNo || '', joinYear: student.joinYear || '2026',
            passoutYear: student.passoutYear || '2027', parentPhone: student.parentPhone || '',
            status: student.status, notes: student.notes || '',
        });
        setEditingId(student.id);
        setErrors({});
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleDelete = async (id) => {
        setSubmitting(true);
        try {
            console.log(`🗑️ DELETE /api/students/${id}`);
            await axios.delete(`/api/students/${id}`);
            setStudents(prev => prev.filter(s => s.id !== id && s._id !== id));
            addToast('success', 'Student Removed ✓', 'The student account has been deleted.');
            setDeleteModal(null);
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Could not delete student';
            addToast('error', 'Delete Error ❌', errMsg);
            console.error('Delete error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendLogin = (student) => {
        const creds = `Login: ${generateLoginId(student.usn)} | Password: ${generatePassword(student.usn)}`;
        navigator.clipboard.writeText(creds);
        addToast('info', 'Credentials Copied!', `${creds}`);
        console.log(`POST /api/admin/students/${student.id}/resend-login`);
    };

    const handleCSVImport = (csvStudents) => {
        setStudents(prev => [...csvStudents, ...prev]);
        console.log('POST /api/admin/students/csv-import', { count: csvStudents.length });
        addToast('success', `${csvStudents.length} Students Imported! 🎉`, 'Login credentials auto-generated for all.');
        setShowCSVModal(false);
    };

    // ── Task Assignment Handlers ───────────────────────────────────────────────
    const handleTaskChange = (e) => {
        const { name, value } = e.target;
        setTaskForm(prev => ({ ...prev, [name]: value }));
        if (taskErrors[name]) {
            setTaskErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateTaskForm = () => {
        const errors = {};
        if (!taskForm.title.trim()) errors.title = 'Task title is required';
        if (!taskForm.description.trim()) errors.description = 'Task description is required';
        if (!taskForm.subject.trim()) errors.subject = 'Subject is required';
        if (!taskForm.dueDate) errors.dueDate = 'Due date is required';
        if (taskForm.class === 'All' && taskForm.section === 'All') {
            errors.assignment = 'Please select at least one class or section';
        }
        return errors;
    };

    const handleAssignTask = async () => {
        const errors = validateTaskForm();
        if (Object.keys(errors).length > 0) {
            setTaskErrors(errors);
            return;
        }

        setAssigningTask(true);
        try {
            // Filter students based on class and section selection
            let targetStudents = students;
            if (taskForm.class !== 'All') {
                targetStudents = targetStudents.filter(s => s.class === taskForm.class);
            }
            if (taskForm.section !== 'All') {
                targetStudents = targetStudents.filter(s => s.section === taskForm.section);
            }

            const taskPayload = {
                ...taskForm,
                assignedTo: targetStudents.map(s => s._id || s.id),
                assignedCount: targetStudents.length,
            };

            console.log('📌 POST /api/tasks', taskPayload);
            const resp = await axios.post('/api/tasks', taskPayload);
            const assignedTask = resp.data?.data || resp.data;

            addToast('success', `Task Assigned! 📝`, `${taskForm.title} assigned to ${targetStudents.length} students in ${taskForm.class === 'All' ? 'all classes' : taskForm.class}${taskForm.section !== 'All' ? `-${taskForm.section}` : ''}`);

            // Reset form
            setTaskForm({
                title: '',
                description: '',
                subject: '',
                class: 'All',
                section: 'All',
                dueDate: '',
                priority: 'Medium',
                assignedStudents: [],
            });
            setTaskErrors({});
            setShowTaskModal(false);

        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'Could not assign task';
            addToast('error', 'Assignment Error ❌', errMsg);
            console.error('Task assignment error:', error);
        } finally {
            setAssigningTask(false);
        }
    };

    const handleExportCSV = () => {
        const rows = [
            ['Name', 'USN', 'Class', 'Section', 'Roll No', 'Phone', 'Email', 'Status', 'Login ID', 'Password', 'Join Year', 'Passout Year'],
            ...filteredStudents.map(s => [
                s.name, s.usn, s.class, s.section, s.rollNo || '',
                s.phone || '', s.email || '', s.status,
                generateLoginId(s.usn), generatePassword(s.usn),
                s.joinYear || '', s.passoutYear || '',
            ]),
        ].map(r => r.join(',')).join('\n');

        const blob = new Blob([rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_export_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        addToast('success', 'CSV Exported', `${filteredStudents.length} records downloaded.`);
    };

    // ─── UI ──────────────────────────────────────────────────────────────────────
    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

        {/* Modals */}
        <DeleteModal student={deleteModal} onConfirm={handleDelete} onCancel={() => setDeleteModal(null)} />
        {viewTasksModal && <ViewTasksModal student={viewTasksModal} onClose={() => setViewTasksModal(null)} />}
        {showCSVModal && <CSVImportModal onClose={() => setShowCSVModal(false)} onImport={handleCSVImport} />}
        <Toast toasts={toasts} dismiss={dismissToast} />

        {/* ── Navbar ─────────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-slate-200/60 shadow-sm">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                            <span className="text-lg">👩‍🏫</span>
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-slate-900 leading-none">Teacher Panel</h1>
                            <p className="text-xs text-slate-400 leading-none mt-0.5">Student Management</p>
                        </div>
                    </div>
                </div>

                {/* Center pills */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-sm font-semibold text-blue-700">
                        <Users className="w-4 h-4" />
                        <span>Students: {students.length}/100</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-700">
                        <Shield className="w-4 h-4" />
                        <span>Active: {students.filter(s => s.status === 'Active').length}</span>
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowCSVModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Import CSV</span>
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            sessionStorage.clear();
                            navigate('/login');
                        }}
                        className="p-2 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-700 transition-all"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </nav>

        {/* ── Main split layout ───────────────────────────────────────────────── */}
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* ── LEFT: Add / Edit Student Form ─────────────────────────────── */}
                <aside
                    ref={formRef}
                    className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-24 backdrop-blur-xl bg-white/90 shadow-2xl shadow-slate-200/60 ring-1 ring-slate-200/50 rounded-3xl p-7 space-y-5"
                >
                    {/* Form header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                {editingId ? <><Edit3 className="w-5 h-5 text-amber-500" />Edit Student</> : <><Plus className="w-5 h-5 text-blue-500" />Add Student</>}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {editingId ? 'Update student details below' : 'Teacher-created account — students cannot self-register'}
                            </p>
                        </div>
                        {editingId && (
                            <button onClick={resetForm} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all" title="Cancel edit">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Auto-generate preview */}
                    {formData.usn && (
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                            <Key className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div className="text-xs font-mono">
                                <span className="text-slate-500">Login: </span>
                                <span className="font-bold text-indigo-700">{generateLoginId(formData.usn)}</span>
                                <span className="text-slate-400 mx-2">|</span>
                                <span className="text-slate-500">Pass: </span>
                                <span className="font-bold text-emerald-700">{generatePassword(formData.usn)}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="space-y-4">
                            {/* Row 1: Full Name */}
                            <Field label="Full Name" required icon={User} error={errors.name}>
                                <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ravi Kumar" className={errors.name ? 'border-red-400 focus:ring-red-200' : ''} />
                            </Field>

                            {/* Row 2: USN + Roll No */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="USN" required icon={Hash} error={errors.usn}>
                                    <Input name="usn" value={formData.usn} onChange={handleChange} placeholder="12A001" className={`font-mono ${errors.usn ? 'border-red-400 focus:ring-red-200' : ''}`} />
                                </Field>
                                <Field label="Roll No" required error={errors.rollNo}>
                                    <Input name="rollNo" value={formData.rollNo} onChange={handleChange} placeholder="01" className={errors.rollNo ? 'border-red-400 focus:ring-red-200' : ''} />
                                </Field>
                            </div>

                            {/* Row 3: Class + Section */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Class" required>
                                    <Select name="class" value={formData.class} onChange={handleChange}>
                                        {CLASS_OPTIONS.map(c => <option key={c}>{c}</option>)}
                                    </Select>
                                </Field>
                                <Field label="Section" required>
                                    <Select name="section" value={formData.section} onChange={handleChange}>
                                        {SECTION_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </Select>
                                </Field>
                            </div>

                            {/* Row 4: Join Year + Passout Year */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Join Year" required icon={Calendar}>
                                    <Select name="joinYear" value={formData.joinYear} onChange={handleChange}>
                                        {JOIN_YEARS.map(y => <option key={y}>{y}</option>)}
                                    </Select>
                                </Field>
                                <Field label="Passout Year" required>
                                    <Select name="passoutYear" value={formData.passoutYear} onChange={handleChange}>
                                        {PASSOUT_YEARS.map(y => <option key={y}>{y}</option>)}
                                    </Select>
                                </Field>
                            </div>

                            {/* Row 5: Phone + Email */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Phone" icon={Phone} error={errors.phone}>
                                    <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" type="tel" className={errors.phone ? 'border-red-400 focus:ring-red-200' : ''} />
                                </Field>
                                <Field label="Email" error={errors.email}>
                                    <Input name="email" value={formData.email} onChange={handleChange} placeholder="Optional" type="email" className={errors.email ? 'border-red-400 focus:ring-red-200' : ''} />
                                </Field>
                            </div>

                            {/* Row 6: Parent Phone + Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Parent Phone" error={errors.parentPhone}>
                                    <Input name="parentPhone" value={formData.parentPhone} onChange={handleChange} placeholder="Parent no." type="tel" className={errors.parentPhone ? 'border-red-400 focus:ring-red-200' : ''} />
                                </Field>
                                <Field label="Status" required>
                                    <Select name="status" value={formData.status} onChange={handleChange}
                                        className={formData.status === 'Active' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}>
                                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                    </Select>
                                </Field>
                            </div>

                            {/* Notes */}
                            <Field label="Notes" icon={FileText}>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Optional notes about student..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
                                />
                            </Field>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-3.5 rounded-2xl font-bold text-white text-sm tracking-wide
                    transition-all duration-200 flex items-center justify-center gap-2
                    ${submitting ? 'opacity-70 cursor-not-allowed bg-slate-400'
                                        : editingId
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02]'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]'}`}
                            >
                                {submitting
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {editingId ? 'Updating...' : 'Creating...'}</>
                                    : editingId
                                        ? <><Check className="w-4 h-4" /> Update Student</>
                                        : <><Plus className="w-4 h-4" /> Create Student & Generate Login</>
                                }
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm}
                                    className="w-full py-2.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </aside>

                {/* ── RIGHT: Students Table ──────────────────────────────────────── */}
                <div className="flex-1 min-w-0 space-y-4">

                    {/* Search + Filter bar */}
                    <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-md ring-1 ring-slate-200/40 p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, USN, phone..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Class filter */}
                        <select
                            value={filterClass}
                            onChange={e => setFilterClass(e.target.value)}
                            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-w-[100px]"
                        >
                            <option value="All">All Classes</option>
                            {CLASS_OPTIONS.map(c => <option key={c}>{c}</option>)}
                        </select>

                        {/* Section filter */}
                        <select
                            value={filterSection}
                            onChange={e => setFilterSection(e.target.value)}
                            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-w-[110px]"
                        >
                            <option value="All">All Sections</option>
                            {SECTION_OPTIONS.map(s => <option key={s}>Section {s}</option>)}
                        </select>

                        {/* Status filter */}
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-w-[110px]"
                        >
                            <option value="All">All Status</option>
                            <option>Active</option>
                            <option>Suspended</option>
                        </select>

                        {/* Assign Task Button */}
                        <button
                            onClick={() => setShowTaskModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all whitespace-nowrap"
                            title="Assign new task to students"
                        >
                            <Bell className="w-4 h-4" />
                            Assign Task
                        </button>

                        {/* Results count + clear */}
                        <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                            <span className="font-semibold text-slate-700">{filteredStudents.length}</span> results
                            {(filterClass !== 'All' || filterSection !== 'All' || filterStatus !== 'All' || searchTerm) && (
                                <button
                                    onClick={() => { setFilterClass('All'); setFilterSection('All'); setFilterStatus('All'); setSearchTerm(''); }}
                                    className="text-xs text-red-500 hover:text-red-700 underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="backdrop-blur-xl bg-white/80 shadow-xl ring-1 ring-slate-200/40 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                            <table className="w-full text-sm min-w-[700px]">
                                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur border-b border-slate-100">
                                    <tr>
                                        {['#', 'Student', 'USN', 'Class-Sec', 'Phone', 'Status', 'Login Credentials', 'Actions'].map(h => (
                                            <th key={h} className={`px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap ${h === '#' ? 'w-10' : ''}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-400" />
                                                <p className="font-medium">Loading students...</p>
                                            </td>
                                        </tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-20 text-center text-slate-400">
                                                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                                <p className="text-lg font-semibold text-slate-500 mb-1">
                                                    {students.length === 0 ? 'No students yet' : 'No matching students'}
                                                </p>
                                                <p className="text-sm">
                                                    {students.length === 0
                                                        ? 'Use the form on the left to create your first student account.'
                                                        : 'Try adjusting your search or filters.'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : filteredStudents.map((student, idx) => (
                                        <tr
                                            key={student.id}
                                            className={`group transition-all duration-300
                          ${student.id === newRowId
                                                    ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-400/40 scale-[1.005] shadow-md animate-pulse'
                                                    : 'hover:bg-blue-50/40'}`}
                                        >
                                            {/* # */}
                                            <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{idx + 1}</td>

                                            {/* Student */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0
                              bg-gradient-to-br ${['from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600'][idx % 4]}`}>
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800 truncate max-w-[130px]">{student.name}</p>
                                                        {student.email && <p className="text-xs text-slate-400 truncate max-w-[130px]">{student.email}</p>}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* USN */}
                                            <td className="px-4 py-3.5">
                                                <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">{student.usn.toUpperCase()}</span>
                                            </td>

                                            {/* Class-Sec */}
                                            <td className="px-4 py-3.5">
                                                <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                                                    {student.class}-{student.section}
                                                </span>
                                            </td>

                                            {/* Phone */}
                                            <td className="px-4 py-3.5 text-slate-600 text-sm">{student.phone || <span className="text-slate-300">—</span>}</td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5"><StatusBadge status={student.status} /></td>

                                            {/* Login Credentials */}
                                            <td className="px-4 py-3.5">
                                                <LoginBadge
                                                    usn={student.usn}
                                                    onCopy={() => addToast('info', 'Copied!', `Login: ${generateLoginId(student.usn)} | Pass: ${generatePassword(student.usn)}`)}
                                                />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {/* Resend Login */}
                                                    <button
                                                        onClick={() => handleResendLogin(student)}
                                                        title="Copy login credentials"
                                                        className="p-2 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-slate-400 transition-all hover:scale-110 hover:shadow-md"
                                                    >
                                                        <ClipboardCopy className="w-4 h-4" />
                                                    </button>
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => handleEdit(student)}
                                                        title="Edit student"
                                                        className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-all hover:scale-110 hover:shadow-md"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    {/* View Tasks */}
                                                    <button
                                                        onClick={() => setViewTasksModal(student)}
                                                        title="View tasks"
                                                        className="p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-all hover:scale-110 hover:shadow-md"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => setDeleteModal(student)}
                                                        title="Delete student"
                                                        className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all hover:scale-110 hover:shadow-md"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Table footer */}
                        {filteredStudents.length > 0 && (
                            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
                                <span>Showing {filteredStudents.length} of {students.length} students</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-emerald-600 font-semibold">
                                        ● Active: {students.filter(s => s.status === 'Active').length}
                                    </span>
                                    <span className="text-red-500 font-semibold">
                                        ● Suspended: {students.filter(s => s.status === 'Suspended').length}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick tip */}
                    {students.length === 0 && !loading && (
                        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 text-center">
                            <BookOpen className="w-10 h-10 text-blue-300 mx-auto mb-3" />
                            <p className="font-semibold text-blue-800 mb-1">Start adding students</p>
                            <p className="text-sm text-blue-600">
                                Fill in the form on the left, or <button onClick={() => setShowCSVModal(true)} className="underline font-bold hover:text-blue-800">import via CSV</button> for bulk onboarding.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>

        {/* Keyframe for toast slide-in */}
        <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

        {/* Task Assignment Modal */}
        {showTaskModal && (
            <TaskAssignmentModal
                onClose={() => setShowTaskModal(false)}
                onAssign={handleAssignTask}
                taskForm={taskForm}
                setTaskForm={setTaskForm}
                errors={taskErrors}
                assigning={assigningTask}
            />
        )}
    </div>
);
}