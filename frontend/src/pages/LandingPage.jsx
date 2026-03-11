import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sp-body {
    font-family: 'Inter', sans-serif;
    background: #fff;
    color: #111827;
    scroll-behavior: smooth;
    overflow-x: hidden;
  }

  /* NAV */
  .sp-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    border-bottom: 1px solid #f3f4f6;
    box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  }
  .sp-nav-bar {
    padding: 0.875rem 1.5rem;
  }
  .sp-nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .sp-logo { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
  .sp-logo-icon {
    width: 38px; height: 38px;
    background: #19207b; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 1.2rem;
  }
  .sp-logo-text { font-size: 1.2rem; font-weight: 800; color: #19207b; letter-spacing: -0.02em; }
  .sp-logo-text span { color: #ffc107; }

  .sp-nav-links {
    display: flex; align-items: center; gap: 2rem;
    font-weight: 500; color: #19207b;
  }
  .sp-nav-links a { text-decoration: none; color: inherit; transition: color 0.2s; white-space: nowrap; }
  .sp-nav-links a:hover { color: #ffc107; }

  .sp-btn-primary {
    background: #ffc107; color: #19207b;
    padding: 0.5rem 1.5rem; border-radius: 9999px;
    font-weight: 700; border: none; cursor: pointer;
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.9rem; transition: background 0.2s;
    text-decoration: none; white-space: nowrap;
  }
  .sp-btn-primary:hover { background: #e0a800; }

  /* Hamburger */
  .sp-hamburger {
    display: none; flex-direction: column; justify-content: center;
    align-items: center; gap: 5px; background: none; border: none;
    cursor: pointer; padding: 6px; z-index: 110;
  }
  .sp-hamburger span {
    display: block; width: 24px; height: 2px;
    background: #19207b; border-radius: 2px;
    transition: all 0.3s; transform-origin: center;
  }
  .sp-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .sp-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .sp-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* Mobile menu */
  .sp-mobile-menu {
    max-height: 0; overflow: hidden;
    transition: max-height 0.35s ease;
    background: #fff;
    border-top: 1px solid transparent;
  }
  .sp-mobile-menu.open {
    max-height: 360px;
    border-top-color: #f3f4f6;
  }
  .sp-mobile-menu-inner {
    padding: 0.75rem 1.5rem 1.5rem;
    display: flex; flex-direction: column; gap: 0;
  }
  .sp-mobile-menu a {
    display: block; padding: 0.85rem 0;
    font-weight: 600; color: #19207b;
    text-decoration: none; font-size: 1rem;
    border-bottom: 1px solid #f3f4f6;
    transition: color 0.2s;
  }
  .sp-mobile-menu a:last-child { border-bottom: none; }
  .sp-mobile-menu a:hover { color: #ffc107; }
  .sp-mobile-cta {
    margin-top: 1rem !important;
    background: #19207b !important; color: #fff !important;
    border-radius: 8px !important; text-align: center;
    padding: 0.875rem !important; font-weight: 700 !important;
    border-bottom: none !important; border-radius: 8px !important;
  }
  .sp-mobile-cta:hover { background: #ffc107 !important; color: #19207b !important; }

  /* HERO */
  .sp-hero {
    background: linear-gradient(rgba(25,32,123,0.85), rgba(25,32,123,0.65)),
      url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1920') center/cover no-repeat;
    min-height: 600px; display: flex; align-items: center;
    color: #fff; overflow: hidden;
  }
  .sp-hero-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 4rem 1.5rem 5.5rem;
    display: flex; align-items: center;
    justify-content: space-between; gap: 3rem; width: 100%;
  }
  .sp-hero-left {
    flex: 1; display: flex; flex-direction: column;
    gap: 1.25rem; position: relative; z-index: 10;
  }
  .sp-hero-badge {
    display: inline-block; padding: 0.3rem 1rem;
    background: #ffc107; color: #19207b;
    font-weight: 700; border-radius: 9999px;
    font-size: 0.8rem; width: fit-content; letter-spacing: 0.03em;
  }
  .sp-hero-title { font-size: clamp(2rem, 4.5vw, 3.5rem); font-weight: 800; line-height: 1.15; }
  .sp-hero-title span { color: #ffc107; }
  .sp-hero-desc { font-size: 1.05rem; color: #f3f4f6; max-width: 32rem; line-height: 1.65; }
  .sp-hero-actions { display: flex; flex-wrap: wrap; gap: 1rem; padding-top: 0.5rem; }
  .sp-hero-cta {
    background: #ffc107; color: #19207b;
    font-weight: 700; padding: 0.9rem 2.25rem;
    border-radius: 8px; border: none; cursor: pointer;
    font-size: 1.05rem; transition: background 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: inherit;
  }
  .sp-hero-cta:hover { background: #e0a800; }
  .sp-hero-avail {
    background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2); padding: 0.875rem 1.25rem;
    border-radius: 8px; display: flex; flex-direction: column; justify-content: center;
  }
  .sp-hero-avail-label {
    font-size: 0.65rem; text-transform: uppercase;
    font-weight: 700; letter-spacing: 0.1em; color: #ffc107;
  }
  .sp-hero-avail-val { font-weight: 700; font-size: 1rem; }
  .sp-hero-features { font-size: 0.82rem; font-weight: 500; color: #d1d5db; line-height: 1.8; }
  .sp-hero-right { flex: 1; position: relative; padding-bottom: 2rem; }
  .sp-hero-img {
    width: 100%; border-radius: 1rem; display: block;
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    border: 4px solid rgba(255,255,255,0.1);
  }
  .sp-hero-stat {
    position: absolute; bottom: 0; left: -1rem;
    background: #19207b; padding: 1.25rem 1.5rem;
    border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    border-left: 4px solid #ffc107;
  }
  .sp-hero-stat-num { font-size: 1.75rem; font-weight: 700; color: #ffc107; }
  .sp-hero-stat-label { font-size: 0.65rem; text-transform: uppercase; color: #fff; opacity: 0.8; }

  /* SHARED SECTION */
  .sp-section-title-wrap { text-align: center; margin-bottom: 3.5rem; }
  .sp-section-title { font-size: clamp(1.65rem, 3.5vw, 2.25rem); font-weight: 800; color: #19207b; margin-bottom: 1rem; }
  .sp-underline-gold { width: 5rem; height: 5px; background: #ffc107; margin: 0 auto; border-radius: 3px; }
  .sp-underline-navy { width: 5rem; height: 5px; background: #19207b; margin: 0 auto; border-radius: 3px; }

  /* PROCESS */
  .sp-process { padding: 5rem 1.5rem; background: #f9fafb; overflow: hidden; }
  .sp-process-grid {
    max-width: 1280px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(5,1fr);
    gap: 1.5rem; position: relative;
  }
  .sp-process-grid::after {
    content: ''; position: absolute;
    top: 2rem; left: 10%; right: 10%; height: 2px;
    background: repeating-linear-gradient(to right,#19207b 0,#19207b 10px,transparent 10px,transparent 20px);
    z-index: 0;
  }
  .sp-step { position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .sp-step-icon {
    width: 64px; height: 64px; background: #fff;
    border-radius: 1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.25rem; color: #19207b;
    border-bottom: 4px solid #19207b; flex-shrink: 0;
  }
  .sp-step-icon.gold { background: #ffc107; border-bottom: none; }
  .sp-step h3 { font-weight: 700; color: #19207b; margin-bottom: 0.4rem; font-size: 0.9rem; }
  .sp-step p { font-size: 0.8rem; color: #4b5563; line-height: 1.55; }

  /* FEATURES */
  .sp-features { padding: 5rem 1.5rem; background: #fff; }
  .sp-features-grid {
    max-width: 1280px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem;
  }
  .sp-feature-card {
    padding: 2rem; border: 1px solid #f3f4f6;
    border-radius: 8px; transition: box-shadow 0.25s, transform 0.25s;
  }
  .sp-feature-card:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.08); transform: translateY(-3px); }
  .sp-feature-icon {
    width: 48px; height: 48px; background: #eff6ff; color: #19207b;
    border-radius: 0.5rem; display: flex; align-items: center;
    justify-content: center; margin-bottom: 1.5rem;
    transition: background 0.2s, color 0.2s; flex-shrink: 0;
  }
  .sp-feature-card:hover .sp-feature-icon { background: #19207b; color: #fff; }
  .sp-feature-card h4 { font-weight: 700; font-size: 1.05rem; margin-bottom: 0.6rem; }
  .sp-feature-card p { font-size: 0.875rem; color: #4b5563; line-height: 1.65; }

  /* METRICS */
  .sp-metrics { padding: 4rem 1.5rem; background: #19207b; color: #fff; }
  .sp-metrics-inner {
    max-width: 1280px; margin: 0 auto;
    display: grid; grid-template-columns: auto 1fr;
    gap: 3rem; align-items: center;
  }
  .sp-metrics-stats { display: flex; flex-direction: column; gap: 1rem; min-width: 155px; }
  .sp-metrics-stat-box { background: #ffc107; padding: 1.5rem; border-radius: 8px; color: #19207b; text-align: center; }
  .sp-metrics-stat-num { font-size: 2.25rem; font-weight: 800; line-height: 1; }
  .sp-metrics-stat-label { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; margin-top: 0.3rem; }
  .sp-metrics-uni { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; text-align: center; }
  .sp-metrics-uni-num { font-size: 1.75rem; font-weight: 700; }
  .sp-metrics-uni-label { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; opacity: 0.7; }
  .sp-metrics-right h3 { font-size: 1.4rem; font-weight: 700; margin-bottom: 2rem; }
  .sp-logos {
    display: flex; flex-wrap: wrap; gap: 2rem 3rem; align-items: center;
    opacity: 0.5; filter: grayscale(1);
    transition: opacity 0.5s, filter 0.5s;
  }
  .sp-logos:hover { opacity: 1; filter: grayscale(0); }
  .sp-logos img { height: 2rem; max-width: 80px; object-fit: contain; }

  /* WHY US */
  .sp-why { padding: 5rem 1.5rem; background: #f9fafb; }
  .sp-why-inner { max-width: 1280px; margin: 0 auto; }
  .sp-benefit {
    background: #fff; padding: 1.75rem 2rem;
    border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    display: flex; gap: 1.5rem; align-items: flex-start;
    margin-bottom: 1.25rem; transition: box-shadow 0.2s;
  }
  .sp-benefit:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.09); }
  .sp-benefit.navy { border-left: 4px solid #19207b; }
  .sp-benefit.gold { border-left: 4px solid #ffc107; }
  .sp-benefit-icon-wrap { padding: 0.875rem; border-radius: 0.5rem; flex-shrink: 0; }
  .sp-benefit-icon-wrap.navy { background: rgba(25,32,123,0.06); color: #19207b; }
  .sp-benefit-icon-wrap.gold { background: rgba(255,193,7,0.12); color: #d4a000; }
  .sp-benefit-text h4 { font-size: 1.1rem; font-weight: 700; color: #19207b; margin-bottom: 0.4rem; }
  .sp-benefit-text p { color: #4b5563; font-size: 0.9rem; line-height: 1.65; }

  /* FOOTER */
  .sp-footer { background: #19207b; color: #fff; padding: 4rem 1.5rem 2rem; }
  .sp-footer-inner { max-width: 1280px; margin: 0 auto; }
  .sp-footer-grid {
    display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
    gap: 2.5rem; margin-bottom: 3rem;
  }
  .sp-footer-logo { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
  .sp-footer-logo-icon {
    width: 32px; height: 32px; background: #fff; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #19207b; font-weight: 700; flex-shrink: 0;
  }
  .sp-footer-logo-text { font-size: 1.05rem; font-weight: 800; letter-spacing: -0.02em; }
  .sp-footer-logo-text span { color: #ffc107; }
  .sp-footer-desc { font-size: 0.85rem; color: #9ca3af; line-height: 1.7; }
  .sp-footer-col h5 { font-weight: 700; color: #ffc107; margin-bottom: 1.25rem; }
  .sp-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.875rem; }
  .sp-footer-col a { font-size: 0.875rem; color: #d1d5db; text-decoration: none; transition: color 0.2s; }
  .sp-footer-col a:hover { color: #fff; }
  .sp-footer-col p { font-size: 0.85rem; color: #9ca3af; margin-bottom: 1rem; line-height: 1.55; }
  .sp-email-row { display: flex; }
  .sp-email-input {
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    color: #fff; padding: 0.6rem 0.75rem; font-size: 0.875rem;
    border-radius: 8px 0 0 8px; flex: 1; outline: none;
    font-family: inherit; min-width: 0;
  }
  .sp-email-input::placeholder { color: #9ca3af; }
  .sp-email-input:focus { border-color: #ffc107; }
  .sp-email-btn {
    background: #ffc107; color: #19207b; border: none;
    padding: 0.6rem 1rem; border-radius: 0 8px 8px 0;
    font-weight: 700; font-size: 0.875rem; cursor: pointer;
    transition: background 0.2s; flex-shrink: 0; font-family: inherit;
  }
  .sp-email-btn:hover { background: #e0a800; }
  .sp-footer-bottom {
    padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);
    display: flex; justify-content: space-between; align-items: center;
    gap: 1rem; font-size: 0.75rem; color: #6b7280;
    font-weight: 500; flex-wrap: wrap;
  }
  .sp-footer-bottom-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }
  .sp-footer-bottom-links a { color: inherit; text-decoration: none; transition: color 0.2s; }
  .sp-footer-bottom-links a:hover { color: #fff; }

  /* ═══ RESPONSIVE ═══════════════════════════ */

  /* Tablet landscape ≤1100px */
  @media (max-width: 1100px) {
    .sp-features-grid { grid-template-columns: repeat(2,1fr); }
    .sp-footer-grid { grid-template-columns: repeat(2,1fr); gap: 2rem; }
  }

  /* Tablet portrait ≤900px */
  @media (max-width: 900px) {
    .sp-process-grid { grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
    .sp-process-grid::after { display: none; }
    .sp-metrics-inner { grid-template-columns: 1fr; gap: 2rem; }
    .sp-metrics-stats { flex-direction: row; min-width: unset; }
    .sp-metrics-stat-box, .sp-metrics-uni { flex: 1; }
    .sp-metrics-right h3 { text-align: center; }
    .sp-logos { justify-content: center; }
    .sp-hero-title { font-size: 2.6rem; }
  }

  /* Mobile ≤768px */
  @media (max-width: 768px) {
    /* Nav */
    .sp-nav-links { display: none; }
    .sp-hamburger { display: flex; }

    /* Hero stacks */
    .sp-hero-inner {
      flex-direction: column;
      padding: 2.5rem 1.25rem 3.5rem;
      gap: 2.5rem; text-align: center;
    }
    .sp-hero-left { align-items: center; }
    .sp-hero-title { font-size: 2.2rem; }
    .sp-hero-desc { text-align: center; max-width: 100%; font-size: 0.95rem; }
    .sp-hero-actions { justify-content: center; }
    .sp-hero-features { text-align: center; font-size: 0.78rem; }
    .sp-hero-right { width: 100%; max-width: 500px; margin: 0 auto; padding-bottom: 2rem; }
    .sp-hero-stat { left: 0; padding: 1rem 1.25rem; }
    .sp-hero-stat-num { font-size: 1.5rem; }

    /* Process 2 cols */
    .sp-process { padding: 3.5rem 1.25rem; }
    .sp-process-grid { grid-template-columns: repeat(2,1fr); gap: 1.5rem; }

    /* Features 1 col horizontal card */
    .sp-features { padding: 3.5rem 1.25rem; }
    .sp-features-grid { grid-template-columns: 1fr; }
    .sp-feature-card {
      display: flex; flex-direction: row;
      align-items: flex-start; gap: 1rem; padding: 1.5rem;
    }
    .sp-feature-icon { margin-bottom: 0; }
    .sp-feature-card h4 { margin-bottom: 0.3rem; }

    /* Metrics */
    .sp-metrics { padding: 3rem 1.25rem; }

    /* Why us */
    .sp-why { padding: 3.5rem 1.25rem; }
    .sp-benefit { flex-direction: column; gap: 1rem; padding: 1.5rem; }

    /* Footer */
    .sp-footer { padding: 3rem 1.25rem 1.5rem; }
    .sp-footer-grid { grid-template-columns: 1fr; gap: 2rem; }
    .sp-footer-bottom { flex-direction: column; align-items: flex-start; }

    .sp-section-title-wrap { margin-bottom: 2.5rem; }
  }

  /* Mobile small ≤480px */
  @media (max-width: 480px) {
    .sp-nav-bar { padding: 0.75rem 1rem; }
    .sp-logo-text { font-size: 1.05rem; }

    .sp-hero-title { font-size: 1.85rem; }
    .sp-hero-actions { flex-direction: column; align-items: stretch; }
    .sp-hero-cta { text-align: center; }
    .sp-hero-avail { text-align: center; }

    /* Process goes single col with horizontal layout */
    .sp-process-grid { grid-template-columns: 1fr; gap: 1rem; }
    .sp-step {
      flex-direction: row; text-align: left;
      align-items: flex-start; gap: 1rem;
    }
    .sp-step-icon { margin-bottom: 0; width: 52px; height: 52px; }

    /* Metrics stack stats */
    .sp-metrics-stats { flex-direction: column; }
    .sp-metrics-stat-box, .sp-metrics-uni { flex: unset; }

    .sp-footer-bottom-links { gap: 0.75rem; }
    .sp-section-title { font-size: 1.45rem; }
  }

  /* Very small ≤360px */
  @media (max-width: 360px) {
    .sp-hero-title { font-size: 1.6rem; }
    .sp-logo-icon { width: 32px; height: 32px; font-size: 1rem; }
    .sp-logo-text { font-size: 0.95rem; }
    .sp-hero-features { font-size: 0.7rem; }
  }
`;

/* ─── ICONS ─────────────────────────────────── */
const I = ({ d, size = 28 }) => (
  <svg style={{ width: size, height: size, display: "block" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const PATHS = {
  doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  clip: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  cal: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  bolt: "M13 10V3L4 14h7v7l9-11h-7z",
  lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  users: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
};

const partnerLogos = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDcSPZGRUquB3f_EiAH5CQov1P1NX2H892szzsEcFAkzfLPVXA78D0JC3hl7KsUdOHI1738W7A0qTQFso_3lwSi-fqODPmLJb9dFlCo_WIVuzkE59sj4eMmbuy6Y0rgUKWJmTyBuhtZ2UcefOzvcGGy3HIfNGPHUrnPv3cVkMKl8aLHiZeZWDfPFkP4lWV_em8TkBkuwisU9z5zokQaa5KTAMk09Mr0l_-4fZlTDvRmc5E1jjvs7w1N0R0tlwtdoS-vEWY97Jgreak",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD9wNBv1qw9lCwvJUmY_LttJCY6c5XA9N6IkJShxwHumq4bb3PCUUJ75y4QEhJLWSWGd9qZn0MRYG5BLaeJ-dqL_cnsxCMF4MB18U9CRjPymRxOgNikuaCLuCMaUWAamgtalND52tsO0HhiI0r2jhZ8CKHXlP2nSwDC67RRW5vk39zY2ktSJriE-OxcrdEvnaghTnRG_-HnkSXawbE87gS43ry2kihAis5gf6UZ_TPure8v_wYJBauXEGVeZVXY8m1blcCQYE26LwI",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCvM9ZmPVwCWi8DvwOJdf32QM0trS-2ISAEjg9HBjfrOzqmIpx9blALy1RCBtv272uuBi4ocIJwdf4evEP9qCUrtSoAvc3zEd-jg2aDuX0o4P4P6T_IFxxqSCYyGhaJRHtuqbaWKFtu_Zbgbh022UV8ssdY8hXmGiYSzAhkov0Ahd1I_HzeJ_mzDtPYv-p4MpvaR5wlEH_KngCUHQ05NDrFzdu6FvZIG04F0pcKlNxRkvcoVXnbf33P-m3_0Xl2BZXQbMHV8D2sLIA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuATJot0DBlZxDjl7XjG284SAIuXEqN63YXRFfIkYoHReRzjAXbmB1oLp-lzOVhOGih79qDc2hGS8VLSvbZqqpQsSdsrrIMmuYWFYZ7jajXXIOoxx3j8gLqE5E2_h6xhQoN4yVwtwMFVIxqDi8QHJJMVXEj02oPEO_6jA_IbxoxoKGGfhUZsN_UgCN9puIFtN0SoG2gBB5-rLuSj8Mca_hDGbKVk1RE7PNpN-3VHr87qJsfvbC9BFllznGIZRf8-EynOgtmBrz4yyS0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB6sTCVK3QqGfXobH8Fkk9I6o4yQCHU1THQuXZ9nStZUdYdfVeaCodiaISfBU-qwlQk6opK5DR63neibFaEFs-Y4wBILTqJvh1X2j9HyWbrhNtUxb3QCaCYuRx_oB-zkLfZalPwqU6TGshZMR3kYjMrBZxtWXuX53oOUGdQpPMT8cWErcJBWmAtoJlZXacNOXnra7xQ-zakkQr7NjaLwQrDs9u-gTa6VFdP_R7aj0a4ExWtvMe11F-rJLeFbkoSDXOeH-dJMslEdf0"
];

export default function StudentPro() {
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="sp-body">
      <style>{styles}</style>

      {/* NAV */}
      <nav className="sp-nav">
        <div className="sp-nav-bar">
          <div className="sp-nav-inner">
            <div className="sp-logo">
              <div className="sp-logo-icon">S</div>
              <span className="sp-logo-text">STUDENT<span>PRO</span></span>
            </div>
            <div className="sp-nav-links">
              <a href="#features">Features</a>
              <a href="#process">How it Works</a>
              <a href="#why-us">Why Us</a>
              <a href="#" className="sp-btn-primary">GET STARTED <span>→</span></a>
            </div>
            <button
              className={`sp-hamburger${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle navigation"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
        <div className={`sp-mobile-menu${menuOpen ? " open" : ""}`}>
          <div className="sp-mobile-menu-inner">
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#process" onClick={closeMenu}>How it Works</a>
            <a href="#why-us" onClick={closeMenu}>Why Us</a>
            <a href="#" className="sp-mobile-cta" onClick={closeMenu}>GET STARTED →</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="sp-hero">
        <div className="sp-hero-inner">
          <div className="sp-hero-left">
            <div className="sp-hero-badge">ADMISSIONS OPEN 2025</div>
            <h1 className="sp-hero-title">
              Master Your Studies with <br />
              <span>Smart Productivity</span>
            </h1>
            <p className="sp-hero-desc">
              Transform your academic life with the all-in-one system designed for the modern student. Manage tasks, schedules, and resources effortlessly.
            </p>
            <div className="sp-hero-actions">
              <button className="sp-hero-cta">REGISTER NOW</button>
              <div className="sp-hero-avail">
                <span className="sp-hero-avail-label">Available On</span>
                <span className="sp-hero-avail-val">WEB &amp; MOBILE</span>
              </div>
            </div>
            <p className="sp-hero-features">✓ AI-Powered Scheduling | ✓ Cloud Sync | ✓ Study Group Collaboration</p>
          </div>
          <div className="sp-hero-right">
            <img
              className="sp-hero-img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN0dUTLN_4dsN5R0Y4zKq_2vCCqY2vy1UPkgzSikXud9KEF9mNwqofytaSUUIdjgH9f2PHjUdxr-4CciQO61TV-xXlyzEdJhwub7OoN90jDJ1TR82ukWJfw1mWOc3fIKQgDcNNWZ1K3MA9kxP8JBr8qEw5O_meMlIcAh7GaIB9wTXw_GD0OZ7e7uZ5B4cHwuH4Rh0wWm0rBAP1RDFyYCx8Rb5cSJrDm_mKq9C5j4EtNTct-Efr4EmsUVbm4MxrUhf_GzKiCwCLL4A"
              alt="Student using tablet"
            />
            <div className="sp-hero-stat">
              <div className="sp-hero-stat-num">4.9/5</div>
              <div className="sp-hero-stat-label">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="sp-process" id="process">
        <div className="sp-section-title-wrap">
          <h2 className="sp-section-title">Onboarding Process</h2>
          <div className="sp-underline-gold" />
        </div>
        <div className="sp-process-grid">
          {[
            { path: PATHS.doc, label: "1. Create Account", desc: "Secure sign-up using your university email.", gold: false },
            { path: PATHS.clip, label: "2. Set Goals", desc: "Define your courses and academic targets.", gold: false },
            { path: PATHS.cal, label: "3. Import Schedule", desc: "Sync your calendar and exam dates.", gold: false },
            { path: PATHS.book, label: "4. Access Resources", desc: "Upload notes and study materials.", gold: false },
            { path: PATHS.check, label: "5. Achieve More", desc: "Track progress and boost performance.", gold: true },
          ].map((s, i) => (
            <div className="sp-step" key={i}>
              <div className={`sp-step-icon${s.gold ? " gold" : ""}`}><I d={s.path} /></div>
              <div>
                <h3>{s.label}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="sp-features" id="features">
        <div className="sp-section-title-wrap">
          <h2 className="sp-section-title">Core Features</h2>
          <div className="sp-underline-navy" />
        </div>
        <div className="sp-features-grid">
          {[
            { path: PATHS.clip, title: "Task Management", desc: "Prioritize assignments and projects with intuitive drag-and-drop boards and deadline tracking." },
            { path: PATHS.cal, title: "Study Schedule", desc: "Automated time-blocking based on your course load and personal preferences for maximum efficiency." },
            { path: PATHS.book, title: "Resource Library", desc: "Centralized storage for lecture notes, PDFs, and citations with advanced search and categorization." },
            { path: PATHS.chart, title: "Performance Analytics", desc: "Visual data on your study habits and grades to help identify areas for academic improvement." },
          ].map((f, i) => (
            <div className="sp-feature-card" key={i}>
              <div className="sp-feature-icon"><I d={f.path} size={22} /></div>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* METRICS */}
      <section className="sp-metrics">
        <div className="sp-metrics-inner">
          <div className="sp-metrics-stats">
            <div className="sp-metrics-stat-box">
              <div className="sp-metrics-stat-num">25,000+</div>
              <div className="sp-metrics-stat-label">Active Students</div>
            </div>
            <div className="sp-metrics-uni">
              <div className="sp-metrics-uni-num">120+</div>
              <div className="sp-metrics-uni-label">Universities</div>
            </div>
          </div>
          <div className="sp-metrics-right">
            <h3>Trusted by Students from Top Institutions</h3>
            <div className="sp-logos">
              {partnerLogos.map((src, i) => <img key={i} src={src} alt="Partner Logo" />)}
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="sp-why" id="why-us">
        <div className="sp-why-inner">
          <div className="sp-section-title-wrap">
            <h2 className="sp-section-title">Why Choose StudentPro?</h2>
            <div className="sp-underline-gold" />
          </div>
          {[
            { v: "navy", iv: "navy", path: PATHS.bolt, title: "Boost Productivity by 40%", desc: "Our research shows that students using the time-blocking system report a significant increase in study efficiency and a reduction in procrastination." },
            { v: "gold", iv: "gold", path: PATHS.lock, title: "Enterprise-Grade Security", desc: "Your academic records and personal data are protected with end-to-end encryption and comply with global student privacy regulations (FERPA/GDPR)." },
            { v: "navy", iv: "navy", path: PATHS.users, title: "Collaborative Ecosystem", desc: "Join verified study groups, share public note repositories, and participate in peer-to-peer tutoring sessions directly within the platform." },
          ].map((b, i) => (
            <div className={`sp-benefit ${b.v}`} key={i}>
              <div className={`sp-benefit-icon-wrap ${b.iv}`}><I d={b.path} /></div>
              <div className="sp-benefit-text">
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sp-footer">
        <div className="sp-footer-inner">
          <div className="sp-footer-grid">
            <div>
              <div className="sp-footer-logo">
                <div className="sp-footer-logo-icon">S</div>
                <span className="sp-footer-logo-text">STUDENT<span>PRO</span></span>
              </div>
              <p className="sp-footer-desc">Empowering students worldwide to achieve their academic potential through smart technology and productivity systems.</p>
            </div>
            <div className="sp-footer-col">
              <h5>Product</h5>
              <ul>
                {["Features", "Integrations", "Pricing", "Mobile Apps"].map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
            <div className="sp-footer-col">
              <h5>Support</h5>
              <ul>
                {["Help Center", "Academic Success", "Tutorials", "Contact Us"].map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
            <div className="sp-footer-col">
              <h5>Join Our Community</h5>
              <p>Get the latest study tips and product updates.</p>
              <div className="sp-email-row">
                <input
                  className="sp-email-input" type="email" placeholder="Your email"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
                <button className="sp-email-btn">GO</button>
              </div>
            </div>
          </div>
          <div className="sp-footer-bottom">
            <p>© 2025 Smart Student Productivity System. All rights reserved.</p>
            <div className="sp-footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}