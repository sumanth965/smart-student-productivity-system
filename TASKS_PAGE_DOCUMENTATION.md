# Tasks Page Documentation

## Overview
The Tasks page is a professional, fully-responsive task management interface for the Smart Student Productivity System. It seamlessly integrates with the existing dashboard design and provides a comprehensive view of both teacher-assigned and personal tasks.

## Features

### 🎨 Design Consistency
- **Perfect Dashboard Matching**: Uses identical color schemes, fonts, spacing, shadows, and hover effects
- **Shared Components**: Reuses DashboardNavbar for consistent navigation
- **Dark Mode Support**: Fully integrated dark/light theme toggle with smooth transitions
- **Responsive Layout**: Adapts beautifully across desktop, tablet, and mobile devices

### 📋 Task Management

#### Two-Section Layout
1. **Teacher Assigned Tasks** (Left/Top - 2/3 width on desktop)
   - Red/Orange gradient accents for high priority
   - Displays: Priority badge, subject, class section, deadline, description
   - Card-based grid layout (2 columns on desktop)
   - Shows teacher name and assignment details

2. **My Personal Tasks** (Right/Bottom - 1/3 width on desktop)
   - Blue/Green gradient accents
   - Compact list view for efficient space usage
   - Shows: Category tag, estimated time, deadline
   - Quick actions for edit/delete

### 🔍 Filtering & Search
- **Real-time Search**: Filter tasks by title or subject
- **Filter Options**:
  - All Tasks
  - Overdue
  - Due Today
  - Upcoming (within 7 days)
  - Completed

### 🎯 Interactive Features
- **Task Completion**: Click checkbox to mark tasks complete/incomplete
- **Task Details**: Click any task card to view full details in modal
- **Delete Tasks**: Hover over task to reveal delete button
- **Responsive Actions**: All interactions have smooth animations and feedback

### 📱 Responsive Design

#### Desktop (lg+)
- Two-column layout: Teacher tasks (66%) | Personal tasks (33%)
- Grid view for teacher tasks (2 columns)
- List view for personal tasks

#### Tablet (md)
- Stacked sections with adjusted padding
- Single column grid for teacher tasks
- Full-width personal tasks

#### Mobile (sm)
- Full-width cards
- Floating Action Button (FAB) for adding tasks
- Touch-friendly buttons and spacing
- Horizontal scroll for tags

### 🎭 Visual Elements

#### Priority Badges
- **High Priority**: Red/Rose gradient with flag icon
- **Medium Priority**: Amber/Orange gradient with flag icon
- **Low Priority**: Emerald/Teal gradient with flag icon

#### Status Indicators
- **Overdue**: Red alert icon with "Overdue" text
- **Upcoming**: Clock icon with days remaining
- **Completed**: Green checkmark with strikethrough text

#### Hover Effects
- Scale transformation (102%)
- Enhanced shadows
- Gradient background overlays
- Smooth transitions (300ms)

### 🔄 State Management
- **Loading States**: Skeleton loaders during data fetch
- **Empty States**: Friendly messages with icons when no tasks
- **Error Handling**: Graceful fallbacks for API failures
- **Optimistic Updates**: Immediate UI feedback with background sync

## Technical Implementation

### File Structure
```
frontend/src/
├── pages/
│   └── Tasks.jsx          # Main Tasks page component
├── components/
│   └── dashboard/
│       ├── DashboardNavbar.jsx  # Shared navigation (updated)
│       └── dashboardUtils.js    # Shared utilities
└── App.jsx                # Routing (updated)
```

### Key Components

#### Tasks (Main Component)
- Manages task state (teacher & personal)
- Handles filtering and search
- Coordinates API calls
- Renders layout and sections

#### TeacherTaskCard
- Displays teacher-assigned task details
- Priority-based gradient backgrounds
- Hover interactions and animations
- Click to expand details

