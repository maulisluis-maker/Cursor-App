'use client';

import { useState } from 'react';

export default function TestWalletPage() {
  const [walletOption, setWalletOption] = useState('');

  const handleChange = (e) => {
    setWalletOption(e.target.value);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Wallet Test</h1>
          <p className="text-slate-300">Test der Wallet-Auswahl</p>
        </div>

        <div className="space-y-6">
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
                  checked={walletOption === 'google'}
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
                  checked={walletOption === 'apple'}
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

          <div className="bg-slate-700 p-4 rounded">
            <p className="text-white">
              Ausgewählt: <strong>{walletOption || 'Nichts'}</strong>
            </p>
          </div>

          <a 
            href="/register" 
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center"
          >
            Zur Registrierung
          </a>
        </div>
      </div>
    </div>
  );
}
