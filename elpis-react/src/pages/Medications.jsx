import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';

const MEDICATIONS = [
  { id: 1, name: 'Ondansetron 8mg', purpose: 'Prevents nausea from chemo', type: 'As needed', frequency: 'As needed, up to 3x/day', prescriber: 'Dr. Rina Osei', refillDate: 'Aug 1, 2026', times: ['8:00 AM'] },
  { id: 2, name: 'Dexamethasone 4mg', purpose: 'Reduces inflammation & nausea', type: 'Scheduled', frequency: 'Once daily during chemo cycles', prescriber: 'Dr. Rina Osei', refillDate: 'Aug 1, 2026', times: ['8:00 AM'] },
  { id: 3, name: 'Lorazepam 0.5mg', purpose: 'Anxiety & anticipatory nausea', type: 'As needed', frequency: 'As needed, up to 2x/day', prescriber: 'Dr. Rina Osei', refillDate: 'Jul 30, 2026', times: ['12:00 PM'] },
  { id: 4, name: 'Prochlorperazine 10mg', purpose: 'Nausea & vomiting', type: 'As needed', frequency: 'As needed, up to 3x/day', prescriber: 'Dr. Rina Osei', refillDate: 'Aug 5, 2026', times: ['6:00 PM'] },
  { id: 5, name: 'Docusate Sodium 100mg', purpose: 'Constipation prevention', type: 'Scheduled', frequency: 'Twice daily', prescriber: 'Dr. Rina Osei', refillDate: 'Aug 10, 2026', times: ['8:00 AM', '8:00 PM'] },
  { id: 6, name: 'Filgrastim Injection', purpose: 'Boosts white blood cell count', type: 'Scheduled', frequency: 'Daily x7 days after each cycle', prescriber: 'Jordan Tran, RN', refillDate: 'Course completed Jul 10', times: [] },
];

const INITIAL_DONE = { '1-8:00 AM': true, '2-8:00 AM': true, '3-12:00 PM': true, '4-6:00 PM': false, '5-8:00 AM': true, '5-8:00 PM': false };

const TYPE_TAG = { Scheduled: 'tag-neutral', 'As needed': 'tag-accent-2' };

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
    <div className="ep-shell-dash">
      <Sidebar active="Medications" />

      <div className="ep-main">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Medications</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Today's schedule and your full medication list.</p>
        </div>

        <div className="card elev-sm" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="card-kicker">Today's schedule</span>
          <h4 className="card-title">{takenCount} of {doses.length} taken</h4>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
            {doses.map((dose) => (
              <div key={dose.key} className="ep-medrow">
                <span className={`ep-check${doneDoses[dose.key] ? ' done' : ''}`} onClick={() => toggleDose(dose.key)}>
                  {doneDoses[dose.key] && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{dose.name}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>{dose.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>All medications</h2>
        <div className="ep-resource-grid">
          {meds.map((med) => (
            <div key={med.id} className="card elev-sm">
              <span className={`tag ${TYPE_TAG[med.type]}`} style={{ alignSelf: 'flex-start' }}>{med.type}</span>
              <h3 className="card-title" style={{ fontSize: 15, marginTop: 4 }}>{med.name}</h3>
              <p className="card-body" style={{ fontSize: 12 }}>{med.purpose}</p>
              <p className="text-muted" style={{ fontSize: 11, margin: 0 }}>{med.frequency}</p>
              <p className="text-muted" style={{ fontSize: 11, margin: 0 }}>Prescribed by {med.prescriber}</p>
              <p className="text-muted" style={{ fontSize: 11, margin: 0 }}>Refill: {med.refillDate}</p>
              {med.refillRequested ? (
                <span className="tag tag-accent" style={{ alignSelf: 'flex-start', marginTop: 6 }}>Refill requested</span>
              ) : (
                <button className="btn btn-secondary btn-block" onClick={() => requestRefill(med.id)}>Request refill</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
