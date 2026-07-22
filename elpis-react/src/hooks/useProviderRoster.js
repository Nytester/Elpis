import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useProviderRoster() {
  const { session } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    let active = true;
    const load = async () => {
      const { data: patientRows } = await supabase
        .from('patients')
        .select('*')
        .eq('provider_id', session.user.id)
        .order('full_name');

      if (!active || !patientRows) return;

      const ids = patientRows.map((p) => p.id);
      const [{ data: symptomRows }, { data: refillRows }] = await Promise.all([
        supabase.from('symptoms').select('*').in('patient_id', ids).order('logged_at', { ascending: false }),
        supabase.from('refill_requests').select('*').in('patient_id', ids).eq('status', 'pending'),
      ]);

      const merged = patientRows.map((p) => {
        const latestSymptom = symptomRows?.find((s) => s.patient_id === p.id);
        const pendingRefills = refillRows?.filter((r) => r.patient_id === p.id).length ?? 0;
        const alert = latestSymptom?.severity === 'Severe'
          ? `${latestSymptom.symptom} logged as Severe`
          : null;
        return { ...p, alert, pendingRefills };
      });

      if (active) {
        setPatients(merged);
        setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel(`provider-roster-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'symptoms' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'refill_requests' }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [session]);

  return { patients, loading };
}
