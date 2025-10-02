'use client';

import { useState } from 'react';

export default function SMTPTestPage() {
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    secure: false,
    user: '',
    pass: '',
    from: ''
  });
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testSMTPConnection = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('http://localhost:4000/api/email/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({
          smtpConfig,
          testEmail
        })
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const quickSetup = (type: string) => {
    switch (type) {
      case 'gmail':
        setSmtpConfig({
          host: 'smtp.gmail.com',
          port: '587',
          secure: false,
          user: '',
          pass: '',
          from: ''
        });
        break;
      case 'sendgrid':
        setSmtpConfig({
          host: 'smtp.sendgrid.net',
          port: '587',
          secure: false,
          user: 'apikey',
          pass: '',
          from: ''
        });
        break;
      case 'ses':
        setSmtpConfig({
          host: 'email-smtp.eu-west-1.amazonaws.com',
          port: '587',
          secure: false,
          user: '',
          pass: '',
          from: ''
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔧 SMTP-Konfiguration Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">SMTP-Einstellungen</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({...smtpConfig, host: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  SMTP Port
                </label>
                <input
                  type="text"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({...smtpConfig, port: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  SMTP Benutzer
                </label>
                <input
                  type="text"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({...smtpConfig, user: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  SMTP Passwort
                </label>
                <input
                  type="password"
                  value={smtpConfig.pass}
                  onChange={(e) => setSmtpConfig({...smtpConfig, pass: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Absender-E-Mail
                </label>
                <input
                  type="email"
                  value={smtpConfig.from}
                  onChange={(e) => setSmtpConfig({...smtpConfig, from: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={smtpConfig.secure}
                    onChange={(e) => setSmtpConfig({...smtpConfig, secure: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-slate-300">SSL/TLS verwenden</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Schnell-Setup</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => quickSetup('gmail')}
                className="w-full px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Gmail SMTP
              </button>
              
              <button
                onClick={() => quickSetup('sendgrid')}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                SendGrid
              </button>
              
              <button
                onClick={() => quickSetup('ses')}
                className="w-full px-4 py-3 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Amazon SES
              </button>
            </div>

            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">Test-E-Mail</h3>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
              />
            </div>

            <button
              onClick={testSMTPConnection}
              disabled={loading || !smtpConfig.user || !smtpConfig.pass || !testEmail}
              className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Teste...' : 'SMTP-Verbindung testen'}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Test-Ergebnis</h2>
            <pre className="text-slate-300 text-sm bg-slate-900 p-4 rounded overflow-auto">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Anleitung</h2>
          
          <div className="space-y-4 text-slate-300">
            <div>
              <h3 className="text-white font-medium">Gmail SMTP:</h3>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>2-Faktor-Authentifizierung aktivieren</li>
                <li>App-Passwort unter Google-Konto → Sicherheit erstellen</li>
                <li>App-Passwort (nicht normales Passwort) verwenden</li>
                <li>Maximal 500 E-Mails pro Tag (kostenlos)</li>
              </ol>
            </div>

            <div>
              <h3 className="text-white font-medium">SendGrid:</h3>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>Kostenloses Konto erstellen</li>
                <li>API Key generieren</li>
                <li>Sender verifizieren</li>
                <li>100 E-Mails pro Tag kostenlos</li>
              </ol>
            </div>

            <div>
              <h3 className="text-white font-medium">Amazon SES:</h3>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>AWS-Konto erstellen</li>
                <li>SES in gewünschter Region aktivieren</li>
                <li>SMTP Credentials generieren</li>
                <li>Sender verifizieren</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

