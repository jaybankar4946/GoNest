import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

type Filters = {
  q?: string;
  purpose?: string;
  cityId?: string;
  minBedrooms?: number;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
};

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: searches, error } = await supabase
    .from('saved_searches')
    .select('*');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  let sent = 0;

  for (const s of searches ?? []) {
    const since = s.last_notified_at ?? s.created_at;
    const f: Filters = s.filters ?? {};

    let q = supabase
      .from('listings')
      .select('id,title,price,purpose,city_id')
      .eq('status', 'active')
      .gt('created_at', since);

    if (f.q) q = q.ilike('title', `%${f.q}%`);
    if (f.purpose) q = q.eq('purpose', f.purpose);
    if (f.cityId) q = q.eq('city_id', f.cityId);
    if (f.minBedrooms) q = q.gte('bedrooms', f.minBedrooms);
    if (f.propertyType) q = q.eq('property_type', f.propertyType);
    if (f.minPrice) q = q.gte('price', f.minPrice);
    if (f.maxPrice) q = q.lte('price', f.maxPrice);

    const { data: matches } = await q.limit(10);

    if (!matches || matches.length === 0) continue;

    const { data: userRes } = await supabase.auth.admin.getUserById(
      s.user_id
    );

    const email = userRes?.user?.email;

    if (!email) continue;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GoNest <alerts@gonest.in>',
        to: email,
        subject: `${matches.length} new listing${
          matches.length === 1 ? '' : 's'
        } for "${s.name}"`,
        text: matches
          .map(
            (m: any) =>
              `${m.title} — https://gonest.in/property/${m.id}`
          )
          .join('\n'),
      }),
    });

    await supabase
      .from('saved_searches')
      .update({
        last_notified_at: new Date().toISOString(),
      })
      .eq('id', s.id);

    sent++;
  }

  return new Response(
    JSON.stringify({
      processed: searches?.length ?? 0,
      emailsSent: sent,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
});
