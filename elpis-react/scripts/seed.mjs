// One-off seed script — uses the service_role key (bypasses RLS), run locally only:
//   SUPABASE_SERVICE_ROLE_KEY=... SEED_PROVIDER_PASSWORD=... node scripts/seed.mjs seed-provider
//   SUPABASE_SERVICE_ROLE_KEY=... SEED_PATIENT_PASSWORD=... node scripts/seed.mjs seed-maya
//   SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs link-patient <email>
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nxmvhbbwbvcaetxppaop.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var before running this script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MOCK_PATIENTS = [
  { name: 'Marcus Reyes', age: 61, diagnosis: 'Stage III Colorectal Cancer', phase: 'Treatment', next_appointment_note: 'Follow-up scan — Jul 24, 10:00 AM', last_check_in_note: '4 days ago' },
  { name: 'Aaliyah Johnson', age: 45, diagnosis: 'Stage I Lung Cancer', phase: 'Surveillance', next_appointment_note: 'Quarterly scan — Aug 12, 1:00 PM', last_check_in_note: 'Today' },
  { name: 'Robert Fontenot', age: 70, diagnosis: 'Stage IV Pancreatic Cancer', phase: 'Treatment', next_appointment_note: 'Chemotherapy infusion — Jul 18, 8:30 AM', last_check_in_note: 'Today' },
  { name: 'Emily Broussard', age: 29, diagnosis: 'Stage IIA Hodgkin Lymphoma', phase: 'Survivorship', next_appointment_note: 'Survivorship check-in — Aug 5, 11:00 AM', last_check_in_note: '10 days ago' },
  { name: 'David Thibodeaux', age: 55, diagnosis: 'Stage IIB Prostate Cancer', phase: 'Treatment', next_appointment_note: 'Radiation session — Jul 19, 2:00 PM', last_check_in_note: 'Yesterday' },
];

async function seedProvider() {
  const password = process.env.SEED_PROVIDER_PASSWORD;
  if (!password) {
    console.error('Set SEED_PROVIDER_PASSWORD env var before running seed-provider.');
    process.exit(1);
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'dr.osei@elpis.demo',
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Dr. Rina Osei', role: 'provider' },
  });
  if (error) throw error;
  const providerId = data.user.id;

  // the public signup trigger clamps role to patient/caregiver regardless of metadata;
  // fix it here with the service_role client, which bypasses RLS.
  const { error: roleError } = await supabase.from('profiles').update({ role: 'provider' }).eq('id', providerId);
  if (roleError) throw roleError;

  const rows = MOCK_PATIENTS.map((p) => ({
    profile_id: null,
    full_name: p.name,
    age: p.age,
    diagnosis: p.diagnosis,
    phase: p.phase,
    provider_id: providerId,
    next_appointment_note: p.next_appointment_note,
    last_check_in_note: p.last_check_in_note,
  }));
  const { error: patientsError } = await supabase.from('patients').insert(rows);
  if (patientsError) throw patientsError;

  console.log('Provider created: dr.osei@elpis.demo');
  console.log('Provider profile id:', providerId);
  console.log(`Seeded ${rows.length} unclaimed roster patients.`);
}

async function linkPatientRow(userId, email) {
  const { data: providerProfile, error: provErr } = await supabase
    .from('profiles').select('id').eq('role', 'provider').single();
  if (provErr) throw provErr;

  const { error: insertErr } = await supabase.from('patients').insert({
    profile_id: userId,
    provider_id: providerProfile.id,
    full_name: 'Maya Chen',
    age: 38,
    diagnosis: 'Stage IIB Breast Cancer',
    phase: 'Treatment',
    next_appointment_note: 'Cycle 4 infusion — Tomorrow, 9:30 AM',
    last_check_in_note: 'Today',
  });
  if (insertErr) throw insertErr;
  console.log('Linked patients row for', email, '-> provider', providerProfile.id);
}

async function linkPatient(email) {
  const { data: usersPage, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  const user = usersPage.users.find((u) => u.email === email);
  if (!user) throw new Error(`No auth user found for ${email} — sign up first.`);
  await linkPatientRow(user.id, email);
}

async function seedMaya() {
  const password = process.env.SEED_PATIENT_PASSWORD;
  if (!password) {
    console.error('Set SEED_PATIENT_PASSWORD env var before running seed-maya.');
    process.exit(1);
  }
  // public signup validates the domain has real mail servers; a made-up demo domain
  // fails that check. The admin API skips it, so we create + link her the same way
  // we did the provider. Register.jsx's actual code path is untouched by this —
  // real users with real email addresses will go through public signup fine.
  const email = 'maya.chen@elpisdemo.com';
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Maya Chen', role: 'patient' },
  });
  if (error) throw error;
  console.log('Patient created:', email);
  await linkPatientRow(data.user.id, email);
}

const [, , cmd, ...args] = process.argv;
if (cmd === 'seed-provider') await seedProvider();
else if (cmd === 'seed-maya') await seedMaya();
else if (cmd === 'link-patient') await linkPatient(args[0]);
else {
  console.error('Usage: node scripts/seed.mjs seed-provider | seed-maya | link-patient <email>');
  process.exit(1);
}
