/**
 * Life OS — Result Card
 * Expandable card showing individual agent results.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Copy, Check } from 'lucide-react';

export default function ResultCard({ result }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="glass-panel"
      style={{ padding: 'var(--space-4)', cursor: 'pointer' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>
            {result.command?.slice(0, 60) || 'Result'}
          </span>
          {result.dryRun && (
            <span className="chip" style={{ fontSize: '10px', color: 'var(--color-tasks)' }}>DRY RUN</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleCopy(); }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <ChevronDown
            size={16}
            style={{
              color: 'var(--text-muted)',
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>

      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
        {result.summary?.slice(0, 120)}
      </p>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginTop: 'var(--space-3)' }}
          >
            <pre style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: 'rgba(0,0,0,0.3)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
