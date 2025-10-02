'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';

export default function MemberPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Nicht eingeloggt');
      return;
    }
    fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api') + '/members/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || 'Fehler');
        setData(j.user);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Card title="Mein Bereich">
      {error && <p className="text-red-400 mb-3">{error}</p>}
      {!data && !error && <p>Lade...</p>}
      {data && (
        <div className="grid gap-2">
          <div><span className="text-slate-400">Name:</span> {data?.member?.firstName} {data?.member?.lastName}</div>
          <div><span className="text-slate-400">Mitglieds-ID:</span> {data?.member?.membershipId}</div>
          <div><span className="text-slate-400">Punkte:</span> <span className="font-semibold text-brand-300">{data?.member?.points}</span></div>
        </div>
      )}
    </Card>
  );
}