#### PersonalTaskCard
- Compact list-style task display
- Blue accent theme
- Quick action buttons
- Estimated time display

#### TaskDetailModal
- Full task information overlay
- Deadline, priority, description
- Assigned by information
- Close button and backdrop

#### EmptyState
- Friendly empty state messages
- Icon and text display
- Matches theme colors

### API Integration

#### Endpoints Used
```javascript
GET /api/students/:studentId/tasks
// Fetches all tasks for the student

PUT /api/tasks/:taskId
// Updates task status (completed/pending)
```

#### Data Mapping
```javascript
{
  id: task._id,
  title: task.title,
  subject: task.subject,
  deadline: new Date(task.dueDate),
  priority: task.priority?.toLowerCase(),
  completed: task.status === 'Completed',
  description: task.description,
  createdBy: task.createdBy?.name,
  classSection: task.classSection
}
```

### Styling Approach

#### Tailwind CSS Classes
- Gradient backgrounds: `bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900`
- Backdrop blur: `backdrop-blur-md`
- Ring borders: `ring-1 ring-slate-700/50`
- Hover effects: `hover:scale-102 hover:shadow-xl`
- Dark mode: `dark:bg-slate-800 dark:text-white`

#### Color Palette
**Light Mode:**
- Background: `from-slate-50 to-blue-50`
- Cards: `bg-white/80`
- Text: `text-slate-900`
- Borders: `ring-slate-200/50`

**Dark Mode:**
- Background: `from-slate-900 via-blue-900 to-slate-900`
- Cards: `bg-slate-800/80`
- Text: `text-white`
- Borders: `ring-slate-700/50`

### Utility Functions

#### calculatePriority(deadline)
Determines task priority based on time until deadline:
- < 24 hours: High
- < 7 days: Medium
- > 7 days: Low

#### isOverdue(deadline, completed)
Checks if task is past deadline and not completed

#### getDaysUntil(deadline)
Calculates days remaining until deadline

## Usage

### Navigation
Access the Tasks page via:
1. Dashboard navbar → "Tasks" link
2. Direct URL: `/tasks`
3. Mobile menu → "Tasks" option

### Adding Tasks
1. Click "Add Task" button (top right on desktop, FAB on mobile)
2. Fill in task details in modal
3. Submit to create new personal task

### Managing Tasks
- **Complete**: Click checkbox on any task
- **View Details**: Click task card to open modal
- **Delete**: Hover over task and click trash icon
- **Filter**: Use dropdown to filter by status
- **Search**: Type in search bar to filter by title/subject

### Dark Mode
Toggle dark mode using the moon/sun icon in the navbar. Preference is saved to localStorage.

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch optimizations

## Performance Optimizations
- **useMemo**: Filtered tasks computed only when dependencies change
- **useCallback**: Event handlers memoized to prevent re-renders
- **Lazy Loading**: Components render only when needed
- **Optimistic Updates**: UI updates immediately, syncs in background

## Accessibility
- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Color contrast meets WCAG standards

## Future Enhancements
- Drag & drop task reordering
- Bulk actions (complete all, delete selected)
- Task editing inline
- Progress bars for multi-step tasks
- Confetti animation on task completion
- Export tasks to calendar
- Task reminders and notifications

## Troubleshooting

### Tasks not loading
- Check browser console for API errors
- Verify user is logged in (check localStorage/sessionStorage)
- Ensure backend API is running

### Dark mode not persisting
- Check localStorage for 'darkMode' key
- Clear browser cache and try again

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check that all required dependencies are installed
- Verify no CSS conflicts with other components

## Dependencies
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "lucide-react": "^0.x",
  "axios": "^1.x"
}
```

## Route Configuration
```javascript
// In App.jsx
<Route path="/tasks" element={<Tasks />} />
```

## Navigation Link
```javascript
// In DashboardNavbar.jsx
{ to: '/tasks', label: 'Tasks', icon: CheckSquare }
```

---

**Created**: March 12, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
