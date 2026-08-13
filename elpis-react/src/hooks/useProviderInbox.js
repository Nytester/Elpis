import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const SEVERE_WINDOW_DAYS = 7;

// One real inbox instead of three separate places a provider had to check:
// refill requests (has a real status field, so genuinely actionable), message
// threads where the patient sent the last message (no "unread" column exists,
// so "needs reply" is derived — the thread's own latest sender — rather than
// a fabricated flag), and severe symptoms logged in the last week (informational
// only; there's no real "acknowledged" state for these, so no fake dismiss
// action is offered — same as how the roster already surfaces them).
export function useProviderInbox() {
  const { session } = useAuth();
  const [refills, setRefills] = useState([]);
  const [needsReply, setNeedsReply] = useState([]);
  const [severeSymptoms, setSevereSymptoms] = useState([]);
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
        setRefills([]); setNeedsReply([]); setSevereSymptoms([]); setLoading(false);
        return;
      }

      const since = new Date(Date.now() - SEVERE_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

      const [{ data: refillRows }, { data: messageRows }, { data: symptomRows }] = await Promise.all([
        supabase.from('refill_requests').select('*').in('patient_id', ids).order('requested_at', { ascending: false }),
        supabase.from('messages').select('*').in('patient_id', ids).order('created_at', { ascending: true }),
        supabase.from('symptoms').select('*').in('patient_id', ids).eq('severity', 'Severe').gte('logged_at', since).order('logged_at', { ascending: false }),
      ]);

      if (!active) return;

      setRefills((refillRows ?? []).map((r) => ({
        id: r.id,
        patientId: r.patient_id,
        patientName: nameById[r.patient_id],
        text: `${r.medication_name} refill request`,
        handled: r.status === 'handled',
      })));

      const latestByPatient = new Map();
      (messageRows ?? []).forEach((m) => latestByPatient.set(m.patient_id, m));
      const reply = [];
      latestByPatient.forEach((m, patientId) => {
        if (m.author_id !== session.user.id) {
          reply.push({ id: m.id, patientId, patientName: nameById[patientId], text: m.body, time: m.created_at });
        }
      });
      reply.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNeedsReply(reply);

      setSevereSymptoms((symptomRows ?? []).map((s) => ({
        id: s.id,
        patientId: s.patient_id,
        patientName: nameById[s.patient_id],
        text: `${s.symptom} logged as Severe`,
        time: s.logged_at,
      })));

      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`provider-inbox-${session.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'refill_requests' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'symptoms' }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [session]);

  const markHandled = useCallback(async (requestId) => {
    await supabase.rpc('mark_refill_handled', { request_id: requestId });
  }, []);

  const pendingRefills = refills.filter((r) => !r.handled);
  const handledRefills = refills.filter((r) => r.handled);
  const totalNeedsAttention = pendingRefills.length + needsReply.length + severeSymptoms.length;

  return { pendingRefills, handledRefills, needsReply, severeSymptoms, totalNeedsAttention, loading, markHandled };
}
