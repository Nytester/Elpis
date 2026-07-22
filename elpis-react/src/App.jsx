import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { PatientDataProvider } from './context/PatientDataContext.jsx';
import RequireRole from './components/RequireRole.jsx';
import Landing from './pages/Landing.jsx';
import About from './pages/About.jsx';
import Pricing from './pages/Pricing.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CareTeam from './pages/CareTeam.jsx';
import Resources from './pages/Resources.jsx';
import Documents from './pages/Documents.jsx';
import Medications from './pages/Medications.jsx';
import Symptoms from './pages/Symptoms.jsx';
import Journey from './pages/Journey.jsx';
import AiAssistant from './pages/AiAssistant.jsx';
import Settings from './pages/Settings.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import ProviderPatientDetail from './pages/ProviderPatientDetail.jsx';
import ProviderInbox from './pages/ProviderInbox.jsx';

const PATIENT_ROLES = ['patient', 'caregiver'];

export default function App() {
  return (
    <AuthProvider>
      <PatientDataProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/dashboard" element={<RequireRole roles={PATIENT_ROLES}><Dashboard /></RequireRole>} />
          <Route path="/dashboard/care-team" element={<RequireRole roles={PATIENT_ROLES}><CareTeam /></RequireRole>} />
          <Route path="/dashboard/resources" element={<RequireRole roles={PATIENT_ROLES}><Resources /></RequireRole>} />
          <Route path="/dashboard/documents" element={<RequireRole roles={PATIENT_ROLES}><Documents /></RequireRole>} />
          <Route path="/dashboard/medications" element={<RequireRole roles={PATIENT_ROLES}><Medications /></RequireRole>} />
          <Route path="/dashboard/symptoms" element={<RequireRole roles={PATIENT_ROLES}><Symptoms /></RequireRole>} />
          <Route path="/dashboard/journey" element={<RequireRole roles={PATIENT_ROLES}><Journey /></RequireRole>} />
          <Route path="/dashboard/assistant" element={<RequireRole roles={PATIENT_ROLES}><AiAssistant /></RequireRole>} />
          <Route path="/dashboard/settings" element={<RequireRole roles={PATIENT_ROLES}><Settings /></RequireRole>} />

          <Route path="/provider" element={<RequireRole roles={['provider']}><ProviderDashboard /></RequireRole>} />
          <Route path="/provider/patients/:id" element={<RequireRole roles={['provider']}><ProviderPatientDetail /></RequireRole>} />
          <Route path="/provider/inbox" element={<RequireRole roles={['provider']}><ProviderInbox /></RequireRole>} />
        </Routes>
      </PatientDataProvider>
    </AuthProvider>
  );
}
