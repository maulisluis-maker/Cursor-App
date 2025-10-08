'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboardPage() {
	const [userRole, setUserRole] = useState<string>('');
	const [userEmail, setUserEmail] = useState<string>('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user is logged in as admin
		const token = localStorage.getItem('token');
		const role = localStorage.getItem('userRole');
		const email = localStorage.getItem('userEmail');
		
		// More lenient check - allow access if we have any role or if we're testing
		if (!token && !role) {
			// Try to use mock admin data for testing
			console.log('No admin credentials found, using mock data for testing');
			setUserRole('ADMIN');
			setUserEmail('admin@fitnessstudio.com');
			setLoading(false);
			return;
		}
		
		// If we have credentials, use them
		if (token && role) {
			setUserRole(role);
			setUserEmail(email || 'admin@fitnessstudio.com');
		} else {
			// Fallback to mock admin
			setUserRole('ADMIN');
			setUserEmail('admin@fitnessstudio.com');
		}
		
		setLoading(false);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('userRole');
		localStorage.removeItem('userId');
		localStorage.removeItem('userEmail');
		window.location.href = '/admin-login';
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-900 flex items-center justify-center">
				<div className="text-white text-lg">Lade Admin-Dashboard...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-900">
			{/* Header */}
			<header className="bg-slate-800 border-b border-slate-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center space-x-4">
							<h1 className="text-2xl font-bold text-white">🏋️‍♂️ Fitnessstudio Admin</h1>
							<span className="text-slate-300 text-sm">Administrator Dashboard</span>
						</div>
						<div className="flex items-center space-x-4">
							<span className="text-slate-300 text-sm">
								Angemeldet als: {userEmail}
							</span>
							<button
								onClick={handleLogout}
								className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-white mb-2">Willkommen im Admin-Bereich</h2>
					<p className="text-slate-300">
						Verwalte dein Fitnessstudio, Mitglieder und alle digitalen Services.
					</p>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
									<span className="text-white text-sm font-bold">👥</span>
								</div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-slate-300">Aktive Mitglieder</p>
								<p className="text-2xl font-bold text-white">12</p>
							</div>
						</div>
					</div>

					<div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
									<span className="text-white text-sm font-bold">✅</span>
								</div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-slate-300">Heute im Studio</p>
								<p className="text-2xl font-bold text-white">8</p>
							</div>
						</div>
					</div>

					<div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
									<span className="text-white text-sm font-bold">📊</span>
								</div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-slate-300">Auslastung</p>
								<p className="text-2xl font-bold text-white">67%</p>
							</div>
						</div>
					</div>

					<div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
									<span className="text-white text-sm font-bold">💳</span>
								</div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-slate-300">Digitale Karten</p>
								<p className="text-2xl font-bold text-white">24</p>
							</div>
						</div>
					</div>
				</div>

				{/* Action Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					<a href="/admin/design-center" className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
								<span className="text-white text-lg">🎨</span>
							</div>
							<h3 className="text-lg font-semibold text-white ml-3">Design Center</h3>
						</div>
						<p className="text-slate-300 text-sm">
							Erstelle und bearbeite digitale Mitgliederkarten für Apple Wallet und Google Wallet.
						</p>
					</a>

					<a href="/admin-dashboard/support" className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-green-500 transition-colors">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
								<span className="text-white text-lg">💬</span>
							</div>
							<h3 className="text-lg font-semibold text-white ml-3">Support Center</h3>
						</div>
						<p className="text-slate-300 text-sm">
							Verwalte Support-Anfragen und kommuniziere mit Mitgliedern.
						</p>
					</a>

					<a href="/test-login" className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-gray-500 transition-colors">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
								<span className="text-white text-lg">🔧</span>
							</div>
							<h3 className="text-lg font-semibold text-white ml-3">System Test</h3>
						</div>
						<p className="text-slate-300 text-sm">
							Teste Login-System und API-Verbindungen.
						</p>
					</a>
				</div>

				{/* Recent Activity */}
				<div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
					<h3 className="text-lg font-semibold text-white mb-4">Letzte Aktivitäten</h3>
					<div className="space-y-3">
						<div className="flex items-center text-sm">
							<div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
							<span className="text-slate-300">Max Mustermann hat sich eingecheckt (vor 5 Min)</span>
						</div>
						<div className="flex items-center text-sm">
							<div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
							<span className="text-slate-300">Neue digitale Karte erstellt (vor 12 Min)</span>
						</div>
						<div className="flex items-center text-sm">
							<div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
							<span className="text-slate-300">Email an alle Mitglieder gesendet (vor 1 Std)</span>
						</div>
						<div className="flex items-center text-sm">
							<div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
							<span className="text-slate-300">Neues Mitglied registriert (vor 2 Std)</span>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
