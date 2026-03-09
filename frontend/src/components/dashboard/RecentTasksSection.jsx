import { CheckCircle, ChevronDown, Filter, Plus, Search, Sparkles } from 'lucide-react';
import TaskItem from './TaskItem';
import { useState, useRef, useEffect } from 'react';

const FILTER_OPTIONS = [
  { label: 'All Tasks', value: 'all', icon: '📋' },
  { label: 'Pending', value: 'pending', icon: '⏳' },
  { label: 'Completed', value: 'completed', icon: '✅' },
  { label: 'Overdue', value: 'overdue', icon: '⚠️' },
  { label: 'High Priority', value: 'high-priority', icon: '🔥' },
];

function TaskGroup({ title, tasks, isDark, handleToggleTask, handleDeleteTask, emptyMessage, index }) {
  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-center gap-2">
        <div className={`h-1.5 w-1.5 rounded-full ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`}></div>
        <h4 className={`text-xs font-bold tracking-wide uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h4>
      </div>
      
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task, idx) => (
            <div key={task.id} style={{ animationDelay: `${(index * 100) + (idx * 50)}ms` }} className="animate-fade-in">
              <TaskItem task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} isDark={isDark} />
            </div>
          ))}
        </div>
      ) : (
        <div className={`rounded-lg p-4 text-center ${isDark ? 'bg-slate-700/30' : 'bg-slate-100/50'}`}>
          <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}

function FilterDropdown({ open, setOpen, filter, setFilter, isDark }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setOpen]);

  const currentFilter = FILTER_OPTIONS.find(opt => opt.value === filter);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
          isDark
            ? `${open ? 'bg-slate-700/50 text-blue-300' : 'bg-slate-700/20 text-slate-300 hover:bg-slate-700/30'}`
            : `${open ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-150'}`
        }`}
      >
        <Filter className="h-4 w-4" />
        <span>{currentFilter?.icon}</span>
        <span className="hidden sm:inline">{currentFilter?.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl ring-1 z-50 overflow-hidden transition-all duration-200 origin-top ${
          open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
        } ${isDark ? 'bg-slate-800/95 ring-slate-700/50 backdrop-blur-sm' : 'bg-white/95 ring-slate-200/50 backdrop-blur-sm'}`}
      >
        <div className={`px-3 py-2 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
          <p className={`text-xs font-semibold tracking-wide uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filter By</p>
        </div>
        <div className="py-1">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setFilter(option.value);
                setOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-150 flex items-center gap-3 ${
                filter === option.value
                  ? isDark
                    ? 'bg-blue-900/40 text-blue-200'
                    : 'bg-blue-50 text-blue-700'
                  : isDark
                  ? 'text-slate-300 hover:bg-slate-700/40'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-base">{option.icon}</span>
              <span>{option.label}</span>
              {filter === option.value && <CheckCircle className="h-4 w-4 ml-auto" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchBar({ searchQuery, setSearchQuery, isDark }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 ${
      isDark
        ? 'border-slate-700/50 bg-slate-700/20 focus-within:border-blue-500/50 focus-within:bg-slate-700/40'
        : 'border-slate-300/50 bg-slate-50 focus-within:border-blue-400/50 focus-within:bg-white'
    }`}>
      <Search className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-transparent border-none outline-none text-sm w-full"
      />
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
    <div className="mb-8 w-full">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-down {
          animation: slideInDown 0.3s ease-out;
        }
      `}</style>

      <div className={`rounded-2xl backdrop-blur-sm p-8 shadow-lg ring-1 transition-all duration-300 ${
        isDark
          ? 'bg-slate-800/50 ring-slate-700/30 hover:shadow-xl hover:ring-slate-700/50'
          : 'bg-white/60 ring-slate-200/40 hover:shadow-xl hover:ring-slate-200/60'
      }`}>
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3">
              <Sparkles className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Recent Tasks
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
            <FilterDropdown open={open} setOpen={setOpen} filter={filter} setFilter={setFilter} isDark={isDark} />
          </div>
        </div>

        {/* Search Bar - Mobile and Desktop */}
        <div className="mb-6">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} isDark={isDark} />
        </div>

        {/* Tasks Grid */}
        {hasTasks ? (
          <div className="grid gap-8 md:grid-cols-2">
            <TaskGroup
              title="Teacher Assigned"
              tasks={recentTeacherTasks}
              isDark={isDark}
              handleToggleTask={handleToggleTask}
              handleDeleteTask={handleDeleteTask}
              emptyMessage="No teacher-assigned tasks"
              index={0}
            />
            <TaskGroup
              title="My Tasks"
              tasks={recentSelfTasks}
              isDark={isDark}
              handleToggleTask={handleToggleTask}
              handleDeleteTask={handleDeleteTask}
              emptyMessage="No self-created tasks"
              index={1}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className={`rounded-full p-4 mb-4 ${isDark ? 'bg-slate-700/30' : 'bg-slate-100/50'}`}>
              <CheckCircle className={`h-12 w-12 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
            </div>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {searchQuery ? '✨ No tasks match your search' : '✨ All caught up! No tasks to display'}
            </p>
            {!searchQuery && (
              <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Create one to get started
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}