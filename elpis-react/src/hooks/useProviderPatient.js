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
  const [authorizations, setAuthorizations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    let active = true;
    const load = async () => {
      const [{ data: patientRow }, { data: symptomRows }, { data: refillRows }, { data: messageRows }, { data: authRows }, { data: apptRows }] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.from('symptoms').select('*').eq('patient_id', patientId).order('logged_at', { ascending: false }),
        supabase.from('refill_requests').select('*').eq('patient_id', patientId).order('requested_at', { ascending: false }),
        supabase.from('messages').select('*').eq('patient_id', patientId).order('created_at', { ascending: true }),
        supabase.from('authorizations').select('*').eq('patient_id', patientId).order('submitted_date', { ascending: false }),
        supabase.from('appointments').select('*').eq('patient_id', patientId).order('scheduled_at', { ascending: true }),
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
      setAuthorizations(authRows ?? []);
      setAppointments(apptRows ?? []);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`provider-patient-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'symptoms', filter: `patient_id=eq.${patientId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'refill_requests', filter: `patient_id=eq.${patientId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `patient_id=eq.${patientId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'authorizations', filter: `patient_id=eq.${patientId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${patientId}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const markRefillHandled = useCallback(async (requestId) => {
    await supabase.rpc('mark_refill_handled', { request_id: requestId });
  }, []);

  const addAuthorization = useCallback(async (procedure) => {
    if (!patientId || !session) return;
    await supabase.from('authorizations').insert({ patient_id: patientId, procedure, created_by: session.user.id });
  }, [patientId, session]);

  const updateAuthorizationStatus = useCallback(async (authorizationId, status, decisionDate) => {
    await supabase.rpc('update_authorization_status', {
      authorization_id: authorizationId,
      new_status: status,
      new_decision_date: decisionDate ?? null,
    });
  }, []);

  const setRiskNote = useCallback(async (authorizationId, note) => {
    await supabase.rpc('set_authorization_risk_note', { authorization_id: authorizationId, note: note || null });
  }, []);

  const sendMessage = useCallback(async (body) => {
    if (!patientId || !session) return;
    await supabase.from('messages').insert({ patient_id: patientId, author_id: session.user.id, body });
  }, [patientId, session]);

  const addAppointment = useCallback(async ({ type, scheduledAt, location, providerNote }) => {
    if (!patientId || !session) return;
    await supabase.from('appointments').insert({
      patient_id: patientId,
      type,
      scheduled_at: scheduledAt,
      location: location || null,
      provider_note: providerNote || null,
      created_by: session.user.id,
    });
  }, [patientId, session]);

  const updateAppointmentStatus = useCallback(async (appointmentId, status) => {
    await supabase.rpc('update_appointment_status', { appointment_id: appointmentId, new_status: status });
  }, []);

  const rescheduleAppointment = useCallback(async (appointmentId, newScheduledAt, newLocation) => {
    await supabase.rpc('reschedule_appointment', {
      appointment_id: appointmentId,
      new_scheduled_at: newScheduledAt,
      new_location: newLocation || null,
    });
  }, []);

  const latestSymptom = symptoms[0];
  const alert = latestSymptom?.severity === 'Severe' ? `${latestSymptom.name} logged as Severe` : null;

  return {
    patient, symptoms, refillRequests, messages, sendMessage, alert, loading, markRefillHandled,
    authorizations, addAuthorization, updateAuthorizationStatus, setRiskNote,
    appointments, addAppointment, updateAppointmentStatus, rescheduleAppointment,
  };
}
