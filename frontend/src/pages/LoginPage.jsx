import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    const role = form.email.includes('admin') ? 'admin' : 'student';
    login({ name: form.email.split('@')[0], email: form.email, role });

    const destination = location.state?.from?.pathname || '/dashboard';
    navigate(destination, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-semibold">Smart Student Login</h1>
        <p className="text-sm text-slate-500">Use <span className="font-medium">admin@school.com</span> to test admin role.</p>
        <input className="w-full rounded-xl border px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
        <input className="w-full rounded-xl border px-3 py-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded-xl bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700" type="submit">Login</button>
        <p className="text-sm text-slate-600">No account? <Link className="text-indigo-600" to="/register">Register</Link></p>
      </form>
    </div>
  );
}
