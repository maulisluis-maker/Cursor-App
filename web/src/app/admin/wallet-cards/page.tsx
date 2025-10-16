'use client';

import { useState, useEffect } from 'react';

interface WalletCard {
  id: string;
  cardUrl: string;
  points: number;
  isActive: boolean;
  createdAt: string;
  lastAccessedAt?: string;
  member: {
    id: string;
    membershipId: string;
    firstName: string;
    lastName: string;
    email: string;
    points: number;
  };
  cardDesign?: {
    id: string;
    name: string;
  };
}

export default function WalletCardsPage() {
  const [walletCards, setWalletCards] = useState<WalletCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCard, setSelectedCard] = useState<WalletCard | null>(null);
  const [pointsUpdate, setPointsUpdate] = useState('');

  useEffect(() => {
    fetchWalletCards();
  }, []);

  const fetchWalletCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/admin/wallet-cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWalletCards(data.walletCards);
      } else {
        setError('Fehler beim Laden der Wallet-Karten');
      }
    } catch (err) {
      setError('Fehler beim Laden der Wallet-Karten');
    } finally {
      setLoading(false);
    }
  };

  const updateCardPoints = async (cardId: string, newPoints: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/wallet-cards/${cardId}/points`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ points: newPoints })
      });

      if (response.ok) {
        setMessage(`Punkte für ${selectedCard?.member.firstName} ${selectedCard?.member.lastName} aktualisiert!`);
        setSelectedCard(null);
        setPointsUpdate('');
        fetchWalletCards();
      } else {
        setError('Fehler beim Aktualisieren der Punkte');
      }
    } catch (err) {
      setError('Fehler beim Aktualisieren der Punkte');
    }
  };

  const toggleCardStatus = async (cardId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/wallet-cards/${cardId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        setMessage(`Karten-Status für ${selectedCard?.member.firstName} ${selectedCard?.member.lastName} geändert!`);
        setSelectedCard(null);
        fetchWalletCards();
      } else {
        setError('Fehler beim Ändern des Karten-Status');
      }
    } catch (err) {
      setError('Fehler beim Ändern des Karten-Status');
    }
  };

  const resendWalletEmail = async (cardId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/wallet-cards/${cardId}/resend-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage(`Wallet-Email für ${selectedCard?.member.firstName} ${selectedCard?.member.lastName} erneut gesendet!`);
        setSelectedCard(null);
      } else {
        setError('Fehler beim Senden der Wallet-Email');
      }
    } catch (err) {
      setError('Fehler beim Senden der Wallet-Email');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Lade Wallet-Karten...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎯 Google Wallet Karten Management</h1>
          <p className="text-slate-300">Verwalte alle personalisierten Google Wallet Karten deiner Mitglieder</p>
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

        <div className="bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Wallet-Karten ({walletCards.length})
            </h2>
            <button
              onClick={fetchWalletCards}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              🔄 Aktualisieren
            </button>
          </div>

          {walletCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Noch keine Wallet-Karten</h3>
              <p className="text-slate-400">
                Sobald sich Mitglieder registrieren und Google Wallet auswählen, 
                werden hier ihre personalisierten Karten angezeigt.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300">Mitglied</th>
                    <th className="text-left py-3 px-4 text-slate-300">Mitgliedsnummer</th>
                    <th className="text-left py-3 px-4 text-slate-300">Punkte</th>
                    <th className="text-left py-3 px-4 text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300">Erstellt</th>
                    <th className="text-left py-3 px-4 text-slate-300">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {walletCards.map((card) => (
                    <tr key={card.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-white font-medium">
                            {card.member.firstName} {card.member.lastName}
                          </div>
                          <div className="text-slate-400 text-sm">{card.member.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white">{card.member.membershipId}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
                          {card.points} Punkte
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          card.isActive 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {card.isActive ? 'Aktiv' : 'Deaktiviert'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(card.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedCard(card)}
                          className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-sm mr-2"
                        >
                          Verwalten
                        </button>
                        <a
                          href={card.cardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Karte ansehen
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Card Management Modal */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Karte verwalten
                </h3>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Mitglied:</h4>
                  <p className="text-slate-300">
                    {selectedCard.member.firstName} {selectedCard.member.lastName}
                  </p>
                  <p className="text-slate-400 text-sm">{selectedCard.member.email}</p>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Aktuelle Punkte:</h4>
                  <p className="text-blue-400 text-xl font-bold">{selectedCard.points}</p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Punkte ändern:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={pointsUpdate}
                      onChange={(e) => setPointsUpdate(e.target.value)}
                      placeholder="Neue Punkte"
                      className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                    <button
                      onClick={() => updateCardPoints(selectedCard.id, parseInt(pointsUpdate))}
                      disabled={!pointsUpdate}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded"
                    >
                      Aktualisieren
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleCardStatus(selectedCard.id, !selectedCard.isActive)}
                    className={`flex-1 px-4 py-2 rounded text-white ${
                      selectedCard.isActive 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {selectedCard.isActive ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                  <button
                    onClick={() => resendWalletEmail(selectedCard.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                  >
                    Email erneut senden
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <a
                    href={selectedCard.cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-slate-600 hover:bg-slate-500 text-white text-center px-4 py-2 rounded"
                  >
                    🎯 Wallet-Karte ansehen
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
