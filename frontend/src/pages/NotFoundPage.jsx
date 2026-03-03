import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 text-center">
        <h1 className="text-2xl font-semibold">404 - Page not found</h1>
        <p className="mt-2 text-slate-600">The page you are trying to access does not exist.</p>
        <Link to="/dashboard" className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-white">Return home</Link>
      </div>
    </div>
  );
}
