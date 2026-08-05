import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useCareTasks(patientId) {
  const { session } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from('care_tasks')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (active) {
        setTasks(data ?? []);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`care-tasks-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'care_tasks', filter: `patient_id=eq.${patientId}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const createTask = useCallback(
    async ({ authorizationId, category = 'insurance_help', note }) => {
      const { error } = await supabase.from('care_tasks').insert({
        patient_id: patientId,
        authorization_id: authorizationId ?? null,
        category,
        note: note?.trim() || null,
        created_by: session.user.id,
      });
      if (error) throw error;
    },
    [patientId, session]
  );

  return { tasks, loading, createTask };
}
