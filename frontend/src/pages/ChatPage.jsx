import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router';
import { MessageCircle, Send, ArrowLeft, Check, CheckCheck, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import useChatSSE from '../hooks/useChatSSE';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function ChatPage() {
  const { user, isLoaded } = useUser();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [userCache, setUserCache] = useState({}); // Cache user details
  const messagesEndRef = useRef(null);

  // SSE connection for real-time updates
  const { isConnected } = useChatSSE(user?.id, {
    onNewMessage: (message) => {
      console.log('📨 New message callback:', message);

      // Convert messageId to id for consistency
      const normalizedMessage = { ...message, id: message.messageId };

      // Add message to current conversation if it matches
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages((prev) => [...prev, normalizedMessage]);

        // Mark as read immediately since user is viewing the conversation
        markAsRead([message.messageId]);
      } else {
        // Update unread count for other conversations
        setUnreadCounts((prev) => ({
          ...prev,
          [message.conversationId]: (prev[message.conversationId] || 0) + 1
        }));

        // Refresh conversations list to show new message preview
        fetchConversations();
      }
    },
    onMessageRead: (readReceipt) => {
      console.log('✅ Read receipt callback:', readReceipt);

      // Update read status of messages in current conversation
      if (selectedConversation && readReceipt.conversationId === selectedConversation.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            readReceipt.messageIds.includes(msg.id)
              ? { ...msg, isRead: true, readAt: readReceipt.readAt }
              : msg
          )
        );
      }
    }
  });

  // Fetch conversations on mount
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchUnreadCounts();
    }
  }, [user?.id]);

  // Auto-select conversation when coming from Matches page
  useEffect(() => {
    const selectedUserId = location.state?.selectedUserId;
    if (selectedUserId && user?.id) {
      // Find or create conversation with this user
      const conversationId = [user.id, selectedUserId].sort().join('_');
      let conversation = conversations.find(c => c.id === conversationId);

      if (conversation) {
        // Conversation exists, select it
        selectConversation(conversation);
      } else {
        // Conversation doesn't exist yet, create placeholder
        // This allows sending the first message
        conversation = {
          id: conversationId,
          user1Id: [user.id, selectedUserId].sort()[0],
          user2Id: [user.id, selectedUserId].sort()[1],
          lastMessageContent: null,
          lastMessageTimestamp: null,
          unreadCounts: { [user.id]: 0, [selectedUserId]: 0 }
        };
        setSelectedConversation(conversation);
        setMessages([]); // Empty message list for new conversation
      }
    }
  }, [location.state, conversations, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const unreadMessageIds = messages
        .filter((msg) => !msg.isRead && msg.recipientId === user?.id)
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
      }
    }
  }, [selectedConversation, messages, user?.id]);

  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_URL}/chat/conversations/${user.id}`);
      const data = await res.json();

      if (data.success) {
        setConversations(data.conversations);

        // Fetch user details for all conversation participants
        data.conversations.forEach(conv => {
          const otherUserId = conv.user1Id === user.id ? conv.user2Id : conv.user1Id;
          fetchUserDetails(otherUserId);
        });
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API_URL}/chat/unread/${user.id}`);
      const data = await res.json();

      if (data.success) {
        setUnreadCounts(data.unreadCounts);
      }
    } catch (error) {
      console.error('Failed to fetch unread counts:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    // Don't fetch if already cached
    if (userCache[userId]) return;

    try {
      const res = await fetch(`${API_URL}/users/${userId}`);
      if (res.ok) {
        const userData = await res.json();
        setUserCache(prev => ({
          ...prev,
          [userId]: {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl
          }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await fetch(`${API_URL}/chat/history/${conversationId}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sending) return;

    const recipientId =
      selectedConversation.user1Id === user.id
        ? selectedConversation.user2Id
        : selectedConversation.user1Id;

    setSending(true);

    try {
      const res = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: recipientId,
          content: messageInput.trim()
        })
      });

      const data = await res.json();

      if (data.success) {
        // Add message to local state immediately
        setMessages((prev) => [...prev, data.message]);
        setMessageInput('');

        // Refresh conversations to update last message
        fetchConversations();
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageIds) => {
    if (!messageIds || messageIds.length === 0) return;

    try {
      await fetch(`${API_URL}/chat/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageIds: messageIds,
          userId: user.id
        })
      });

      // Update unread counts locally
      if (selectedConversation) {
        setUnreadCounts((prev) => ({
          ...prev,
          [selectedConversation.id]: 0
        }));
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);

    // Fetch user details for display
    const otherUserId = conversation.user1Id === user?.id
      ? conversation.user2Id
      : conversation.user1Id;
    fetchUserDetails(otherUserId);
  };

  const getOtherUserName = (conversation) => {
    const otherUserId =
      conversation.user1Id === user?.id ? conversation.user2Id : conversation.user1Id;

    const otherUser = userCache[otherUserId];
    if (otherUser) {
      return `${otherUser.firstName} ${otherUser.lastName}`;
    }

    // Fetch user details if not cached
    fetchUserDetails(otherUserId);

    // Return user ID as fallback while loading
    return otherUserId;
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen w-full bg-base-200 flex flex-col">
        <Navbar />
        <div className="grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-base-content/60 font-medium">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-base-200/50 flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex p-4 gap-4 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-1/3 bg-base-100 rounded-3xl shadow-lg overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-base-300">
            <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              Messages
            </h1>
            {!isConnected && (
              <p className="text-xs text-warning mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Connecting...
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-base-content/50">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-base-content/20" />
                <p className="font-medium">No conversations yet</p>
                <p className="text-sm mt-2">
                  Start chatting with your matches!
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 border-b border-base-200 hover:bg-base-200 transition-colors text-left ${
                    selectedConversation?.id === conv.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base-content truncate">
                          {getOtherUserName(conv)}
                        </h3>
                        {unreadCounts[conv.id] > 0 && (
                          <span className="badge badge-primary badge-sm">
                            {unreadCounts[conv.id]}
                          </span>
                        )}
                      </div>
                      {conv.lastMessageContent && (
                        <p className="text-sm text-base-content/60 truncate mt-1">
                          {conv.lastMessageContent}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex flex-1 bg-base-100 rounded-3xl shadow-lg overflow-hidden flex-col h-full">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-base-300 flex items-center gap-4">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden btn btn-ghost btn-circle"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-base-content">
                    {getOtherUserName(selectedConversation)}
                  </h2>
                  <p className="text-xs text-base-content/60">
                    {isConnected ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ minHeight: 0 }}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-base-content/50">
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isSender = msg.senderId === user.id;
                      return (
                        <div
                          key={msg.id || index}
                          className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                              isSender
                                ? 'bg-primary text-primary-content'
                                : 'bg-base-200 text-base-content'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <div
                              className={`flex items-center gap-1 mt-1 text-xs ${
                                isSender ? 'text-primary-content/70' : 'text-base-content/50'
                              }`}
                            >
                              <span>
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isSender && (
                                <span>
                                  {msg.isRead ? (
                                    <CheckCheck className="w-3 h-3" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-base-300">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="input input-bordered flex-1"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className="btn btn-primary"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-base-content/50">
              <div className="text-center">
                <MessageCircle className="w-24 h-24 mx-auto mb-4 text-base-content/20" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-2">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ChatPage;
