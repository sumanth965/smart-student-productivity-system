import { AlertCircle, BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AIInsightsPanel from './AIInsightsPanel';
import ScrollReveal from './ScrollReveal';
import StatCard from './StatCard';

export default function DashboardOverview({ isDark, tasks, stats, deadlineData }) {
  const { totalTasks, completedTasks, pendingTasks, productivity, productivityChange } = stats;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={BookOpen} label="Total Tasks" value={totalTasks} bgGradient="bg-gradient-to-r from-blue-500 to-cyan-500" isDark={isDark} delay={0.05} />
          <StatCard icon={CheckCircle} label="Completed" value={completedTasks} bgGradient="bg-gradient-to-r from-emerald-500 to-teal-500" isDark={isDark} delay={0.1} />
          <StatCard icon={Clock} label="Pending" value={pendingTasks} bgGradient="bg-gradient-to-r from-amber-500 to-orange-500" isDark={isDark} delay={0.15} />
          <StatCard icon={Calendar} label="Productivity" value={`${productivity}%`} change={productivityChange} bgGradient="bg-gradient-to-r from-violet-500 to-purple-500" isDark={isDark} delay={0.2} />
        </div>

        <ScrollReveal delay={0.25} className={`rounded-2xl backdrop-blur-md p-6 shadow-2xl ring-1 ${isDark ? 'bg-slate-800/80 ring-slate-700/50' : 'bg-white/80 ring-slate-200/50'}`}>
          <h3 className={`mb-4 font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>📊 Deadline Analytics</h3>
          <div className="h-72 min-h-[18rem] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={240}>
              <BarChart data={deadlineData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollReveal>
      </div>

      <div className="lg:col-span-1">
        <AIInsightsPanel tasks={tasks} isDark={isDark} />
        <ScrollReveal delay={0.35} className={`mt-6 rounded-xl p-4 ${isDark ? 'bg-slate-800/70 text-slate-300' : 'bg-white/70 text-slate-700'}`}>
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /><p className="text-sm">Use filters to focus on overdue and high-priority tasks.</p></div>
        </ScrollReveal>
      </div>
    </div>
  );
}
