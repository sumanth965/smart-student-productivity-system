import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <input className="w-full rounded-xl border px-3 py-2" placeholder="Full name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
        <input className="w-full rounded-xl border px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
        <input className="w-full rounded-xl border px-3 py-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
        <button className="w-full rounded-xl bg-indigo-600 py-2 font-medium text-white" type="submit">Register</button>
        <p className="text-sm text-slate-600">Already registered? <Link className="text-indigo-600" to="/">Login</Link></p>
      </form>
    </div>
  );
}
