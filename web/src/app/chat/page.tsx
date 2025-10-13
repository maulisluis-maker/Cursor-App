'use client';

import { useState, useEffect } from 'react';

interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  readAt: string | null;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string | null;
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  messages: SupportMessage[];
}

export default function ChatPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');

  useEffect(() => {
    // Check if user is admin or member
    const token = localStorage.getItem('token');
    if (token) {
      // Simple check - in real app, decode JWT to get role
      const isAdmin = localStorage.getItem('userRole') === 'ADMIN';
      setUserRole(isAdmin ? 'ADMIN' : 'MEMBER');
    }
    
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const endpoint = userRole === 'ADMIN' 
        ? 'http://localhost:4000/api/support/admin/tickets'
        : 'http://localhost:4000/api/support/tickets/my';

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        fetchTickets();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-500';
      case 'IN_PROGRESS': return 'bg-yellow-500';
      case 'RESOLVED': return 'bg-green-500';
      case 'CLOSED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Lade Support-Chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">💬 Support Chat</h1>
            <p className="text-slate-300">
              {userRole === 'ADMIN' ? 'Verwalte Support-Anfragen' : 'Stelle Fragen und erhalte Hilfe'}
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href="/"
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              🏠 Homepage
            </a>
            {userRole === 'ADMIN' ? (
              <a
                href="/admin-dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📊 Admin Dashboard
              </a>
            ) : (
              <a
                href="/member-dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📊 Member Dashboard
              </a>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-h-[600px] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {userRole === 'ADMIN' ? 'Alle Tickets' : 'Meine Tickets'} ({tickets.length})
            </h2>
            
            {tickets.length === 0 ? (
              <div className="text-slate-300 text-center py-8">
                <div className="text-4xl mb-4">📭</div>
                <div>Keine Tickets vorhanden</div>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => selectTicket(ticket)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-blue-600'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold text-sm">
                        {ticket.ticketNumber}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="text-white text-sm mb-1 truncate">{ticket.subject}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">
                        {new Date(ticket.createdAt).toLocaleDateString('de-DE')}
                      </span>
                      <span className="text-slate-300 text-xs">
                        💬 {ticket.messages.length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-6">
            {selectedTicket ? (
              <div className="flex flex-col h-full">
                {/* Ticket Header */}
                <div className="border-b border-slate-600 pb-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedTicket.subject}</h2>
                    <span className={`px-3 py-1 rounded text-white ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300 text-sm">
                    <span>Ticket: {selectedTicket.ticketNumber}</span>
                    <span>•</span>
                    <span>{new Date(selectedTicket.createdAt).toLocaleString('de-DE')}</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[400px]">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.senderRole === 'ADMIN'
                          ? 'bg-blue-900/30 border-l-4 border-blue-500'
                          : 'bg-slate-700/30 border-l-4 border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold text-sm">
                          {message.senderRole === 'ADMIN' ? '👨‍💼 Support Team' : '👤 Member'}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {new Date(message.createdAt).toLocaleString('de-DE')}
                        </span>
                      </div>
                      <div className="text-slate-200 whitespace-pre-wrap">{message.message}</div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-slate-600 pt-4">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nachricht eingeben..."
                      className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg resize-none"
                      rows={3}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Senden
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <div className="text-xl mb-2">Willkommen im Support Chat</div>
                  <div className="text-sm">Wähle ein Ticket aus, um zu chatten</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
