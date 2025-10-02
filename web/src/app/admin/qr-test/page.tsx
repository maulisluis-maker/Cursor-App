'use client';

import { useState } from 'react';

export default function QRTestPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('DEMO001');
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const generateSimpleQRCode = () => {
    const qrData = selectedMember;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    setQrCodeUrl(qrUrl);
    setQrData({ type: 'simple', data: qrData });
  };

  const generateDetailedQRCode = () => {
    const qrData = JSON.stringify({
      memberId: selectedMember,
      timestamp: new Date().toISOString(),
      type: 'checkin',
      version: '1.0'
    });
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    setQrCodeUrl(qrUrl);
    setQrData({ type: 'detailed', data: qrData });
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${selectedMember}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const testCheckin = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('http://localhost:4000/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({
          memberId: selectedMember
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Check-in erfolgreich! ${data.message}`);
      } else {
        setResult(`❌ Check-in fehlgeschlagen: ${data.error}`);
      }
    } catch (error) {
      setResult('❌ Netzwerkfehler beim Check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📱 QR-Code Management</h1>
          <p className="text-slate-300">Teste QR-Codes für Check-ins und Mitgliederverifizierung</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Generator */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">🔧 QR-Code Generator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Member-ID
                </label>
                <input
                  type="text"
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  placeholder="DEMO001"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={generateSimpleQRCode}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Einfacher QR-Code
                </button>
                <button
                  onClick={generateDetailedQRCode}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                >
                  Detaillierter QR-Code
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">👁️ QR-Code Vorschau</h2>
            
            {qrCodeUrl ? (
              <div className="text-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="mx-auto border border-slate-600 rounded-lg mb-4"
                />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={downloadQRCode}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                  >
                    📥 Herunterladen
                  </button>
                  <button
                    onClick={testCheckin}
                    disabled={loading}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium disabled:opacity-50"
                  >
                    {loading ? 'Teste...' : '✅ Check-in testen'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">Generiere einen QR-Code um ihn hier zu sehen</p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Data */}
        {qrData && (
          <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">📊 QR-Code Daten</h2>
            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Typ: {qrData.type}</h4>
              <pre className="text-sm text-slate-300 overflow-x-auto">{qrData.data}</pre>
            </div>
          </div>
        )}

        {/* Test Result */}
        {result && (
          <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">📋 Test Ergebnis</h2>
            <div className={`p-4 rounded-lg ${
              result.includes('✅') ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
            }`}>
              <p className={result.includes('✅') ? 'text-green-200' : 'text-red-200'}>
                {result}
              </p>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">ℹ️ Wie es funktioniert</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">1</span>
              </div>
              <h3 className="text-white font-medium mb-2">QR-Code generieren</h3>
              <p className="text-slate-300 text-sm">Erstelle einen QR-Code mit der Member-ID</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">2</span>
              </div>
              <h3 className="text-white font-medium mb-2">QR-Code scannen</h3>
              <p className="text-slate-300 text-sm">Mitglied scannt QR-Code mit Smartphone</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">3</span>
              </div>
              <h3 className="text-white font-medium mb-2">Check-in verarbeiten</h3>
              <p className="text-slate-300 text-sm">System verarbeitet Check-in und vergibt Punkte</p>
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">📚 API Dokumentation</h2>
          <div className="space-y-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">Check-in Endpoint:</h3>
              <code className="text-green-400 text-sm">POST /api/checkin</code>
              <div className="mt-2">
                <h4 className="text-slate-300 font-medium">Request Body:</h4>
                <pre className="text-slate-300 text-sm bg-slate-800 p-2 rounded mt-1">
{`{
  "memberId": "DEMO001"
}`}
                </pre>
              </div>
              <div className="mt-2">
                <h4 className="text-slate-300 font-medium">Response:</h4>
                <pre className="text-slate-300 text-sm bg-slate-800 p-2 rounded mt-1">
{`{
  "success": true,
  "message": "Check-in erfolgreich",
  "points": 10
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Test QR Code */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">🧪 Test QR-Code</h2>
          <div className="text-center">
            <p className="text-slate-300 mb-4">Scanne diesen QR-Code um einen Test-Check-in durchzuführen:</p>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEMO001" 
              alt="Test QR Code" 
              className="mx-auto border border-slate-600 rounded-lg"
            />
            <p className="text-slate-400 text-sm mt-2">Enthält: DEMO001</p>
          </div>
        </div>
      </div>
    </div>
  );
}
