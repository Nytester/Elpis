import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';

const CONTACTS = [
  {
    id: 'osei', initials: 'DR', name: 'Dr. Rina Osei', role: 'Oncologist',
    messages: [],
  },
  {
    id: 'tran', initials: 'JT', name: 'Jordan Tran, RN', role: 'Nurse Navigator',
    messages: [
      { from: 'them', text: "Reminder: please arrive 20 minutes early tomorrow for pre-infusion bloodwork.", time: 'Today 9:02 AM' },
      { from: 'me', text: "Got it — will the transportation voucher still be available at the front desk?", time: 'Today 9:15 AM' },
      { from: 'them', text: "Yes, just ask for me at check-in and I'll have it ready.", time: 'Today 9:20 AM' },
    ],
  },
  {
    id: 'chen', initials: 'SC', name: 'Sam Chen', role: 'Caregiver',
    messages: [
      { from: 'them', text: "I can drive you to the infusion tomorrow, what time should I pick you up?", time: 'Yesterday 7:40 PM' },
      { from: 'me', text: "That would be great — 8:45 AM? Appointment is at 9:30.", time: 'Yesterday 7:52 PM' },
      { from: 'them', text: "Works for me. I'll bring snacks too.", time: 'Yesterday 8:01 PM' },
    ],
  },
];

export default function CareTeam() {
  const { messages: oseiMessages, sendMessage: sendOseiMessage } = usePatientData();
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get('contact');
  const initialId = CONTACTS.some((c) => c.id === requestedId) ? requestedId : CONTACTS[0].id;

  const [threads, setThreads] = useState(() =>
    Object.fromEntries(CONTACTS.filter((c) => c.id !== 'osei').map((c) => [c.id, c.messages]))
  );
  const [activeId, setActiveId] = useState(initialId);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  const activeMessages = activeId === 'osei' ? oseiMessages : threads[activeId];

  useEffect(() => {
    if (CONTACTS.some((c) => c.id === requestedId)) setActiveId(requestedId);
  }, [requestedId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [activeMessages, activeId]);

  const activeContact = CONTACTS.find((c) => c.id === activeId);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    if (activeId === 'osei') {
      sendOseiMessage(text);
    } else {
      const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setThreads((t) => ({
        ...t,
        [activeId]: [...t[activeId], { from: 'me', text, time: `Today ${time}` }],
      }));
    }
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ep-shell-dash">
      <Sidebar active="Care Team" />

      <div className="ep-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Care Team</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Message your oncologist, nurse navigator, and caregivers directly.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--space-4)', flex: 1, minHeight: 0 }}>
          {/* Contact list */}
          <div className="card elev-sm" style={{ padding: 'var(--space-2)', overflowY: 'auto' }}>
            {CONTACTS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className="ep-contact"
                style={{
                  width: '100%', textAlign: 'left', background: c.id === activeId ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'transparent',
                  border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 10px', cursor: 'pointer',
                }}
              >
                <div className="ep-avatar">{c.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: c.id === activeId ? 600 : 400 }}>{c.name}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>{c.role}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Thread */}
          <div className="card elev-sm" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, padding: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-divider)' }}>
              <div className="ep-avatar">{activeContact.initials}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{activeContact.name}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>{activeContact.role}</div>
              </div>
            </div>

            <div ref={scrollRef} className="ep-msg-thread">
              {activeMessages.map((m, i) => (
                <div key={m.id ?? i} className={`ep-msg ${m.from === 'me' ? 'ep-msg-out' : 'ep-msg-in'}`}>
                  <div>{m.text}</div>
                  <div className="ep-msg-time">{m.time}</div>
                </div>
              ))}
            </div>

            <div className="ep-msg-input-row">
              <textarea
                className="input"
                rows={1}
                placeholder={`Message ${activeContact.name.split(',')[0]}...`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ resize: 'none', flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleSend} disabled={!draft.trim()}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
