import { useEffect, useState } from 'react';
import ProviderSidebar from '../components/ProviderSidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import './dashboardGlass.css';

// Captured once here instead of asked at every patient invite — every
// patient this provider invites inherits it via their provider_id (looked
// up at read time, not copied per-patient, so it stays correct if it's ever
// updated).
export default function ProviderSettings() {
  const { profile, session } = useAuth();
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalZip, setHospitalZip] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session) return;
    supabase.from('profiles').select('hospital_name, hospital_zip').eq('id', session.user.id).single()
      .then(({ data }) => {
        setHospitalName(data?.hospital_name ?? '');
        setHospitalZip(data?.hospital_zip ?? '');
        setLoading(false);
      });
  }, [session]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ hospital_name: hospitalName.trim() || null, hospital_zip: hospitalZip.trim() || null })
      .eq('id', session.user.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="ep-shell-dash gl-shell">
      <ProviderSidebar active="Settings" />

      <div className="ep-main">
      <div className="gl-dash">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Settings</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>{profile?.full_name}</p>
        </div>

        {!loading && (
          <form onSubmit={save} className="card elev-sm" style={{ maxWidth: 480, gap: 'var(--space-3)' }}>
            <span className="card-kicker">Your hospital / clinic</span>
            <p className="card-body" style={{ fontSize: 13 }}>
              Every patient you invite inherits this automatically — they won't need to look up or select their own care location.
            </p>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>Hospital / clinic name</label>
              <input className="input" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="e.g. Ochsner Medical Center" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>Zip code</label>
              <input
                className="input"
                value={hospitalZip}
                onChange={(e) => setHospitalZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="e.g. 70121"
                inputMode="numeric"
                maxLength={5}
                style={{ width: 140 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              {saved && <span className="tag tag-accent">Saved</span>}
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
