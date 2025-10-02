'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalMembers: number;
  activeMembers: number;
  totalPoints: number;
  averagePoints: number;
  recentCheckins: number;
  currentlyInStudio: number;
  utilizationPercentage: number;
  averageSessionTime: number;
}

interface Member {
  id: string;
  membershipId: string;
  firstName: string;
  lastName: string;
  email: string;
  points: number;
  status: string;
  createdAt: string;
  isCurrentlyInStudio?: boolean;
  lastCheckin?: string;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [liveData, setLiveData] = useState({
    currentlyInStudio: 0,
    utilizationPercentage: 0,
    recentActivity: []
  });

  useEffect(() => {
    fetchStats();
    fetchMembers();
    fetchLiveData();
    
    // Update live data every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Fehler beim Laden der Statistiken');
      }
    } catch (error) {
      setError('Fehler beim Laden der Statistiken');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure data is always an array
        setMembers(Array.isArray(data) ? data : []);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    }
  };

  const fetchLiveData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/stats/live', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLiveData({
          currentlyInStudio: data.stats?.currentlyInStudio || 0,
          utilizationPercentage: data.stats?.utilizationPercentage || 0,
          recentActivity: data.recentCheckins || []
        });
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  const getTopMembers = () => {
    if (!Array.isArray(members)) return [];
    return members
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  };

  const getRecentMembers = () => {
    if (!Array.isArray(members)) return [];
    return members
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const getCurrentlyInStudio = () => {
    if (!Array.isArray(members)) return [];
    return members.filter(member => member.isCurrentlyInStudio);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage < 30) return 'text-green-400';
    if (percentage < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getUtilizationBarColor = (percentage: number) => {
    if (percentage < 30) return 'bg-green-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Lade Statistiken...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📊 Live Statistiken & Dashboard</h1>
          <p className="text-slate-300">Echtzeit-Daten über dein Fitnessstudio - wie bei FitX</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded">
            {error}
          </div>
        )}

        {/* Live Status Banner */}
        <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">LIVE</span>
              <span className="text-slate-300">Echtzeit-Daten werden alle 30 Sekunden aktualisiert</span>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Letzte Aktualisierung</p>
              <p className="text-white font-mono">{new Date().toLocaleTimeString('de-DE')}</p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-4">
            <span className="text-slate-300 text-sm font-medium">Zeitraum:</span>
            <div className="flex space-x-2">
              {['today', 'week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {period === 'today' && 'Heute'}
                  {period === 'week' && 'Diese Woche'}
                  {period === 'month' && 'Dieser Monat'}
                  {period === 'year' && 'Dieses Jahr'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Gym Status */}
        <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">🏋️‍♂️ Live Studio Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{liveData.currentlyInStudio}</div>
              <div className="text-slate-300 text-sm">Aktuell im Studio</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getUtilizationColor(liveData.utilizationPercentage)}`}>
                {liveData.utilizationPercentage}%
              </div>
              <div className="text-slate-300 text-sm">Auslastung</div>
              <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUtilizationBarColor(liveData.utilizationPercentage)}`}
                  style={{ width: `${Math.min(liveData.utilizationPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats?.averageSessionTime || 45}</div>
              <div className="text-slate-300 text-sm">Ø Session (Min)</div>
            </div>
          </div>
        </div>

        {/* Live Utilization Chart - FitX Style */}
        <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">📊 Live Utilization</h2>
            <div className="text-slate-300 text-sm">Fitnessstudio Heute</div>
          </div>
          
          {/* Live Status Banner */}
          <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Live {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}</span>
              <span className="text-blue-400 text-sm font-medium">
                {liveData.utilizationPercentage < 30 ? 'Wenig besucht' : 
                 liveData.utilizationPercentage < 70 ? 'Mittel besucht' : 'Stark besucht'}
              </span>
            </div>
          </div>

          {/* Utilization Chart */}
          <div className="relative">
            <div className="flex items-end justify-between h-32 mb-4">
              {/* Generate 24 hour bars */}
              {Array.from({ length: 24 }, (_, hour) => {
                const currentHour = new Date().getHours();
                const isCurrentHour = hour === currentHour;
                const utilization = Math.floor(Math.random() * 80) + 10; // Mock data
                const height = (utilization / 100) * 100; // Percentage of max height
                
                return (
                  <div key={hour} className="flex flex-col items-center">
                    {/* Live indicator for current hour */}
                    {isCurrentHour && (
                      <div className="mb-2 px-2 py-1 bg-blue-800/20 border border-blue-800/30 rounded text-xs text-blue-200">
                        Live
                      </div>
                    )}
                    
                    {/* Bar */}
                    <div 
                      className={`w-3 rounded-t transition-all duration-300 ${
                        isCurrentHour 
                          ? 'bg-blue-800 shadow-lg shadow-blue-800/50' 
                          : hour < currentHour 
                            ? 'bg-blue-300' 
                            : 'bg-slate-600'
                      }`}
                      style={{ height: `${height}%` }}
                    ></div>
                    
                    {/* Hour label */}
                    <div className="text-xs text-slate-400 mt-2">
                      {hour === 0 ? '12 AM' : 
                       hour === 12 ? '12 PM' : 
                       hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-slate-400 px-2">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>12 AM</span>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
          </div>
        </div>

        {/* Main Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Members */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Gesamt Mitglieder</p>
                  <p className="text-3xl font-bold text-white">{stats.totalMembers}</p>
                  <p className="text-xs text-slate-400">+2 diese Woche</p>
                </div>
              </div>
            </div>

            {/* Active Members */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Aktive Mitglieder</p>
                  <p className="text-3xl font-bold text-white">{stats.activeMembers}</p>
                  <p className="text-xs text-green-400">95% Aktivitätsrate</p>
                </div>
              </div>
            </div>

            {/* Total Points */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">⭐</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Gesamt Punkte</p>
                  <p className="text-3xl font-bold text-white">{stats.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-yellow-400">+247 heute</p>
                </div>
              </div>
            </div>

            {/* Average Points */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Ø Punkte</p>
                  <p className="text-3xl font-bold text-white">{stats.averagePoints.toFixed(1)}</p>
                  <p className="text-xs text-purple-400">Pro Mitglied</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Currently In Studio */}
        <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">🏃‍♂️ Aktuell im Studio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCurrentlyInStudio().map((member) => (
              <div key={member.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{member.firstName} {member.lastName}</p>
                    <p className="text-slate-400 text-sm">{member.membershipId}</p>
                    <p className="text-slate-400 text-sm">{member.points} Punkte</p>
                  </div>
                  <div className="text-right">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-green-400 text-xs mt-1">Aktiv</p>
                  </div>
                </div>
              </div>
            ))}
            {getCurrentlyInStudio().length === 0 && (
              <p className="text-slate-400 text-center col-span-full">Aktuell niemand im Studio</p>
            )}
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Members */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">🏆 Top Mitglieder</h2>
            <div className="space-y-3">
              {getTopMembers().map((member, index) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-slate-600'
                    }`}>
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.firstName} {member.lastName}</p>
                      <p className="text-slate-400 text-sm">{member.membershipId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{member.points} Punkte</p>
                    <p className="text-slate-400 text-sm">{member.status}</p>
                  </div>
                </div>
              ))}
              {getTopMembers().length === 0 && (
                <p className="text-slate-400 text-center">Keine Mitglieder gefunden</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">📈 Letzte Aktivitäten</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-slate-300">Check-ins heute</span>
                </div>
                <span className="text-white font-semibold">{stats?.recentCheckins || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-slate-300">Neue Mitglieder diese Woche</span>
                </div>
                <span className="text-white font-semibold">2</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-slate-300">Punkte vergeben heute</span>
                </div>
                <span className="text-white font-semibold">247</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-slate-300">Wallet-Karten gesendet</span>
                </div>
                <span className="text-white font-semibold">8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Members */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">🆕 Neue Mitglieder</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Mitglied
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Punkte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Registriert
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {getRecentMembers().map((member) => (
                  <tr key={member.id} className="hover:bg-slate-700">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-slate-400">{member.membershipId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">
                      {member.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {member.points} Punkte
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">
                      {new Date(member.createdAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {getRecentMembers().length === 0 && (
              <p className="text-slate-400 text-center py-4">Keine Mitglieder gefunden</p>
            )}
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">📤 Export & Berichte</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              📊 PDF Bericht
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
              📈 Excel Export
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
              📧 E-Mail Bericht
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
