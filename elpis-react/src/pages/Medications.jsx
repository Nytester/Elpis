import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';
import './dashboardGlass.css';

const MEDICATIONS = [
  { id: 1, name: 'Ondansetron 8mg', purpose: 'Prevents nausea from chemo', type: 'As needed', frequency: 'As needed, up to 3x/day', prescriber: 'Dr. Rina Osei', refillDate: 'Aug 1, 2026', times: ['8:00 AM'] },
  { id: 2, name: 'Dexamethasone 4mg', purpose: 'Reduces inflammation & nausea', type: 'Scheduled', frequency: 'Once daily during chemo cycles', prescriber: 'Dr. Rina Osei', refillDate: 'Aug 1, 2026', times: ['8:00 AM'] },
  { id: 3, name: 'Lorazepam 0.5mg', purpose: 'Anxiety & anticipatory nausea', type: 'As needed', frequency: 'As needed, up to 2x/day', prescriber: 'Dr. Rina Osei', refillDate: 'Jul 30, 2026', times: ['12:00 PM'] },
  { id: 4, name: 'Prochlorperazine 10mg', purpose: 'Nausea & vomiting', type: 'As needed', frequency: 'As needed, up to 3x/day', prescriber: 'Dr. Rina Osei', refillDate: 'Aug 5, 2026', times: ['6:00 PM'] },
  { id: 5, name: 'Docusate Sodium 100mg', purpose: 'Constipation prevention', type: 'Scheduled', frequency: 'Twice daily', prescriber: 'Dr. Rina Osei', refillDate: 'Aug 10, 2026', times: ['8:00 AM', '8:00 PM'] },
  { id: 6, name: 'Filgrastim Injection', purpose: 'Boosts white blood cell count', type: 'Scheduled', frequency: 'Daily x7 days after each cycle', prescriber: 'Jordan Tran, RN', refillDate: 'Course completed Jul 10', times: [] },
];

const INITIAL_DONE = { '1-8:00 AM': true, '2-8:00 AM': true, '3-12:00 PM': true, '4-6:00 PM': false, '5-8:00 AM': true, '5-8:00 PM': false };

const TYPE_TAG = { Scheduled: 'gl-tag', 'As needed': 'gl-tag-accent' };

export default function Medications() {
  const { requestRefill: requestRefillShared } = usePatientData();
  const [doneDoses, setDoneDoses] = useState(INITIAL_DONE);
  const [meds, setMeds] = useState(MEDICATIONS.map((m) => ({ ...m, refillRequested: false })));

  const doses = MEDICATIONS.flatMap((m) => m.times.map((time) => ({ medId: m.id, name: m.name, time, key: `${m.id}-${time}` })));
  const takenCount = doses.filter((d) => doneDoses[d.key]).length;

  const toggleDose = (key) => setDoneDoses((d) => ({ ...d, [key]: !d[key] }));

  const requestRefill = (id) => {
    setMeds((ms) => ms.map((m) => m.id === id ? { ...m, refillRequested: true } : m));
    const med = meds.find((m) => m.id === id);
    if (med) requestRefillShared(med.name);
  };

  return (
    <div className="ep-shell-dash gl-shell">
      <Sidebar active="Medications" />

      <div className="ep-main">
        <div className="gl-dash">
          <div style={{ marginBottom: 20 }}>
            <h1 className="gl-greeting">Medications</h1>
            <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)', marginTop: 4 }}>Today's schedule and your full medication list.</p>
          </div>

          <div className="gl-panel" style={{ padding: 18, marginBottom: 20 }}>
            <span className="gl-kicker">Today's schedule</span>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{takenCount} of {doses.length} taken</div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              {doses.map((dose) => (
                <div key={dose.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                  <span className={`gl-check${doneDoses[dose.key] ? ' done' : ''}`} onClick={() => toggleDose(dose.key)}>
                    {doneDoses[dose.key] && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14 }}>{dose.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(34,48,43,.55)' }}>{dose.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>All medications</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {meds.map((med) => (
              <div key={med.id} className="gl-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className={`gl-tag ${TYPE_TAG[med.type]}`} style={{ alignSelf: 'flex-start' }}>{med.type}</span>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{med.name}</div>
                <p style={{ fontSize: 12, color: 'rgba(34,48,43,.7)', margin: 0 }}>{med.purpose}</p>
                <p style={{ fontSize: 11, color: 'rgba(34,48,43,.55)', margin: 0 }}>{med.frequency}</p>
                <p style={{ fontSize: 11, color: 'rgba(34,48,43,.55)', margin: 0 }}>Prescribed by {med.prescriber}</p>
                <p style={{ fontSize: 11, color: 'rgba(34,48,43,.55)', margin: 0 }}>Refill: {med.refillDate}</p>
                {med.refillRequested ? (
                  <span className="gl-tag gl-tag-accent" style={{ alignSelf: 'flex-start', marginTop: 6 }}>Refill requested</span>
                ) : (
                  <button className="gl-pill" style={{ width: '100%', marginTop: 6, border: '1px solid rgba(34,48,43,.15)' }} onClick={() => requestRefill(med.id)}>Request refill</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
