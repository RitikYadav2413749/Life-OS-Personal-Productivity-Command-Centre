/**
 * Life OS — Conversation Thread
 * Chat-like scrolling history of past commands and AI summaries.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import useMemoryStore from '../stores/useMemoryStore';
import './ConversationThread.css';

export default function ConversationThread() {
  const history = useMemoryStore((s) => s.history);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history.length]);

  if (history.length === 0) {
    return (
      <div className="conversation-empty">
        <Bot size={32} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
          No conversation history yet.
          <br />Type a command to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="conversation-thread">
      <div className="section-label">History</div>
      <div className="thread-messages">
        {history.map((entry, i) => (
          <motion.div
            key={entry.session_id || i}
            className="thread-entry"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="thread-msg user">
              <User size={14} />
              <span>{entry.command}</span>
            </div>
            <div className="thread-msg bot">
              <Bot size={14} />
              <span>{entry.summary || 'Completed'}</span>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
