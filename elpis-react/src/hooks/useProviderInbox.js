import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useProviderInbox() {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
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
      const { data: refillRows } = await supabase
        .from('refill_requests')
        .select('*')
        .in('patient_id', patientRows.map((p) => p.id))
        .order('requested_at', { ascending: false });

      if (!active) return;
      setItems((refillRows ?? []).map((r) => ({
        id: r.id,
        patientId: r.patient_id,
        patientName: nameById[r.patient_id],
        text: `${r.medication_name} refill request`,
        handled: r.status === 'handled',
      })));
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`provider-inbox-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'refill_requests' }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [session]);

  const markHandled = useCallback(async (requestId) => {
    await supabase.rpc('mark_refill_handled', { request_id: requestId });
  }, []);

  return { items, loading, markHandled };
}
