// Supabase Edge Function: send-invite
// Sends the patient invite email via Resend. "Enforce JWT verification" only
// checks that *some* valid Supabase JWT is present — the public anon key itself
// satisfies that trivially, since it's a real (if low-privilege) JWT. So this
// function does its own check: resolve the caller's actual user from the token,
// then confirm their profiles.role is 'provider' before sending anything.
// RESEND_API_KEY and the service-role key are both server-side secrets, never
// exposed to the client.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Browser calls (unlike curl) send a CORS preflight OPTIONS request first, and every
// response — including error responses — needs these headers or the browser blocks
// the whole thing client-side before it ever reaches this code.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'provider') {
    return new Response(JSON.stringify({ error: 'Only providers can send invites' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { invitedEmail, patientFirstName, providerName, claimUrl } = await req.json();

    if (!invitedEmail || !claimUrl) {
      return new Response(JSON.stringify({ error: 'Missing invitedEmail or claimUrl' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Elpis <onboarding@resend.dev>',
        to: [invitedEmail],
        subject: `${providerName ?? 'Your care team'} invited you to Elpis`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="font-weight: 400;">You've been invited to Elpis</h2>
            <p>Hi ${patientFirstName ?? 'there'},</p>
            <p>${providerName ?? 'Your care team'} has set up an Elpis account to help you track appointments, medications, symptoms, and stay connected during your care.</p>
            <p style="margin: 24px 0;">
              <a href="${claimUrl}" style="background: #b68235; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none;">Set up your account</a>
            </p>
            <p style="font-size: 13px; color: #7d7979;">This link is unique to you and expires in 14 days. If you weren't expecting this, you can ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      return new Response(JSON.stringify({ error: 'Failed to send email', detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
