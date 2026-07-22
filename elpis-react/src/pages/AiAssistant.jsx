import { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';

const QUICK_PROMPTS = [
  "What's my next appointment?",
  "What are today's medications?",
  'What should I expect from Cycle 4?',
  "Who's on my care team?",
];

const RULES = [
  {
    keywords: ['appointment', 'infusion', 'schedule'],
    response: "Your next appointment is Chemotherapy infusion — Cycle 4, tomorrow (Friday, July 17) at 9:30 AM at Dana-Farber Infusion Suite, Room 12. Want me to remind Sam Chen to arrange a ride, or add it to your calendar?",
  },
  {
    keywords: ['medication', 'meds', 'dose', 'pill'],
    response: "Today you have 4 doses scheduled: Ondansetron 8mg (8:00 AM), Dexamethasone 4mg (8:00 AM), Lorazepam 0.5mg (12:00 PM), and Prochlorperazine 10mg (6:00 PM). You've taken 3 of 4 so far — Prochlorperazine is still due tonight.",
  },
  {
    keywords: ['cycle 4', 'what to expect', 'chemo', 'chemotherapy'],
    response: 'Cycle 4 is your final scheduled infusion in this treatment block — it typically takes about 3 hours. In the 24–48 hours after, fatigue and mild nausea are common, and your anti-nausea medications are already scheduled for tomorrow.',
  },
  {
    keywords: ['nausea', 'symptom', 'sick', 'feel'],
    response: "You logged Nausea as Moderate yesterday. Ondansetron and Prochlorperazine are your as-needed options — you can log a new symptom any time from the Symptoms page, and I'll flag patterns to Dr. Osei and Jordan Tran.",
  },
  {
    keywords: ['diagnosis', 'stage', 'cancer type'],
    response: "You were diagnosed with Stage IIB cancer on May 2, 2026, following your pathology report and staging CT scan. You're currently in the Treatment phase — Surveillance begins after your post-treatment scan in August.",
  },
  {
    keywords: ['care team', 'doctor', 'nurse', 'oncologist'],
    response: 'Your care team is Dr. Rina Osei (Oncologist), Jordan Tran, RN (Nurse Navigator), and Sam Chen (Caregiver). You can message any of them directly from the Care Team page.',
  },
  {
    keywords: ['transport', 'ride', 'drive'],
    response: "Jordan Tran noted a transportation voucher will be available at check-in tomorrow. There's also the Road To Recovery volunteer ride program listed under Resources if you need a ride to a future appointment.",
  },
  {
    keywords: ['financial', 'cost', 'insurance', 'bill', 'money'],
    response: 'Your insurance pre-authorization was completed on June 15. If costs come up, the Ochsner Financial Assistance Program is listed under Resources and can help offset expenses.',
  },
];

const FALLBACK = "I don't have specific information on that yet, but I can connect you with your care team, or you can check the Resources page for more support.";

function matchResponse(text) {
  const lower = text.toLowerCase();
  const rule = RULES.find((r) => r.keywords.some((k) => lower.includes(k)));
  return rule ? rule.response : FALLBACK;
}

const INITIAL_MESSAGES = [
  { from: 'ai', text: "Hi Maya, I'm your Elpis Assistant. Ask me about your medications, appointments, symptoms, or what's next in your care journey.", time: 'Today' },
];

export default function AiAssistant() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, typing]);

  const send = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setMessages((m) => [...m, { from: 'me', text: trimmed, time: `Today ${time}` }]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'ai', text: matchResponse(trimmed), time: `Today ${time}` }]);
      setTyping(false);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  };

  return (
    <div className="ep-shell-dash">
      <Sidebar active="AI Assistant" />

      <div className="ep-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>AI Assistant</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Ask about symptoms, meds, or what's next — grounded in your own chart.</p>
        </div>

        <div className="card elev-sm" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-divider)' }}>
            <div className="ep-avatar" style={{ background: 'var(--color-accent)', color: 'white' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 1 1-4-7.2" /><path d="M21 4v6h-6" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Elpis Assistant</div>
              <div className="text-muted" style={{ fontSize: 11 }}>Grounded in your chart</div>
            </div>
          </div>

          <div ref={scrollRef} className="ep-msg-thread">
            {messages.map((m, i) => (
              <div key={i} className={`ep-msg ${m.from === 'me' ? 'ep-msg-out' : 'ep-msg-in'}`}>
                <div>{m.text}</div>
                <div className="ep-msg-time">{m.time}</div>
              </div>
            ))}
            {typing && <div className="ep-msg ep-msg-in" style={{ fontStyle: 'italic', color: 'var(--color-neutral-600)' }}>Elpis is typing…</div>}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: 'var(--space-2) 0' }}>
            {QUICK_PROMPTS.map((p) => (
              <button key={p} className="ep-chip" onClick={() => send(p)}>{p}</button>
            ))}
          </div>

          <div className="ep-msg-input-row">
            <textarea
              className="input"
              rows={1}
              placeholder="Ask Elpis..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ resize: 'none', flex: 1 }}
            />
            <button className="btn btn-primary" onClick={() => send(draft)} disabled={!draft.trim()}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
