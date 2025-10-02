'use client';

import { useState, useEffect } from 'react';

interface Member {
  id: string;
  membershipId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export default function EmailQRPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [walletType, setWalletType] = useState<'google' | 'apple'>('google');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/members', {
        headers: {
          'Authorization': `Bearer ${token || 'demo-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(Array.isArray(data) ? data : []);
      } else {
        // Fallback to mock data
        setMembers([
          {
            id: '1',
            membershipId: 'MEMBER001',
            firstName: 'Max',
            lastName: 'Mustermann',
            email: 'max@example.com',
            status: 'ACTIVE'
          },
          {
            id: '2',
            membershipId: 'MEMBER002',
            firstName: 'Anna',
            lastName: 'Schmidt',
            email: 'anna@example.com',
            status: 'ACTIVE'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      // Fallback to mock data
      setMembers([
        {
          id: '1',
          membershipId: 'MEMBER001',
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max@example.com',
          status: 'ACTIVE'
        },
        {
          id: '2',
          membershipId: 'MEMBER002',
          firstName: 'Anna',
          lastName: 'Schmidt',
          email: 'anna@example.com',
          status: 'ACTIVE'
        }
      ]);
    }
  };

  const sendQRCodeEmail = async () => {
    if (!selectedMember || !email) {
      alert('Bitte wähle einen Member und gib eine E-Mail-Adresse ein.');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const token = localStorage.getItem('token') || 'demo-token';
      const endpoint = 'http://localhost:4000/api/email/test-send-email';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          memberId: selectedMember,
          email: email,
          walletType: walletType
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ ${data.error}`);
      }
    } catch (error) {
      setResult('❌ Netzwerkfehler beim Senden der E-Mail');
    } finally {
      setLoading(false);
    }
  };

  const sendQRCodeToAllMembers = async () => {
    if (!email) {
      alert('Bitte gib eine E-Mail-Adresse ein.');
      return;
    }

    if (!confirm('Möchtest du wirklich QR-Codes an ALLE aktiven Mitglieder senden?')) {
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const token = localStorage.getItem('token') || 'demo-token';
      const endpoint = 'http://localhost:4000/api/email/test-send-bulk-email';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          walletType: walletType
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ ${data.error}`);
      }
    } catch (error) {
      setResult('❌ Netzwerkfehler beim Senden der E-Mails');
    } finally {
      setLoading(false);
    }
  };

  const activeMembers = members.filter(member => member.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📧 E-Mail QR-Codes</h1>
          <p className="text-slate-300">Sende digitale Wallet-Karten per E-Mail an Mitglieder</p>
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>🧪 Test-Modus:</strong> Diese Seite verwendet Test-E-Mail-Funktionen. 
              Echte E-Mails werden nicht versendet, aber die Funktionalität wird simuliert.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Einzelversand */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">👤 Einzelversand</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mitglied auswählen
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="">Mitglied auswählen...</option>
                  {activeMembers.map((member) => (
                    <option key={member.id} value={member.membershipId}>
                      {member.firstName} {member.lastName} ({member.membershipId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="empfaenger@example.com"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Wallet-Typ
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="google"
                      checked={walletType === 'google'}
                      onChange={(e) => setWalletType(e.target.value as 'google' | 'apple')}
                      className="mr-2"
                    />
                    <span className="text-slate-300">Google Wallet</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="apple"
                      checked={walletType === 'apple'}
                      onChange={(e) => setWalletType(e.target.value as 'google' | 'apple')}
                      className="mr-2"
                    />
                    <span className="text-slate-300">Apple Wallet</span>
                  </label>
                </div>
              </div>

              <button
                onClick={sendQRCodeEmail}
                disabled={loading || !selectedMember || !email}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Sende...' : '📧 QR-Code senden (Test)'}
              </button>
            </div>
          </div>

          {/* Massenversand */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">👥 Massenversand</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-700 rounded-lg">
                <p className="text-slate-300 text-sm">
                  <strong>Aktive Mitglieder:</strong> {activeMembers.length}
                </p>
                <p className="text-slate-300 text-sm">
                  <strong>Wallet-Typ:</strong> {walletType === 'google' ? 'Google Wallet' : 'Apple Wallet'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-Mail-Adresse (für alle)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="empfaenger@example.com"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Wallet-Typ
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="google"
                      checked={walletType === 'google'}
                      onChange={(e) => setWalletType(e.target.value as 'google' | 'apple')}
                      className="mr-2"
                    />
                    <span className="text-slate-300">Google Wallet</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="apple"
                      checked={walletType === 'apple'}
                      onChange={(e) => setWalletType(e.target.value as 'google' | 'apple')}
                      className="mr-2"
                    />
                    <span className="text-slate-300">Apple Wallet</span>
                  </label>
                </div>
              </div>

              <button
                onClick={sendQRCodeToAllMembers}
                disabled={loading || !email || activeMembers.length === 0}
                className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Sende...' : `📧 An alle ${activeMembers.length} Mitglieder senden (Test)`}
              </button>
            </div>
          </div>
        </div>

        {/* Ergebnis */}
        {result && (
          <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">📋 Ergebnis</h2>
            <div className={`p-4 rounded-lg ${
              result.includes('✅') ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
            }`}>
              <p className={result.includes('✅') ? 'text-green-200' : 'text-red-200'}>
                {result}
              </p>
            </div>
          </div>
        )}

        {/* E-Mail-Inhalt */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">📧 E-Mail-Inhalt (Beispiel)</h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">Betreff:</h3>
              <p className="text-slate-300">🎫 Deine digitale Fitnessstudio-Mitgliedskarte ist bereit!</p>
            </div>
            
            <div className="p-4 bg-slate-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">Inhalt:</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Hallo [Name],</p>
                <p>Deine persönliche digitale Mitgliedskarte für {walletType === 'google' ? 'Google Wallet' : 'Apple Wallet'} ist bereit!</p>
                <p>Mit dieser Karte kannst du dich schnell und einfach im Fitnessstudio einchecken.</p>
                <p><strong>So fügst du deine Karte hinzu:</strong></p>
                <ol className="list-decimal list-inside ml-4">
                  <li>Öffne die {walletType === 'google' ? 'Google Wallet' : 'Apple Wallet'} App</li>
                  <li>Tippe auf das "+" Symbol</li>
                  <li>Scanne den QR-Code oder klicke auf den Link</li>
                  <li>Bestätige das Hinzufügen der Karte</li>
                </ol>
                <p><strong>QR-Code:</strong> [QR-Code wird hier eingefügt]</p>
                <p><strong>Wallet-Link:</strong> [Wallet-Link wird hier eingefügt]</p>
                <p>Viel Spaß beim Training!</p>
                <p>Dein Fitnessstudio-Team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
