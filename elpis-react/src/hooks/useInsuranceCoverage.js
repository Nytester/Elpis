import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export function useInsuranceCoverage(patientId) {
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setCoverage(null);
      setLoading(false);
      return;
    }

    let active = true;
    const load = async () => {
      const { data } = await supabase.from('insurance_coverage').select('*').eq('patient_id', patientId).maybeSingle();
      if (active) {
        setCoverage(data);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`insurance-coverage-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insurance_coverage', filter: `patient_id=eq.${patientId}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const saveCoverage = useCallback(
    async (fields) => {
      const { error } = await supabase
        .from('insurance_coverage')
        .upsert({ patient_id: patientId, ...fields, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    [patientId]
  );

  return { coverage, loading, saveCoverage };
}
