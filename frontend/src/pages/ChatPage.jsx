import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router';
import {
  MessageCircle, Send, ArrowLeft, Check, CheckCheck,
  Loader2, Trash2, Search, Phone, Video,
  MoreVertical, Smile
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import useChatSSE from '../hooks/useChatSSE';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper for conditional classes
const cn = (...classes) => classes.filter(Boolean).join(' ');

function ChatPage() {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [userCache, setUserCache] = useState({});
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // --- Logic & Hooks ---
  const { isConnected } = useChatSSE(user?.id, {
    onNewMessage: (message) => {
      const normalizedMessage = { ...message, id: message.messageId };
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages((prev) => [...prev, normalizedMessage]);
        markAsRead([message.messageId]);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.conversationId]: (prev[message.conversationId] || 0) + 1
        }));
        fetchConversations();
      }
    },
    onMessageRead: (readReceipt) => {
      if (selectedConversation && readReceipt.conversationId === selectedConversation.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            readReceipt.messageIds.includes(msg.id)
              ? { ...msg, isRead: true, readAt: readReceipt.readAt }
              : msg
          )
        );
      }
    },
    onMessageDeleted: (deletion) => {
      if (selectedConversation && deletion.conversationId === selectedConversation.id) {
        setMessages((prev) => prev.filter((msg) => msg.id !== deletion.messageId));
      }
    }
  });

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchUnreadCounts();
    }
  }, [user?.id]);

  useEffect(() => {
    const selectedUserId = location.state?.selectedUserId;
    if (selectedUserId && user?.id) {
      const conversationId = [user.id, selectedUserId].sort().join('_');
      let conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        selectConversation(conversation);
      } else {
        conversation = {
          id: conversationId,
          user1Id: [user.id, selectedUserId].sort()[0],
          user2Id: [user.id, selectedUserId].sort()[1],
          lastMessageContent: null,
          lastMessageTimestamp: null,
          unreadCounts: { [user.id]: 0, [selectedUserId]: 0 }
        };
        setSelectedConversation(conversation);
        setMessages([]);
        fetchUserDetails(selectedUserId);
      }
    }
  }, [location.state, conversations, user?.id]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (isNearBottom || shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldAutoScroll(false);
    }
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const unreadMessageIds = messages
        .filter((msg) => !msg.isRead && msg.recipientId === user?.id)
        .map((msg) => msg.id);
      if (unreadMessageIds.length > 0) markAsRead(unreadMessageIds);
    }
  }, [selectedConversation, messages, user?.id]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  }, [messageInput]);

  // --- API Functions ---
  const fetchConversations = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/chat/conversations/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
        data.conversations.forEach(conv => {
          const otherUserId = conv.user1Id === user.id ? conv.user2Id : conv.user1Id;
          fetchUserDetails(otherUserId);
        });
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/chat/unread/${user.id}`);
      const data = await res.json();
      if (data.success) setUnreadCounts(data.unreadCounts);
    } catch (error) { console.error(error); }
  };

  const fetchUserDetails = async (userId) => {
    if (userCache[userId]) return;
    try {
      const res = await fetch(`${API_URL}/users/${userId}`);
      if (res.ok) {
        const userData = await res.json();
        setUserCache(prev => ({ ...prev, [userId]: userData }));
      }
    } catch (error) { console.error(error); }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await fetch(`${API_URL}/chat/history/${conversationId}`);
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (error) { toast.error('Failed to load messages'); }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sending) return;
    const recipientId = selectedConversation.user1Id === user.id ? selectedConversation.user2Id : selectedConversation.user1Id;
    const messageContent = messageInput.trim();
    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      senderId: user.id,
      recipientId: recipientId,
      content: messageContent,
      timestamp: new Date().toISOString(),
      isRead: false,
      sending: true
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageInput('');
    setShouldAutoScroll(true);
    setSending(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.id, recipientId: recipientId, content: messageContent })
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.map((msg) => msg.id === optimisticMessage.id ? data.message : msg));
        setConversations((prev) => prev.map((conv) => conv.id === selectedConversation.id ? {
          ...conv,
          lastMessageContent: messageContent,
          lastMessageTimestamp: data.message.timestamp,
          lastMessageSenderId: user.id
        } : conv));
      } else { throw new Error(data.error); }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      setMessageInput(messageContent);
      toast.error('Failed to send message');
    } finally { setSending(false); }
  };

  const markAsRead = async (messageIds) => {
    if (!messageIds?.length) return;
    try {
      await fetch(`${API_URL}/chat/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds: messageIds, userId: user.id })
      });
      if (selectedConversation) {
        setUnreadCounts((prev) => ({ ...prev, [selectedConversation.id]: 0 }));
      }
    } catch (error) { console.error(error); }
  };

  const deleteMessage = (messageId, messageContent) => {
    setDeleteConfirmation({ messageId, content: messageContent });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    const { messageId } = deleteConfirmation;
    setDeleteConfirmation(null);
    try {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      await fetch(`${API_URL}/chat/message/${messageId}?userId=${user.id}`, { method: 'DELETE' });
      toast.success('Message deleted');
    } catch (error) {
      fetchMessages(selectedConversation.id);
      toast.error('Failed to delete message');
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    const otherUserId = conversation.user1Id === user?.id ? conversation.user2Id : conversation.user1Id;
    fetchUserDetails(otherUserId);
  };

  // --- Helpers ---
  const getOtherUser = (conversation) => {
    if (!conversation) return null;
    const otherUserId = conversation.user1Id === user?.id ? conversation.user2Id : conversation.user1Id;
    return userCache[otherUserId] || { id: otherUserId, firstName: 'Loading...', lastName: '' };
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const lastOwnMessageId = messages.slice().reverse().find(m => m.senderId === user?.id)?.id;

  // --- Render ---

  if (!isLoaded || loading) {
    return (
      <div className="h-screen w-full bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-base-100 overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* --- Sidebar / Conversation List --- */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 bg-base-100 border-r border-base-200 flex flex-col transition-all duration-300 z-10",
          selectedConversation ? "hidden md:flex" : "flex"
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-base-200 bg-base-100/50 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-base-content tracking-tight">Chats</h1>
              <div className={cn("badge gap-1", isConnected ? "badge-success badge-outline" : "badge-warning badge-outline")}>
                <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-success" : "bg-warning animate-pulse")} />
                {isConnected ? 'Online' : 'Connecting'}
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="input input-bordered input-sm w-full pl-10 rounded-full bg-base-200/50 focus:bg-base-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-base-content/40">
                <MessageCircle className="w-12 h-12 mb-2 opacity-20" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherUser = getOtherUser(conv);
                const isActive = selectedConversation?.id === conv.id;
                const unread = unreadCounts[conv.id] || 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={cn(
                      "w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200",
                      isActive ? "bg-primary text-primary-content shadow-md transform scale-[1.02]" : "hover:bg-base-200 text-base-content"
                    )}
                  >
                    <div className="relative">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full ring-2 ring-base-100 ring-offset-2">
                          <img 
                            src={otherUser.profileImageUrl || `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}`} 
                            alt={otherUser.firstName} 
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-base-100 rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex justify-between items-baseline">
                        <h3 className={cn("font-bold truncate", isActive ? "text-primary-content" : "text-base-content")}>
                          {otherUser.firstName} {otherUser.lastName}
                        </h3>
                        {conv.lastMessageTimestamp && (
                          <span className={cn("text-xs", isActive ? "text-primary-content/70" : "text-base-content/50")}>
                            {formatTime(conv.lastMessageTimestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-0.5">
                        <p className={cn("text-sm truncate max-w-[80%]", isActive ? "text-primary-content/80" : "text-base-content/60")}>
                          {conv.lastMessageSenderId === user.id && "You: "}
                          {conv.lastMessageContent || "Drafting..."}
                        </p>
                        {unread > 0 && (
                          <div className="badge badge-error badge-sm animate-bounce text-xs font-bold shadow-sm">
                            {unread}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* --- Main Chat Area --- */}
        <div className={cn(
          "flex-1 flex flex-col bg-base-200/50 relative transition-all duration-300",
          !selectedConversation ? "hidden md:flex" : "flex absolute inset-0 md:static z-20"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-4 bg-base-100 border-b border-base-200 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedConversation(null)} 
                    className="md:hidden btn btn-ghost btn-circle btn-sm -ml-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img 
                        src={getOtherUser(selectedConversation).profileImageUrl || `https://ui-avatars.com/api/?name=${getOtherUser(selectedConversation).firstName}`} 
                        alt="User" 
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-base-content leading-tight">
                      {getOtherUser(selectedConversation).firstName} {getOtherUser(selectedConversation).lastName}
                    </h3>
                    <p className="text-xs text-success font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                      Active now
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="btn btn-ghost btn-circle btn-sm text-base-content/60">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="btn btn-ghost btn-circle btn-sm text-base-content/60">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="btn btn-ghost btn-circle btn-sm text-base-content/60">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={messagesContainerRef} 
                className="flex-1 overflow-y-auto p-4 space-y-0 scroll-smooth" 
                style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,0,0,0.02) 2px, transparent 2px)', backgroundSize: '24px 24px' }}
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-base-content/40">
                    <div className="w-20 h-20 bg-base-300 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-10 h-10" />
                    </div>
                    <p>Start a conversation with {getOtherUser(selectedConversation).firstName}!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isSender = msg.senderId === user.id;
                    const isLastOwnMessage = isSender && msg.id === lastOwnMessageId;
                    
                    const nextMsg = messages[index + 1];
                    const prevMsg = messages[index - 1];

                    // Sequence logic checks sender AND minute matching
                    const isSequenceStart = 
                      !prevMsg || 
                      prevMsg.senderId !== msg.senderId || 
                      formatTime(msg.timestamp) !== formatTime(prevMsg.timestamp);

                    const isSequenceEnd = 
                      !nextMsg || 
                      nextMsg.senderId !== msg.senderId || 
                      formatTime(msg.timestamp) !== formatTime(nextMsg.timestamp);

                    // Bubble shape logic for stacking
                    // If it's NOT the start, we flatten top corner. If it's NOT the end, we flatten bottom corner.
                    const bubbleShape = isSender
                      ? cn(
                          !isSequenceStart && "rounded-tr-md", // Connect to previous
                          !isSequenceEnd && "rounded-br-md"    // Connect to next (remove tail)
                        )
                      : cn(
                          !isSequenceStart && "rounded-tl-md",
                          !isSequenceEnd && "rounded-bl-md"
                        );

                    return (
                      <div 
                        key={msg.id || index} 
                        className={cn(
                          "chat", 
                          isSender ? "chat-end" : "chat-start", 
                          isSequenceStart ? "mt-4" : "mt-[2px]" // 2px margin for stacking
                        )}
                      >
                        {/* Avatar only at the bottom of the group */}
                        {!isSender && (
                          <div className={cn("chat-image avatar", !isSequenceEnd && "invisible")}>
                            <div className="w-8 h-8 rounded-full">
                              <img src={getOtherUser(selectedConversation).profileImageUrl} alt="avatar" />
                            </div>
                          </div>
                        )}
                        
                        {/* Header only at start of sequence */}
                        {isSequenceStart && (
                           <div className="chat-header mb-1 text-xs opacity-50">
                             {isSender ? "You" : getOtherUser(selectedConversation).firstName}
                           </div>
                        )}

                        <div className={cn(
                          "chat-bubble relative group max-w-[80%] md:max-w-[60%] shadow-sm",
                          bubbleShape, // Apply stacking shapes
                          isSender 
                            ? "chat-bubble-primary text-primary-content" 
                            : "bg-base-100 text-base-content border border-base-200"
                        )}>
                          {msg.content}
                          
                          {/* Message Actions */}
                          {isSender && !msg.sending && (
                            <button
                              onClick={() => deleteMessage(msg.id, msg.content)}
                              className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-base-200 rounded-full text-error"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Footer: Time for last of chunk, Status for last sent message */}
                        <div className="chat-footer opacity-50 text-xs flex items-center gap-1 mt-0.5 min-h-[1.25rem]">
                            {isSequenceEnd && <time>{formatTime(msg.timestamp)}</time>}
                            
                            {/* Status ONLY for the very last message sent by user */}
                            {isLastOwnMessage && (
                                <span className="flex items-center gap-1 ml-1">
                                    {msg.sending ? 'Sending...' : msg.isRead ? 'Seen' : 'Delivered'}
                                    {msg.sending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : msg.isRead ? (
                                    <CheckCheck className="w-3 h-3 text-primary" />
                                    ) : (
                                    <Check className="w-3 h-3" />
                                    )}
                                </span>
                            )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Full width */}
              <div className="p-4 pb-6 bg-transparent">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex items-end gap-2 w-full"
                >
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="textarea textarea-bordered w-full rounded-3xl pl-4 pr-10 py-3 focus:outline-none focus:border-primary transition-colors bg-base-200 shadow-sm resize-none overflow-y-auto min-h-[3rem] max-h-32 leading-normal"
                      disabled={sending}
                      rows={1}
                    />
                    <button type="button" className="absolute right-3 bottom-3 text-base-content/40 hover:text-primary transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className="btn btn-primary btn-circle shadow-lg hover:scale-105 transition-transform"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-base-content/30 bg-base-200/30">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                <MessageCircle className="w-24 h-24 relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-base-content/70">Welcome to Chat</h2>
              <p className="mt-2 text-base-content/50">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-base-100 rounded-3xl shadow-2xl p-6 max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center text-error mb-2">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Delete Message?</h3>
              <p className="text-sm text-base-content/60">
                Are you sure you want to remove this message? It will be deleted for everyone in the chat.
              </p>
              
              <div className="w-full bg-base-200 rounded-xl p-3 my-2 text-left">
                 <p className="text-sm italic text-base-content/70 line-clamp-2">"{deleteConfirmation.content}"</p>
              </div>

              <div className="flex w-full gap-3 mt-4">
                <button 
                  onClick={() => setDeleteConfirmation(null)} 
                  className="btn btn-ghost flex-1 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="btn btn-error flex-1 rounded-xl shadow-lg shadow-error/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;