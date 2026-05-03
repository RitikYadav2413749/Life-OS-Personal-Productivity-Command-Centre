/**
 * Life OS — Agent Store (Zustand)
 * Manages agent execution states, results, and WebSocket events.
 */

import { create } from 'zustand';

const AGENT_DEFAULTS = {
  email_agent: { name: 'Email', icon: '📧', color: 'email', status: 'idle', steps: [], result: null, duration: 0 },
  calendar_agent: { name: 'Calendar', icon: '📅', color: 'calendar', status: 'idle', steps: [], result: null, duration: 0 },
  task_agent: { name: 'Tasks', icon: '📝', color: 'task', status: 'idle', steps: [], result: null, duration: 0 },
  notifier_agent: { name: 'Notify', icon: '🔔', color: 'notify', status: 'idle', steps: [], result: null, duration: 0 },
};

const useAgentStore = create((set, get) => ({
  // Agent states
  agents: { ...AGENT_DEFAULTS },

  // Current execution
  isExecuting: false,
  currentCommand: '',
  currentSessionId: null,
  executionSummary: '',
  dryRunMode: false,

  // History of results
  results: [],

  // Toast notifications
  toasts: [],

  // ── Actions ──

  startExecution: (command, dryRun = false) => set({
    isExecuting: true,
    currentCommand: command,
    dryRunMode: dryRun,
    executionSummary: '',
    agents: Object.fromEntries(
      Object.entries(AGENT_DEFAULTS).map(([k, v]) => [k, { ...v, status: 'idle', steps: [], result: null, duration: 0 }])
    ),
  }),

  setAgentStatus: (agentName, status) => set((state) => ({
    agents: {
      ...state.agents,
      [agentName]: { ...state.agents[agentName], status },
    },
  })),

  addAgentStep: (agentName, step) => set((state) => ({
    agents: {
      ...state.agents,
      [agentName]: {
        ...state.agents[agentName],
        steps: [...(state.agents[agentName]?.steps || []), step],
      },
    },
  })),

  completeAgent: (agentName, result, durationMs) => set((state) => ({
    agents: {
      ...state.agents,
      [agentName]: {
        ...state.agents[agentName],
        status: 'success',
        result,
        duration: durationMs,
      },
    },
  })),

  failAgent: (agentName, error) => set((state) => ({
    agents: {
      ...state.agents,
      [agentName]: {
        ...state.agents[agentName],
        status: 'error',
        result: { error },
      },
    },
  })),

  finishExecution: (sessionId, summary, agentResults) => set((state) => ({
    isExecuting: false,
    currentSessionId: sessionId,
    executionSummary: summary,
    results: [
      {
        id: sessionId,
        command: state.currentCommand,
        summary,
        agents: agentResults || state.agents,
        timestamp: new Date().toISOString(),
        dryRun: state.dryRunMode,
      },
      ...state.results.slice(0, 19),
    ],
  })),

  // Handle WebSocket message
  handleWSMessage: (msg) => {
    const { type, agent, data } = msg;
    const actions = get();

    switch (type) {
      case 'execution_start':
        actions.startExecution(data?.command || '');
        break;
      case 'agent_start':
        actions.setAgentStatus(agent, 'running');
        actions.addAgentStep(agent, data?.task || 'Starting...');
        break;
      case 'agent_progress':
        actions.addAgentStep(agent, data?.step || 'Processing...');
        break;
      case 'agent_complete':
        actions.completeAgent(agent, data, data?.duration_ms || 0);
        break;
      case 'agent_error':
        actions.failAgent(agent, data?.message || 'Unknown error');
        break;
      case 'execution_complete':
        actions.finishExecution(data?.session_id, data?.summary, null);
        break;
      case 'error':
        actions.finishExecution(null, `Error: ${data?.message}`, null);
        break;
    }
  },

  // Toast management
  addToast: (message, type = 'info') => set((state) => ({
    toasts: [...state.toasts, { id: Date.now(), message, type, timestamp: new Date() }],
  })),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  // Reset
  reset: () => set({ agents: { ...AGENT_DEFAULTS }, isExecuting: false, currentCommand: '', executionSummary: '' }),
}));

export default useAgentStore;
