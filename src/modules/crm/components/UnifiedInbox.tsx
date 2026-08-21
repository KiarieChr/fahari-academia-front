import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Search, Send, User, Smartphone, MessageSquare, Loader2, Bot } from 'lucide-react';
import { crmService } from '../../../services/crmService';
import { toast } from 'react-hot-toast';

export const UnifiedInbox: React.FC = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [simPhoneNumber, setSimPhoneNumber] = useState('');
  
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await crmService.getConversations();
      setConversations(res.results || res);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Simulate auto-refresh every 10s for the demo
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async (chatId) => {
    try {
      const res = await crmService.getMessages(chatId);
      setMessages(res.results || res);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    fetchMessages(chat.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChat) return;
    
    try {
      setIsSending(true);
      const res = await crmService.sendReply(activeChat.id, newMessage);
      setMessages([...messages, res]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
      fetchConversations(); // Update left pane
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSimulate = async () => {
    if (!simPhoneNumber) return;
    try {
      await crmService.simulateInbound(simPhoneNumber, "Hello, is the bus running late?", "WHATSAPP");
      toast.success("Simulated incoming message");
      fetchConversations();
      if (activeChat && (activeChat.whatsapp_number === simPhoneNumber || activeChat.phone === simPhoneNumber)) {
        fetchMessages(activeChat.id);
      }
    } catch (err) {
      toast.error("Parent not found or error simulating");
    }
  };

  return (
    <DashboardLayout title="Unified Inbox">
      <div className="p-4 bg-slate-50 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 m-0">Unified Inbox</h2>
            <p className="text-gray-500 text-sm">Real-time chat via WhatsApp & SMS</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Simulate incoming from +254..." 
              value={simPhoneNumber}
              onChange={(e) => setSimPhoneNumber(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none w-64"
            />
            <button onClick={handleSimulate} className="bg-indigo-100 text-indigo-600 px-3 py-1.5 text-sm font-semibold rounded-lg hover:bg-indigo-200 transition-colors">
              Simulate Inbound
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Pane - Chat List */}
          <div className="w-1/3 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search parents..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-100/50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex justify-center p-8 text-gray-400"><Loader2 className="animate-spin" /></div>
              ) : conversations.length === 0 ? (
                <div className="text-center p-8 text-sm text-gray-500">No conversations yet</div>
              ) : (
                conversations.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full text-left p-3 rounded-xl mb-1 transition-all flex gap-3 ${activeChat?.id === chat.id ? 'bg-indigo-50 shadow-sm' : 'hover:bg-slate-50'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner">
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-800 text-sm truncate">{chat.parent_full_name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(chat.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {chat.channel === 'WHATSAPP' ? (
                          <Smartphone size={12} className="text-emerald-500 shrink-0" />
                        ) : (
                          <MessageSquare size={12} className="text-blue-500 shrink-0" />
                        )}
                        <p className="text-xs text-gray-500 truncate">{chat.recent_message}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Pane - Chat Window */}
          <div className="flex-1 bg-white/70 backdrop-blur-md rounded-2xl shadow-[4px_4px_16px_#e0e5ec,-4px_-4px_16px_#ffffff] border border-white/50 flex flex-col overflow-hidden">
            {activeChat ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-white/50 shrink-0 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{activeChat.parent_full_name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {activeChat.channel === 'WHATSAPP' ? <Smartphone size={12}/> : <MessageSquare size={12}/>} 
                      {activeChat.channel} • {activeChat.channel === 'WHATSAPP' ? activeChat.whatsapp_number : activeChat.phone}
                    </p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col gap-3">
                  {messages.map(msg => {
                    const isOutbound = msg.direction === 'OUTBOUND';
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[75%] ${isOutbound ? 'self-end items-end' : 'self-start items-start'}`}>
                        <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                          isOutbound 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-tr-sm' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                        }`}>
                          {msg.body}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(msg.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                          {isOutbound && ` • ${msg.status}`}
                        </span>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/50 border-t border-gray-100 shrink-0">
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={`Reply via ${activeChat.channel}...`}
                      className="w-full pl-4 pr-12 py-3 bg-white rounded-full outline-none text-sm border border-gray-200 shadow-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={isSending || !newMessage.trim()}
                      className="absolute right-1 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                    >
                      {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-1" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageSquare size={48} className="mb-4 opacity-20" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
