import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from './AuthContext.jsx';
import { formatRelativeDate, formatMessageTime } from '../lib/formatDate.js';

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

function mapMessages(rows, myId) {
  return rows.map((r) => ({
    id: r.id,
    from: r.author_id === myId ? 'me' : 'them',
    text: r.body,
    time: formatMessageTime(r.created_at),
  }));
}

export function PatientDataProvider({ children }) {
  const { session } = useAuth();
  const [patientId, setPatientId] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [authorizations, setAuthorizations] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Resolve the logged-in user's own patients.id row
  useEffect(() => {
    if (!session) {
      setPatientId(null);
      setSymptoms([]);
      setMessages([]);
      setAuthorizations([]);
      setAppointments([]);
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

  // Load + realtime-subscribe to this patient's own message thread
  useEffect(() => {
    if (!patientId || !session) return;

    let active = true;
    const load = () => {
      supabase
        .from('messages')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true })
        .then(({ data }) => { if (active) setMessages(mapMessages(data ?? [], session.user.id)); });
    };
    load();

    const channel = supabase
      .channel(`messages-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `patient_id=eq.${patientId}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [patientId, session]);

  // Load + realtime-subscribe to this patient's own authorizations (read-only —
  // only the provider writes to this table)
  useEffect(() => {
    if (!patientId) return;

    let active = true;
    const load = () => {
      supabase
        .from('authorizations')
        .select('*')
        .eq('patient_id', patientId)
        .order('submitted_date', { ascending: false })
        .then(({ data }) => { if (active) setAuthorizations(data ?? []); });
    };
    load();

    const channel = supabase
      .channel(`authorizations-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'authorizations', filter: `patient_id=eq.${patientId}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  // Load + realtime-subscribe to this patient's own appointments (read-only —
  // only the provider writes to this table)
  useEffect(() => {
    if (!patientId) return;

    let active = true;
    const load = () => {
      supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('scheduled_at', { ascending: true })
        .then(({ data }) => { if (active) setAppointments(data ?? []); });
    };
    load();

    const channel = supabase
      .channel(`appointments-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${patientId}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const sendMessage = useCallback(async (body) => {
    if (!patientId || !session) return;
    await supabase.from('messages').insert({ patient_id: patientId, author_id: session.user.id, body });
  }, [patientId, session]);

  const logSymptom = useCallback(async ({ symptom, severity, notes }) => {
    if (!patientId) return;
    await supabase.from('symptoms').insert({ patient_id: patientId, symptom, severity, notes });
  }, [patientId]);

  const requestRefill = useCallback(async (medicationName) => {
    if (!patientId) return;
    await supabase.from('refill_requests').insert({ patient_id: patientId, medication_name: medicationName });
  }, [patientId]);

  return (
    <PatientDataContext.Provider value={{ patientId, symptoms, logSymptom, requestRefill, messages, sendMessage, authorizations, appointments }}>
      {children}
    </PatientDataContext.Provider>
  );
}

export const usePatientData = () => useContext(PatientDataContext);
