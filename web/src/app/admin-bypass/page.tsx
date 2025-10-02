'use client';

import { useEffect } from 'react';

export default function AdminBypassPage() {
	useEffect(() => {
		// Set admin credentials directly
		localStorage.setItem('token', 'bypass-token');
		localStorage.setItem('userRole', 'ADMIN');
		localStorage.setItem('userId', 'bypass-user-id');
		localStorage.setItem('userEmail', 'admin@fitnessstudio.com');
		
		// Redirect to admin dashboard
		window.location.href = '/admin-dashboard';
	}, []);

	return (
		<div className="min-h-screen bg-slate-900 flex items-center justify-center">
			<div className="text-center">
				<div className="text-white text-2xl mb-4">🔄</div>
				<div className="text-white text-lg">Leite zum Admin Dashboard weiter...</div>
			</div>
		</div>
	);
}
