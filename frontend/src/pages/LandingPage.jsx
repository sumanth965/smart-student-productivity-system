import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Brain,
  Clock,
  BarChart3,
  Zap,
  Shield,
  Users,
  Star,
} from 'lucide-react'

const SLIDES = [
  {
    bg: 'from-[#0f172a] via-[#1e3a5f] to-[#0f172a]',
    badge: '🎓 Smart Student Platform',
    title: 'Manage Your',
    highlight: 'Academic Life',
    subtitle: 'Effortlessly',
    desc: 'Track deadlines, prioritize tasks with AI, and collaborate — all in one powerful dashboard built for students.',
    cta: 'Get Started Free',
    ctaLink: '/register',
  },
  {
    bg: 'from-[#1a0f2e] via-[#3b1f6b] to-[#1a0f2e]',
    badge: '🤖 AI-Powered Insights',
    title: 'Let AI Plan',
    highlight: 'Your Study',
    subtitle: 'Schedule',
    desc: 'Our intelligent risk engine analyzes your workload, predicts burnout, and recommends the optimal study plan.',
    cta: 'Try AI Module',
    ctaLink: '/login',
  },
  {
    bg: 'from-[#0f2e1a] via-[#1f6b3b] to-[#0f2e1a]',
    badge: '⚡ Deadline Tracker',
    title: 'Never Miss',
    highlight: 'A Deadline',
    subtitle: 'Again',
    desc: 'Real-time countdown timers, smart snooze, and priority-based alerts keep you ahead of every submission.',
    cta: 'View Features',
    ctaLink: '/login',
  },
];

const FEATURES = [
  { icon: Brain, label: 'AI Risk Analysis', desc: 'Predicts task risk scores using importance & urgency.' },
  { icon: Clock, label: 'Deadline Tracker', desc: 'Live countdowns for every pending assignment.' },
  { icon: BarChart3, label: 'Progress Dashboard', desc: 'Visual overview of task completion & productivity.' },
  { icon: Shield, label: 'Secure Auth', desc: 'JWT-based authentication keeps your data safe.' },
  { icon: Users, label: 'Admin Panel', desc: 'Teacher & admin tools to manage student tasks.' },
  { icon: BookOpen, label: 'Smart Planner', desc: 'Organise by subject, priority, and deadline.' },
];

export default function LandingPage() {
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  const prev = () => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setSlide((s) => (s + 1) % SLIDES.length);
  const current = SLIDES[slide];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SmartStudent
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#why" className="hover:text-white transition-colors">Why Us</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-white/20 hover:border-white/40 transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO CAROUSEL ── */}
      <section className="group relative h-[600px] overflow-hidden">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${current.bg} transition-all duration-700`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

        {/* Floating orbs */}
        <div className="absolute top-20 right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center px-6 lg:px-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold tracking-widest text-slate-200 uppercase">
                {current.badge}
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight text-white">
                {current.title}{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {current.highlight}
                </span>
                <br />{current.subtitle}
              </h1>
              <p className="max-w-xl text-lg text-slate-300 leading-relaxed">
                {current.desc}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to={current.ctaLink}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/40 transition-transform hover:scale-105"
                >
                  {current.cta} <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-slate-100 backdrop-blur-md transition-all hover:bg-white/20"
                >
                  Sign In →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow buttons */}
        <button
          onClick={prev}
          className="absolute top-1/2 left-6 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-cyan-500"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-6 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-cyan-500"
          aria-label="Next slide"
        >
          <ChevronRight className="h-7 w-7" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-10 bg-cyan-400' : 'w-4 bg-white/30 hover:bg-white/60'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 lg:px-20 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase mb-3">Everything you need</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Built for <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Student Success</span></h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">From AI-powered risk analysis to real-time deadline tracking, SmartStudent has every tool to keep you on top of your academics.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
              >
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{label}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section id="why" className="py-16 px-6 lg:px-20 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-indigo-600/20 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10K+', label: 'Students enrolled' },
            { value: '98%', label: 'On-time submissions' },
            { value: '3x', label: 'Productivity gain' },
            { value: '4.9 ★', label: 'Average rating' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-black text-cyan-400 mb-1">{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="about" className="py-24 px-6 lg:px-20 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white">What Students <span className="text-cyan-400">Say</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Priya S.', role: 'Computer Science, 3rd Year', text: 'SmartStudent completely changed how I manage my workload. The AI module is insanely accurate.' },
              { name: 'Rahul M.', role: 'Electronics, 2nd Year', text: 'The deadline tracker saved me so many times. I never miss a submission date anymore.' },
              { name: 'Ananya K.', role: 'MBA Student', text: 'The dashboard gives me a bird\'s eye view of everything. The dark mode is gorgeous too!' },
            ].map(({ name, role, text }) => (
              <div key={name} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-cyan-400 text-cyan-400" />)}
                </div>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">"{text}"</p>
                <div>
                  <p className="font-bold text-white text-sm">{name}</p>
                  <p className="text-slate-500 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-t border-white/10">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
          Ready to <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">level up?</span>
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto mb-8">Join thousands of students already using SmartStudent to stay organized and ahead.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/40 transition-transform hover:scale-105"
          >
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-slate-200 hover:bg-white/10 transition-all"
          >
            Already have an account?
          </Link>
        </div>
        <p className="text-slate-600 text-xs mt-6">© 2025 SmartStudent Productivity System. All rights reserved.</p>
      </section>
    </div>
  )
}
