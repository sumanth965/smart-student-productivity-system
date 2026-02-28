import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  GraduationCap,
  HandHelping,
  HelpCircle,
  Megaphone,
  Palette,
  Rocket,
  Search,
  Share2,
  Terminal,
  Trophy,
} from 'lucide-react'

const navItems = ['Activities', 'Clubs', 'Events', 'Mentors']

const categories = [
  { title: 'STEM', icon: Rocket },
  { title: 'Arts', icon: Palette },
  { title: 'Sports', icon: Trophy },
  { title: 'Social Impact', icon: HandHelping },
  { title: 'Debate', icon: Megaphone, hiddenOnSmall: true },
]

const cards = [
  {
    tag: 'Debate Team',
    title: 'Master the Art of Persuasion',
    description:
      'Join our award-winning debate team and develop critical thinking and public speaking skills that last a lifetime.',
    cta: 'Learn More',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLFUutgapSGxCW2aMmC0Ak1o3BjMcvsQVShgiHBk32pVtWChHWZObRJ5GdfErpwPYuXftM7RGz_bcsEBmsRJWXf9xAhTucMP0xCkBM5-92sU9RbVRmilg2iKyhOvhroOJKu6Q_69DftDhg95rpp6LFuLlafONnKFIKVjV41APiIdqAPgIurPSZYOwlV_7weNKrxR6fFc6Line0kSQNDD3sY0v5T7NdK9Ed_5P-7w6BmpkhMIj3JrLjOvSP0pMnlddpu3sq51K_66Q',
  },
  {
    tag: 'Volunteer',
    title: 'Build a Better Community',
    description:
      'Participate in local projects that make a real difference. From environmental cleanup to tutoring, your impact matters.',
    cta: 'View Projects',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBWUo0HGxvjQRIOh2gFw_95HOMLTiF8Z8YcN_zOic1rzkrhyZGR5zWk43wLyF2eKVMdUi_IuOcs9chwQNC3m5Z4CNGZs7GHYMVa-57Unndn72aw5Ar0UHEoE571Jmb4_CmItbO4mHlYTs6a0dS8RNcaHBbRgnUlBuZ54CB9S8qygXgEm-dw-fDd_xRD6RJDODLsRMIvf3Wjyrq8lrY91c9B7qPlwdRQlDCkuMlgzdVKlHdTHNn55Qa2x58kKmuWsRhpgX82C7kLgwU',
  },
  {
    tag: 'STEM',
    title: 'Introduction to AI Ethics',
    description:
      'An upcoming workshop series exploring the future of artificial intelligence and its impact on human society.',
    cta: 'Reserve Spot',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUmbQ4NO0YunY7X0gUnAz1k9tJPY65P-OxD62sciR5bpqjhsA1x83a2BjkKr73jzxLFWT4fm2HnyzF_tvRzCfivt0LXvbxtPGN7QucVAuxmSljMtm9C7wRSoIiLCqe-zf7y4X5SZeI22MWhMeB9wA2_3L6cFVyuV81OhvIDS3PWVl5CFe3f28KUVwAei5beHgOSBOwRze8za6dufLqPaDhhr1r4DfyjFezn_T1nEKW1GwaFNoB01zu_6Lju26Q5aEpl1wZOSWxBaw',
  },
]

