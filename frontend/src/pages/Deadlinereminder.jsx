import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import axios from '../lib/axios';

const statusStyles = {
  overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  upcoming: 'bg-amber-50 text-amber-700 border-amber-200',
  later: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const priorityStyles = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
};

const resolveUserId = (user) => user?._id || user?.id || '';

const mapApiTask = (task, currentStudentId) => ({
  id: task._id,
  title: task.title,
  subject: task.subject,
  description: task.description,
  dueDate: new Date(task.dueDate),
  completed: task.status === 'Completed',
  priority: task.priority?.toLowerCase() || 'medium',
  sourceType: task.createdBy?._id === currentStudentId ? 'self' : 'teacher',
});

const getTaskState = (task) => {
  if (task.completed) return 'completed';

  const diffMs = task.dueDate.getTime() - Date.now();
  if (diffMs < 0) return 'overdue';
  if (diffMs <= 1000 * 60 * 60 * 24 * 3) return 'upcoming';
  return 'later';
};

const formatDueDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);

export default function DeadlineReminder() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isDark, setIsDark] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const persistedUser = localStorage.getItem('student_user') || sessionStorage.getItem('student_user');

      if (!persistedUser) {
        setTasks([]);
        setError('Please log in to view your deadline reminders.');
        return;
      }

      const parsedUser = JSON.parse(persistedUser);
      const studentId = resolveUserId(parsedUser);

      if (!studentId) {
        setTasks([]);
        setError('Unable to identify the student account. Please log in again.');
        return;
      }

      const response = await axios.get(`/api/students/${studentId}/tasks`);
      const loadedTasks = Array.isArray(response.data?.data)
        ? response.data.data.map((task) => mapApiTask(task, studentId))
        : [];

      setTasks(loadedTasks);
    } catch (loadError) {
      console.error('Failed to load deadline reminders:', loadError);
      setError('Unable to fetch reminders from the server right now.');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    const handleRefresh = () => loadTasks();
    window.addEventListener('tasks:refresh', handleRefresh);
    window.addEventListener('focus', handleRefresh);

    return () => {
      window.removeEventListener('tasks:refresh', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [loadTasks]);


  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) setIsDark(JSON.parse(savedMode));
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const summary = useMemo(() => {
    const overdue = tasks.filter((task) => getTaskState(task) === 'overdue').length;
    const upcoming = tasks.filter((task) => getTaskState(task) === 'upcoming').length;
    const completed = tasks.filter((task) => task.completed).length;

    return {
      total: tasks.length,
      overdue,
      upcoming,
      completed,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const byState = activeTab === 'all' ? tasks : tasks.filter((task) => getTaskState(task) === activeTab);
    return byState.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
      || task.subject.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [activeTab, searchQuery, tasks]);

  return (
    <div className="min-h-screen bg-white">
      <DashboardNavbar
        isDark={isDark}
        setIsDark={setIsDark}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Deadline Reminders</h1>
          <p className="mt-2 text-sm text-slate-600">
            Live reminders from your dashboard tasks. Updates automatically when tasks are changed.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Tasks', value: summary.total, tone: 'bg-blue-50 text-blue-700' },
            { label: 'Overdue', value: summary.overdue, tone: 'bg-rose-50 text-rose-700' },
            { label: 'Due in 3 days', value: summary.upcoming, tone: 'bg-amber-50 text-amber-700' },
            { label: 'Completed', value: summary.completed, tone: 'bg-emerald-50 text-emerald-700' },
          ].map((item) => (
            <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className={`mt-3 inline-flex rounded-lg px-3 py-1 text-2xl font-bold ${item.tone}`}>{item.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'overdue', label: 'Overdue' },
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'later', label: 'Later' },
                { key: 'completed', label: 'Completed' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading && <p className="text-sm text-slate-500">Loading reminders...</p>}
            {!isLoading && error && <p className="text-sm text-rose-600">{error}</p>}
            {!isLoading && !error && filteredTasks.length === 0 && (
              <p className="text-sm text-slate-500">No tasks found for this filter.</p>
            )}

            {!isLoading && !error && filteredTasks.length > 0 && (
              <ul className="space-y-3">
                {filteredTasks
                  .slice()
                  .sort((a, b) => a.dueDate - b.dueDate)
                  .map((task) => {
                    const taskState = getTaskState(task);

                    return (
                      <li key={task.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-base font-semibold text-slate-900">{task.title}</h2>
                            <p className="mt-1 text-sm text-slate-600">{task.subject}</p>
                            {task.description && <p className="mt-2 text-sm text-slate-500">{task.description}</p>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-md border px-2 py-1 text-xs font-semibold capitalize ${statusStyles[taskState]}`}>
                              {taskState}
                            </span>
                            <span className={`rounded-md px-2 py-1 text-xs font-semibold capitalize ${priorityStyles[task.priority] || priorityStyles.medium}`}>
                              {task.priority}
                            </span>
                            <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                              {task.sourceType === 'self' ? 'Self' : 'Teacher'}
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-sm font-medium text-slate-700">Due: {formatDueDate(task.dueDate)}</p>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
