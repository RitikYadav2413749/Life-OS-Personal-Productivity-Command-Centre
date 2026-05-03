/**
 * Life OS — Quick Actions
 * Suggested prompt chips for one-click execution.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import useMemoryStore from '../stores/useMemoryStore';

export default function QuickActions({ onSelect }) {
  const suggestions = useMemoryStore((s) => s.suggestions);
  const fetchSuggestions = useMemoryStore((s) => s.fetchSuggestions);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const defaults = suggestions.length > 0 ? suggestions : [
    'Give me my morning brief',
    'Handle my unread emails',
    "What's on my calendar today?",
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Sparkles size={12} /> Quick Actions
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {defaults.map((text, i) => (
          <motion.button
            key={text}
            className="chip"
            onClick={() => onSelect(text)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }}
          >
            {text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
