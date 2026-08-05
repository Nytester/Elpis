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
      const [{ data: symptomRows }, { data: refillRows }, { data: authRows }, { data: inviteRows }, { data: taskRows }] = await Promise.all([
        supabase.from('symptoms').select('*').in('patient_id', ids).order('logged_at', { ascending: false }),
        supabase.from('refill_requests').select('*').in('patient_id', ids).eq('status', 'pending'),
        supabase.from('authorizations').select('*').in('patient_id', ids),
        supabase.from('patient_invites').select('*').in('patient_id', ids).eq('status', 'pending'),
        supabase.from('care_tasks').select('*').in('patient_id', ids).eq('status', 'open'),
      ]);

      const merged = patientRows.map((p) => {
        const latestSymptom = symptomRows?.find((s) => s.patient_id === p.id);
        const pendingRefills = refillRows?.filter((r) => r.patient_id === p.id).length ?? 0;
        const atRiskAuth = authRows?.find((a) =>
          a.patient_id === p.id && a.at_risk_note && !['approved', 'denied'].includes(a.status)
        );
        const openTask = taskRows?.find((t) => t.patient_id === p.id);
        const alert = latestSymptom?.severity === 'Severe'
          ? `${latestSymptom.symptom} logged as Severe`
          : atRiskAuth
          ? atRiskAuth.at_risk_note
          : openTask
          ? (openTask.note || 'Requested help with an insurance issue')
          : null;
        const invitePending = !p.profile_id && inviteRows?.some((i) => i.patient_id === p.id);
        return { ...p, alert, pendingRefills, invitePending };
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'authorizations' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_invites' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'care_tasks' }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [session]);

  return { patients, loading };
}
