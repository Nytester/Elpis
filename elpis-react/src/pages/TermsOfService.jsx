import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import LegalPage from '../components/LegalPage.jsx';
import './dashboardGlass.css';

const SECTIONS = [
  {
    title: 'Using Elpis',
    body: [
      'Elpis is a care coordination tool for cancer patients, caregivers, and their providers. You need an account to use most features, and you agree to keep your login credentials secure.',
      'You&apos;re responsible for the accuracy of the information you enter — symptoms, medications, and other details you log help your care team, so keep them up to date.',
    ],
  },
  {
    title: 'Not a substitute for medical care',
    body: [
      'Elpis helps you track and communicate with your care team — it does not replace professional medical advice, diagnosis, or treatment.',
      'If you have a medical emergency, call 911 or go to your nearest emergency room. Do not use in-app messaging for urgent or emergency situations.',
      'The AI Assistant, where available, is a tool for general guidance grounded in your own chart — always confirm anything important with your care team.',
    ],
  },
  {
    title: 'Accounts and access',
    body: [
      'Patient and caregiver accounts are currently free during early access.',
      'Providers access Elpis only for patients assigned to them, and are expected to use the platform in line with their own professional and legal obligations.',
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'Don&apos;t use Elpis to impersonate someone else, share another person&apos;s health information without their consent, or attempt to access accounts or data that aren&apos;t yours.',
    ],
  },
  {
    title: 'Availability',
    body: [
      'We aim to keep Elpis available and reliable, but we don&apos;t guarantee uninterrupted access — the service may occasionally be unavailable for maintenance or due to factors outside our control.',
    ],
  },
  {
    title: 'Changes',
    body: [
      'We may update these terms as Elpis evolves. Significant changes will be communicated before they take effect.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'Questions about these terms? Reach out from the Contact page.',
    ],
  },
];

export default function TermsOfService() {
  return (
    <div className="gl-public">
      <Navbar />
      <LegalPage
        eyebrow="Legal"
        title="Terms of Service"
        intro="These terms cover how you can use Elpis. By creating an account, you agree to them."
        updated="August 2026"
        sections={SECTIONS}
      />
      <div className="hr ep-container" />
      <Footer />
    </div>
  );
}
