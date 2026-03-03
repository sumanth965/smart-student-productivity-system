import { mockTasks } from '../../data/mockData';

export default function DashboardPage() {
  const todaysTasks = mockTasks.filter((task) => task.dueDate === '2026-03-03');
  const completed = mockTasks.filter((task) => task.completed).length;
  const progress = Math.round((completed / mockTasks.length) * 100);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <section className="rounded-2xl border bg-white p-4 md:col-span-2">
        <h3 className="mb-3 text-lg font-semibold">Today&apos;s Tasks</h3>
        <ul className="space-y-2">
          {todaysTasks.map((task) => (
            <li key={task.id} className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="font-medium">{task.title}</p>
              <p className="text-slate-500">{task.category}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h3 className="text-lg font-semibold">Progress</h3>
        <div className="mt-3 h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-indigo-600" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-600">{progress}% tasks completed</p>
        <div className="mt-4 space-y-2 text-sm">
          <p>Total tasks: {mockTasks.length}</p>
          <p>Completed: {completed}</p>
          <p>Focus streak: 5 days</p>
        </div>
      </section>
    </div>
  );
}
