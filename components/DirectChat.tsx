
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { Send, User, MoreHorizontal, Circle } from 'lucide-react';

interface DirectChatProps {
  currentUser: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  mockUsers: UserProfile[];
}

export const DirectChat: React.FC<DirectChatProps> = ({ currentUser, messages, onSendMessage, mockUsers }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      
      {/* Active Team Strip */}
      <div className="p-4 border-b border-slate-800">
         <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Active Team</h4>
         <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {mockUsers.filter(u => u.id !== currentUser.id).map(user => (
               <div key={user.id} className="flex flex-col items-center min-w-[60px]">
                  <div className="relative">
                     <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-slate-600">
                        {user.name.charAt(0)}
                     </div>
                     <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        user.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500'
                     }`}></span>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 truncate max-w-[60px]">{user.name.split(' ')[0]}</span>
               </div>
            ))}
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
         {messages.length === 0 && (
            <div className="text-center text-slate-500 text-xs mt-10">
               Start a private coordination channel.
            </div>
         )}
         {messages.map(msg => {
            const isMe = msg.senderId === currentUser.id;
            return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 ${
                     isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'
                  }`}>
                     {!isMe && <div className="text-[10px] text-indigo-300 font-bold mb-1">{msg.senderName}</div>}
                     <p className="text-sm">{msg.content}</p>
                     <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </div>
                  </div>
               </div>
            )
         })}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900">
         <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message team..."
              className="w-full bg-slate-800 text-slate-200 text-sm rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-700"
            />
            <button 
               type="submit"
               disabled={!input.trim()}
               className="absolute right-1.5 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-700"
            >
               <Send className="w-3.5 h-3.5" />
            </button>
         </div>
      </form>
    </div>
  );
};
