import { CheckCircle, Trash2, AlertCircle, Clock, Flag } from 'lucide-react';
import { calculatePriority, getDaysUntil, isOverdue } from './dashboardUtils';

export default function TaskItem({ task, onToggle, onDelete, isDark }) {
  const daysUntil = getDaysUntil(task.deadline);
  const overdue = isOverdue(task.deadline, task.completed);
  const actualPriority = calculatePriority(task.deadline);

  const priorityConfig = {
    high: {
      light: {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        border: 'border-red-200/60 ring-red-200/40',
        text: 'text-red-700',
        badge: 'bg-red-100/80 text-red-700 border-red-200/60',
      },
      dark: {
        bg: 'bg-gradient-to-r from-red-950/20 to-rose-950/20',
        border: 'border-red-800/40 ring-red-700/30',
        text: 'text-red-400',
        badge: 'bg-red-900/40 text-red-300 border-red-700/50',
      }
    },
    medium: {
      light: {
        bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
        border: 'border-amber-200/60 ring-amber-200/40',
        text: 'text-amber-700',
        badge: 'bg-amber-100/80 text-amber-700 border-amber-200/60',
      },
      dark: {
        bg: 'bg-gradient-to-r from-amber-950/20 to-orange-950/20',
        border: 'border-amber-800/40 ring-amber-700/30',
        text: 'text-amber-400',
        badge: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
      }
    },
    low: {
      light: {
        bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
        border: 'border-emerald-200/60 ring-emerald-200/40',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/60',
      },
      dark: {
        bg: 'bg-gradient-to-r from-emerald-950/20 to-teal-950/20',
        border: 'border-emerald-800/40 ring-emerald-700/30',
        text: 'text-emerald-400',
        badge: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
      }
    },
  };

  const config = isDark ? priorityConfig[actualPriority].dark : priorityConfig[actualPriority].light;

  return (
    <div className={`
      group relative rounded-xl backdrop-blur-sm transition-all duration-300
      border-l-4 hover:shadow-lg hover:scale-102 active:scale-98
      ${overdue ? 'border-l-red-500 shadow-md' : `border-l-transparent shadow-sm`}
      ring-1 p-4
      ${isDark
        ? 'bg-slate-800/40 ring-slate-700/30 hover:bg-slate-800/60 hover:ring-slate-700/50'
        : 'bg-white/50 ring-slate-200/30 hover:bg-slate-50/80 hover:ring-slate-200/50'
      }
    `}>
      {/* Background gradient on hover */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
        ${config.bg}
      `}></div>

      {/* Content wrapper */}
      <div className="relative flex items-start justify-between gap-3">

        {/* Left side - Checkbox and content */}
        <div className="flex flex-1 items-start gap-3.5 min-w-0">

          {/* Enhanced Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            className="mt-0.5 flex-shrink-0 transition-transform duration-300 hover:scale-110 active:scale-95"
            aria-label={`Toggle completion for ${task.title}`}
          >
            <div className={`
              h-6 w-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
              ${task.completed
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-600 shadow-lg shadow-emerald-500/30'
                : isDark
                  ? 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                  : 'border-slate-300 hover:border-slate-400 bg-white/50'
              }
            `}>
              {task.completed && (
                <CheckCircle className="h-4 w-4 text-white drop-shadow-md" />
              )}
            </div>
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className={`
              font-bold text-sm leading-tight transition-all duration-300 line-clamp-2
              ${task.completed
                ? isDark
                  ? 'line-through text-slate-500'
                  : 'line-through text-slate-400'
                : isDark
                  ? 'text-white'
                  : 'text-slate-900'
              }
            `}>
              {task.title}
            </h4>

            {/* Metadata */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {/* Priority Badge */}
              <span className={`
                inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300
                ${config.badge}
              `}>
                <Flag className="h-3 w-3" />
                {actualPriority.charAt(0).toUpperCase() + actualPriority.slice(1)}
              </span>

              {/* Deadline Status */}
              <div className={`
                inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-300
                ${overdue
                  ? isDark
                    ? 'bg-red-900/40 text-red-300 ring-1 ring-red-700/50'
                    : 'bg-red-100/80 text-red-700 ring-1 ring-red-200/60'
                  : isDark
                    ? 'bg-slate-700/40 text-slate-300'
                    : 'bg-slate-200/60 text-slate-600'
                }
              `}>
                {overdue ? (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>Overdue</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>{daysUntil}d left</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Delete button */}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className={`
              flex-shrink-0 rounded-lg p-2.5 transition-all duration-300 
              hover:scale-110 active:scale-95 
              opacity-0 group-hover:opacity-100
              ${isDark
                ? 'hover:bg-red-900/30 text-slate-500 hover:text-red-400'
                : 'hover:bg-red-50/80 text-slate-400 hover:text-red-600'
              }
            `}
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Optional: Completion indicator line */}
      {task.completed && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-transparent rounded-b-xl opacity-60"></div>
      )}
    </div>
  );
}