function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f7f5] text-slate-900">
      <header className="sticky top-0 z-50 w-full border-b border-[#f49d25]/10 bg-[#f8f7f5]/80 px-6 py-4 backdrop-blur-md lg:px-20">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-[#f49d25]">
              <GraduationCap className="h-8 w-8" />
              <h2 className="text-xl font-bold tracking-tight">SmartStudent</h2>
            </div>
            <nav className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <a key={item} className="text-sm font-medium text-slate-600 transition-colors hover:text-[#f49d25]" href="#">
                  {item}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end gap-6">
            <div className="hidden w-full max-w-[240px] items-center rounded-lg border border-[#f49d25]/10 bg-[#f49d25]/5 px-3 py-1.5 sm:flex">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Find an activity..."
                type="text"
              />
            </div>
            <button className="rounded-lg bg-[#f49d25] px-6 py-2 text-sm font-bold text-slate-900 shadow-lg shadow-[#f49d25]/20 transition-all hover:bg-[#f49d25]/90">
              Sign Up
            </button>
            <div className="hidden size-10 overflow-hidden rounded-full border-2 border-[#f49d25] bg-[#f49d25]/20 sm:block">
              <img
                alt="Student profile"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7hMSVNAUriB0BDy1tDOWD3pIJ8eeYt6NMGrmokeQpYtZk9_V_SQ8PsxCGd2T5_hEcCS_ewYBnPg59uc6g9bxvThCdrj1xCH_EHssO_MJQD5rJs6HGZOUjQ-CpFqcO9JJbep2Y5Sum3rJDq-yfu5imvvxS7uoU3ooIDORa_oNkGHiCoPqp24aJodhBrRZuEOtC09moNNgg8qd8ouCa0ZCJusF2UJf4Xmn-kK7RHzo-J1hzvY4q--8phlP33Iknh6Gp3eH82GGej7Q"
              />
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="group relative h-[600px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4SAV5sIXw9hGZ35dscmOROIly0VZckSpz5iyLGZ2pJshNJw1iHjND4CrRRVxzCHnJIIDmxRA1qTypHQWseSUr2Emrx6YiacKNqN30RGR8IZhleXXj853XJ5sxC1ZIc3CYspVuMS11pe_B6IuFREthSAj--NUZzyE0MQD9BQeAEG7RdLk9-ZoEMFyP-tnFyVwMCxHjVy3rieaxUCAKcaEgoYoWY30aEKtQBziea0ijvb8ENGVSqKsfSfb-qwNbe49FbpMmWyL9VE4')" }} />
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

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold">Explore Categories</h2>
                <p className="mt-1 text-slate-500">Find what moves you today.</p>
              </div>
              <a className="flex items-center gap-1 font-semibold text-[#f49d25] hover:underline" href="#">
                View all <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {categories.map(({ title, icon: Icon, hiddenOnSmall }) => (
                <div
                  key={title}
                  className={`group cursor-pointer rounded-2xl border border-[#f49d25]/10 bg-[#f49d25]/5 p-6 text-center transition-all hover:bg-[#f49d25] ${hiddenOnSmall ? 'hidden lg:block' : ''}`}
                >
                  <Icon className="mx-auto mb-3 h-10 w-10 text-[#f49d25] group-hover:text-slate-900" />
                  <p className="font-bold text-slate-800 group-hover:text-slate-900">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f49d25]/5 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-10 text-3xl font-bold">Recommended for You</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {cards.map((card) => (
                <article
                  key={card.title}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#f49d25]/10 bg-white shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img alt={card.title} className="h-full w-full object-cover" src={card.image} />
                    <div className="absolute top-4 left-4 rounded-full bg-[#f49d25] px-3 py-1 text-xs font-black text-slate-900 uppercase">
                      {card.tag}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-2 text-xl font-bold">{card.title}</h3>
                    <p className="mb-6 flex-1 text-sm text-slate-500">{card.description}</p>
                    <button className="w-full rounded-lg bg-[#f49d25]/10 py-3 font-bold text-[#f49d25] transition-all hover:bg-[#f49d25] hover:text-slate-900">
                      {card.cta}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 px-6 py-12 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 border-t border-slate-800 pt-8 md:flex-row">
          <div className="flex items-center gap-2 text-[#f49d25]">
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-bold tracking-tight text-white">SmartStudent</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {['About Us', 'Privacy Policy', 'Contact Support', 'Careers'].map((item) => (
              <a key={item} className="transition-colors hover:text-[#f49d25]" href="#">
                {item}
              </a>
            ))}
          </div>
          <div className="flex gap-4">
            <Globe className="cursor-pointer hover:text-[#f49d25]" />
            <Share2 className="cursor-pointer hover:text-[#f49d25]" />
            <HelpCircle className="cursor-pointer hover:text-[#f49d25]" />
          </div>
        </div>
        <p className="mt-8 text-center text-xs">© 2024 Smart Student Activity Platform. Empowering students worldwide.</p>
      </footer>
    </div>
  )
}

export default LandingPage
