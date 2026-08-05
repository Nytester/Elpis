import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const SIGNED_URL_TTL = 60 * 60; // seconds

export function useInsuranceDocuments(patientId) {
  const { session } = useAuth();
  const [docs, setDocs] = useState([]);
  const [urls, setUrls] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !patientId) {
      setDocs([]);
      setLoading(false);
      return;
    }

    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from('insurance_documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (!active || !data) return;

      setDocs(data);
      setLoading(false);

      const paths = data.map((d) => d.file_path);
      if (paths.length) {
        const { data: signed } = await supabase.storage.from('insurance-documents').createSignedUrls(paths, SIGNED_URL_TTL);
        if (active && signed) {
          setUrls(Object.fromEntries(signed.filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl])));
        }
      }
    };

    load();

    const channel = supabase
      .channel(`insurance-documents-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insurance_documents', filter: `patient_id=eq.${patientId}` }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [session, patientId]);

  const uploadDocument = useCallback(
    async ({ file, name, category, authorizationId }) => {
      const ext = file.name.split('.').pop();
      const filePath = `${patientId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('insurance-documents').upload(filePath, file, { upsert: false });
      if (uploadError) throw uploadError;

      const { error } = await supabase.from('insurance_documents').insert({
        patient_id: patientId,
        authorization_id: authorizationId ?? null,
        name: name?.trim() || file.name,
        category,
        file_path: filePath,
        size_bytes: file.size,
        uploaded_by: session.user.id,
      });
      if (error) {
        await supabase.storage.from('insurance-documents').remove([filePath]);
        throw error;
      }
    },
    [patientId, session]
  );

  const deleteDocument = useCallback(async (doc) => {
    const { error } = await supabase.from('insurance_documents').delete().eq('id', doc.id);
    if (error) throw error;
    await supabase.storage.from('insurance-documents').remove([doc.file_path]);
  }, []);

  return { docs, urls, loading, uploadDocument, deleteDocument };
}
