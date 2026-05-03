/**
 * Life OS — WebSocket Hook
 * Auto-reconnecting WebSocket connection to the FastAPI backend.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import useAgentStore from '../stores/useAgentStore';

const WS_URL = `ws://${window.location.host}/ws/stream`;
const RECONNECT_INTERVAL = 3000;
const MAX_RETRIES = 10;

export default function useWebSocket() {
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const [connected, setConnected] = useState(false);
  const handleWSMessage = useAgentStore((s) => s.handleWSMessage);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnected(true);
        retriesRef.current = 0;
        console.log('[WS] Connected');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleWSMessage(msg);
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        if (retriesRef.current < MAX_RETRIES) {
          retriesRef.current += 1;
          setTimeout(connect, RECONNECT_INTERVAL);
        }
      };

      ws.onerror = (err) => {
        console.error('[WS] Error:', err);
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WS] Connection failed:', err);
    }
  }, [handleWSMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendCommand = useCallback((text, dryRun = false, userId = 'user_001') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        text,
        dry_run: dryRun,
        user_id: userId,
      }));
      return true;
    }
    return false;
  }, []);

  return { connected, sendCommand };
}
