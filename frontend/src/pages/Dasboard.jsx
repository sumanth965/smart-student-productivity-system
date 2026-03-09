import { useCallback, useEffect, useMemo, useState } from 'react';
import AddTaskModal from '../components/dashboard/AddTaskModal';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import RecentTasksSection from '../components/dashboard/RecentTasksSection';
import { calculatePriority, getDaysUntil, isOverdue } from '../components/dashboard/dashboardUtils';
import axios from '../lib/axios';

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [filter, setFilter] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) setIsDark(JSON.parse(savedMode));
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const loadAssignedTasks = async () => {
      try {
        const persistedUser =
          localStorage.getItem('student_user') || sessionStorage.getItem('student_user');

        if (!persistedUser) return;

        const parsedUser = JSON.parse(persistedUser);
        if (!parsedUser?._id) return;

        setStudentId(parsedUser._id);

        const response = await axios.get(`/api/students/${parsedUser._id}/tasks`);
        const assignedTasks = Array.isArray(response.data?.data)
          ? response.data.data.map((task) => mapApiTaskToDashboardTask(task, parsedUser._id))
          : [];

        setTasks(assignedTasks);
      } catch (error) {
        console.error('Failed to load assigned tasks for dashboard:', error);
      }
    };

    loadAssignedTasks();
  }, [mapApiTaskToDashboardTask]);

  const handleAddTask = useCallback(async (newTask) => {
    if (!studentId) return;

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

      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to save self task:', error);
      alert('Unable to save task to database. Please try again.');
    }
  }, [mapApiTaskToDashboardTask, studentId]);

  const handleToggleTask = useCallback((taskId) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
  }, []);

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
