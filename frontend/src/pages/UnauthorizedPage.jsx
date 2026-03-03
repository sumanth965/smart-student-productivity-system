import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 text-center">
        <h1 className="text-2xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-slate-600">You do not have access to this page.</p>
        <Link to="/dashboard" className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-white">Go to dashboard</Link>
      </div>
    </div>
  );
}
