'use client';

import { useState, useEffect } from 'react';

interface CardDesign {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export default function WalletSetupPage() {
  const [activeDesign, setActiveDesign] = useState<CardDesign | null>(null);
  const [allDesigns, setAllDesigns] = useState<CardDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    pendingMembers: 0
  });

  useEffect(() => {
    fetchSetupStatus();
  }, []);

  const fetchSetupStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch active design
      const designsResponse = await fetch('http://localhost:4000/api/card-designs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (designsResponse.ok) {
        const designsData = await designsResponse.json();
        setAllDesigns(designsData.designs || []);
        const active = designsData.designs?.find((d: CardDesign) => d.isActive);
        setActiveDesign(active || null);
      }

      // Fetch wallet card stats
      const statsResponse = await fetch('http://localhost:4000/api/admin/wallet-cards/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Lade Setup-Status...</div>
      </div>
    );
  }

  const isSetupComplete = activeDesign !== null;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎯 Google Wallet Setup</h1>
          <p className="text-slate-300">Überprüfe den Setup-Status für Google Wallet Karten</p>
        </div>

        {/* Setup Status Card */}
        <div className={`rounded-lg p-8 mb-8 ${
          isSetupComplete 
            ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-2 border-green-500' 
            : 'bg-gradient-to-r from-red-900/50 to-orange-900/50 border-2 border-red-500'
        }`}>
          <div className="flex items-start space-x-6">
            <div className="text-6xl">
              {isSetupComplete ? '✅' : '⚠️'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3" style={{ color: isSetupComplete ? '#86efac' : '#fca5a5' }}>
                {isSetupComplete ? 'Setup Abgeschlossen!' : 'Setup Erforderlich'}
              </h2>
              
              {isSetupComplete ? (
                <>
                  <p className="text-green-100 mb-4">
                    Das Master-Design ist aktiv und bereit. Mitglieder können jetzt personalisierte Google Wallet Karten erhalten!
                  </p>
                  <div className="bg-green-800/30 rounded-lg p-4 border border-green-600">
                    <h3 className="text-green-200 font-semibold mb-2">Aktives Master-Design:</h3>
                    <p className="text-green-100 text-lg font-bold">{activeDesign.name}</p>
                    {activeDesign.description && (
                      <p className="text-green-200 text-sm mt-1">{activeDesign.description}</p>
                    )}
                    <p className="text-green-300 text-xs mt-2">
                      Erstellt am: {new Date(activeDesign.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-red-100 mb-4">
                    <strong>Wichtig:</strong> Du musst erst ein Master-Design erstellen und aktivieren, 
                    bevor Mitglieder Google Wallet Karten erhalten können!
                  </p>
                  <div className="bg-red-800/30 rounded-lg p-4 border border-red-600 mb-4">
                    <h3 className="text-red-200 font-semibold mb-2">📋 Setup-Schritte:</h3>
                    <ol className="text-red-100 space-y-2 list-decimal list-inside">
                      <li>Gehe zum <strong>Design Center</strong></li>
                      <li>Erstelle ein neues Karten-Design (Master-Design)</li>
                      <li>Klicke auf <strong>"Master-Design speichern"</strong></li>
                      <li>Aktiviere das Design in der Liste der gespeicherten Designs</li>
                      <li>Fertig! Mitglieder können jetzt Karten erhalten</li>
                    </ol>
                  </div>
                  <a
                    href="/admin/design-center"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    🎨 Zum Design Center
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Gespeicherte Designs</p>
                <p className="text-white text-3xl font-bold">{allDesigns.length}</p>
              </div>
              <div className="text-4xl">🎨</div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Generierte Karten</p>
                <p className="text-white text-3xl font-bold">{stats.totalCards}</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Aktive Karten</p>
                <p className="text-white text-3xl font-bold">{stats.activeCards}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* All Designs */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Alle Designs</h2>
          
          {allDesigns.length > 0 ? (
            <div className="space-y-3">
              {allDesigns.map((design) => (
                <div 
                  key={design.id} 
                  className={`p-4 rounded-lg border ${
                    design.isActive 
                      ? 'bg-green-900/20 border-green-500' 
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">{design.name}</h3>
                      {design.description && (
                        <p className="text-slate-400 text-sm">{design.description}</p>
                      )}
                      <p className="text-slate-500 text-xs mt-1">
                        Erstellt: {new Date(design.createdAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    {design.isActive && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ✅ Aktiv
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-slate-400">Noch keine Designs erstellt</p>
              <a
                href="/admin/design-center"
                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Erstes Design erstellen
              </a>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">🚀 Schnellzugriff</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/design-center"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-center font-semibold"
            >
              🎨 Design Center
            </a>
            <a
              href="/admin/wallet-cards"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center font-semibold"
            >
              🎯 Karten verwalten
            </a>
            <a
              href="/admin-dashboard"
              className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-3 rounded-lg text-center font-semibold"
            >
              🔙 Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
