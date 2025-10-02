'use client';
import { useState } from 'react';
import { Card } from '@/components/Card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api') + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Fehler');
      localStorage.setItem('token', data.token);
      setMessage('Login erfolgreich.');
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  return (
    <Card title="Login">
      <form onSubmit={onSubmit} className="grid gap-4 max-w-md">
        <div>
          <label className="label">E-Mail</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Passwort</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
      {message && <p className="mt-4 text-sm text-brand-300">{message}</p>}
    </Card>
  );
}
