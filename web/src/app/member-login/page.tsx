'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MemberLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      // Try backend first
      try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store auth data
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userEmail', data.user.email);
          
          console.log('Login erfolgreich, weiterleiten zu /member-dashboard');
          router.push('/member-dashboard');
          return;
        } else {
          setError(data.error || 'Login fehlgeschlagen');
        }
      } catch (backendError) {
        console.log('Backend not available, using mock login');
        
        // Mock login for demo purposes
        if (email === 'member@fitnessstudio.com' && password === 'member123') {
          localStorage.setItem('token', 'mock-token');
          localStorage.setItem('userRole', 'MEMBER');
          localStorage.setItem('userId', 'mock-user-id');
          localStorage.setItem('userEmail', email);
          
          console.log('Mock login erfolgreich');
          router.push('/member-dashboard');
          return;
        } else {
          setError('Ungültige Anmeldedaten');
        }
      }
    } catch (error) {
      setError('Netzwerkfehler beim Login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mitglieder Login</h1>
          <p className="text-slate-300">Melde dich in deinem Fitnessstudio-Account an</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              E-Mail Adresse
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-slate-900 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="deine@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Passwort
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-slate-900 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dein Passwort"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Noch kein Konto?{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300">
              Registrieren
            </a>
          </p>
        </div>

        <div className="mt-4 p-3 bg-slate-700/50 rounded-md">
          <p className="text-xs text-slate-400">
            <strong>Demo-Anmeldedaten:</strong><br />
            E-Mail: member@fitnessstudio.com<br />
            Passwort: member123
          </p>
        </div>
      </div>
    </div>
  );
}
