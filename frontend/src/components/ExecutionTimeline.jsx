/**
 * Life OS — Execution Timeline
 * Gantt-style horizontal bars showing parallel agent durations.
 */

import { motion } from 'framer-motion';
import useAgentStore from '../stores/useAgentStore';
import './ExecutionTimeline.css';

const COLORS = {
  email_agent: 'var(--color-email)',
  calendar_agent: 'var(--color-calendar)',
  task_agent: 'var(--color-tasks)',
  notifier_agent: 'var(--color-notify)',
};

const LABELS = {
  email_agent: 'Email',
  calendar_agent: 'Calendar',
  task_agent: 'Tasks',
  notifier_agent: 'Notify',
};

export default function ExecutionTimeline() {
  const agents = useAgentStore((s) => s.agents);
  const isExecuting = useAgentStore((s) => s.isExecuting);

  const maxDuration = Math.max(
    ...Object.values(agents).map((a) => a.duration || 0),
    1
  );

  const hasActivity = Object.values(agents).some((a) => a.status !== 'idle');
  if (!hasActivity && !isExecuting) return null;

  return (
    <div className="execution-timeline">
      <div className="section-label">Execution Timeline</div>
      <div className="timeline-bars">
        {Object.entries(agents).map(([key, agent]) => {
          const pct = maxDuration > 0 ? ((agent.duration || 0) / maxDuration) * 100 : 0;
          const isRunning = agent.status === 'running';

          return (
            <div key={key} className="timeline-row">
              <span className="timeline-label">{LABELS[key]}</span>
              <div className="timeline-track">
                <motion.div
                  className={`timeline-bar ${isRunning ? 'running' : ''}`}
                  style={{ background: COLORS[key] }}
                  initial={{ width: 0 }}
                  animate={{ width: isRunning ? '100%' : `${Math.max(pct, 5)}%` }}
                  transition={{ duration: isRunning ? 12 : 0.5, ease: isRunning ? 'linear' : 'easeOut' }}
                />
              </div>
              <span className="timeline-duration">
                {agent.duration > 0 ? `${agent.duration}ms` : isRunning ? '...' : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
