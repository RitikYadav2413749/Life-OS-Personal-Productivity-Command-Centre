/**
 * Life OS — Agent Connection Graph
 * Animated SVG showing live data flow between agents during execution.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import useAgentStore from '../stores/useAgentStore';
import './AgentConnectionGraph.css';

const NODES = [
  { id: 'supervisor', label: '🧠', x: 200, y: 30, color: 'var(--color-primary)' },
  { id: 'email_agent', label: '📧', x: 60, y: 130, color: 'var(--color-email)' },
  { id: 'calendar_agent', label: '📅', x: 160, y: 130, color: 'var(--color-calendar)' },
  { id: 'task_agent', label: '📝', x: 260, y: 130, color: 'var(--color-tasks)' },
  { id: 'notifier_agent', label: '🔔', x: 360, y: 130, color: 'var(--color-notify)' },
];

const CONNECTIONS = [
  { from: 'supervisor', to: 'email_agent' },
  { from: 'supervisor', to: 'calendar_agent' },
  { from: 'supervisor', to: 'task_agent' },
  { from: 'supervisor', to: 'notifier_agent' },
];

export default function AgentConnectionGraph() {
  const agents = useAgentStore((s) => s.agents);
  const isExecuting = useAgentStore((s) => s.isExecuting);

  const nodeMap = useMemo(() => {
    const m = {};
    NODES.forEach((n) => { m[n.id] = n; });
    return m;
  }, []);

  return (
    <div className="connection-graph">
      <div className="section-label">Agent Network</div>
      <svg viewBox="0 0 420 170" className="graph-svg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {CONNECTIONS.map((conn) => {
          const from = nodeMap[conn.from];
          const to = nodeMap[conn.to];
          const agentStatus = agents[conn.to]?.status || 'idle';
          const isActive = agentStatus === 'running';

          return (
            <g key={`${conn.from}-${conn.to}`}>
              <line
                x1={from.x}
                y1={from.y + 16}
                x2={to.x}
                y2={to.y - 16}
                stroke={isActive ? to.color : 'rgba(255,255,255,0.06)'}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? '6 3' : 'none'}
                className={isActive ? 'line-active' : ''}
              />
              {isActive && (
                <circle r="3" fill={to.color} filter="url(#glow)">
                  <animateMotion
                    dur="1.5s"
                    repeatCount="indefinite"
                    path={`M${from.x},${from.y + 16} L${to.x},${to.y - 16}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map((node) => {
          const agentStatus = node.id === 'supervisor'
            ? (isExecuting ? 'running' : 'idle')
            : (agents[node.id]?.status || 'idle');

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.id === 'supervisor' ? 22 : 18}
                fill="var(--bg-secondary)"
                stroke={agentStatus === 'running' ? node.color : 'var(--glass-border)'}
                strokeWidth={agentStatus === 'running' ? 2 : 1}
                filter={agentStatus === 'running' ? 'url(#glow)' : 'none'}
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontSize="16"
                className="graph-emoji"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
