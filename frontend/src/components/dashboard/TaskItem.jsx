import { CheckCircle, Trash2 } from 'lucide-react';
import { calculatePriority, getDaysUntil, isOverdue } from './dashboardUtils';

export default function TaskItem({ task, onToggle, onDelete, isDark }) {
  const daysUntil = getDaysUntil(task.deadline);
  const overdue = isOverdue(task.deadline, task.completed);
  const actualPriority = calculatePriority(task.deadline);

  const priorityColor = {
    high: isDark ? 'bg-red-900/30 text-red-400 border-red-700/50' : 'bg-red-50 text-red-700 border-red-200',
    medium: isDark ? 'bg-amber-900/30 text-amber-400 border-amber-700/50' : 'bg-amber-50 text-amber-700 border-amber-200',
    low: isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className={`group rounded-xl backdrop-blur-md p-4 shadow-lg ring-1 ${isDark ? 'bg-slate-800/60 ring-slate-700/50' : 'bg-white/60 ring-slate-200/40'} ${overdue ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          <button onClick={() => onToggle(task.id)} className="mt-1" aria-label={`Toggle completion for ${task.title}`}>
            <div className={`h-5 w-5 rounded-md border-2 ${task.completed ? 'border-emerald-500 bg-emerald-500/20' : isDark ? 'border-slate-600' : 'border-slate-300'}`}>
              {task.completed && <CheckCircle className="h-5 w-5 text-emerald-400" />}
            </div>
          </button>

          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold line-clamp-1 ${task.completed ? 'line-through text-slate-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
              {task.title}
            </h4>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-block rounded-full border px-2 py-1 text-xs font-semibold ${priorityColor[actualPriority]}`}>{actualPriority}</span>
              <span className={`text-xs ${overdue ? 'font-bold text-red-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {overdue ? '⚠️ Overdue' : `${daysUntil}d left`}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className={`flex-shrink-0 rounded-lg p-2 transition-all duration-200 hover:scale-110 ${isDark ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'}`}
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
