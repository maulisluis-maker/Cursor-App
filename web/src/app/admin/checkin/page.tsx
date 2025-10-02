'use client';

import { useState, useEffect } from 'react';

export default function CheckinPage() {
  const [memberId, setMemberId] = useState<string>('');
  const [checkinResult, setCheckinResult] = useState<string>('');
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if memberId is passed via URL parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('memberId');
      if (id) {
        setMemberId(id);
        handleCheckin(id);
      }
    }
  }, []);

  const handleCheckin = async (id: string) => {
    setLoading(true);
    setCheckinResult('');

    try {
      const response = await fetch('http://localhost:4000/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({
          memberId: id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCheckinResult(`✅ Check-in erfolgreich! ${data.message}`);
      } else {
        setCheckinResult(`❌ Check-in fehlgeschlagen: ${data.error}`);
      }
    } catch (error) {
      setCheckinResult('❌ Netzwerkfehler beim Check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckin = () => {
    if (!memberId.trim()) {
      alert('Bitte gib eine Member-ID ein.');
      return;
    }
    handleCheckin(memberId.trim());
  };

  const handleQRCodeScan = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Simple QR code data extraction (in real app, you'd use a QR decoder library)
      if (result.includes('DEMO001') || result.includes('MEMBER')) {
        const extractedId = result.includes('DEMO001') ? 'DEMO001' : 'MEMBER001';
        setQrData({ scanned: true, memberId: extractedId });
        setMemberId(extractedId);
        handleCheckin(extractedId);
      } else {
        setQrData({ scanned: true, error: 'Ungültiger QR-Code' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">✅ Check-in System</h1>
          <p className="text-slate-300">Verwalte Check-ins und QR-Code-Scanning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR-Code Check-in */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">📱 QR-Code Check-in</h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <div className="w-32 h-32 bg-slate-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">📷</span>
                </div>
                <p className="text-slate-300 text-sm mb-4">QR-Code Datei hochladen</p>
                <input
                  type="file"
                  accept=".txt,.json"
                  onChange={handleQRCodeScan}
                  className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>

              {qrData && (
                <div className={`p-4 rounded-lg ${
                  qrData.error ? 'bg-red-900/50 border border-red-500' : 'bg-green-900/50 border border-green-500'
                }`}>
                  <p className={qrData.error ? 'text-red-200' : 'text-green-200'}>
                    {qrData.error || `QR-Code gescannt: ${qrData.memberId}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Manueller Check-in */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">⌨️ Manueller Check-in</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Member-ID
                </label>
                <input
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="DEMO001"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <button
                onClick={handleManualCheckin}
                disabled={loading || !memberId.trim()}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Verarbeite...' : '✅ Check-in durchführen'}
              </button>

              <div className="text-sm text-slate-400">
                <p>Beispiel Member-IDs:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>DEMO001</li>
                  <li>MEMBER001</li>
                  <li>MEMBER002</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* QR-Code Daten */}
        {qrData && (
          <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">📊 QR-Code Daten</h2>
            <div className="bg-slate-700 p-4 rounded-lg">
              <pre className="text-sm text-slate-300 overflow-x-auto">
                {JSON.stringify(qrData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Check-in Ergebnis */}
        {checkinResult && (
          <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">📋 Check-in Ergebnis</h2>
            <div className={`p-4 rounded-lg ${
              checkinResult.includes('✅') ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
            }`}>
              <p className={checkinResult.includes('✅') ? 'text-green-200' : 'text-red-200'}>
                {checkinResult}
              </p>
            </div>
          </div>
        )}

        {/* Test QR-Code */}
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
            <button
              onClick={() => handleCheckin('DEMO001')}
              disabled={loading}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Teste...' : 'Test Check-in für DEMO001'}
            </button>
          </div>
        </div>

        {/* Check-in Statistiken */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">📈 Check-in Statistiken</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">12</div>
              <div className="text-slate-300 text-sm">Check-ins heute</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">3</div>
              <div className="text-slate-300 text-sm">Aktuell im Studio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">45</div>
              <div className="text-slate-300 text-sm">Ø Session (Min)</div>
            </div>
          </div>
        </div>

        {/* Letzte Check-ins */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">🕒 Letzte Check-ins</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <span className="text-slate-300">DEMO001 - Demo User</span>
                  <p className="text-slate-400 text-sm">vor 5 Minuten</p>
                </div>
              </div>
              <span className="text-green-400 text-sm">+10 Punkte</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <span className="text-slate-300">MEMBER001 - Max Mustermann</span>
                  <p className="text-slate-400 text-sm">vor 15 Minuten</p>
                </div>
              </div>
              <span className="text-green-400 text-sm">+10 Punkte</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <span className="text-slate-300">MEMBER002 - Anna Schmidt</span>
                  <p className="text-slate-400 text-sm">vor 1 Stunde</p>
                </div>
              </div>
              <span className="text-yellow-400 text-sm">Check-out</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
