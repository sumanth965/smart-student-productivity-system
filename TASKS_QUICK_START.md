# Tasks Page - Quick Start Guide

## 🚀 Access the Page
Navigate to: **`/tasks`** or click **"Tasks"** in the navbar

## 📊 Layout Overview

### Desktop View
```
┌─────────────────────────────────────────────────────────┐
│  [Navbar with Search, Dark Mode, Profile]              │
├─────────────────────────────────────────────────────────┤
│  My Tasks                          [+ Add Task Button]  │
│  ┌──────────────────────┬──────────────────────────┐   │
│  │ Teacher Tasks (66%)  │  Personal Tasks (33%)    │   │
│  │ ┌────────┬────────┐  │  ┌──────────────────┐   │   │
│  │ │ Card 1 │ Card 2 │  │  │ Compact Task 1   │   │   │
│  │ └────────┴────────┘  │  ├──────────────────┤   │   │
│  │ ┌────────┬────────┐  │  │ Compact Task 2   │   │   │
│  │ │ Card 3 │ Card 4 │  │  └──────────────────┘   │   │
│  │ └────────┴────────┘  │                          │   │
│  └──────────────────────┴──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Mobile View
- Stacked sections (Teacher → Personal)
- Floating Action Button (FAB) for quick add
- Full-width cards with touch-friendly spacing

## 🎨 Key Features

### 1. Task Cards
**Teacher Tasks**: Priority badges (Red/Orange/Green) + Subject + Deadline
**Personal Tasks**: Compact list with category tags + estimated time

### 2. Filters & Search
- Search bar: Filter by title/subject
- Dropdown: All | Overdue | Today | Upcoming | Completed

### 3. Interactions
- ✅ Click checkbox → Mark complete/incomplete
- 🗑️ Hover → Show delete button
- 👁️ Click card → View full details modal
- ➕ Add Task → Opens creation modal

## 🎯 Quick Actions

| Action | Desktop | Mobile |
|--------|---------|--------|
| Add Task | Top-right button | FAB (bottom-right) |
| Complete | Click checkbox | Click checkbox |
| Delete | Hover + trash icon | Swipe or tap trash |
| View Details | Click card | Tap card |
| Search | Top search bar | Top search bar |

## 🌓 Dark Mode
Toggle via navbar moon/sun icon - syncs across all pages

## 📱 Responsive Breakpoints
- **Mobile**: < 768px (sm)
- **Tablet**: 768px - 1024px (md)
- **Desktop**: > 1024px (lg)

## 🔗 Navigation Added
New "Tasks" link in navbar between "Dashboard" and "Deadlines"

---
**Ready to use!** Navigate to `/tasks` to see it in action.
