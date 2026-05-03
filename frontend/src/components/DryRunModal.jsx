/**
 * Life OS — Dry Run Modal
 * Preview planned actions before committing.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, X } from 'lucide-react';

export default function DryRunModal({ isOpen, result, onCommit, onCancel }) {
  if (!isOpen || !result) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="modal-content"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <Shield size={24} style={{ color: 'var(--color-tasks)' }} />
            <div>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>Dry Run Preview</h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                Review the planned actions before committing
              </p>
            </div>
          </div>

          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
            border: '1px solid var(--glass-border)',
          }}>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
              <strong>Command:</strong> {result.command}
            </p>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
              {result.summary}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button className="btn" onClick={onCancel} id="dryrun-cancel">
              <X size={16} /> Cancel
            </button>
            <button className="btn btn-primary" onClick={onCommit} id="dryrun-commit">
              <Check size={16} /> Commit Actions
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
