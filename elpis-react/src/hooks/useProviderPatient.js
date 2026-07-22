import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { formatRelativeDate } from '../lib/formatDate.js';

export function useProviderPatient(patientId) {
  const [patient, setPatient] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [refillRequests, setRefillRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    let active = true;
    const load = async () => {
      const [{ data: patientRow }, { data: symptomRows }, { data: refillRows }] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.from('symptoms').select('*').eq('patient_id', patientId).order('logged_at', { ascending: false }),
        supabase.from('refill_requests').select('*').eq('patient_id', patientId).order('requested_at', { ascending: false }),
      ]);

      if (!active) return;
      setPatient(patientRow ?? null);
      setSymptoms((symptomRows ?? []).map((s) => ({
        name: s.symptom, severity: s.severity, date: formatRelativeDate(s.logged_at),
      })));
      setRefillRequests(refillRows ?? []);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`provider-patient-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'symptoms', filter: `patient_id=eq.${patientId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'refill_requests', filter: `patient_id=eq.${patientId}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const markRefillHandled = useCallback(async (requestId) => {
    await supabase.rpc('mark_refill_handled', { request_id: requestId });
  }, []);

  const latestSymptom = symptoms[0];
  const alert = latestSymptom?.severity === 'Severe' ? `${latestSymptom.name} logged as Severe` : null;

  return { patient, symptoms, refillRequests, alert, loading, markRefillHandled };
}
