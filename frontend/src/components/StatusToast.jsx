/**
 * Life OS — Status Toast
 * Non-blocking toast notifications for background events.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import useAgentStore from '../stores/useAgentStore';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: 'var(--color-calendar)',
  error: 'var(--color-notify)',
  info: 'var(--color-primary)',
};

export default function StatusToast() {
  const toasts = useAgentStore((s) => s.toasts);
  const removeToast = useAgentStore((s) => s.removeToast);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => removeToast(toast.id), 5000);
      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              className="toast"
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 20, x: 20 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <Icon size={16} style={{ color: COLORS[toast.type], flexShrink: 0, marginTop: 2 }} />
                <span style={{ flex: 1 }}>{toast.message}</span>
                <button
                  className="btn-icon"
                  onClick={() => removeToast(toast.id)}
                  style={{ width: 20, height: 20, flexShrink: 0 }}
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
