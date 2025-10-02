'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    walletOption: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Check password match in real-time
    if (name === 'password' || name === 'confirmPassword') {
      const password = name === 'password' ? value : newFormData.password;
      const confirmPassword = name === 'confirmPassword' ? value : newFormData.confirmPassword;
      
      if (password && confirmPassword) {
        setPasswordMatch(password === confirmPassword);
      } else {
        setPasswordMatch(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.walletOption) {
      setError('Bitte wähle Apple Wallet oder Google Wallet aus.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein. Bitte überprüfe deine Eingabe.');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password, 
          firstName: formData.firstName, 
          lastName: formData.lastName,
          walletType: formData.walletOption 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Fehler');
      
      if (data.emailVerificationSent) {
        setMessage('Registrierung erfolgreich! Bitte überprüfe deine E-Mail und bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren.');
      } else {
        setMessage('Registrierung erfolgreich! Deine digitale Mitgliedskarte wurde erstellt.');
      }
      console.log('Registrierungsdaten:', formData);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Registrieren</h1>
          <p className="text-slate-300">Registriere dich für dein Fitnessstudio-Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
              Vorname
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dein Vorname"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
              Nachname
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dein Nachname"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              E-Mail Adresse
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="deine@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dein Passwort"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
              Passwort erneut eingeben
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 bg-slate-700 border rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                passwordMatch === true 
                  ? 'border-green-500 focus:ring-green-500' 
                  : passwordMatch === false 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-slate-600 focus:ring-blue-500'
              }`}
              placeholder="Passwort wiederholen"
            />
            {passwordMatch !== null && (
              <div className={`mt-2 text-sm flex items-center ${
                passwordMatch ? 'text-green-400' : 'text-red-400'
              }`}>
                <span className="mr-2">
                  {passwordMatch ? '✅' : '❌'}
                </span>
                {passwordMatch ? 'Passwörter stimmen überein' : 'Passwörter stimmen nicht überein'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              📱 Welche Wallet-App verwendest du? *
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-slate-600 rounded-md hover:bg-slate-700 cursor-pointer bg-slate-700">
                <input
                  type="radio"
                  name="walletOption"
                  value="google"
                  checked={formData.walletOption === 'google'}
                  onChange={handleChange}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <span className="text-2xl mr-2">📱</span>
                  <div>
                    <div className="font-medium text-white">Google Wallet</div>
                    <div className="text-sm text-slate-400">Android & iPhone</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-slate-600 rounded-md hover:bg-slate-700 cursor-pointer bg-slate-700">
                <input
                  type="radio"
                  name="walletOption"
                  value="apple"
                  checked={formData.walletOption === 'apple'}
                  onChange={handleChange}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🍎</span>
                  <div>
                    <div className="font-medium text-white">Apple Wallet</div>
                    <div className="text-sm text-slate-400">Nur iPhone</div>
                  </div>
                </div>
              </label>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              * Pflichtfeld - Deine digitale Mitgliedskarte wird automatisch erstellt
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-md">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordMatch === false}
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${
              passwordMatch === false
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {passwordMatch === false ? 'Passwörter müssen übereinstimmen' : 'Registrieren'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Bereits ein Konto?{' '}
            <a href="/member-login" className="text-blue-400 hover:text-blue-300">
              Anmelden
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 
