import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const WS_URL = API_URL.replace('/api', '/ws');

export function useWebSocket(userId) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    if (!userId) return;

    // Create STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {},
      debug: (str) => {
        console.log('[WebSocket]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected');
        setConnected(true);
        setError(null);
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('WebSocket Error:', frame);
        setError(frame.headers.message || 'WebSocket error occurred');
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      // Unsubscribe all
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];

      // Disconnect
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [userId]);

  // Subscribe to a destination
  const subscribe = (destination, callback) => {
    if (!clientRef.current || !connected) {
      console.warn('WebSocket not connected, cannot subscribe to:', destination);
      return null;
    }

    const subscription = clientRef.current.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    subscriptionsRef.current.push(subscription);
    return subscription;
  };

  // Send a message
  const send = (destination, body) => {
    if (!clientRef.current || !connected) {
      console.warn('WebSocket not connected, cannot send to:', destination);
      return;
    }

    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
    });
  };

  return {
    connected,
    error,
    subscribe,
    send,
  };
}
