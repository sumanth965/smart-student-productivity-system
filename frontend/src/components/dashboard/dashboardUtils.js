export const MOCK_TASKS = [
  {
    id: 1,
    title: 'Complete Mathematics Assignment',
    subject: 'Mathematics',
    deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
    priority: 'high',
    completed: false,
    description: 'Chapters 5-7 integration problems',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: 'Physics Lab Report',
    subject: 'Physics',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    priority: 'high',
    completed: false,
    description: 'Oscillations experiment analysis',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: 'Essay on Modern Literature',
    subject: 'English',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    completed: true,
    description: '2000 words on contemporary authors',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    title: 'Chemistry Quiz Preparation',
    subject: 'Chemistry',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    priority: 'high',
    completed: false,
    description: 'Organic chemistry periodic table review',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 5,
    title: 'History Project Presentation',
    subject: 'History',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    completed: false,
    description: 'World War II era research slides',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 6,
    title: 'Programming Project - Database',
    subject: 'Computer Science',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    completed: false,
    description: 'Build student management system',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 7,
    title: 'Biology Exam Study',
    subject: 'Biology',
    deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    priority: 'low',
    completed: false,
    description: 'Genetics and evolution chapters',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 8,
    title: 'Art Portfolio Submission',
    subject: 'Art',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    priority: 'high',
    completed: true,
    description: '5 digital artwork pieces',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
];

export const calculatePriority = (deadline) => {
  const diffHours = (deadline - new Date()) / (1000 * 60 * 60);
  if (diffHours < 24) return 'high';
  if (diffHours < 168) return 'medium';
  return 'low';
};


const TASK_PRIORITY_LEVELS = new Set(['high', 'medium', 'low']);

export const resolveTaskPriority = (priority, deadline) => {
  const normalizedPriority = typeof priority === 'string' ? priority.toLowerCase() : '';
  if (TASK_PRIORITY_LEVELS.has(normalizedPriority)) return normalizedPriority;
  return calculatePriority(deadline);
};

export const isOverdue = (deadline, completed) => !completed && new Date() > deadline;

export const getDaysUntil = (deadline) => {
  const diffMs = deadline - new Date();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};
