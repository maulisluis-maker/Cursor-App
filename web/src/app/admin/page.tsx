'use client';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/Card';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [txMeta, setTxMeta] = useState<any>({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [addByMember, setAddByMember] = useState<Record<string, string>>({});
  const [subByMember, setSubByMember] = useState<Record<string, string>>({});

  useEffect(() => { setToken(localStorage.getItem('token')); }, []);

  async function fetchPage(page = 1) {
    setError(null);
    if (!token) { setError('Kein Token'); return; }
    const query = new URLSearchParams({ ...(q ? { q } : {}), page: String(page), pageSize: String(meta.pageSize) });
    const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api') + `/members?${query.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) { setError(data?.error || 'Fehler'); return; }
    setUsers(data.users);
    setMeta(data.meta);
  }

  useEffect(() => { if (token) fetchPage(1); }, [token]);

  async function search() { await fetchPage(1); }

  async function adjust(memberId: string, delta: number, reason: string) {
    if (!token) return;
    if (!Number.isFinite(delta) || delta === 0) return;
    const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api') + `/members/${memberId}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ delta: Math.trunc(delta), reason })
    });
    const data = await res.json();
    if (!res.ok) { setError(data?.error || 'Fehler'); return; }
    await fetchPage(meta.page);
    if (selectedMember?.id === memberId) loadTxs(memberId, txMeta.page);
  }

  async function loadTxs(memberId: string, page = 1) {
    if (!token) return;
    const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api') + `/members/${memberId}/transactions?page=${page}&pageSize=${txMeta.pageSize}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) { setError(data?.error || 'Fehler'); return; }
    setTxs(data.items);
    setTxMeta(data.meta);
  }

  return (
    <Card title="Admin-Dashboard" actions={<button className="btn btn-secondary" onClick={() => fetchPage(meta.page)}>Neu laden</button>}>
      <div className="flex gap-3 mb-4">
        <input className="input" placeholder="Suche (Name, E-Mail, Mitglieds-ID)" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary" onClick={search}>Suchen</button>
      </div>
      {error && <p className="text-red-400 mb-3">{error}</p>}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>E-Mail</th>
              <th>Name</th>
              <th>Mitglieds-ID</th>
              <th>Punkte</th>
              <th className="text-center">Aufladen</th>
              <th className="text-center">Abbuchung</th>
              <th className="text-center">Historie</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="pr-4">{u.email}</td>
                <td className="pr-4">{u.member?.firstName} {u.member?.lastName}</td>
                <td className="pr-4">{u.member?.membershipId}</td>
                <td className="pr-4 font-semibold">{u.member?.points}</td>
                <td className="text-center">
                  <div className="inline-flex items-center gap-2">
                    <input
                      className="input w-24"
                      type="number"
                      min={1}
                      step={1}
                      value={addByMember[u.member.id] ?? '0'}
                      onChange={(e) => setAddByMember((s) => ({ ...s, [u.member.id]: e.target.value }))}
                      placeholder="0"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        const v = parseInt(addByMember[u.member.id] ?? '0', 10) || 0;
                        if (v > 0) adjust(u.member.id, v, 'admin topup');
                        setAddByMember((s) => ({ ...s, [u.member.id]: '0' }));
                      }}
                    >Aufladen</button>
                  </div>
                </td>
                <td className="text-center">
                  <div className="inline-flex items-center gap-2">
                    <input
                      className="input w-24"
                      type="number"
                      min={1}
                      step={1}
                      value={subByMember[u.member.id] ?? '0'}
                      onChange={(e) => setSubByMember((s) => ({ ...s, [u.member.id]: e.target.value }))}
                      placeholder="0"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        const v = parseInt(subByMember[u.member.id] ?? '0', 10) || 0;
                        if (v > 0) adjust(u.member.id, -v, 'admin deduction');
                        setSubByMember((s) => ({ ...s, [u.member.id]: '0' }));
                      }}
                    >Abbuchung</button>
                  </div>
                </td>
                <td className="text-center">
                  <button className="btn btn-secondary" onClick={() => { setSelectedMember(u.member); loadTxs(u.member.id, 1); }}>Historie</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
        <span>Seite {meta.page} / {meta.totalPages} · {meta.total} Einträge</span>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => fetchPage(Math.max(1, meta.page - 1))} disabled={meta.page <= 1}>Zurück</button>
          <button className="btn btn-secondary" onClick={() => fetchPage(Math.min(meta.totalPages || 1, meta.page + 1))} disabled={meta.page >= (meta.totalPages || 1)}>Weiter</button>
        </div>
      </div>

      {selectedMember && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Punkte-Historie · {selectedMember.firstName} {selectedMember.lastName}</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Delta</th>
                  <th>Grund</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t.id}>
                    <td className="pr-4">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className={`pr-4 font-semibold ${t.delta>0 ? 'text-green-300' : 'text-red-300'}`}>{t.delta > 0 ? `+${t.delta}` : t.delta}</td>
                    <td className="pr-4">{t.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <button className="btn btn-secondary" onClick={() => loadTxs(selectedMember.id, Math.max(1, txMeta.page - 1))} disabled={txMeta.page <= 1}>Zurück</button>
            <button className="btn btn-secondary" onClick={() => loadTxs(selectedMember.id, Math.min(txMeta.totalPages || 1, txMeta.page + 1))} disabled={txMeta.page >= (txMeta.totalPages || 1)}>Weiter</button>
          </div>
        </div>
      )}
    </Card>
  );
}
