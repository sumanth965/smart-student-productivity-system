export const mockTasks = [
  { id: 1, title: 'Prepare calculus assignment', dueDate: '2026-03-03', completed: false, category: 'Math' },
  { id: 2, title: 'Revise chemistry chapter 7', dueDate: '2026-03-03', completed: true, category: 'Chemistry' },
  { id: 3, title: 'History essay draft', dueDate: '2026-03-04', completed: false, category: 'History' },
];

export const mockAiHistory = [
  { id: 1, prompt: 'Summarize Newton\'s laws in simple words', createdAt: '2026-03-01T10:20:00Z' },
  { id: 2, prompt: 'Create a 7-day exam revision plan', createdAt: '2026-03-02T09:00:00Z' },
];

export const mockStudents = [
  { id: 1, name: 'Aarav Shah', className: '10-A', status: 'active', productivity: 82 },
  { id: 2, name: 'Maya Rao', className: '10-B', status: 'active', productivity: 91 },
  { id: 3, name: 'Ravi Kumar', className: '10-A', status: 'at-risk', productivity: 58 },
];

export const mockActivityLogs = [
  { id: 1, actor: 'Aarav Shah', action: 'Completed task: Calculus assignment', timestamp: '2026-03-03 08:35' },
  { id: 2, actor: 'Maya Rao', action: 'Used AI module', timestamp: '2026-03-03 09:12' },
  { id: 3, actor: 'System', action: 'Reminder pushed for 4 deadlines', timestamp: '2026-03-03 09:30' },
];
