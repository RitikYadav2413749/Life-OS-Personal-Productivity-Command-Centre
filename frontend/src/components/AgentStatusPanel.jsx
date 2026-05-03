/**
 * Life OS — Agent Status Panel
 * 4 agent cards in a grid showing real-time execution status.
 */

import { motion } from 'framer-motion';
import { Mail, Calendar, ListTodo, Bell } from 'lucide-react';
import useAgentStore from '../stores/useAgentStore';
import './AgentStatusPanel.css';

const AGENT_META = {
  email_agent: { icon: Mail, label: 'Email Agent', color: 'email' },
  calendar_agent: { icon: Calendar, label: 'Calendar Agent', color: 'calendar' },
  task_agent: { icon: ListTodo, label: 'Task Agent', color: 'task' },
  notifier_agent: { icon: Bell, label: 'Notification Agent', color: 'notify' },
};

function AgentCard({ agentKey, agent }) {
  const meta = AGENT_META[agentKey];
  const Icon = meta.icon;
  const isActive = agent.status === 'running';
  const isDone = agent.status === 'success';
  const isError = agent.status === 'error';

  return (
    <motion.div
      className={`agent-card ${meta.color} ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isError ? 'errored' : ''}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="agent-card-header">
        <div className="agent-card-icon" style={{ background: `var(--color-${meta.color}-soft)` }}>
          <Icon size={18} style={{ color: `var(--color-${meta.color})` }} />
        </div>
        <div className="agent-card-info">
          <span className="agent-card-name">{meta.label}</span>
          <span className={`agent-card-status status-${agent.status}`}>
            <span className={`status-dot ${agent.status}`} />
            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </span>
        </div>
        {agent.duration > 0 && (
          <span className="agent-card-duration">{agent.duration}ms</span>
        )}
      </div>

      {agent.steps.length > 0 && (
        <div className="agent-card-steps">
          {agent.steps.slice(-3).map((step, i) => (
            <motion.div
              key={i}
              className="agent-step"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="step-bullet">›</span>
              <span className="step-text">{step}</span>
            </motion.div>
          ))}
        </div>
      )}

      {isActive && (
        <div className="agent-card-pulse">
          <div className="pulse-ring" />
        </div>
      )}
    </motion.div>
  );
}

export default function AgentStatusPanel() {
  const agents = useAgentStore((s) => s.agents);

  return (
    <div className="agent-status-panel">
      <div className="section-label">Agent Orchestra</div>
      <div className="agent-grid">
        {Object.entries(agents).map(([key, agent]) => (
          <AgentCard key={key} agentKey={key} agent={agent} />
        ))}
      </div>
    </div>
  );
}
