import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const FROM_EMAIL = Deno.env.get("GONEST_FROM_EMAIL") ?? "GoNest <alerts@gonest.in>";

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  // Fail closed: this batch job must only be invoked by a trusted scheduler.
  if (!CRON_SECRET) {
    return json({ error: "cron_not_configured", action: "Set CRON_SECRET in Supabase Edge Function secrets before enabling a scheduler." }, 503);
  }
  if (req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return json({ error: "unauthorized" }, 401);
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    return json({ error: "server_configuration_missing" }, 503);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: searches, error: searchError } = await supabase
    .from("saved_searches")
    .select("id,user_id,name,filters,last_notified_at,created_at");

  if (searchError) return json({ error: "saved_searches_read_failed" }, 500);

  let sent = 0;
  let failed = 0;
  let processed = 0;

  for (const s of searches ?? []) {
    const since = s.last_notified_at ?? s.created_at;
    const f = (s.filters ?? {}) as {
      q?: string; purpose?: string; cityId?: string;
      minBedrooms?: number; propertyType?: string;
      minPrice?: number; maxPrice?: number;
    };

    let query = supabase
      .from("listings")
      .select("id,title,price,purpose,city_id")
      .eq("status", "active")
      .eq("is_sample", false)
      .gt("created_at", since);

    if (f.q) query = query.ilike("title", `%${f.q.slice(0, 100)}%`);
    if (f.purpose) query = query.eq("purpose", f.purpose);
    if (f.cityId) query = query.eq("city_id", f.cityId);
    if (f.minBedrooms) query = query.gte("bedrooms", f.minBedrooms);
    if (f.propertyType) query = query.eq("property_type", f.propertyType);
    if (f.minPrice !== undefined) query = query.gte("price", f.minPrice);
    if (f.maxPrice !== undefined) query = query.lte("price", f.maxPrice);

    const { data: matches, error: matchError } = await query.limit(10);
    if (matchError) { failed++; continue; }
    if (!matches?.length) continue;

    const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(s.user_id);
    const email = userResult?.user?.email;
    if (userError || !email) { failed++; continue; }

    const subjectName = String(s.name ?? "your saved search").replace(/[\r\n]/g, " ").slice(0, 100);
    const text = matches
      .map((m) => `${m.title} — https://gonest.in/property/${m.id}`)
      .join("\n");

    let response: Response;
    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: `${matches.length} new listing${matches.length === 1 ? "" : "s"} for "${subjectName}"`,
          text: `${text}\n\nManage your saved searches at https://gonest.in/dashboard.\nYou received this email because you saved a search on GoNest.`,
        }),
      });
    } catch {
      failed++;
      continue;
    }

    if (!response.ok) { failed++; continue; }

    const { error: updateError } = await supabase
      .from("saved_searches")
      .update({ last_notified_at: new Date().toISOString() })
      .eq("id", s.id);

    if (updateError) failed++;
    else { sent++; processed++; }
  }

  return json({ processed: searches?.length ?? 0, sent, failed });
});
