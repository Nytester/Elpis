// One-off seed script — uses the service_role key (bypasses RLS), run locally only:
//   SUPABASE_SERVICE_ROLE_KEY=... SEED_PROVIDER_PASSWORD=... node scripts/seed.mjs seed-provider
//   SUPABASE_SERVICE_ROLE_KEY=... SEED_PATIENT_PASSWORD=... node scripts/seed.mjs seed-maya
//   SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs link-patient <email>
//   SUPABASE_SERVICE_ROLE_KEY=... SEED_HOPE_PASSWORD=... node scripts/seed.mjs seed-hope
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

// Hope-only demo accounts: no `patients` roster row (not needed — create_community_post
// only checks profiles.role), just enough to populate the Hope feed with a believable
// spread of different people rather than one repeated name.
const HOPE_PATIENTS = [
  { name: 'Grace Kim', email: 'grace.kim@elpisdemo.com' },
  { name: 'Malik Turner', email: 'malik.turner@elpisdemo.com' },
  { name: 'Sofia Delgado', email: 'sofia.delgado@elpisdemo.com' },
  { name: 'Nathan Cole', email: 'nathan.cole@elpisdemo.com' },
  { name: 'Priya Nair', email: 'priya.nair@elpisdemo.com' },
];

const HOPE_POSTS = [
  { author: 'Grace Kim', category: 'milestone', caption: 'Rang the bell today after my last radiation session. Six weeks down, and I actually feel like myself again. 🌱' },
  { author: 'Malik Turner', category: 'good_news', caption: 'Got my scan results back — no evidence of disease. I keep rereading the email just to make sure it\'s real.' },
  { author: 'Sofia Delgado', category: 'support', caption: 'Starting chemo next week and I\'m terrified of the nausea. If anyone has tips that actually helped, I\'d love to hear them.' },
  { author: 'Nathan Cole', category: 'question', caption: 'Has anyone dealt with neuropathy in their hands during treatment? Wondering what helped you manage it day to day.' },
  { author: 'Priya Nair', category: 'thought', caption: 'Some days the hardest part isn\'t the treatment, it\'s the waiting. Today was a waiting day. Grateful for this space to just say that out loud.' },
  { author: 'Grace Kim', category: 'good_news', caption: 'One year post-treatment checkup, and everything came back clear. Never thought I\'d be this happy about a needle.' },
  { author: 'Malik Turner', category: 'milestone', caption: 'Finished my last round of chemo this morning. My nurse gave me a little paper crown. I\'m keeping it forever.' },
  { author: 'Sofia Delgado', category: 'thought', caption: 'My daughter drew me a picture of us at the beach "for when treatment is over." It\'s on my fridge and it\'s getting me through the hard days.' },
  { author: 'Nathan Cole', category: 'support', caption: 'Anyone else struggle with people not knowing what to say? I don\'t need advice, just people who\'ll sit with me in it.' },
  { author: 'Priya Nair', category: 'question', caption: 'Does anyone have a good system for keeping track of appointments and side effects? My notebook is a mess at this point.' },
];

// [authorName, postIndex (into HOPE_POSTS), commentBody]
const HOPE_COMMENTS = [
  ['Grace Kim', 2, 'Ginger chews were a lifesaver for me, and small frequent meals instead of three big ones. Sending you so much strength.'],
  ['Malik Turner', 3, 'I found that gentle hand stretches before bed helped a little. Ask your care team about B6 too, mine mentioned it can help.'],
  ['Sofia Delgado', 4, 'This is exactly how I feel some days too. You\'re not alone in the waiting.'],
  ['Nathan Cole', 6, 'This made me tear up. Congratulations — that crown is well earned.'],
];

// [authorName, postIndex] — who reacts to which post
const HOPE_REACTIONS = [
  ['Sofia Delgado', 1], ['Nathan Cole', 1], ['Priya Nair', 1], ['Grace Kim', 1],
  ['Malik Turner', 5], ['Sofia Delgado', 5], ['Nathan Cole', 5],
  ['Grace Kim', 6], ['Priya Nair', 6], ['Sofia Delgado', 6],
  ['Malik Turner', 2], ['Grace Kim', 2],
  ['Grace Kim', 4], ['Malik Turner', 4],
];

async function seedHope() {
  const password = process.env.SEED_HOPE_PASSWORD;
  if (!password) {
    console.error('Set SEED_HOPE_PASSWORD env var before running seed-hope.');
    process.exit(1);
  }

  const idByName = {};
  for (const p of HOPE_PATIENTS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: p.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: p.name, role: 'patient' },
    });
    if (error) throw error;
    idByName[p.name] = data.user.id;
    console.log('Hope demo account created:', p.email);
  }

  const postRows = HOPE_POSTS.map((p) => ({
    author_id: idByName[p.author],
    author_name: p.author,
    category: p.category,
    caption: p.caption,
  }));
  const { data: insertedPosts, error: postsError } = await supabase.from('community_posts').insert(postRows).select('id');
  if (postsError) throw postsError;
  console.log(`Seeded ${insertedPosts.length} Hope posts.`);

  const commentRows = HOPE_COMMENTS.map(([authorName, postIndex, body]) => ({
    post_id: insertedPosts[postIndex].id,
    author_id: idByName[authorName],
    author_name: authorName,
    body,
  }));
  const { error: commentsError } = await supabase.from('community_comments').insert(commentRows);
  if (commentsError) throw commentsError;
  console.log(`Seeded ${commentRows.length} Hope comments.`);

  const reactionRows = HOPE_REACTIONS.map(([authorName, postIndex]) => ({
    post_id: insertedPosts[postIndex].id,
    user_id: idByName[authorName],
    reaction_type: 'hope',
  }));
  const { error: reactionsError } = await supabase.from('community_likes').insert(reactionRows);
  if (reactionsError) throw reactionsError;
  console.log(`Seeded ${reactionRows.length} Hope reactions.`);
}

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
else if (cmd === 'seed-hope') await seedHope();
else {
  console.error('Usage: node scripts/seed.mjs seed-provider | seed-maya | link-patient <email> | seed-hope');
  process.exit(1);
}
