import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from './AuthContext.jsx';
import { formatRelativeDate } from '../lib/formatDate.js';

const PatientDataContext = createContext(null);

function mapSymptoms(rows) {
  return rows.map((r) => ({
    id: r.id,
    symptom: r.symptom,
    severity: r.severity,
    notes: r.notes ?? '',
    date: formatRelativeDate(r.logged_at),
  }));
}

export function PatientDataProvider({ children }) {
  const { session } = useAuth();
  const [patientId, setPatientId] = useState(null);
  const [symptoms, setSymptoms] = useState([]);

  // Resolve the logged-in user's own patients.id row
  useEffect(() => {
    if (!session) {
      setPatientId(null);
      setSymptoms([]);
      return;
    }
    supabase.from('patients').select('id').eq('profile_id', session.user.id).single()
      .then(({ data }) => setPatientId(data?.id ?? null));
  }, [session]);

  // Load + realtime-subscribe to this patient's own symptoms
  useEffect(() => {
    if (!patientId) return;

    let active = true;
    const load = () => {
      supabase
        .from('symptoms')
        .select('*')
        .eq('patient_id', patientId)
        .order('logged_at', { ascending: false })
        .then(({ data }) => { if (active) setSymptoms(mapSymptoms(data ?? [])); });
    };
    load();

    const channel = supabase
      .channel(`symptoms-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'symptoms', filter: `patient_id=eq.${patientId}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const logSymptom = useCallback(async ({ symptom, severity, notes }) => {
    if (!patientId) return;
    await supabase.from('symptoms').insert({ patient_id: patientId, symptom, severity, notes });
  }, [patientId]);

  const requestRefill = useCallback(async (medicationName) => {
    if (!patientId) return;
    await supabase.from('refill_requests').insert({ patient_id: patientId, medication_name: medicationName });
  }, [patientId]);

  return (
    <PatientDataContext.Provider value={{ symptoms, logSymptom, requestRefill }}>
      {children}
    </PatientDataContext.Provider>
  );
}

export const usePatientData = () => useContext(PatientDataContext);
