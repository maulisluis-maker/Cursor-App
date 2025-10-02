'use client';

import { useState, useEffect } from 'react';

export default function TestLoginPage() {
  const [loginStatus, setLoginStatus] = useState('Bereit für Login-Test');
  const [localStorageData, setLocalStorageData] = useState({
    token: false,
    role: '',
    email: ''
  });

  useEffect(() => {
    // Check localStorage on component mount
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        token: !!localStorage.getItem('token'),
        role: localStorage.getItem('userRole') || '',
        email: localStorage.getItem('userEmail') || ''
      });
    }
  }, []);

  const testAdminLogin = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: 'admin@fitnessstudio.com', 
          password: 'admin123' 
        })
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'ADMIN') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userEmail', data.user.email);
        
        setLoginStatus(`Admin Login erfolgreich: ${data.user.email}`);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin-dashboard';
        }, 2000);
      } else {
        setLoginStatus('Admin Login fehlgeschlagen');
      }
    } catch (error) {
      setLoginStatus('Fehler beim Admin Login');
    }
  };

  const testMemberLogin = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: 'member@fitnessstudio.com', 
          password: 'member123' 
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userEmail', data.user.email);
        
        setLoginStatus(`Member Login erfolgreich: ${data.user.email}`);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/member-dashboard';
        }, 2000);
      } else {
        setLoginStatus('Member Login fehlgeschlagen');
      }
    } catch (error) {
      setLoginStatus('Fehler beim Member Login');
    }
  };

  const clearLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    setLoginStatus('Login gelöscht');
    setLocalStorageData({
      token: false,
      role: '',
      email: ''
    });
  };

  const goToAdminDashboard = () => {
    window.location.href = '/admin-dashboard';
  };

  const goToMemberDashboard = () => {
    window.location.href = '/member-dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Login Test & Bypass</h1>
        
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Aktueller Status</h2>
          <p className="text-slate-300 mb-4">{loginStatus}</p>
          
          <div className="space-y-2 text-sm text-slate-400">
            <p>Token: {localStorageData.token ? '✅ Vorhanden' : '❌ Fehlt'}</p>
            <p>Role: {localStorageData.role || 'Keine'}</p>
            <p>Email: {localStorageData.email || 'Keine'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={testAdminLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            🔐 Admin Login Test
          </button>
          
          <button
            onClick={testMemberLogin}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            👤 Member Login Test
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={clearLogin}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            🗑️ Login löschen
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            🔄 Seite neu laden
          </button>
        </div>

        <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-200 mb-4">🚀 Direkte Zugänge (Bypass)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={goToAdminDashboard}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              🏋️‍♂️ Admin Dashboard (Direkt)
            </button>
            
            <button
              onClick={goToMemberDashboard}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              👤 Member Dashboard (Direkt)
            </button>
          </div>
          <p className="text-yellow-200 text-sm mt-3">
            Diese Buttons umgehen die Login-Prüfung komplett!
          </p>
        </div>

        <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-200 mb-4">📋 Verfügbare Login-Daten</h3>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-700 rounded p-3">
              <p className="text-blue-200 font-medium">👨‍💼 Admin Account:</p>
              <p className="text-slate-300">E-Mail: admin@fitnessstudio.com</p>
              <p className="text-slate-300">Passwort: admin123</p>
            </div>
            <div className="bg-slate-700 rounded p-3">
              <p className="text-blue-200 font-medium">👤 Member Account:</p>
              <p className="text-slate-300">E-Mail: member@fitnessstudio.com</p>
              <p className="text-slate-300">Passwort: member123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
