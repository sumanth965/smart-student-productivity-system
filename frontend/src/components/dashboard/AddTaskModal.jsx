import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddTaskModal({ isOpen, onClose, onAdd, isDark }) {
  const [formData, setFormData] = useState({ title: '', subject: 'Mathematics', deadline: '', priority: 'medium', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) {
      alert('Please fill in title and deadline');
      return;
    }

    const isSaved = await onAdd({ id: Date.now(), ...formData, deadline: new Date(formData.deadline), completed: false, createdAt: new Date() });

    if (isSaved) {
      setFormData({ title: '', subject: 'Mathematics', deadline: '', priority: 'medium', description: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-gradient-to-br from-slate-900 to-blue-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <div className="relative p-6">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-2 hover:bg-slate-200/20" aria-label="Close modal"><X className="h-5 w-5" /></button>
          <h2 className={`mb-6 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Create New Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Task title" className="w-full rounded-lg border px-4 py-2" />
            <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full rounded-lg border px-4 py-2">
              <option>Mathematics</option><option>Physics</option><option>Chemistry</option><option>Biology</option><option>English</option><option>History</option><option>Computer Science</option><option>Art</option>
            </select>
            <input type="datetime-local" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full rounded-lg border px-4 py-2" />
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Add task details..." rows="3" className="w-full rounded-lg border px-4 py-2" />
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 rounded-lg px-4 py-2">Cancel</button>
              <button type="submit" className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-2 font-semibold text-white">Create Task</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
