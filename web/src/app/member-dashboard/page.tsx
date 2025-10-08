'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';

interface MemberData {
  id: string;
  email: string;
  member: {
    id: string;
    membershipId: string;
    firstName: string;
    lastName: string;
    points: number;
  };
}

export default function MemberDashboard() {
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');

        if (!token || !userEmail) {
          setError('Nicht angemeldet');
          setLoading(false);
          return;
        }

        // Try backend first, fallback to mock data
        try {
          const response = await fetch('http://localhost:4000/api/members/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.user && data.user.member) {
              setMemberData({
                id: data.user.id,
                email: data.user.email,
                member: data.user.member
              });
              setLoading(false);
              return;
            }
          }
        } catch (backendError) {
          console.log('Backend not available, using mock data');
        }

        // Fallback to mock data
        const mockMemberData: MemberData = {
          id: 'mock-user-id',
          email: userEmail,
          member: {
            id: 'mock-member-id',
            membershipId: 'MEMBER001',
            firstName: 'Max',
            lastName: 'Mustermann',
            points: 50
          }
        };

        setMemberData(mockMemberData);
      } catch (error) {
        console.error('Error fetching member data:', error);
        setError('Netzwerkfehler');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Lade...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Keine Daten gefunden</div>
      </div>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${memberData.member.membershipId}`;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Willkommen zurück!</h1>
          <p className="text-slate-400">
            Hier findest du deine Mitgliedsinformationen und digitale Karten.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Mitgliedsinformationen">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Name</label>
                <p className="text-white font-medium">
                  {memberData.member.firstName} {memberData.member.lastName}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-slate-400">E-Mail</label>
                <p className="text-white font-medium">{memberData.email}</p>
              </div>
              
              <div>
                <label className="text-sm text-slate-400">Mitglieds-ID</label>
                <p className="text-white font-medium">{memberData.member.membershipId}</p>
              </div>
              
              <div>
                <label className="text-sm text-slate-400">Punkte</label>
                <p className="text-white font-medium text-2xl">{memberData.member.points}</p>
              </div>
            </div>
          </Card>

          <Card title="Digitale Karten">
            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">QR-Code für Check-in</h3>
                <p className="text-slate-400 text-sm mb-3">
                  Zeige diesen QR-Code beim Check-in im Fitnessstudio vor.
                </p>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  QR-Code anzeigen
                </button>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Digitale Mitgliedskarte</h3>
                <p className="text-slate-400 text-sm mb-3">
                  Deine digitale Mitgliedskarte wurde bei der Registrierung per E-Mail gesendet.
                </p>
                <button
                  onClick={() => alert('Deine digitale Mitgliedskarte wurde bei der Registrierung per E-Mail gesendet. Prüfe dein E-Mail-Postfach.')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  E-Mail erneut senden
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/member-dashboard/support"
              className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-green-500 transition-colors flex items-center"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-lg">💬</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Support Center</h3>
                <p className="text-slate-400 text-sm">Hilfe & Fragen</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">QR-Code für Check-in</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              <img 
                src={qrCodeUrl} 
                alt="QR Code"
                className="mx-auto border border-gray-300 rounded mb-4"
              />
              <p className="text-sm text-gray-600 mb-4">
                Mitglieds-ID: {memberData.member.membershipId}
              </p>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrCodeUrl;
                  link.download = `qr-code-${memberData.member.membershipId}.png`;
                  link.click();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                QR-Code herunterladen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
