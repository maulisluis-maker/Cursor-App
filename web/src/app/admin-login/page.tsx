'use client';

import { useState } from 'react';
import { Card } from '../../components/Card';

export default function AdminLoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch('http://localhost:4000/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (response.ok && data.user && data.user.role === 'ADMIN') {
				// Store admin token
				localStorage.setItem('token', data.token);
				localStorage.setItem('userRole', data.user.role);
				localStorage.setItem('userId', data.user.id);
				localStorage.setItem('userEmail', data.user.email);
				
				// Redirect to admin dashboard
				window.location.href = '/admin-dashboard';
			} else {
				setError('Zugriff verweigert. Nur Administratoren können sich hier anmelden.');
			}
		} catch (error) {
			setError('Netzwerkfehler beim Login');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Card title="Admin Login">
				<p className="text-slate-300 mb-6">
					Administrator-Zugang für Studio-Management.
				</p>
				
				<form onSubmit={handleLogin} className="space-y-4">
					<div>
						<label className="label">Admin E-Mail</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="admin@fitnessstudio.com"
							className="input w-full"
							required
						/>
					</div>
					
					<div>
						<label className="label">Admin Passwort</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Admin Passwort"
							className="input w-full"
							required
						/>
					</div>
					
					{error && (
						<div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
							{error}
						</div>
					)}
					
					<button 
						type="submit"
						disabled={loading}
						className="btn btn-primary w-full"
					>
						{loading ? 'Admin Login...' : 'Admin Login'}
					</button>
				</form>
				
				<div className="mt-6 text-center">
					<p className="text-slate-400 text-sm">
						Mitglieder-Login?{' '}
						<a href="/member-login" className="text-blue-400 hover:underline">
							Hier klicken
						</a>
					</p>
				</div>
			</Card>
		</>
	);
}
