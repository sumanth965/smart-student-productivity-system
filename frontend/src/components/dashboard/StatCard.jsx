import { TrendingUp } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, change, bgGradient, isDark }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md p-6 shadow-2xl ring-1 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20 ${isDark
        ? 'bg-slate-800/80 ring-slate-700/50 hover:bg-slate-800/90'
        : 'bg-white/80 ring-slate-200/50 hover:bg-white/90'
        }`}
    >
      <div className={`absolute inset-0 opacity-10 ${bgGradient}`} style={{ pointerEvents: 'none' }} />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
          <p className={`mt-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">{change} this month</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${bgGradient}`} style={{ opacity: 0.2 }}>
          <Icon className="h-6 w-6 text-red-900" />
        </div>
      </div>
    </div>
  );
}
