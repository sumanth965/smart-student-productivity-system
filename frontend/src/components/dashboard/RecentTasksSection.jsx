import { CheckCircle, ChevronDown, Filter, Plus, Search } from 'lucide-react';
import TaskItem from './TaskItem';

const FILTER_OPTIONS = [
  { label: 'All Tasks', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'High Priority', value: 'high-priority' },
];

function TaskGroup({ title, tasks, isDark, handleToggleTask, handleDeleteTask, emptyMessage }) {
  return (
    <div className="space-y-3">
      <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{title}</h4>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} isDark={isDark} />
        ))
      ) : (
        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{emptyMessage}</p>
      )}
    </div>
  );
}

export default function RecentTasksSection({
  isDark,
  open,
  setOpen,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  recentTeacherTasks,
  recentSelfTasks,
  handleToggleTask,
  handleDeleteTask,
  setShowAddModal,
}) {
  const hasTasks = recentTeacherTasks.length > 0 || recentSelfTasks.length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
      <div className="lg:col-span-3">
        <div className={`rounded-2xl backdrop-blur-md p-6 shadow-2xl ring-1 ${isDark ? 'bg-slate-800/80 ring-slate-700/50' : 'bg-white/80 ring-slate-200/50'}`}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>📋 Recent Tasks</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-2 font-semibold text-white"><Plus className="h-4 w-4" /><span>Add Task</span></button>
              <div className="relative">
                <button onClick={() => setOpen(!open)} className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold ${isDark ? 'hover:bg-slate-700/50 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                  <Filter className="h-4 w-4" /><span>Filter</span><ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl ring-1 z-50 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'} ${isDark ? 'bg-slate-800 ring-slate-700' : 'bg-white ring-slate-200'}`}>
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setFilter(option.value); setOpen(false); }}
                      className={`block w-full px-4 py-2 text-left text-sm ${filter === option.value ? (isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700') : (isDark ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-100')}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 md:hidden">
            <div className="flex items-center gap-2 bg-slate-200/30 dark:bg-slate-700/30 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
            </div>
          </div>

          {hasTasks ? (
            <div className="grid gap-4 md:grid-cols-2">
              <TaskGroup
                title="Teacher Assigned (Latest 2)"
                tasks={recentTeacherTasks}
                isDark={isDark}
                handleToggleTask={handleToggleTask}
                handleDeleteTask={handleDeleteTask}
                emptyMessage="No teacher-assigned tasks found"
              />
              <TaskGroup
                title="My Self Tasks (Latest 2)"
                tasks={recentSelfTasks}
                isDark={isDark}
                handleToggleTask={handleToggleTask}
                handleDeleteTask={handleDeleteTask}
                emptyMessage="No self-created tasks found"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className={`h-12 w-12 mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{searchQuery ? 'No tasks matching your search' : 'No tasks to display'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
