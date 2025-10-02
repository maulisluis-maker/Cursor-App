'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifiedPage() {
  const [userEmail, setUserEmail] = useState('');
  const [walletType, setWalletType] = useState<'apple' | 'google' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setUserEmail(decodeURIComponent(email));
    }
  }, [searchParams]);

  const handleWalletIntegration = async (type: 'apple' | 'google') => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // Generate wallet pass
      const response = await fetch(`http://localhost:4000/api/wallet/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          walletType: type
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setWalletType(type);
        setMessage(`Deine ${type === 'apple' ? 'Apple' : 'Google'} Wallet Karte wurde erfolgreich erstellt!`);
        
        // For demo purposes, show success message
        setTimeout(() => {
          setMessage('');
        }, 5000);
      } else {
        setMessage(data.error || 'Fehler beim Erstellen der Wallet-Karte');
      }
    } catch (error) {
      console.error('Wallet integration error:', error);
      setMessage('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-3xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">E-Mail bestätigt!</h1>
          <p className="text-slate-300 text-lg">
            Willkommen bei XKYS Fitnessstudio! Dein Konto ist jetzt aktiv.
          </p>
          {userEmail && (
            <p className="text-slate-400 text-sm mt-2">
              Angemeldet als: {userEmail}
            </p>
          )}
        </div>

        <div className="bg-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            📱 Füge deine digitale Mitgliedskarte hinzu
          </h2>
          <p className="text-slate-300 text-center mb-6">
            Wähle deine bevorzugte Wallet-App und füge deine digitale Mitgliedskarte hinzu. 
            Mit dieser Karte kannst du dich schnell im Fitnessstudio einchecken.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Apple Wallet Button */}
            <button
              onClick={() => handleWalletIntegration('apple')}
              disabled={isLoading}
              className="flex items-center justify-center p-6 bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🍎</div>
                <div className="font-semibold text-lg">Apple Wallet</div>
                <div className="text-sm text-gray-300">Nur iPhone</div>
              </div>
            </button>

            {/* Google Wallet Button */}
            <button
              onClick={() => handleWalletIntegration('google')}
              disabled={isLoading}
              className="flex items-center justify-center p-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors border border-green-500 hover:border-green-400"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <div className="font-semibold text-lg">Google Wallet</div>
                <div className="text-sm text-green-200">Android & iPhone</div>
              </div>
            </button>
          </div>

          {isLoading && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center text-slate-300">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                Wallet-Karte wird erstellt...
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-4 rounded-lg text-center ${
              message.includes('erfolgreich') 
                ? 'bg-green-900/50 border border-green-500 text-green-200' 
                : 'bg-red-900/50 border border-red-500 text-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="bg-slate-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">💡 Vorteile deiner digitalen Karte:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-green-400 text-lg">✅</span>
              <div>
                <div className="text-white font-medium">Immer dabei</div>
                <div className="text-slate-400 text-sm">Keine vergessenen Karten mehr</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 text-lg">✅</span>
              <div>
                <div className="text-white font-medium">Schneller Check-in</div>
                <div className="text-slate-400 text-sm">QR-Code Scanner am Eingang</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 text-lg">✅</span>
              <div>
                <div className="text-white font-medium">Automatische Punkte</div>
                <div className="text-slate-400 text-sm">+1 Punkt pro Besuch</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 text-lg">✅</span>
              <div>
                <div className="text-white font-medium">Umweltfreundlich</div>
                <div className="text-slate-400 text-sm">Keine Plastikkarten</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/member-login"
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 font-medium transition-colors text-center"
          >
            Zum Member-Portal
          </a>
          <a
            href="/"
            className="flex-1 bg-slate-600 text-white py-3 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 font-medium transition-colors text-center"
          >
            Zur Startseite
          </a>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            Powered by XKYS Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
