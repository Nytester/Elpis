import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import './dashboardGlass.css';

const SECTIONS = [
  {
    category: 'Education',
    title: 'Understanding Your Treatment',
    blurb: 'Guides and checklists to help you make sense of your diagnosis and care plan.',
    items: [
      { title: 'Understanding Your Pathology Report', org: 'Ochsner Patient Education', tag: 'Guide', tagClass: 'gl-tag-mild', action: 'Read guide' },
      { title: 'Chemotherapy Side Effects: What to Expect', org: 'Ochsner MD Anderson', tag: 'Guide', tagClass: 'gl-tag-mild', action: 'Read guide' },
      { title: 'Questions to Ask Your Oncology Team', org: 'Elpis Care Library', tag: 'Checklist', tagClass: 'gl-tag-mild', action: 'View checklist' },
    ],
  },
  {
    category: 'Financial & Transportation',
    title: 'Financial & Transportation Support',
    blurb: 'Programs that help cover costs and get you to appointments.',
    items: [
      { title: 'Ochsner Financial Assistance Program', org: 'Ochsner Health', tag: 'Program', tagClass: 'gl-tag-accent', action: 'Learn more' },
      { title: 'Louisiana Cancer Transportation Voucher', org: 'LA Dept. of Health', tag: 'Program', tagClass: 'gl-tag-accent', action: 'Apply' },
      { title: 'Road To Recovery — Volunteer Rides', org: 'American Cancer Society', tag: 'Program', tagClass: 'gl-tag-accent', action: 'Request a ride' },
    ],
  },
  {
    category: 'Emotional & Social',
    title: 'Emotional & Social Support',
    blurb: 'Connect with others who understand what you and your caregivers are going through.',
    items: [
      { title: 'Virtual Support Group — Tuesdays 6pm', org: 'Ochsner MD Anderson', tag: 'Support group', tagClass: 'gl-tag-purple', action: 'Join session' },
      { title: 'Caregiver Support Network', org: 'CancerCare', tag: 'Community', tagClass: 'gl-tag-purple', action: 'Connect' },
      { title: 'One-on-One Counseling', org: 'Ochsner Behavioral Health', tag: 'Service', tagClass: 'gl-tag-purple', action: 'Schedule' },
    ],
  },
  {
    category: 'Rural & Telehealth',
    title: 'Rural & Telehealth Access',
    blurb: 'Get care from home when travel to a cancer center isn’t possible.',
    items: [
      { title: 'Telehealth Oncology Follow-ups', org: 'Ochsner Anywhere Care', tag: 'Telehealth', tagClass: 'gl-tag-outline', action: 'Start visit' },
      { title: 'Nurse Navigator Hotline', org: 'Ochsner MD Anderson', tag: 'Hotline', tagClass: 'gl-tag-outline', action: 'Call (855) 555-0142' },
      { title: 'Find a Regional Infusion Site', org: 'Ochsner Network', tag: 'Directory', tagClass: 'gl-tag-outline', action: 'Search sites' },
    ],
  },
];

const CATEGORIES = ['All', ...SECTIONS.map((s) => s.category)];

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('All');

  const visibleSections = activeCategory === 'All'
    ? SECTIONS
    : SECTIONS.filter((s) => s.category === activeCategory);

  return (
    <div className="ep-shell-dash gl-shell">
      <Sidebar active="Resources" />

      <div className="ep-main">
        <div className="gl-dash">
          <div style={{ marginBottom: 20 }}>
            <h1 className="gl-greeting">Resources</h1>
            <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)', marginTop: 4 }}>Curated support for the practical and emotional sides of your care journey.</p>
          </div>

          <div className="gl-seg" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <span
                key={cat}
                className={`gl-seg-opt${activeCategory === cat ? ' selected' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {visibleSections.map((section) => (
              <div key={section.category}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{section.title}</div>
                <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)', marginBottom: 12 }}>{section.blurb}</p>
                <div className="ep-resource-grid">
                  {section.items.map((item) => (
                    <div key={item.title} className="gl-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span className={`gl-tag ${item.tagClass}`} style={{ alignSelf: 'flex-start' }}>{item.tag}</span>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{item.title}</div>
                      <p style={{ fontSize: 12, color: 'rgba(34,48,43,.6)', margin: 0 }}>{item.org}</p>
                      <a className="gl-pill" style={{ width: '100%', border: '1px solid rgba(34,48,43,.15)' }} href="#">{item.action}</a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
