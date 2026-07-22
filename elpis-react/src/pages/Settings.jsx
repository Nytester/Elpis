import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';

function Switch({ checked, onChange, label }) {
  return (
    <label className="ep-switch" aria-label={label}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="ep-switch-slider" />
    </label>
  );
}

const INITIAL_NOTIFICATIONS = [
  { id: 'appointments', label: 'Appointment reminders', desc: 'Get notified before upcoming scans, infusions and follow-ups.', on: true },
  { id: 'medications', label: 'Medication reminders', desc: 'Reminders for scheduled doses throughout the day.', on: true },
  { id: 'messages', label: 'Care team messages', desc: 'Alerts when your care team replies.', on: true },
  { id: 'symptoms', label: 'Symptom check-in reminders', desc: 'A gentle nudge if you haven’t logged how you’re feeling in a few days.', on: false },
];

const INITIAL_CIRCLE = [
  { id: 'sam', name: 'Sam Chen', relationship: 'Caregiver', hasAccess: true },
];

const LANGUAGES = ['English', 'Español', 'Tiếng Việt', 'Français'];

export default function Settings() {
  const [profile, setProfile] = useState({ name: 'Maya Chen', email: 'maya.chen@example.com', phone: '(555) 012-4488' });
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const toggleNotification = (id) => setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, on: !n.on } : n));

  const [circle, setCircle] = useState(INITIAL_CIRCLE);
  const toggleAccess = (id) => setCircle((c) => c.map((p) => p.id === id ? { ...p, hasAccess: !p.hasAccess } : p));
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('Caregiver');

  const [language, setLanguage] = useState(LANGUAGES[0]);

  const saveProfile = (e) => {
    e.preventDefault();
    setProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sendInvite = (e) => {
    e.preventDefault();
    const name = inviteName.trim();
    if (!name) return;
    setCircle((c) => [...c, { id: `${Date.now()}`, name, relationship: inviteRelationship, hasAccess: true }]);
    setInviteName('');
    setInviteRelationship('Caregiver');
    setShowInvite(false);
  };

  return (
    <div className="ep-shell-dash">
      <Sidebar active="Settings" />

      <div className="ep-main">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Settings</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Manage your profile, notifications, and who has access to your care.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 680 }}>
          {/* Profile */}
          <form onSubmit={saveProfile} className="card elev-sm" style={{ gap: 'var(--space-3)' }}>
            <span className="card-kicker">Profile</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>Full name</label>
                <input className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>Email</label>
                <input className="input" type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>Phone</label>
                <input className="input" type="tel" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button type="submit" className="btn btn-primary">Save changes</button>
              {saved && <span className="tag tag-accent">Saved</span>}
            </div>
          </form>

          {/* Notifications */}
          <div className="card elev-sm">
            <span className="card-kicker">Notifications</span>
            <div style={{ marginTop: 4 }}>
              {notifications.map((n) => (
                <div key={n.id} className="ep-setting-row">
                  <div>
                    <div style={{ fontSize: 14 }}>{n.label}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{n.desc}</div>
                  </div>
                  <Switch checked={n.on} onChange={() => toggleNotification(n.id)} label={n.label} />
                </div>
              ))}
            </div>
          </div>

          {/* Care circle */}
          <div className="card elev-sm">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="card-kicker">Care circle access</span>
              <button className="btn btn-secondary" type="button" onClick={() => setShowInvite((s) => !s)}>+ Invite someone</button>
            </div>
            <p className="card-body" style={{ fontSize: 12 }}>People with access can view your dashboard, journey timeline, and documents.</p>

            {showInvite && (
              <form onSubmit={sendInvite} style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 4 }}>
                <input
                  className="input"
                  placeholder="Name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  style={{ flex: 2, minWidth: 160 }}
                  autoFocus
                />
                <select className="input" value={inviteRelationship} onChange={(e) => setInviteRelationship(e.target.value)} style={{ flex: 1, minWidth: 140 }}>
                  <option>Caregiver</option>
                  <option>Family member</option>
                  <option>Friend</option>
                </select>
                <button type="submit" className="btn btn-primary" disabled={!inviteName.trim()}>Send invite</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
              </form>
            )}

            <div style={{ marginTop: 4 }}>
              {circle.map((p) => (
                <div key={p.id} className="ep-setting-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="ep-avatar">{p.name.split(' ').map((w) => w[0]).join('')}</div>
                    <div>
                      <div style={{ fontSize: 14 }}>{p.name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{p.relationship}</div>
                    </div>
                  </div>
                  <Switch checked={p.hasAccess} onChange={() => toggleAccess(p.id)} label={`${p.name} access`} />
                </div>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="card elev-sm">
            <span className="card-kicker">Language</span>
            <h4 className="card-title">Display language</h4>
            <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ maxWidth: 220 }}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
