'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
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
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export default function MemberSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'GENERAL',
    priority: 'NORMAL'
  });

  useEffect(() => {
    fetchTickets();
    fetchUnreadCount();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTickets();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/support/tickets/my', {
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

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/support/tickets/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const selectTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowNewTicketForm(false);
    
    // Mark messages as read
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:4000/api/support/tickets/${ticket.id}/messages/mark-read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      alert('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTicket)
      });

      if (response.ok) {
        const createdTicket = await response.json();
        setNewTicket({ subject: '', message: '', category: 'GENERAL', priority: 'NORMAL' });
        setShowNewTicketForm(false);
        fetchTickets();
        setSelectedTicket(createdTicket);
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Fehler beim Erstellen des Tickets');
    }
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
        
        // Refresh ticket details
        const updatedResponse = await fetch(`http://localhost:4000/api/support/tickets/${selectedTicket.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (updatedResponse.ok) {
          const updatedTicket = await updatedResponse.json();
          setSelectedTicket(updatedTicket);
          fetchTickets();
        }
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Offen';
      case 'IN_PROGRESS': return 'In Bearbeitung';
      case 'RESOLVED': return 'Gelöst';
      case 'CLOSED': return 'Geschlossen';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Lade Support-Tickets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">💬 Support Center</h1>
            <p className="text-slate-300">Stelle Fragen und erhalte Hilfe vom Support-Team</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowNewTicketForm(true);
                setSelectedTicket(null);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              ➕ Neues Ticket
            </button>
            <button
              onClick={() => router.push('/member-dashboard')}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              ← Zurück
            </button>
          </div>
        </div>

        {/* Unread Count */}
        {unreadCount > 0 && (
          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-6">
            <div className="text-white">
              📬 Du hast <strong>{unreadCount}</strong> ungelesene Nachricht(en)
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-h-[600px] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              Meine Tickets ({tickets.length})
            </h2>
            
            {tickets.length === 0 ? (
              <div className="text-slate-300 text-center py-8">
                <div className="text-4xl mb-4">📭</div>
                <div>Noch keine Tickets vorhanden</div>
                <button
                  onClick={() => {
                    setShowNewTicketForm(true);
                    setSelectedTicket(null);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Erstes Ticket erstellen
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => {
                  const hasUnread = ticket.messages.some(m => 
                    m.senderRole === 'ADMIN' && !m.readAt
                  );
                  
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => selectTicket(ticket)}
                      className={`p-3 rounded-lg cursor-pointer transition-all relative ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-blue-600'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {hasUnread && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold text-sm">
                          {ticket.ticketNumber}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Ticket Details or New Ticket Form */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-6">
            {showNewTicketForm ? (
              /* New Ticket Form */
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Neues Support-Ticket erstellen</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 mb-2">Betreff *</label>
                    <input
                      type="text"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      placeholder="z.B. Problem mit Mitgliedskarte"
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2">Kategorie</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                    >
                      <option value="GENERAL">Allgemein</option>
                      <option value="TECHNICAL">Technisch</option>
                      <option value="BILLING">Abrechnung</option>
                      <option value="MEMBERSHIP">Mitgliedschaft</option>
                      <option value="OTHER">Sonstiges</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2">Priorität</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                    >
                      <option value="LOW">Niedrig</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">Hoch</option>
                      <option value="URGENT">Dringend</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2">Nachricht *</label>
                    <textarea
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                      placeholder="Beschreibe dein Anliegen..."
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg resize-none"
                      rows={8}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={createTicket}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Ticket erstellen
                    </button>
                    <button
                      onClick={() => setShowNewTicketForm(false)}
                      className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedTicket ? (
              /* Ticket Details */
              <div className="flex flex-col h-full">
                {/* Ticket Header */}
                <div className="border-b border-slate-600 pb-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedTicket.subject}</h2>
                    <span className={`px-3 py-1 rounded text-white ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusText(selectedTicket.status)}
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
                          {message.senderRole === 'ADMIN' ? '👨‍💼 Support Team' : '👤 Du'}
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
                {selectedTicket.status !== 'CLOSED' && (
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
                )}

                {selectedTicket.status === 'CLOSED' && (
                  <div className="border-t border-slate-600 pt-4 text-center text-slate-300">
                    Dieses Ticket ist geschlossen. Erstelle ein neues Ticket für weitere Fragen.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <div className="text-xl mb-2">Willkommen im Support Center</div>
                  <div className="text-sm">Wähle ein Ticket aus oder erstelle ein neues</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
