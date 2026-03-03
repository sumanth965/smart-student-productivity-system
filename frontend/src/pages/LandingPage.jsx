import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from 'lucide-react'

function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f7f5] text-slate-900">
      <main>
        <section className="group relative h-[600px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4SAV5sIXw9hGZ35dscmOROIly0VZckSpz5iyLGZ2pJshNJw1iHjND4CrRRXxzCHnJIIDmxRA1qTypHQWseSUr2Emrx6YiacKNqN30RGR8IZhleXXj853XJ5sxC1ZIc3CYspVuMS11pe_B6IuFREthSAj--NUZzyE0MQD9BQeAEG7RdLk9-ZoEMFyP-tnFyVwMCxHjVy3rieaxUCAKcaEgoYoWY30aEKtQBziea0ijvb8ENGVSqKsfSfb-qwNbe49FbpMmWyL9VE4')" }} />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#221a10]/90 via-[#221a10]/60 to-transparent" />

          <div className="absolute inset-0 z-20 flex items-center px-6 lg:px-20">
            <div className="mx-auto w-full max-w-7xl">
              <div className="max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f49d25]/30 bg-[#f49d25]/20 px-3 py-1 text-xs font-bold tracking-widest text-[#f49d25] uppercase">
                  <Terminal className="h-4 w-4" /> Coding Club
                </div>
                <h1 className="text-5xl leading-[1.1] font-bold tracking-tight text-slate-100 md:text-7xl">
                  Discover Your <span className="text-[#f49d25]">Passion</span>
                </h1>
                <p className="max-w-xl text-lg leading-relaxed font-light text-slate-300 md:text-xl">
                  Join the next generation of innovators. Learn modern web development, AI integration, and
                  collaborative engineering in our premier student-led community.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="flex items-center gap-2 rounded-xl bg-[#f49d25] px-8 py-4 text-base font-bold text-slate-900 shadow-xl shadow-[#f49d25]/30 transition-transform hover:scale-105">
                    Join Now <ArrowRight className="h-5 w-5" />
                  </button>
                  <button className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-slate-100 backdrop-blur-md transition-all hover:bg-white/20">
                    View Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button className="absolute top-1/2 left-6 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-[#f49d25]">
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button className="absolute top-1/2 right-6 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-[#f49d25]">
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 gap-3">
            <button className="h-1.5 w-12 rounded-full bg-[#f49d25]" />
            <button className="h-1.5 w-12 rounded-full bg-white/30 transition-all hover:bg-white/50" />
            <button className="h-1.5 w-12 rounded-full bg-white/30 transition-all hover:bg-white/50" />
          </div>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
