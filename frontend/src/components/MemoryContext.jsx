/**
 * Life OS — Memory Context Panel
 * Shows what the AI "remembers" — persona, recent history, pending reminders.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, Bell, Trash2 } from 'lucide-react';
import useMemoryStore from '../stores/useMemoryStore';
import './MemoryContext.css';

export default function MemoryContext() {
  const { persona, historySummary, recentCommands, pendingReminders, fetchMemoryContext, clearMemory } = useMemoryStore();

  useEffect(() => {
    fetchMemoryContext();
  }, [fetchMemoryContext]);

  return (
    <div className="memory-context">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Brain size={14} /> AI Memory
        </div>
        <button className="btn-icon" onClick={() => clearMemory()} title="Clear memory" style={{ width: 24, height: 24 }}>
          <Trash2 size={12} />
        </button>
      </div>

      {/* Persona snapshot */}
      {persona && (
        <div className="memory-section">
          <div className="memory-tag">👤 Persona</div>
          <div className="memory-item">{persona.name || 'User'} • {persona.timezone}</div>
          <div className="memory-item">Style: {persona.communication_style}</div>
        </div>
      )}

      {/* History summary */}
      {historySummary && (
        <div className="memory-section">
          <div className="memory-tag"><Clock size={12} /> Summary</div>
          <div className="memory-item">{historySummary.slice(0, 200)}</div>
        </div>
      )}

      {/* Pending reminders */}
      {pendingReminders.length > 0 && (
        <div className="memory-section">
          <div className="memory-tag"><Bell size={12} /> Pending</div>
          {pendingReminders.slice(0, 3).map((r, i) => (
            <div key={i} className="memory-item">{r.message?.slice(0, 80)}</div>
          ))}
        </div>
      )}

      {!persona && !historySummary && pendingReminders.length === 0 && (
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', padding: 'var(--space-3)' }}>
          No memory data yet. Run a command to start building context.
        </p>
      )}
    </div>
  );
}
