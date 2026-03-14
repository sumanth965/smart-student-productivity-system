import { useCallback, useEffect, useMemo, useState } from 'react';
import AddTaskModal from '../components/dashboard/AddTaskModal';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import RecentTasksSection from '../components/dashboard/RecentTasksSection';
import { calculatePriority, getDaysUntil, isOverdue } from '../components/dashboard/dashboardUtils';
import axios from '../lib/axios';
import { useTheme } from '../contexts/ThemeContext';

export default function Dashboard() {
  const { isDark, setIsDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [filter, setFilter] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const resolveUserId = useCallback((user) => user?._id || user?.id || '', []);

  const mapApiTaskToDashboardTask = useCallback((task, currentStudentId) => ({
    id: task._id,
    title: task.title,
    subject: task.subject,
    deadline: new Date(task.dueDate),
    priority: task.priority?.toLowerCase() || calculatePriority(new Date(task.dueDate)),
    completed: task.status === 'Completed',
    description: task.description,
    createdAt: new Date(task.createdAt),
    sourceType: task.createdBy?._id === currentStudentId ? 'self' : 'teacher',
  }), []);

  const loadAssignedTasks = useCallback(async () => {
    try {
      const persistedUser =
        localStorage.getItem('student_user') || sessionStorage.getItem('student_user');

      if (!persistedUser) return;

      const parsedUser = JSON.parse(persistedUser);
      const parsedUserId = resolveUserId(parsedUser);
      if (!parsedUserId) return;

      setStudentId(parsedUserId);

      const response = await axios.get(`/api/students/${parsedUserId}/tasks`);
      const assignedTasks = Array.isArray(response.data?.data)
        ? response.data.data.map((task) => mapApiTaskToDashboardTask(task, parsedUserId))
        : [];

      setTasks(assignedTasks);
    } catch (error) {
      console.error('Failed to load assigned tasks for dashboard:', error);
    }
  }, [mapApiTaskToDashboardTask, resolveUserId]);

  useEffect(() => {
    loadAssignedTasks();

    const handleRefresh = () => loadAssignedTasks();
    const handleFocus = () => loadAssignedTasks();

    window.addEventListener('tasks:refresh', handleRefresh);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('tasks:refresh', handleRefresh);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadAssignedTasks]);

  const handleAddTask = useCallback(async (newTask) => {
    if (!studentId) {
      alert('Unable to identify the current student. Please log in again.');
      return false;
    }

    try {
      const response = await axios.post(`/api/students/${studentId}/tasks`, {
        title: newTask.title,
        description: newTask.description || 'Self assigned task',
        subject: newTask.subject,
        dueDate: newTask.deadline,
        priority: (newTask.priority || 'medium').charAt(0).toUpperCase() + (newTask.priority || 'medium').slice(1),
      });

      const savedTask = response.data?.data
        ? mapApiTaskToDashboardTask(response.data.data, studentId)
        : null;

      if (savedTask) {
        setTasks((prevTasks) => [savedTask, ...prevTasks]);
      }

      window.dispatchEvent(new Event('tasks:refresh'));
      setShowAddModal(false);
      return true;
    } catch (error) {
      console.error('Failed to save self task:', error);
      alert('Unable to save task to database. Please try again.');
      return false;
    }
  }, [mapApiTaskToDashboardTask, studentId]);

  const handleToggleTask = useCallback(async (taskId) => {
    const targetTask = tasks.find((task) => task.id === taskId);
    if (!targetTask) return;

    const nextCompleted = !targetTask.completed;

    setTasks((prevTasks) => prevTasks.map((task) => (
      task.id === taskId ? { ...task, completed: nextCompleted } : task
    )));

    try {
      await axios.put(`/api/tasks/${taskId}`, {
        status: nextCompleted ? 'Completed' : 'Pending',
        ...(nextCompleted && studentId ? { completedBy: studentId } : {}),
      });
      window.dispatchEvent(new Event('tasks:refresh'));
    } catch (error) {
      console.error('Failed to sync task completion state:', error);
      setTasks((prevTasks) => prevTasks.map((task) => (
        task.id === taskId ? { ...task, completed: !nextCompleted } : task
      )));
      alert('Could not update task status. Please try again.');
    }
  }, [studentId, tasks]);

  const handleDeleteTask = useCallback((taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    }
  }, []);

  const filteredTasks = useMemo(() => tasks
    .filter((task) => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      if (filter === 'overdue') return isOverdue(task.deadline, task.completed);
      if (filter === 'high-priority') return !task.completed && calculatePriority(task.deadline) === 'high';
      return true;
    })
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchQuery.toLowerCase()),
    ), [filter, searchQuery, tasks]);

  const recentTeacherTasks = filteredTasks
    .filter((task) => task.sourceType === 'teacher')
    .slice(0, 2);

  const recentSelfTasks = filteredTasks
    .filter((task) => task.sourceType === 'self')
    .slice(0, 2);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const deadlineData = [
    { name: 'Overdue', count: tasks.filter((t) => isOverdue(t.deadline, t.completed)).length },
    { name: 'Critical (< 24h)', count: tasks.filter((t) => !t.completed && getDaysUntil(t.deadline) <= 1).length },
    { name: 'Upcoming (< 7d)', count: tasks.filter((t) => !t.completed && getDaysUntil(t.deadline) <= 7).length },
  ];

  return (
    <>
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
        <DashboardNavbar
          isDark={isDark}
          setIsDark={setIsDark}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
        />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <DashboardOverview
            isDark={isDark}
            tasks={tasks}
            stats={{ totalTasks, completedTasks, pendingTasks, productivity, productivityChange: '+12%' }}
            deadlineData={deadlineData}
          />

          <RecentTasksSection
            isDark={isDark}
            open={open}
            setOpen={setOpen}
            filter={filter}
            setFilter={setFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            recentTeacherTasks={recentTeacherTasks}
            recentSelfTasks={recentSelfTasks}
            handleToggleTask={handleToggleTask}
            handleDeleteTask={handleDeleteTask}
            setShowAddModal={setShowAddModal}
          />
        </main>

        <AddTaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddTask} isDark={isDark} />
      </div>
    </>

  );
}
