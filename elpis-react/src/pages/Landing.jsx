import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../pages/dashboardGlass.css';

// Wraps a section in a fade/slide-up that plays once, the moment it scrolls
// into view — a single shared IntersectionObserver per instance rather than
// a scroll listener, and it disconnects itself after triggering once so it
// never re-runs on scroll-back. `delay` (ms) lets sibling sections stagger.
function Reveal({ children, as: Tag = 'div', className = '', style, delay = 0, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`gl-reveal${inView ? ' gl-reveal-in' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Simple monochrome line-icon set (24x24, stroke-only) — one glyph per
// feature row, no icon library, so it stays consistent with the rest of the
// hand-drawn inline SVGs already used across the app.
const ICONS = {
  timeline: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  assistant: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16v10H9l-4 4v-4H4V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="12" cy="10" r="1" fill="currentColor" /><circle cx="15" cy="10" r="1" fill="currentColor" /></svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="17" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.6" /><path d="M15.5 12.2c2.5.3 4.5 2.5 4.5 5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  pill: (
    <svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="10.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 14)" stroke="currentColor" strokeWidth="1.6" /><path d="M9.5 10.5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9.5 12.5h5M9.5 15.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  lifering: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.6" /><path d="M6.3 6.3l3.3 3.3M17.7 6.3l-3.3 3.3M6.3 17.7l3.3-3.3M17.7 17.7l-3.3-3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" /></svg>
  ),
  patient: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
};

// "Everyone in the loop" — patient/caregiver/care-team cards linked by
// curved connector lines meeting at one point. Solid-white polaroid cards
// (opaque, shadow-only edge, no blur) — the one section on this page that
// deliberately steps outside the glass system, by request.
const CONNECTED = [
  { icon: 'patient', name: 'Patient', desc: 'Logs symptoms, sees the Journey Timeline, messages the care team directly.', cls: 'card--patient' },
  { icon: 'people', name: 'Caregiver', desc: 'Follows along, helps track medications, and steps in without re-asking every detail.', cls: 'card--caregiver' },
  { icon: 'assistant', name: 'Care team', desc: 'Oncologists and nurse navigators see updates in real time, no phone tag required.', cls: 'card--team' },
];

function ConnectedCareSection() {
  return (
    <div className="ep-container gl-connect-scene">
      <Reveal className="gl-connect-head">
        <span className="gl-kicker">Always connected</span>
        <h2 className="gl-connect-title">Care doesn&apos;t happen<br /><em>in one place —</em><br />neither should the record of it.</h2>
        <p>Patients, caregivers and care teams each see the same picture, updated as it happens.</p>
      </Reveal>

      <div className="gl-connect-canvas">
        <svg className="gl-connect-lines" viewBox="0 0 880 380" role="img" aria-label="Three connected cards: Patient, Caregiver, and Care Team, linked by curved lines meeting at a shared center point">
          <path className="gl-connect-path" d="M 160 90 Q 340 40, 440 190" />
          <path className="gl-connect-path" d="M 720 100 Q 560 50, 440 190" />
          <path className="gl-connect-path" d="M 350 300 Q 400 240, 440 190" />
          <circle className="gl-connect-node" cx="440" cy="190" r="5" />
          <circle className="gl-connect-node-ring" cx="440" cy="190" r="11" />
        </svg>

        {CONNECTED.map((c, i) => (
          <Reveal key={c.name} as="div" className={`gl-connect-card ${c.cls}`} delay={i * 120}>
            <div className="gl-connect-icon">{ICONS[c.icon]}</div>
            <h4>{c.name}</h4>
            <p>{c.desc}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// A rotating cast of accent hues — one per feature panel, borrowed from tags
// already used elsewhere in the app (mint/gold/purple/sky) — so the seven
// blocks read as distinct sections instead of one repeated template stamped
// seven times. Panels stay glass (blur + translucency); only the tint and
// the accent color of their real UI bits (checkmarks, avatars, dots) rotate.
const ACCENTS = [
  { name: 'mint', solid: '#1d7a5f', wash: 'rgba(29,122,95,.14)' },
  { name: 'gold', solid: '#b5732a', wash: 'rgba(181,115,42,.14)' },
  { name: 'purple', solid: '#7a4fb8', wash: 'rgba(122,79,184,.14)' },
  { name: 'sky', solid: '#3f7ea3', wash: 'rgba(63,126,163,.14)' },
];

// Each feature's preview reuses the *actual* dashboard components it's
// describing (Journey's gl-vtimeline, AiAssistant's gl-msg bubbles,
// CareTeam's gl-avatar, Medications' gl-check, etc.) with generic
// placeholder copy — a real excerpt of the product's own UI language,
// not a stock icon-on-gradient placeholder.
function FeatureVisual({ type, accent }) {
  switch (type) {
    case 'timeline':
      return (
        <div className="gl-vtimeline">
          <div className="gl-vitem gl-stagger-item" style={{ '--i': 0 }}><span className="gl-vdot done" style={{ background: accent.solid, borderColor: accent.solid }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Diagnosis confirmed</div>
          </div>
          <div className="gl-vitem gl-stagger-item" style={{ '--i': 1 }}><span className="gl-vdot current" style={{ background: accent.solid, borderColor: accent.solid, boxShadow: `0 0 0 3px ${accent.wash}` }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Treatment in progress</div>
          </div>
          <div className="gl-vitem gl-stagger-item" style={{ '--i': 2 }}><span className="gl-vdot" />
            <div style={{ fontSize: 13, color: 'rgba(34,48,43,.5)' }}>Follow-up scheduled</div>
          </div>
        </div>
      );
    case 'assistant':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 360 }}>
          <div className="gl-msg gl-msg-out gl-stagger-item" style={{ '--i': 0, alignSelf: 'flex-end', background: accent.solid }}>What does this lab result mean?</div>
          <div className="gl-msg gl-msg-in gl-stagger-item" style={{ '--i': 1 }}>Let's walk through it together — I'll flag anything outside your usual range.</div>
        </div>
      );
    case 'people':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
          {[['DR', 'Dr. Reyes', 'Oncologist'], ['NP', 'Nadia P.', 'Nurse Navigator'], ['CG', 'You', 'Caregiver']].map(([initials, name, role], i) => (
            <div key={name} className="gl-stagger-item" style={{ '--i': i, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="gl-avatar gl-avatar-lg" style={{ background: accent.solid }}>{initials}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: 11, color: 'rgba(34,48,43,.55)' }}>{role}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case 'pill':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
          <div className="gl-stagger-item" style={{ '--i': 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="gl-check done" style={{ background: accent.solid, borderColor: accent.solid }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span style={{ fontSize: 13 }}>Morning dose logged</span>
          </div>
          <div className="gl-stagger-item" style={{ '--i': 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="gl-check" />
            <span style={{ fontSize: 13, color: 'rgba(34,48,43,.55)' }}>Evening dose</span>
          </div>
          <div className="gl-stagger-item" style={{ '--i': 2, display: 'flex', gap: 6, marginTop: 4 }}>
            {['Mild', 'Moderate', 'Severe'].map((s) => <span key={s} className="gl-tag" style={{ background: accent.wash, color: accent.solid }}>{s}</span>)}
          </div>
        </div>
      );
    case 'document':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
          {['Lab Results', 'Visit Summary', 'Imaging Report'].map((name, i) => (
            <div key={name} className="gl-stagger-item" style={{ '--i': i, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="gl-vicon" style={{ background: accent.wash, color: accent.solid }}>{ICONS.document}</span>
              <span style={{ fontSize: 13 }}>{name}.pdf</span>
            </div>
          ))}
        </div>
      );
    case 'lifering':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 320 }}>
          {['Financial assistance', 'Transportation', 'Telehealth visits', 'Local support groups'].map((s, i) => (
            <span key={s} className="gl-chip gl-stagger-item" style={{ '--i': i, background: accent.wash, borderColor: 'transparent', color: accent.solid }}>{s}</span>
          ))}
        </div>
      );
    case 'pin':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="gl-mini-radar" style={{ '--gl-radar-ring': accent.wash }}>
            <span className="gl-mini-radar-you" />
            <span className="gl-mini-radar-dot gl-stagger-item" style={{ '--i': 0, top: '18%', left: '68%', background: accent.solid, boxShadow: `0 0 0 3px ${accent.wash}` }} />
            <span className="gl-mini-radar-dot gl-stagger-item" style={{ '--i': 1, top: '58%', left: '26%', background: accent.solid, boxShadow: `0 0 0 3px ${accent.wash}` }} />
            <span className="gl-mini-radar-dot gl-stagger-item" style={{ '--i': 2, top: '72%', left: '72%', background: accent.solid, boxShadow: `0 0 0 3px ${accent.wash}` }} />
          </div>
          <span className="gl-stagger-item" style={{ '--i': 3, fontSize: 13, color: 'rgba(34,48,43,.6)', lineHeight: 1.5 }}>Nearby hospitals,<br />sorted by distance</span>
        </div>
      );
    default:
      return null;
  }
}

const FEATURES = [
  {
    icon: 'timeline', kicker: 'Timeline', title: 'Journey Timeline',
    body: "A single line through diagnosis, treatment and recovery — see where you've been and what's next.",
    tag: 'Always up to date', tagCls: 'gl-tag',
  },
  {
    icon: 'assistant', kicker: 'Assistant', title: 'AI Assistant',
    body: 'Ask questions about symptoms or appointments any hour, and get answers grounded in your own chart.',
    tag: 'Available 24/7', tagCls: 'gl-tag',
  },
  {
    icon: 'people', kicker: 'People', title: 'Care Team',
    body: 'Oncologists, nurses and caregivers, all reachable in one thread.',
    tag: 'One inbox', tagCls: 'gl-tag-purple',
  },
  {
    icon: 'pill', kicker: 'Tracking', title: 'Medications & Symptoms',
    body: 'Log doses and symptoms in seconds so patterns get caught early.',
    tag: 'Daily use', tagCls: 'gl-tag-purple',
  },
  {
    icon: 'document', kicker: 'Records', title: 'Documents',
    body: 'Lab results, imaging and visit summaries in one place — no more chasing down paperwork between providers.',
    tag: 'Always accessible', tagCls: 'gl-tag-mild',
  },
  {
    icon: 'lifering', kicker: 'Access', title: 'Resources & Support',
    body: 'Financial assistance, transportation and telehealth options.',
    tag: 'Rural & underserved access', tagCls: 'gl-tag-mild',
  },
  {
    icon: 'pin', kicker: 'Locations', title: 'Hospital Finder',
    body: 'Search any zip code to find nearby hospitals and cancer treatment centers, sorted by distance, on an interactive map — no account needed to try it.',
    tag: 'No account needed', tagCls: 'gl-tag-accent',
    link: { to: '/hospital-finder', label: 'Try it now →' },
  },
];

// A sticky-scroll step sequence: the left column lists all 7 features (the
// one nearest the vertical center of the viewport is "active" — full
// opacity, dimmed otherwise), while the right column stays pinned and its
// card morphs to the active step's preview. Hovering a step also activates
// it immediately, so it behaves like a tabbed sequence on top of the
// scroll-driven one. No animation library — an IntersectionObserver on a
// thin horizontal band at the viewport's center drives `active`, and the
// card's own remount (via `key={active}`) triggers its CSS enter animation.
function StickyFeatureSteps() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.idx));
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const activeFeature = FEATURES[active];
  const activeAccent = ACCENTS[active % ACCENTS.length];

  return (
    <div className="gl-steps-wrap">
      <div className="gl-steps-list">
        {FEATURES.map((f, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          const isActive = i === active;
          return (
            <div
              key={f.title}
              ref={(el) => { stepRefs.current[i] = el; }}
              data-idx={i}
              className={`gl-step${isActive ? ' active' : ''}`}
              onMouseEnter={() => setActive(i)}
            >
              <div className="gl-feat-heading">
                <span className="gl-feat-glyph" style={{ color: accent.solid }}>{ICONS[f.icon]}</span>
                <span className="gl-step-num" style={isActive ? { color: accent.solid } : undefined}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.title}</h3>
              </div>
              <p className="gl-feat-body">{f.body}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                <span className="gl-tag" style={{ background: accent.wash, color: accent.solid }}>{f.tag}</span>
                {f.link && <Link to={f.link.to} style={{ fontSize: 13, color: accent.solid }}>{f.link.label}</Link>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="gl-steps-sticky">
        <div key={active} className="gl-hero-frame gl-window-frame gl-feat-visual">
          <div className="gl-window-bar">
            <span className="gl-window-dot" style={{ background: '#ff5f57' }} />
            <span className="gl-window-dot" style={{ background: '#febc2e' }} />
            <span className="gl-window-dot" style={{ background: '#28c840' }} />
          </div>
          <div className="gl-feat-visual-body">
            <FeatureVisual type={activeFeature.icon} accent={activeAccent} />
          </div>
        </div>
      </div>
    </div>
  );
}

const PARTNERS = [
  { name: 'Ochsner Health', desc: 'Cancer Care & Prevention Challenge healthcare partner', logo: '/ochsner-logo.png' },
  { name: 'Nexus Louisiana', desc: 'DevDays Challenge organizer', logo: '/nexus-logo.png' },
];

// Infinite marquee — the track renders PARTNERS twice back-to-back and
// animates exactly -50% of its own width, so the seam between the first
// and second copy is invisible and the loop never visibly "resets."
function PartnerMarquee() {
  const track = [...PARTNERS, ...PARTNERS];
  return (
    <div className="ep-container" style={{ position: 'relative', zIndex: 1, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
      <p style={{ textAlign: 'center', fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(34,48,43,.5)', marginBottom: 'var(--space-4)' }}>
        Built for the Nexus Louisiana × Ochsner Health Cancer Care Challenge
      </p>
      <div className="gl-marquee">
        <div className="gl-marquee-track">
          {track.map((p, i) => (
            <div className="gl-marquee-card" key={`${p.name}-${i}`}>
              <img src={p.logo} alt={p.name} />
              <div>
                <div className="gl-marquee-name">{p.name}</div>
                <div className="gl-marquee-desc">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Answers reflect the real, current state of the product — the two
// questions that touch unshipped features (caregiver-to-patient linking,
// the AI Assistant) say so plainly rather than implying they work today.
const FAQS = [
  {
    q: 'Is Elpis free for patients and caregivers?',
    a: 'Yes. Individual patient and caregiver accounts are free during early access — no trial clock, no card required. Pricing only ever applies to provider organizations.',
  },
  {
    q: 'Can I invite multiple family members to view my timeline?',
    a: "Not yet — right now each caregiver signs up with their own separate account. Linking a caregiver directly to a patient's timeline is on our roadmap, not live yet.",
  },
  {
    q: 'How does the AI Assistant use my health data?',
    a: "The AI Assistant is designed to answer questions grounded only in your own chart — the appointments, medications and symptoms you've logged — visible to you and your care team, nothing else. It's still in development and not yet live in the app.",
  },
];

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div className={`gl-faq-card${open ? ' open' : ''}`}>
      <button type="button" className="gl-faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <span className={`gl-faq-toggle${open ? ' open' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </span>
      </button>
      {open && <p className="gl-faq-a">{a}</p>}
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="ep-container" style={{ maxWidth: 720, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
      <Reveal style={{ textAlign: 'center' }}>
        <span className="gl-faq-eyebrow">FAQs</span>
        <h2 className="gl-faq-title">Straight <em>answers</em></h2>
        <p className="gl-faq-sub">What Elpis does today — and what's still on the way.</p>
      </Reveal>
      <Reveal as="div" className="gl-faq-list" delay={100}>
        {FAQS.map((f, i) => (
          <FAQItem key={f.q} q={f.q} a={f.a} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
        <div className="gl-faq-card gl-faq-contact">
          <span>Couldn&apos;t find the answer you were looking for?</span>
          <Link to="/contact" className="btn btn-primary">Contact us</Link>
        </div>
      </Reveal>
    </div>
  );
}

// Real Louisiana cancer centers, shown as plain text-mark circles scattered
// around the closing CTA card — not their trademarked logos (those come
// later), and not implying a partnership, the same way the Hospital Finder
// just states that a place exists.
const CANCER_CENTERS = [
  { name: 'Ochsner', cls: 'a1', logo: '/ochsner-logo.png' },
  { name: 'Mary Bird\nPerkins', cls: 'a2', logo: '/mary-bird-perkins-logo.jpeg' },
  { name: 'Tulane', cls: 'a3', logo: '/tulane-logo.png' },
  { name: 'LSU', cls: 'a4', logo: '/lsu-logo.png' },
  { name: 'Our Lady\nof the Lake', cls: 'a5', logo: '/our-lady-of-the-lake-logo.png' },
  { name: 'Willis-\nKnighton', cls: 'a6' },
  { name: 'Touro', cls: 'a7', logo: '/touro-logo.png' },
  { name: 'Christus', cls: 'a8', logo: '/christus-logo.webp' },
  { name: 'Feist-\nWeiller', cls: 'a9' },
  { name: 'Baton\nRouge\nGeneral', cls: 'a10', logo: '/baton-rouge-general-logo.png' },
];

function ClosingCTASection() {
  return (
    <div className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
      <Reveal as="div" className="gl-cta-card">
        {CANCER_CENTERS.map((c) => (
          <div key={c.name} className={`gl-cta-mark ${c.cls}${c.logo ? ' has-logo' : ''}`}>
            {c.logo ? <img src={c.logo} alt={c.name} /> : c.name.split('\n').map((line, i) => <span key={i}>{line}</span>)}
          </div>
        ))}

        <div className="gl-cta-content">
          <h2 style={{ margin: 0 }}>Begin with a little more clarity today.</h2>
          <p>Elpis helps you track appointments, medications, symptoms, and stay connected with your care team.</p>
          <div className="ep-btnrow" style={{ justifyContent: 'center', marginTop: 'var(--space-4)' }}>
            <Link className="btn btn-primary" to="/register">Create an account →</Link>
            <Link className="btn btn-secondary" to="/contact">Talk to us</Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

// Plays the hero demo video muted/looping. Setting `muted` as a JSX
// attribute only sets the HTML attribute, not the DOM property browsers
// actually check for autoplay — without setting `.muted` imperatively here,
// some browsers silently block autoplay, so the video never gets going long
// enough to loop. loop stays as a JSX attribute since that one works fine.
function HeroVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      src="/elpis-animation.mp4"
      autoPlay
      loop
      muted
      playsInline
      controls
      style={{ display: 'block', width: '100%', aspectRatio: '16/9', objectFit: 'cover', background: '#0c1512' }}
    />
  );
}

export default function Landing() {
  return (
    <div className="gl-public">
      <div className="gl-hero-scene">
        <Navbar />

        <div className="ep-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: 'var(--space-8)', maxWidth: 760 }}>
          <div className="gl-hero-scrim" aria-hidden="true" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="gl-hero-eyebrow">For patients, caregivers &amp; care teams</span>
            <h1 className="gl-hero-title">
              Your care,<br /><em>organized around you.</em>
            </h1>
            <p className="gl-hero-sub">Elpis brings your whole cancer journey into one quiet place — appointments, medications, symptoms and the people caring for you, gathered where you can find them.</p>
            <div className="ep-btnrow" style={{ justifyContent: 'center', marginTop: 'var(--space-5)' }}>
              <Link className="btn btn-primary" to="/register">Get started →</Link>
              <Link className="btn btn-ghost" to="/how-it-works">See how it works →</Link>
            </div>
          </div>
        </div>

        <div className="ep-container" style={{ position: 'relative', zIndex: 1, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)', maxWidth: 1440 }}>
          <Reveal as="div" className="gl-hero-frame gl-window-frame">
            <div className="gl-window-bar">
              <span className="gl-window-dot" style={{ background: '#ff5f57' }} />
              <span className="gl-window-dot" style={{ background: '#febc2e' }} />
              <span className="gl-window-dot" style={{ background: '#28c840' }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: 'rgba(34,48,43,.55)' }}>See Elpis in action</span>
            </div>
            <HeroVideo />
          </Reveal>
        </div>
      </div>

      <div className="gl-feat-white-band">
        <div className="ep-container" style={{ position: 'relative', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
          <div className="gl-blob" style={{ width: 300, height: 300, top: 40, right: 0, background: 'radial-gradient(circle, rgba(140,180,210,.4), transparent 70%)', animation: 'gl-float2 16s ease-in-out infinite' }} />
          <div className="gl-blob" style={{ width: 260, height: 260, bottom: -40, left: '10%', background: 'radial-gradient(circle, rgba(126,211,183,.4), transparent 70%)', animation: 'gl-float 14s ease-in-out infinite' }} />
          <Reveal style={{ position: 'relative', zIndex: 1 }}>
            <h6 style={{ color: 'var(--color-accent-700)' }}>A guide through treatment</h6>
            <h2 style={{ marginTop: 'var(--space-2)', maxWidth: '22ch' }}>Everything care requires, nothing it doesn't.</h2>
          </Reveal>
          <div style={{ marginTop: 'var(--space-8)' }}>
            <StickyFeatureSteps />
          </div>
        </div>
      </div>

      <ConnectedCareSection />

      <div className="gl-marquee-band">
        <PartnerMarquee />

        <Reveal className="ep-container" style={{ position: 'relative', zIndex: 1, maxWidth: 620, textAlign: 'center', paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-4)' }}>
          <div className="gl-quote-avatar-plain" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.4" /><path d="M4.5 20c1-3.8 4.2-6 7.5-6s6.5 2.2 7.5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 600, lineHeight: 1.4, margin: 'var(--space-4) 0 0', color: '#22302b' }}>&ldquo;For the first time since my diagnosis, I didn't feel like I was managing this alone.&rdquo;</p>
          <p className="text-muted" style={{ marginTop: 'var(--space-3)', fontSize: 13 }}>— Elpis patient, in treatment since 2025</p>
        </Reveal>
      </div>

      <FAQSection />

      <ClosingCTASection />

      <div className="hr ep-container" />
      <Footer />
    </div>
  );
}
