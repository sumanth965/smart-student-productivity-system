import { useMemo, useState } from 'react';
import { mockTasks } from '../../data/mockData';

export default function DeadlineReminderPage() {
  const [tasks, setTasks] = useState(mockTasks);
  const [draft, setDraft] = useState({ title: '', dueDate: '', category: '' });
  const [editingId, setEditingId] = useState(null);

  const groupedByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.dueDate] = [...(acc[task.dueDate] || []), task];
      return acc;
    }, {});
  }, [tasks]);

  const handleSave = () => {
    if (!draft.title || !draft.dueDate) return;
    if (editingId) {
      setTasks((prev) => prev.map((task) => (task.id === editingId ? { ...task, ...draft } : task)));
    } else {
      setTasks((prev) => [...prev, { id: Date.now(), ...draft, completed: false }]);
    }
    setDraft({ title: '', dueDate: '', category: '' });
    setEditingId(null);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold">Add / Edit Reminder</h3>
        <div className="space-y-2">
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Task title" value={draft.title} onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))} />
          <input className="w-full rounded-xl border px-3 py-2" type="date" value={draft.dueDate} onChange={(e) => setDraft((s) => ({ ...s, dueDate: e.target.value }))} />
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Category" value={draft.category} onChange={(e) => setDraft((s) => ({ ...s, category: e.target.value }))} />
          <button onClick={handleSave} className="rounded-xl bg-indigo-600 px-4 py-2 text-white">{editingId ? 'Update' : 'Add'} task</button>
          <p className="text-xs text-slate-500">Notification support: integrate browser Notification API + service worker for push reminders.</p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold">Calendar View</h3>
        <div className="space-y-3">
          {Object.entries(groupedByDate).map(([date, dateTasks]) => (
            <div key={date} className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold">{date}</p>
              {dateTasks.map((task) => (
                <div key={task.id} className="mt-2 flex items-center justify-between text-sm">
                  <span>{task.title}</span>
                  <div className="space-x-2">
                    <button onClick={() => { setDraft({ title: task.title, dueDate: task.dueDate, category: task.category || '' }); setEditingId(task.id); }} className="text-indigo-600">Edit</button>
                    <button onClick={() => setTasks((prev) => prev.filter((item) => item.id !== task.id))} className="text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
