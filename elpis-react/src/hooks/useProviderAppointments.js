import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

// Every appointment across the provider's whole roster, in one place —
// appointments.sql only ever shipped a per-patient view; this is the
// cross-patient calendar/list that was explicitly deferred as a follow-up.
export function useProviderAppointments() {
  const { session } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    let active = true;
    const load = async () => {
      const { data: patientRows } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('provider_id', session.user.id);

      if (!active || !patientRows) return;

      const nameById = Object.fromEntries(patientRows.map((p) => [p.id, p.full_name]));
      const ids = patientRows.map((p) => p.id);
      if (ids.length === 0) {
        setAppointments([]); setLoading(false);
        return;
      }

      const { data: apptRows } = await supabase
        .from('appointments')
        .select('*')
        .in('patient_id', ids)
        .order('scheduled_at', { ascending: true });

      if (!active) return;
      setAppointments((apptRows ?? []).map((a) => ({ ...a, patientName: nameById[a.patient_id] })));
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`provider-appointments-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [session]);

  const updateStatus = useCallback(async (appointmentId, newStatus) => {
    await supabase.rpc('update_appointment_status', { appointment_id: appointmentId, new_status: newStatus });
  }, []);

  const now = new Date();
  const upcoming = appointments
    .filter((a) => a.status === 'scheduled' && new Date(a.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  const past = appointments
    .filter((a) => a.status !== 'scheduled' || new Date(a.scheduled_at) < now)
    .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

  return { upcoming, past, loading, updateStatus };
}
