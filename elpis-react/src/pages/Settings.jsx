import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';
import './dashboardGlass.css';

// Real, self-reported home zip — used to default the Transportation search
// instead of asking every time. Independent of how the patient logged in
// (works today with email/password, will keep working once Google auth is
// added, since it only needs the existing session).
function HomeZipCard() {
  const { homeZip, setHomeZip } = usePatientData();
  const [zip, setZip] = useState('');
  const [saved, setSaved] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setZip(homeZip ?? ''); }, [homeZip]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await setHomeZip(zip.trim());
    setSaving(false);
    if (!error) {
      setSaved('Saved');
      setTimeout(() => setSaved(''), 2000);
    }
  };

  return (
    <form onSubmit={save} className="gl-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span className="gl-kicker">Location</span>
      <div style={{ fontSize: 15, fontWeight: 600 }}>Home zip code</div>
      <p style={{ fontSize: 12.5, color: 'rgba(34,48,43,.6)', margin: 0 }}>Used to default Transportation searches to your own area, so you're not typing it in every time.</p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
        <input
          className="gl-input"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
          placeholder="e.g. 70115"
          inputMode="numeric"
          maxLength={5}
          style={{ width: 140 }}
        />
        <button type="submit" className="gl-pill gl-pill-primary" style={{ border: 'none' }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        {saved && <span className="gl-tag">{saved}</span>}
      </div>
    </form>
  );
}

// .ep-switch/.ep-setting-row/.ep-avatar are reused unchanged — they're
// already driven entirely by var(--color-*) tokens, which .gl-dash
// redefines, so they pick up the glass palette automatically without needing
// their own gl- variants.
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
    <div className="ep-shell-dash gl-shell">
      <Sidebar active="Settings" />

      <div className="ep-main">
        <div className="gl-dash">
          <div style={{ marginBottom: 20 }}>
            <h1 className="gl-greeting">Settings</h1>
            <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)', marginTop: 4 }}>Manage your profile, notifications, and who has access to your care.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680 }}>
            {/* Profile */}
            <form onSubmit={saveProfile} className="gl-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="gl-kicker">Profile</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(34,48,43,.55)' }}>Full name</label>
                  <input className="gl-input" style={{ width: '100%', marginTop: 4 }} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(34,48,43,.55)' }}>Email</label>
                  <input className="gl-input" style={{ width: '100%', marginTop: 4 }} type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(34,48,43,.55)' }}>Phone</label>
                  <input className="gl-input" style={{ width: '100%', marginTop: 4 }} type="tel" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <button type="submit" className="gl-pill gl-pill-primary" style={{ border: 'none' }}>Save changes</button>
                {saved && <span className="gl-tag">Saved</span>}
              </div>
            </form>

            <HomeZipCard />

            {/* Notifications */}
            <div className="gl-panel" style={{ padding: 18 }}>
              <span className="gl-kicker">Notifications</span>
              <div style={{ marginTop: 4 }}>
                {notifications.map((n) => (
                  <div key={n.id} className="ep-setting-row">
                    <div>
                      <div style={{ fontSize: 14 }}>{n.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(34,48,43,.55)' }}>{n.desc}</div>
                    </div>
                    <Switch checked={n.on} onChange={() => toggleNotification(n.id)} label={n.label} />
                  </div>
                ))}
              </div>
            </div>

            {/* Care circle */}
            <div className="gl-panel" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="gl-kicker">Care circle access</span>
                <button className="gl-pill" type="button" onClick={() => setShowInvite((s) => !s)}>+ Invite someone</button>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(34,48,43,.6)', marginTop: 6 }}>People with access can view your dashboard, journey timeline, and documents.</p>

              {showInvite && (
                <form onSubmit={sendInvite} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  <input
                    className="gl-input"
                    placeholder="Name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    style={{ flex: 2, minWidth: 160 }}
                    autoFocus
                  />
                  <select className="gl-input" value={inviteRelationship} onChange={(e) => setInviteRelationship(e.target.value)} style={{ flex: 1, minWidth: 140 }}>
                    <option>Caregiver</option>
                    <option>Family member</option>
                    <option>Friend</option>
                  </select>
                  <button type="submit" className="gl-pill gl-pill-primary" style={{ border: 'none' }} disabled={!inviteName.trim()}>Send invite</button>
                  <button type="button" className="gl-pill" onClick={() => setShowInvite(false)}>Cancel</button>
                </form>
              )}

              <div style={{ marginTop: 4 }}>
                {circle.map((p) => (
                  <div key={p.id} className="ep-setting-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="ep-avatar">{p.name.split(' ').map((w) => w[0]).join('')}</div>
                      <div>
                        <div style={{ fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(34,48,43,.55)' }}>{p.relationship}</div>
                      </div>
                    </div>
                    <Switch checked={p.hasAccess} onChange={() => toggleAccess(p.id)} label={`${p.name} access`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="gl-panel" style={{ padding: 18 }}>
              <span className="gl-kicker">Language</span>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, marginBottom: 8 }}>Display language</div>
              <select className="gl-input" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ maxWidth: 220 }}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
