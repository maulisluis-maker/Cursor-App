'use client';

import { useState, useEffect } from 'react';

interface WalletCard {
  id: string;
  cardUrl: string;
  points: number;
  isActive: boolean;
  createdAt: string;
  lastAccessedAt?: string;
  cardDesign?: {
    id: string;
    name: string;
  };
}

interface Member {
  id: string;
  membershipId: string;
  firstName: string;
  lastName: string;
  email: string;
  points: number;
  status: string;
}

export default function WalletCardPage() {
  const [walletCard, setWalletCard] = useState<WalletCard | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWalletCard();
  }, []);

  const fetchWalletCard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/member/wallet-card', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWalletCard(data.walletCard);
        setMember(data.member);
      } else if (response.status === 404) {
        // No wallet card found - member hasn't requested one yet
        const memberResponse = await fetch('http://localhost:4000/api/member/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (memberResponse.ok) {
          const memberData = await memberResponse.json();
          setMember(memberData.member);
        }
      } else {
        setError('Fehler beim Laden der Wallet-Karte');
      }
    } catch (err) {
      setError('Fehler beim Laden der Wallet-Karte');
    } finally {
      setLoading(false);
    }
  };

  const requestWalletCard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/member/request-wallet-card', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage('Wallet-Karten-Anfrage gesendet! Du erhältst eine Email sobald deine Karte bereit ist.');
      } else {
        setError('Fehler beim Anfordern der Wallet-Karte');
      }
    } catch (err) {
      setError('Fehler beim Anfordern der Wallet-Karte');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Lade Wallet-Karte...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎯 Meine Google Wallet Karte</h1>
          <p className="text-slate-300">Verwalte deine personalisierte digitale Mitgliedskarte</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-md mb-6">
            {message}
          </div>
        )}

        {member && (
          <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">📋 Mitgliedsinformationen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <p className="text-white">{member.firstName} {member.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mitgliedsnummer</label>
                <p className="text-white font-mono">{member.membershipId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Aktuelle Punkte</label>
                <p className="text-blue-400 text-xl font-bold">{member.points} Punkte</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  member.status === 'ACTIVE' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-yellow-600 text-white'
                }`}>
                  {member.status === 'ACTIVE' ? 'Aktiv' : 'Wartend'}
                </span>
              </div>
            </div>
          </div>
        )}

        {walletCard ? (
          <div className="bg-slate-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">🎯 Deine Google Wallet Karte</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${
                walletCard.isActive 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}>
                {walletCard.isActive ? 'Aktiv' : 'Deaktiviert'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">📊 Karten-Informationen</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Karten-Punkte:</span>
                      <span className="text-blue-400 font-bold">{walletCard.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Erstellt am:</span>
                      <span className="text-white">{new Date(walletCard.createdAt).toLocaleDateString('de-DE')}</span>
                    </div>
                    {walletCard.lastAccessedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-300">Zuletzt genutzt:</span>
                        <span className="text-white">{new Date(walletCard.lastAccessedAt).toLocaleDateString('de-DE')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">🎨 Design</h3>
                  {walletCard.cardDesign ? (
                    <p className="text-slate-300">{walletCard.cardDesign.name}</p>
                  ) : (
                    <p className="text-slate-400">Standard Design</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-center">
                  <h3 className="text-white text-lg font-semibold mb-4">🎯 Deine Karte hinzufügen</h3>
                  <p className="text-blue-100 mb-4">
                    Klicke auf den Button um deine personalisierte Karte zu Google Wallet hinzuzufügen
                  </p>
                  <a
                    href={walletCard.cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                  >
                    🎯 Zu Google Wallet hinzufügen
                  </a>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">📱 So funktioniert's</h3>
                  <ol className="text-slate-300 text-sm space-y-1">
                    <li>1. Klicke auf "Zu Google Wallet hinzufügen"</li>
                    <li>2. Öffne die Google Wallet App</li>
                    <li>3. Bestätige das Hinzufügen der Karte</li>
                    <li>4. Nutze deine Karte zum Check-in im Studio</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500 rounded-lg">
              <h4 className="text-blue-200 font-medium mb-2">💡 Tipp</h4>
              <p className="text-blue-100 text-sm">
                Deine Karte wird automatisch mit deinen aktuellen Punkten aktualisiert. 
                Du musst nichts manuell aktualisieren!
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-white mb-4">Keine Wallet-Karte vorhanden</h2>
            <p className="text-slate-300 mb-6">
              Du hast noch keine personalisierte Google Wallet Karte. 
              Fordere jetzt deine individuelle Karte an!
            </p>
            
            {member?.status === 'ACTIVE' ? (
              <>
                <button
                  onClick={requestWalletCard}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold mb-4"
                >
                  🎯 Wallet-Karte anfordern
                </button>
                <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mt-4">
                  <h4 className="text-blue-200 font-medium mb-2">ℹ️ Hinweis</h4>
                  <p className="text-blue-100 text-sm">
                    Falls die Anfrage fehlschlägt, hat der Admin möglicherweise noch kein Master-Design erstellt. 
                    In diesem Fall kontaktiere bitte den Support.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-200">
                  ⚠️ Du musst erst deine Email bestätigen, bevor du eine Wallet-Karte anfordern kannst.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-slate-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">❓ Hilfe & Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">🆘 Probleme mit der Karte?</h3>
              <p className="text-slate-300 text-sm mb-3">
                Falls du Probleme beim Hinzufügen oder Nutzen deiner Karte hast:
              </p>
              <a
                href="/member-dashboard"
                className="inline-block bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded text-sm"
              >
                Support kontaktieren
              </a>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">📱 Google Wallet nicht installiert?</h3>
              <p className="text-slate-300 text-sm mb-3">
                Lade die Google Wallet App aus dem App Store herunter:
              </p>
              <div className="flex space-x-2">
                <a
                  href="https://play.google.com/store/apps/details?id=com.google.android.apps.walletnfcrel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm"
                >
                  Android
                </a>
                <a
                  href="https://apps.apple.com/app/google-pay/id1193357048"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm"
                >
                  iPhone
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
