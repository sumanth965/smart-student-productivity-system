import { Brain } from 'lucide-react';
import { calculatePriority, getDaysUntil, isOverdue } from './dashboardUtils';
import ScrollReveal from './ScrollReveal';

export default function AIInsightsPanel({ tasks, isDark, delay = 0.3 }) {
  const highPriorityTodayCount = tasks.filter(
    (t) => !t.completed && calculatePriority(t.deadline) === 'high' && getDaysUntil(t.deadline) === 0,
  ).length;
  const overdueTasks = tasks.filter((t) => isOverdue(t.deadline, t.completed));
  const completed = tasks.filter((t) => t.completed).length;
  const productivity = Math.round((completed / tasks.length) * 100);

  return (
    <ScrollReveal delay={delay} className={`rounded-2xl backdrop-blur-md p-6 shadow-2xl ring-1 ${isDark ? 'bg-gradient-to-br from-slate-800/80 to-blue-900/40 ring-blue-700/30' : 'bg-gradient-to-br from-white/80 to-blue-50/80 ring-blue-200/30'}`}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-blue-500" />
        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>AI-Powered Insights</h3>
      </div>
      <div className="space-y-3">
        {highPriorityTodayCount > 0 && <p className={`rounded-lg border-l-4 border-red-500 p-3 text-sm font-semibold ${isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>⚡ {highPriorityTodayCount} high-priority task{highPriorityTodayCount > 1 ? 's' : ''} due TODAY</p>}
        {overdueTasks.length > 0 && <p className={`rounded-lg border-l-4 border-orange-500 p-3 text-sm font-semibold ${isDark ? 'bg-orange-900/20 text-orange-300' : 'bg-orange-50 text-orange-700'}`}>⚠️ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''} - Complete ASAP!</p>}
        <p className={`rounded-lg border-l-4 border-emerald-500 p-3 text-sm font-semibold ${isDark ? 'bg-emerald-900/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>✨ Productivity: {productivity}% - Keep the momentum!</p>
      </div>
    </ScrollReveal>
  );
}
