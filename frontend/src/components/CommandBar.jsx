/**
 * Life OS — Command Bar
 * Glowing natural language input with voice support and Ctrl+K shortcut.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Zap, Command } from 'lucide-react';
import useAgentStore from '../stores/useAgentStore';
import useVoiceInput from '../hooks/useVoiceInput';
import './CommandBar.css';

export default function CommandBar({ onSubmit }) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const isExecuting = useAgentStore((s) => s.isExecuting);

  const handleVoiceResult = useCallback((text) => {
    setInput(text);
  }, []);

  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput(handleVoiceResult);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isExecuting) return;
    onSubmit(text);
    setInput('');
  };

  return (
    <motion.div
      className={`command-bar ${focused ? 'focused' : ''} ${isExecuting ? 'executing' : ''}`}
      layout
    >
      <form onSubmit={handleSubmit} className="command-bar-inner">
        <div className="command-bar-icon">
          <Zap size={18} />
        </div>

        <input
          ref={inputRef}
          type="text"
          className="command-input"
          placeholder={isListening ? 'Listening...' : 'What would you like me to do?'}
          value={isListening ? transcript : input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isExecuting}
          id="command-input"
          autoComplete="off"
        />

        <div className="command-bar-actions">
          {!focused && (
            <div className="command-shortcut">
              <Command size={12} />
              <span>K</span>
            </div>
          )}

          {isSupported && (
            <button
              type="button"
              className={`btn-icon ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              title="Voice input"
              id="voice-btn"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}

          <button
            type="submit"
            className="btn-icon submit"
            disabled={!input.trim() || isExecuting}
            id="submit-btn"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {isExecuting && (
          <motion.div
            className="command-bar-progress"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 12, ease: 'linear' }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
