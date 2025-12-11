
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile, ChatChannel } from '../types';
import { Send, Search, Plus, X, Phone, Video, Image, Smile, MessageSquarePlus, ArrowLeft, Check, Users } from 'lucide-react';

interface ChatInterfaceProps {
  currentUser: UserProfile;
  channels: ChatChannel[];
  messages: ChatMessage[];
  onSendMessage: (channelId: string, content: string) => void;
  onCreateChannel: (name: string, participantIds: string[], type: 'DIRECT' | 'GROUP') => void;
  onClose: () => void;
  allUsers: UserProfile[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  currentUser, 
  channels, 
  messages, 
  onSendMessage, 
  onCreateChannel,
  onClose,
  allUsers
}) => {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  
  // Modals
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  
  // Group Creation State
  const [selectedForGroup, setSelectedForGroup] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevChannelsLength = useRef(channels.length);

  // Auto-switch to newly created channel
  useEffect(() => {
    if (channels.length > prevChannelsLength.current) {
        const newChannel = channels[0];
        setActiveChannelId(newChannel.id);
        setShowMobileChat(true);
    }
    prevChannelsLength.current = channels.length;
  }, [channels]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId, showMobileChat]);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const currentMessages = messages.filter(m => m.channelId === activeChannelId);

  // Filter channels based on search
  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChannelId) return;
    onSendMessage(activeChannelId, input);
    setInput('');
  };

  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    setShowMobileChat(true); // Switch view on mobile
  };

  const handleCreateGroup = () => {
    if (!newGroupName || selectedForGroup.length === 0) return;
    onCreateChannel(newGroupName, [currentUser.id, ...selectedForGroup], 'GROUP');
    setIsCreatingGroup(false);
    setNewGroupName('');
    setSelectedForGroup([]);
  };

  const handleStartDirectChat = (targetUserId: string) => {
    // Check if DM exists (participants must include ONLY me and target)
    const existing = channels.find(c => 
        c.type === 'DIRECT' && 
        c.participants.includes(currentUser.id) && 
        c.participants.includes(targetUserId)
    );

    if (existing) {
        setActiveChannelId(existing.id);
        setShowMobileChat(true);
    } else {
        // Create new DM
        onCreateChannel('Direct Chat', [currentUser.id, targetUserId], 'DIRECT');
    }
    setIsNewChatModalOpen(false);
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedForGroup.includes(userId)) {
      setSelectedForGroup(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedForGroup(prev => [...prev, userId]);
    }
  };

  // Helper to get channel name/avatar for Direct messages (show the OTHER person)
  const getChannelDisplay = (channel: ChatChannel) => {
    if (channel.type === 'GROUP') {
       return { name: channel.name, icon: <Users className="w-5 h-5 text-indigo-200" />, color: 'bg-indigo-600' };
    }
    // For Direct, find the participant that isn't me
    const otherId = channel.participants.find(p => p !== currentUser.id);
    const otherUser = allUsers.find(u => u.id === otherId);
    const name = otherUser ? otherUser.name : (channel.name === 'Direct Chat' ? 'Unknown User' : channel.name);
    const initial = name.charAt(0);
    const color = otherUser?.status === 'ONLINE' ? 'bg-emerald-600' : 'bg-slate-600';
    
    return { name, icon: <span className="text-sm font-bold text-white">{initial}</span>, color };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex animate-in fade-in duration-200">
      
      {/* SIDEBAR: CHAT LIST (Hidden on mobile if chat is open) */}
      <div className={`w-full md:w-80 bg-slate-900 border-r border-slate-800 flex-col h-full ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
         
         {/* Header */}
         <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors" 
                title="New Direct Message"
              >
                 <MessageSquarePlus className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsCreatingGroup(true)}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition-colors" 
                title="New Group"
              >
                 <Plus className="w-5 h-5" />
              </button>
            </div>
         </div>

         {/* Search */}
         <div className="p-4">
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="Search conversations..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
               />
               <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            </div>
         </div>

         {/* Channel List */}
         <div className="flex-grow overflow-y-auto custom-scrollbar">
            {filteredChannels.length === 0 && (
                <div className="p-4 text-center text-slate-500 text-sm">
                    No active chats. Start a new one!
                </div>
            )}
            {filteredChannels.map(channel => {
               const display = getChannelDisplay(channel);
               const isActive = channel.id === activeChannelId;
               return (
                  <div 
                    key={channel.id}
                    onClick={() => handleChannelSelect(channel.id)}
                    className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-colors ${
                       isActive ? 'bg-indigo-900/20 border border-indigo-500/30' : 'hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                     <div className={`w-12 h-12 rounded-full ${display.color} flex items-center justify-center border-2 border-slate-800 relative flex-shrink-0`}>
                        {display.icon}
                        {channel.type === 'DIRECT' && (
                           <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className={`text-sm font-bold truncate ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}>
                              {display.name}
                           </h3>
                           {channel.lastMessageTime && (
                              <span className="text-[10px] text-slate-500">{channel.lastMessageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                           {channel.lastMessage || <span className="italic opacity-50">No messages yet</span>}
                        </p>
                     </div>
                  </div>
               );
            })}
         </div>
         
         <div className="p-4 md:hidden">
             <button onClick={onClose} className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-bold">
                 Close Messenger
             </button>
         </div>
      </div>

      {/* MAIN: CONVERSATION (Visible on mobile if showMobileChat is true) */}
      <div className={`flex-1 flex-col bg-slate-950 relative ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
         
         {/* Top Bar */}
         <div className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-900/50 backdrop-blur">
            <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button onClick={() => setShowMobileChat(false)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {activeChannel ? (
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getChannelDisplay(activeChannel).color}`}>
                         {getChannelDisplay(activeChannel).icon}
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-white leading-tight">{getChannelDisplay(activeChannel).name}</h3>
                         <p className="text-xs text-slate-400">
                            {activeChannel.type === 'GROUP' 
                              ? `${activeChannel.participants.length} members` 
                              : 'Active Now'
                            }
                         </p>
                      </div>
                   </div>
                ) : (
                   <div></div>
                )}
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
               <button className="p-2 hover:bg-slate-800 rounded-full text-indigo-400 hidden sm:block"><Phone className="w-5 h-5" /></button>
               <button className="p-2 hover:bg-slate-800 rounded-full text-indigo-400 hidden sm:block"><Video className="w-5 h-5" /></button>
               <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
               <button 
                 onClick={onClose}
                 className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
               >
                  <X className="w-6 h-6" />
               </button>
            </div>
         </div>

         {/* Messages Area */}
         <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-slate-950">
            {!activeChannelId ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
                        <MessageSquarePlus className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm">Select a chat to start messaging</p>
                </div>
            ) : currentMessages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                   <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                      <Send className="w-8 h-8" />
                   </div>
                   <p className="text-sm">Start the conversation</p>
               </div>
            ) : (
               currentMessages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser.id;
                  const showHeader = idx === 0 || currentMessages[idx-1].senderId !== msg.senderId;
                  
                  return (
                     <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {showHeader && !isMe && (
                           <div className="text-[10px] text-slate-500 ml-11 mb-1">{msg.senderName}</div>
                        )}
                        <div className="flex gap-3 max-w-[85%] md:max-w-[70%]">
                           {!isMe && (
                              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-1 ${showHeader ? 'opacity-100' : 'opacity-0'} bg-slate-700 text-slate-300`}>
                                 {msg.senderName.charAt(0)}
                              </div>
                           )}
                           <div className={`p-3 rounded-2xl break-words ${
                              isMe 
                               ? 'bg-indigo-600 text-white rounded-tr-none' 
                               : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                           }`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                           </div>
                        </div>
                        <div className={`text-[9px] text-slate-500 mt-1 ${isMe ? 'mr-1' : 'ml-11'}`}>
                           {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                     </div>
                  );
               })
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         {activeChannelId && (
             <div className="p-3 md:p-4 bg-slate-900 border-t border-slate-800">
                <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
                   <button type="button" className="p-2 md:p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-full transition-colors hidden sm:block">
                      <Plus className="w-5 h-5" />
                   </button>
                   <button type="button" className="p-2 md:p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-full transition-colors hidden sm:block">
                      <Image className="w-5 h-5" />
                   </button>
                   <div className="flex-grow bg-slate-800 rounded-2xl border border-slate-700 flex items-center px-4 py-2">
                      <input 
                         type="text"
                         value={input}
                         onChange={(e) => setInput(e.target.value)}
                         placeholder="Type a message..."
                         className="w-full bg-transparent text-white focus:outline-none py-1 text-sm md:text-base"
                      />
                      <button type="button" className="ml-2 text-slate-500 hover:text-yellow-400">
                         <Smile className="w-5 h-5" />
                      </button>
                   </div>
                   <button 
                      type="submit" 
                      disabled={!input.trim()}
                      className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-700 rounded-full text-white shadow-lg transition-all"
                   >
                      <Send className="w-5 h-5" />
                   </button>
                </form>
             </div>
         )}
      </div>

      {/* CREATE GROUP MODAL */}
      {isCreatingGroup && (
         <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">New Group Chat</h3>
                  <button onClick={() => setIsCreatingGroup(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="space-y-4">
                  <div>
                     <label className="text-xs font-bold text-slate-400 uppercase">Group Name</label>
                     <input 
                       type="text" 
                       value={newGroupName}
                       onChange={(e) => setNewGroupName(e.target.value)}
                       placeholder="e.g. AOCC Crisis Team"
                       className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                     />
                  </div>
                  
                  <div>
                     <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Select Members</label>
                     <div className="h-48 overflow-y-auto custom-scrollbar border border-slate-700 rounded-lg bg-slate-800">
                        {allUsers.filter(u => u.id !== currentUser.id).map(user => (
                           <div 
                              key={user.id}
                              onClick={() => toggleUserSelection(user.id)}
                              className="flex items-center justify-between p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0"
                           >
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold text-slate-300 text-xs">
                                    {user.name.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="text-sm font-bold text-slate-200">{user.name}</div>
                                    <div className="text-[10px] text-slate-500">{user.role}</div>
                                 </div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                 selectedForGroup.includes(user.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-500'
                              }`}>
                                 {selectedForGroup.includes(user.id) && <Check className="w-3 h-3 text-white" />}
                              </div>
                           </div>
                        ))}
                     </div>
                     <p className="text-xs text-slate-500 mt-2 text-right">{selectedForGroup.length} selected</p>
                  </div>

                  <button 
                     onClick={handleCreateGroup}
                     disabled={!newGroupName || selectedForGroup.length === 0}
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-all"
                  >
                     Create Group
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* NEW CHAT (DIRECTORY) MODAL */}
      {isNewChatModalOpen && (
         <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 flex flex-col max-h-[80vh]">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">New Message</h3>
                  <button onClick={() => setIsNewChatModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="mb-4">
                   <div className="relative">
                      <input 
                         type="text" 
                         placeholder="Search directory..."
                         className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pl-9 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                         autoFocus
                      />
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                   </div>
               </div>

               <div className="flex-grow overflow-y-auto custom-scrollbar border border-slate-700 rounded-lg bg-slate-800">
                  <div className="p-2 text-xs font-bold text-slate-500 uppercase">Teammates</div>
                  {allUsers.filter(u => u.id !== currentUser.id).map(user => (
                     <div 
                        key={user.id}
                        onClick={() => handleStartDirectChat(user.id)}
                        className="flex items-center justify-between p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0"
                     >
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-200 text-sm border-2 ${
                               user.status === 'ONLINE' ? 'border-emerald-500 bg-emerald-900/50' : 'border-slate-600 bg-slate-700'
                           }`}>
                              {user.name.charAt(0)}
                           </div>
                           <div>
                              <div className="text-sm font-bold text-slate-200">{user.name}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                 {user.role} • {user.department.replace('_', ' ')}
                              </div>
                           </div>
                        </div>
                        <MessageSquarePlus className="w-5 h-5 text-indigo-400" />
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
