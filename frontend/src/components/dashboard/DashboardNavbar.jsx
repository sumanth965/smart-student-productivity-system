import { Bell, ChevronDown, Menu, Moon, Search, Sun, User, X, Zap } from 'lucide-react';

export default function DashboardNavbar({
  isDark,
  setIsDark,
  searchQuery,
  setSearchQuery,
  showMobileMenu,
  setShowMobileMenu,
}) {
  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-md shadow-lg ring-1 ${isDark ? 'bg-slate-900/80 ring-slate-700/50' : 'bg-white/80 ring-slate-200/50'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg p-2"><Zap className="h-6 w-6 text-white" /></div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} hidden sm:block`}>StudyFlow</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-200/30 dark:bg-slate-700/30 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm w-32" />
          </div>
          <div className="flex items-center gap-4">
            <button className={`relative rounded-lg p-2 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`} aria-label="Notifications"><Bell className="h-5 w-5" /><span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" /></button>
            <button onClick={() => setIsDark(!isDark)} className={`rounded-lg p-2 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`} aria-label="Toggle dark mode">{isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200/50"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center"><User className="h-4 w-4 text-white" /></div><ChevronDown className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} /></div>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className={`md:hidden rounded-lg p-2 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`} aria-label="Toggle menu">{showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
