import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import LegalPage from '../components/LegalPage.jsx';
import './dashboardGlass.css';

const SECTIONS = [
  {
    title: 'What we collect',
    body: [
      'Account details you provide when you register — name, email, and role (patient, caregiver, or provider).',
      'Health information you or your care team enter into Elpis, such as symptoms, medications, appointments, documents, and messages exchanged with your care team.',
      'Basic usage data (like pages visited and general device/browser info) used only to keep the product working and to fix problems.',
    ],
  },
  {
    title: 'How we use it',
    body: [
      'To operate the features you use — your dashboard, care team messaging, appointment and medication tracking, and the AI Assistant.',
      'To let your assigned provider see the information needed to coordinate your care.',
      "We do not sell your personal or health information, and we don't use it for advertising.",
    ],
  },
  {
    title: 'Who can see it',
    body: [
      'You can always see your own data.',
      'Your assigned care provider can see the information tied to your care (symptoms, appointments, messages, and documents you share).',
      'We do not share your information with third parties except the infrastructure providers that host the app (e.g., our database provider), and only as needed to run the service.',
    ],
  },
  {
    title: 'How it’s protected',
    body: [
      'Access to your data is restricted by row-level security rules, so a patient can only see their own records and a provider can only see the patients assigned to them.',
      'Traffic to and from Elpis is encrypted in transit.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You can update your account details from Settings at any time.',
      'To request a copy of your data or to have your account deleted, contact us — see the Contact page.',
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'If this policy changes in a meaningful way, we’ll let you know before the change takes effect.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="gl-public">
      <Navbar />
      <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        intro="This explains what information Elpis collects, how it's used, and who can see it. It applies to patients, caregivers, and providers using the app."
        updated="August 2026"
        sections={SECTIONS}
      />
      <div className="hr ep-container" />
      <Footer />
    </div>
  );
}
