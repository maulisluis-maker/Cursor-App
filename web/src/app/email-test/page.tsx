'use client';

import { useState } from 'react';

export default function EmailTestPage() {
  const [email, setEmail] = useState('test@example.com');
  const [memberId, setMemberId] = useState('MEMBER001');
  const [walletType, setWalletType] = useState<'google' | 'apple'>('google');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testSingleEmail = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('http://localhost:4000/api/email/test-send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({
          memberId,
          email,
          walletType
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

  const testBulkEmail = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('http://localhost:4000/api/email/test-send-bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({
          email,
          walletType
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

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🧪 E-Mail Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Einzel-E-Mail Test</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Member ID
                </label>
                <input
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Wallet Type
                </label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value as 'google' | 'apple')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="google">Google Wallet</option>
                  <option value="apple">Apple Wallet</option>
                </select>
              </div>

              <button
                onClick={testSingleEmail}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Single Email'}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Bulk E-Mail Test</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  E-Mail (für alle)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Wallet Type
                </label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value as 'google' | 'apple')}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="google">Google Wallet</option>
                  <option value="apple">Apple Wallet</option>
                </select>
              </div>

              <button
                onClick={testBulkEmail}
                disabled={loading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Bulk Email'}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Result</h2>
            <pre className="text-slate-300 text-sm bg-slate-900 p-4 rounded overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

