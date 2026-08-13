import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

// Every open/resolved "need help" task raised by any patient on this
// provider's roster — the roster page only ever shows these as a one-line
// alert; this is the actual queue to see and resolve them.
export function useProviderCareTasks() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    let active = true;
    const load = async () => {
      const { data: patientRows } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('provider_id', session.user.id);

      const ids = (patientRows ?? []).map((p) => p.id);
      if (ids.length === 0) {
        if (active) { setTasks([]); setLoading(false); }
        return;
      }
      const patientMap = new Map(patientRows.map((p) => [p.id, p.full_name]));

      const { data: taskRows } = await supabase
        .from('care_tasks')
        .select('*')
        .in('patient_id', ids)
        .order('created_at', { ascending: false });

      if (active) {
        setTasks((taskRows ?? []).map((t) => ({ ...t, patientName: patientMap.get(t.patient_id) })));
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`provider-care-tasks-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'care_tasks' }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [session]);

  const updateStatus = useCallback(async (taskId, newStatus) => {
    await supabase.rpc('update_care_task_status', { task_id: taskId, new_status: newStatus });
  }, []);

  return { tasks, loading, updateStatus };
}
