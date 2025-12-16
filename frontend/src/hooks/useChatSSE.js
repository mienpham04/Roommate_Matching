import { useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Custom hook for managing chat SSE (Server-Sent Events) connections
 * Subscribes to real-time chat events for a specific user
 */
export function useChatSSE(userId, callbacks = {}) {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const {
    onNewMessage = () => {},
    onMessageRead = () => {},
    onMessageDeleted = () => {},
    onError = () => {}
  } = callbacks;

  const connect = useCallback(() => {
    if (!userId) {
      console.log('❌ No userId provided, skipping SSE connection');
      return;
    }

    if (eventSourceRef.current) {
      console.log('⚠️ SSE connection already exists');
      return;
    }

    console.log(`🔌 Connecting to chat SSE for user: ${userId}`);
    const eventSource = new EventSource(`${API_URL}/chat/stream/${userId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Chat SSE connection established');
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on success
    };

    eventSource.addEventListener('new-message', (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 New message received:', message);

        // Call callback
        onNewMessage(message);

        // Show toast notification
        toast.success('New message received!', {
          icon: '💬',
          duration: 3000
        });
      } catch (error) {
        console.error('Failed to parse new message event:', error);
      }
    });

    eventSource.addEventListener('message-read', (event) => {
      try {
        const readReceipt = JSON.parse(event.data);
        console.log('✅ Message read receipt:', readReceipt);

        // Call callback
        onMessageRead(readReceipt);
      } catch (error) {
        console.error('Failed to parse read receipt event:', error);
      }
    });

    eventSource.addEventListener('message-deleted', (event) => {
      try {
        const deletion = JSON.parse(event.data);
        console.log('🗑️  Message deleted:', deletion);

        // Call callback
        onMessageDeleted(deletion);
      } catch (error) {
        console.error('Failed to parse message deletion event:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('❌ Chat SSE error:', error);

      // Call error callback
      onError(error);

      // Close the connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Attempt to reconnect with exponential backoff
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, delay);
      } else {
        console.error('❌ Max reconnection attempts reached');
        toast.error('Chat connection lost. Please refresh the page.', {
          duration: 5000
        });
      }
    };
  }, [userId, onNewMessage, onMessageRead, onError]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting chat SSE');

    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Reset reconnect attempts
    reconnectAttemptsRef.current = 0;
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected: eventSourceRef.current !== null,
    reconnect: () => {
      disconnect();
      setTimeout(connect, 100);
    }
  };
}

export default useChatSSE;
