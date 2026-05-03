/**
 * Life OS — Memory Store (Zustand)
 * Manages user context, history, and persona from the Redis-backed API.
 */

import { create } from 'zustand';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Safe JSON fetch — returns null if the backend is unreachable
 * or the response isn't valid JSON.
 */
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    // Backend not running — silently ignore
    return null;
  }
}

const useMemoryStore = create((set) => ({
  persona: null,
  historySummary: '',
  recentCommands: [],
  pendingReminders: [],
  suggestions: [],
  history: [],
  isLoading: false,

  // Fetch persona from API
  fetchPersona: async (userId = 'user_001') => {
    const data = await safeFetch(`${API}/api/persona?user_id=${userId}`);
    if (data) set({ persona: data });
  },

  // Fetch memory context
  fetchMemoryContext: async (userId = 'user_001') => {
    set({ isLoading: true });
    const data = await safeFetch(`${API}/api/memory/context?user_id=${userId}`);
    if (data) {
      set({
        persona: data.persona,
        historySummary: data.history_summary || '',
        recentCommands: data.recent_commands || [],
        pendingReminders: data.pending_reminders || [],
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },

  // Fetch command history
  fetchHistory: async (userId = 'user_001', count = 20) => {
    const data = await safeFetch(`${API}/api/history?user_id=${userId}&count=${count}`);
    if (data) set({ history: data.history || [] });
  },

  // Fetch suggestions
  fetchSuggestions: async (userId = 'user_001') => {
    const data = await safeFetch(`${API}/api/suggestions?user_id=${userId}`);
    if (data) set({ suggestions: data.suggestions || [] });
  },

  // Update persona
  updatePersona: async (updates, userId = 'user_001') => {
    const data = await safeFetch(`${API}/api/persona?user_id=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (data) set({ persona: data });
  },

  // Clear memory
  clearMemory: async (userId = 'user_001') => {
    await safeFetch(`${API}/api/memory/context?user_id=${userId}`, { method: 'DELETE' });
    set({ historySummary: '', recentCommands: [], pendingReminders: [] });
  },
}));

export default useMemoryStore;
