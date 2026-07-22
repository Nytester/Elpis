import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRelativeDate, formatMessageTime } from '../lib/formatDate.js';

export function useProviderPatient(patientId) {
  const { session } = useAuth();
  const [patient, setPatient] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [refillRequests, setRefillRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    let active = true;
    const load = async () => {
      const [{ data: patientRow }, { data: symptomRows }, { data: refillRows }, { data: messageRows }] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.from('symptoms').select('*').eq('patient_id', patientId).order('logged_at', { ascending: false }),
        supabase.from('refill_requests').select('*').eq('patient_id', patientId).order('requested_at', { ascending: false }),
        supabase.from('messages').select('*').eq('patient_id', patientId).order('created_at', { ascending: true }),
      ]);

      if (!active) return;
      setPatient(patientRow ?? null);
      setSymptoms((symptomRows ?? []).map((s) => ({
        name: s.symptom, severity: s.severity, date: formatRelativeDate(s.logged_at),
      })));
      setRefillRequests(refillRows ?? []);
      setMessages((messageRows ?? []).map((m) => ({
        id: m.id,
        from: m.author_id === patientRow?.profile_id ? 'them' : 'me',
        text: m.body,
        time: formatMessageTime(m.created_at),
      })));
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`provider-patient-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'symptoms', filter: `patient_id=eq.${patientId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'refill_requests', filter: `patient_id=eq.${patientId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `patient_id=eq.${patientId}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const markRefillHandled = useCallback(async (requestId) => {
    await supabase.rpc('mark_refill_handled', { request_id: requestId });
  }, []);

  const sendMessage = useCallback(async (body) => {
    if (!patientId || !session) return;
    await supabase.from('messages').insert({ patient_id: patientId, author_id: session.user.id, body });
  }, [patientId, session]);

  const latestSymptom = symptoms[0];
  const alert = latestSymptom?.severity === 'Severe' ? `${latestSymptom.name} logged as Severe` : null;

  return { patient, symptoms, refillRequests, messages, sendMessage, alert, loading, markRefillHandled };
}
