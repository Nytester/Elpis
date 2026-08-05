import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';
import './dashboardGlass.css';

const CONTACT_COLORS = { osei: '#1d7a5f', tran: '#7a4fb8', chen: '#b5732a' };

const CONTACTS = [
  {
    id: 'osei', initials: 'RO', name: 'Dr. Rina Osei', role: 'Oncologist',
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
        <div className="gl-dash" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <h1 className="gl-greeting" style={{ flex: 1 }}>Care Team</h1>
            <span style={{ fontSize: 13, color: 'rgba(34,48,43,.55)' }}>Message your oncologist, nurse navigator, and caregivers directly.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 18, flex: 1, minHeight: 0 }}>
            {/* Contact list */}
            <div className="gl-panel" style={{ padding: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {CONTACTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`gl-contact${c.id === activeId ? ' active' : ''}`}
                >
                  <div className="gl-avatar" style={{ width: 34, height: 34, fontSize: 12, background: CONTACT_COLORS[c.id] }}>{c.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: c.id === activeId ? 600 : 500 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(34,48,43,.55)' }}>{c.role}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Thread */}
            <div className="gl-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(34,48,43,.1)' }}>
                <div className="gl-avatar" style={{ width: 34, height: 34, fontSize: 12, background: CONTACT_COLORS[activeContact.id] }}>{activeContact.initials}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{activeContact.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(34,48,43,.55)' }}>{activeContact.role}</div>
                </div>
              </div>

              <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, padding: '12px 4px' }}>
                {activeMessages.length === 0 && (
                  <p style={{ fontSize: 13, color: 'rgba(34,48,43,.5)', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                    No messages yet — start the conversation below.
                  </p>
                )}
                {activeMessages.map((m, i) => (
                  <div key={m.id ?? i} className={`gl-msg ${m.from === 'me' ? 'gl-msg-out' : 'gl-msg-in'}`}>
                    <div>{m.text}</div>
                    <div className="gl-msg-time">{m.time}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', paddingTop: 12, borderTop: '1px solid rgba(34,48,43,.1)' }}>
                <textarea
                  className="gl-input"
                  rows={1}
                  placeholder={`Message ${activeContact.name.split(',')[0]}...`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ resize: 'none', flex: 1 }}
                />
                <button className="gl-pill gl-pill-primary" onClick={handleSend} disabled={!draft.trim()} style={{ border: 'none', opacity: draft.trim() ? 1 : .5, padding: '10px 20px' }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
