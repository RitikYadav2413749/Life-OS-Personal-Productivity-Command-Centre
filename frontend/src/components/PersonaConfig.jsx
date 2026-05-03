/**
 * Life OS — Persona Config
 * User preferences panel for timezone, working hours, and notification settings.
 */

import { useEffect, useState } from 'react';
import { Settings, Save } from 'lucide-react';
import useMemoryStore from '../stores/useMemoryStore';
import './PersonaConfig.css';

export default function PersonaConfig() {
  const persona = useMemoryStore((s) => s.persona);
  const fetchPersona = useMemoryStore((s) => s.fetchPersona);
  const updatePersona = useMemoryStore((s) => s.updatePersona);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPersona();
  }, [fetchPersona]);

  useEffect(() => {
    if (persona) setForm(persona);
  }, [persona]);

  const handleSave = async () => {
    await updatePersona(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="persona-config">
      <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Settings size={12} /> Preferences
      </div>

      <div className="persona-fields">
        <label className="persona-field">
          <span>Name</span>
          <input
            type="text"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="persona-input"
            id="persona-name"
          />
        </label>

        <label className="persona-field">
          <span>Timezone</span>
          <input
            type="text"
            value={form.timezone || ''}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className="persona-input"
            id="persona-timezone"
          />
        </label>

        <label className="persona-field">
          <span>Style</span>
          <select
            value={form.communication_style || 'casual'}
            onChange={(e) => setForm({ ...form, communication_style: e.target.value })}
            className="persona-input"
            id="persona-style"
          >
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="brief">Brief</option>
          </select>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
          <label className="persona-field">
            <span>Work Start</span>
            <input
              type="text"
              value={form.working_hours_start || '09:00'}
              onChange={(e) => setForm({ ...form, working_hours_start: e.target.value })}
              className="persona-input"
            />
          </label>
          <label className="persona-field">
            <span>Work End</span>
            <input
              type="text"
              value={form.working_hours_end || '18:00'}
              onChange={(e) => setForm({ ...form, working_hours_end: e.target.value })}
              className="persona-input"
            />
          </label>
        </div>
      </div>

      <button className="btn btn-sm" onClick={handleSave} id="save-persona" style={{ width: '100%', justifyContent: 'center' }}>
        <Save size={14} /> {saved ? 'Saved ✓' : 'Save'}
      </button>
    </div>
  );
}
