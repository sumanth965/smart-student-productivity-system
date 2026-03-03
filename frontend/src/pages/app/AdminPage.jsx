import { mockActivityLogs, mockStudents } from '../../data/mockData';

export default function AdminPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold">Manage Students</h3>
        <ul className="space-y-2 text-sm">
          {mockStudents.map((student) => (
            <li key={student.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-slate-500">{student.className}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs ${student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {student.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold">Activity Logs</h3>
        <ul className="space-y-2 text-sm">
          {mockActivityLogs.map((log) => (
            <li key={log.id} className="rounded-xl bg-slate-50 p-3">
              <p className="font-medium">{log.actor}</p>
              <p>{log.action}</p>
              <p className="text-xs text-slate-500">{log.timestamp}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
