'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Kein Verifikations-Token gefunden.');
      return;
    }

    // Verify email with backend
    fetch(`http://localhost:4000/api/auth/verify?token=${token}`, {
      method: 'GET',
    })
    .then(response => {
      if (response.ok) {
        setStatus('success');
        setMessage('E-Mail-Adresse erfolgreich bestätigt!');
      } else {
        setStatus('error');
        setMessage('Verifikation fehlgeschlagen. Der Link ist möglicherweise abgelaufen.');
      }
    })
    .catch(error => {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">E-Mail wird bestätigt...</h1>
              <p className="text-slate-300">Bitte warten Sie einen Moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">✅</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">E-Mail bestätigt!</h1>
              <p className="text-slate-300 mb-6">{message}</p>
              <div className="space-y-4">
                <a
                  href="/verified"
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 font-medium transition-colors"
                >
                  Weiter zur Wallet-Integration
                </a>
                <a
                  href="/member-login"
                  className="w-full bg-slate-600 text-white py-3 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 font-medium transition-colors"
                >
                  Zum Login
                </a>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">❌</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verifikation fehlgeschlagen</h1>
              <p className="text-slate-300 mb-6">{message}</p>
              <div className="space-y-4">
                <a
                  href="/register"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 font-medium transition-colors"
                >
                  Erneut registrieren
                </a>
                <a
                  href="/"
                  className="w-full bg-slate-600 text-white py-3 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 font-medium transition-colors"
                >
                  Zur Startseite
                </a>
              </div>
            </>
          )}
        </div>

        <div className="text-center">
          <p className="text-slate-400 text-sm">
            Powered by XKYS Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
