import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';

const SECTIONS = [
  {
    category: 'Education',
    title: 'Understanding Your Treatment',
    blurb: 'Guides and checklists to help you make sense of your diagnosis and care plan.',
    items: [
      { title: 'Understanding Your Pathology Report', org: 'Ochsner Patient Education', tag: 'Guide', tagClass: 'tag-neutral', action: 'Read guide' },
      { title: 'Chemotherapy Side Effects: What to Expect', org: 'Ochsner MD Anderson', tag: 'Guide', tagClass: 'tag-neutral', action: 'Read guide' },
      { title: 'Questions to Ask Your Oncology Team', org: 'Elpis Care Library', tag: 'Checklist', tagClass: 'tag-neutral', action: 'View checklist' },
    ],
  },
  {
    category: 'Financial & Transportation',
    title: 'Financial & Transportation Support',
    blurb: 'Programs that help cover costs and get you to appointments.',
    items: [
      { title: 'Ochsner Financial Assistance Program', org: 'Ochsner Health', tag: 'Program', tagClass: 'tag-accent', action: 'Learn more' },
      { title: 'Louisiana Cancer Transportation Voucher', org: 'LA Dept. of Health', tag: 'Program', tagClass: 'tag-accent', action: 'Apply' },
      { title: 'Road To Recovery — Volunteer Rides', org: 'American Cancer Society', tag: 'Program', tagClass: 'tag-accent', action: 'Request a ride' },
    ],
  },
  {
    category: 'Emotional & Social',
    title: 'Emotional & Social Support',
    blurb: 'Connect with others who understand what you and your caregivers are going through.',
    items: [
      { title: 'Virtual Support Group — Tuesdays 6pm', org: 'Ochsner MD Anderson', tag: 'Support group', tagClass: 'tag-accent-2', action: 'Join session' },
      { title: 'Caregiver Support Network', org: 'CancerCare', tag: 'Community', tagClass: 'tag-accent-2', action: 'Connect' },
      { title: 'One-on-One Counseling', org: 'Ochsner Behavioral Health', tag: 'Service', tagClass: 'tag-accent-2', action: 'Schedule' },
    ],
  },
  {
    category: 'Rural & Telehealth',
    title: 'Rural & Telehealth Access',
    blurb: 'Get care from home when travel to a cancer center isn’t possible.',
    items: [
      { title: 'Telehealth Oncology Follow-ups', org: 'Ochsner Anywhere Care', tag: 'Telehealth', tagClass: 'tag-outline', action: 'Start visit' },
      { title: 'Nurse Navigator Hotline', org: 'Ochsner MD Anderson', tag: 'Hotline', tagClass: 'tag-outline', action: 'Call (855) 555-0142' },
      { title: 'Find a Regional Infusion Site', org: 'Ochsner Network', tag: 'Directory', tagClass: 'tag-outline', action: 'Search sites' },
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
    <div className="ep-shell-dash">
      <Sidebar active="Resources" />

      <div className="ep-main">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Resources</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Curated support for the practical and emotional sides of your care journey.</p>
        </div>

        <div className="seg" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className={`seg-opt${activeCategory === cat ? ' selected' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {visibleSections.map((section) => (
            <div key={section.category}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>{section.title}</h2>
              <p className="text-muted" style={{ fontSize: 13, marginBottom: 'var(--space-3)' }}>{section.blurb}</p>
              <div className="ep-resource-grid">
                {section.items.map((item) => (
                  <div key={item.title} className="card elev-sm">
                    <span className={`tag ${item.tagClass}`} style={{ alignSelf: 'flex-start' }}>{item.tag}</span>
                    <h3 className="card-title" style={{ fontSize: 15, marginTop: 4 }}>{item.title}</h3>
                    <p className="card-body" style={{ fontSize: 12 }}>{item.org}</p>
                    <a className="btn btn-secondary btn-block" href="#">{item.action}</a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
