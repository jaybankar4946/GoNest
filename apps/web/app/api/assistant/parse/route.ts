import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Criteria = {
  q?: string;
  purpose?: 'sale' | 'rent';
  minBedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  preferences?: string[];
};

function fallbackParse(message: string): Criteria {
  const text = message.toLowerCase();
  const location = text.match(/\\b(?:in|around|near)\\s+([a-z][a-z .'-]{1,35}?)(?=\\s+(?:under|below|less than|up to|between|with|near|for|within|at)\\b|[,;.!?]|$)/i);
  const c: Criteria = { q: location?.[1]?.trim() || undefined };
  if (/\b(rent|rental|lease|monthly)\b/.test(text)) c.purpose = 'rent';
  else if (/\b(buy|buying|purchase|sale|sell|own)\b/.test(text)) c.purpose = 'sale';
  const beds = text.match(/\b(\d+)\s*(?:bhk|bed(?:room)?s?)\b/);
  if (beds) c.minBedrooms = Math.max(0, Math.min(10, Number(beds[1])));
  const money = [...text.matchAll(/(?:₹|rs\.?\s*|inr\s*)(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|k)?/g)];
  const values = money.map(m => {
    const n = Number(m[1]);
    const unit = (m[2] || '').toLowerCase();
    return Math.round(n * (unit === 'crore' || unit === 'cr' ? 10000000 : unit === 'lakh' || unit === 'lac' || unit === 'l' ? 100000 : 1));
  }).filter(n => Number.isFinite(n) && n > 0);
  if (values.length === 1) c.maxPrice = values[0];
  if (values.length >= 2) { c.minPrice = Math.min(...values); c.maxPrice = Math.max(...values); }
  const types: Array<[RegExp, string]> = [
    [/\b(villa|bungalow)\b/, 'villa'],
    [/\b(plot|land)\b/, 'plot'],
    [/\b(shop|retail)\b/, 'commercial'],
    [/\b(office)\b/, 'office'],
    [/\b(1\s*bhk|studio)\b/, 'apartment'],
    [/\b(flat|apartment)\b/, 'apartment'],
  ];
  for (const [pattern, value] of types) if (pattern.test(text)) { c.propertyType = value; break; }
  c.preferences = [
    /ready.to.move|ready possession/.test(text) ? 'Ready to move' : '',
    /near (?:the )?(?:station|railway|metro)/.test(text) ? 'Near public transport' : '',
    /family|school|safe/.test(text) ? 'Family-friendly' : '',
    /pet/.test(text) ? 'Pet-friendly' : '',
    /furnished/.test(text) ? 'Furnished' : '',
  ].filter(Boolean);
  return c;
}

function cleanCriteria(input: unknown, original: string): Criteria {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out: Criteria = { q: fallbackParse(original).q };
  if (raw.purpose === 'sale' || raw.purpose === 'rent') out.purpose = raw.purpose;
  if (typeof raw.minBedrooms === 'number' && raw.minBedrooms >= 0 && raw.minBedrooms <= 10) out.minBedrooms = Math.floor(raw.minBedrooms);
  for (const key of ['minPrice', 'maxPrice'] as const) {
    const v = raw[key];
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100000000000) out[key] = Math.floor(v);
  }
  if (typeof raw.propertyType === 'string' && /^[a-z -]{1,40}$/i.test(raw.propertyType)) out.propertyType = raw.propertyType.toLowerCase();
  if (Array.isArray(raw.preferences)) out.preferences = raw.preferences.filter((v): v is string => typeof v === 'string').slice(0, 5);
  return out;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 1200) : '';
    if (!message) return NextResponse.json({ error: 'Tell us what kind of home you are looking for.' }, { status: 400 });

    const fallback = fallbackParse(message);
    const key = process.env.AI_API_KEY;
    const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = process.env.AI_MODEL || 'gpt-4.1-mini';
    if (!key) return NextResponse.json({ criteria: fallback, mode: 'basic' });

    try {
      const response = await fetch(baseUrl + '/chat/completions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          model,
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Extract real-estate search criteria from the user request. Return JSON only with keys purpose (sale or rent), minBedrooms (number), minPrice and maxPrice (INR integer), propertyType (short lowercase category matching common Indian property types), preferences (array of short strings). Omit unknown fields. For one stated budget, set maxPrice. Convert lakh/lac to 100000 and crore/cr to 10000000. Never invent a location ID or facts. The original user message will remain the text query.' },
            { role: 'user', content: message }
          ]
        })
      });
      if (!response.ok) return NextResponse.json({ criteria: fallback, mode: 'basic' });
      const json = await response.json();
      const content = json?.choices?.[0]?.message?.content;
      const parsed = typeof content === 'string' ? JSON.parse(content) : {};
      const criteria = cleanCriteria(parsed, message);
      return NextResponse.json({ criteria, mode: 'ai' });
    } catch {
      return NextResponse.json({ criteria: fallback, mode: 'basic' });
    }
  } catch {
    return NextResponse.json({ error: 'Could not process that request.' }, { status: 400 });
  }
}
