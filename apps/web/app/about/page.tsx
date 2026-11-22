import Link from 'next/link';
import type { Metadata } from 'next';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'About GoNest',
  description:
    'GoNest is a residential marketplace for India, built around reviewed listings, honest information and a clear path from search to move-in.',
  alternates: { canonical: 'https://gonest.in/about' },
  openGraph: {
    title: 'About GoNest – Discover. Connect. Move Forward.',
    description: 'Discover, buy, rent and list residential properties with GoNest.',
    url: 'https://gonest.in/about',
    siteName: 'GoNest',
    type: 'website',
    locale: 'en_IN',
  },
};

const css = `
.ab{color:var(--foreground)}
.ab .wrap{max-width:1080px;margin:0 auto;padding:0 24px}
.ab section{padding:72px 0}
.ab .band{background:var(--gray-1)}
.ab h1,.ab h2,.ab h3{font-family:var(--font-display);letter-spacing:-.02em;line-height:1.12}
.ab h1{font-size:clamp(34px,5.5vw,60px);font-weight:800}
.ab h2{font-size:clamp(26px,4vw,38px);font-weight:700}
.ab p{max-width:62ch;margin-bottom:1em;line-height:1.7}
.ab .muted{color:var(--gray-4)}
.ab .lede{font-size:19px;margin-top:22px}
.ab .actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.ab .btn{display:inline-block;padding:12px 22px;border-radius:9999px;font-size:14px;font-weight:600;background:var(--primary);color:#fff;border:1px solid var(--primary)}
.ab .btn.ghost{background:#fff;color:#111;border-color:var(--border)}
.ab .hero-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:48px;align-items:center}
.ab .proof{background:#fff;border:1px solid var(--border);border-radius:var(--radius-2xl);padding:26px;box-shadow:var(--shadow-lg)}
.ab .proof h3{font-size:19px;margin-bottom:4px}
.ab .proof .sub{font-size:13.5px;color:var(--gray-4);margin-bottom:14px}
.ab .proof ul{list-style:none}
.ab .proof li{display:flex;gap:12px;padding:10px 0;border-top:1px solid var(--border);font-size:15px}
.ab .proof li i{flex:none;width:22px;height:22px;border-radius:50%;background:var(--primary);color:#fff;display:grid;place-items:center;font-style:normal;font-size:12px;font-weight:700;margin-top:2px}
.ab .proof .not{margin-top:14px;padding:12px 14px;border-radius:var(--radius-md);background:var(--gray-1);font-size:13.5px;color:var(--gray-4)}
.ab .split{display:grid;grid-template-columns:.8fr 1.2fr;gap:48px}
.ab .problems{border-top:1px solid var(--border)}
.ab .problems div{padding:16px 0;border-bottom:1px solid var(--border)}
.ab .problems strong{display:block;font-family:var(--font-display);font-size:18px;margin-bottom:2px}
.ab .loops{display:grid;gap:16px;margin-top:32px}
.ab .loop{background:#fff;border:1px solid var(--border);border-radius:var(--radius-xl);padding:20px 22px}
.ab .loop h3{font-size:18px;margin-bottom:12px}
.ab .steps{display:flex;flex-wrap:wrap;gap:8px;list-style:none;counter-reset:s}
.ab .steps li{counter-increment:s;padding:6px 13px;border-radius:9999px;background:var(--gray-1);border:1px solid var(--border);font-size:14px;font-weight:500}
.ab .steps li::before{content:counter(s) ". ";color:var(--primary);font-weight:700}
.ab .who{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:28px;border-top:1px solid var(--border)}
.ab .who div{padding:20px 22px 20px 0;border-bottom:1px solid var(--border)}
.ab .who h3{font-size:18px;margin-bottom:6px}
.ab .who p{font-size:15px;color:var(--gray-4);margin:0}
.ab .values{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:32px 44px;margin-top:28px}
.ab .values h3{font-size:19px;margin-bottom:8px;padding-left:14px;border-left:4px solid var(--primary)}
.ab .values p{color:var(--gray-4);margin:0}
.ab .now{background:var(--primary);color:#fff;border-radius:var(--radius-2xl);padding:44px}
.ab .now h2{margin-bottom:14px}
.ab .now ul{padding-left:20px}
.ab .now li{margin-bottom:8px}
@media (max-width:820px){
  .ab .hero-grid,.ab .split{grid-template-columns:1fr;gap:30px}
  .ab section{padding:52px 0}
  .ab .now{padding:28px 22px}
}
`;

const loops: { title: string; steps: string[] }[] = [
  { title: 'For people looking for a home', steps: ['Discover', 'Search', 'Evaluate', 'Save', 'Enquire', 'Message', 'Schedule a visit', 'Follow up', 'Move forward'] },
  { title: 'For owners, agents and builders', steps: ['Create a listing', 'Submit', 'Get reviewed', 'Publish', 'Receive leads', 'Manage visits', 'Close', 'Keep listings current'] },
  { title: 'For the GoNest team', steps: ['Monitor', 'Review', 'Verify', 'Approve', 'Moderate', 'Support', 'Improve'] },
];

const audiences: [string, string][] = [
  ['Buyers', 'Compare homes and projects, understand the real cost, and book visits without chasing anyone.'],
  ['Renters', 'See rent, deposit and maintenance up front, and keep every conversation in one place.'],
  ['Owners', 'List a property, track enquiries and visits, and keep your listing accurate.'],
  ['Agents', 'Show your services and listings, and manage leads and follow-ups from one dashboard.'],
  ['Builders', 'Present projects, inventory and possession details, and respond to genuine interest.'],
];

const values: [string, string][] = [
  ['Trust you can inspect', 'Every listing goes through review. Badges explain what they mean, and listings that go stale are paused or removed.'],
  ['Honest information', 'We show the full picture, including deposit, maintenance and possession, rather than a teaser price.'],
  ['Help with the decision', 'Browsing is easy. Choosing is hard. Our decision tools help people weigh monthly cost, location and fit.'],
  ['A fair marketplace', 'Listings are ranked by relevance, quality and reliability, not by who pays the most.'],
  ['Accountability', 'Sensitive actions on the platform are recorded, and people can report problems and expect them to be looked at.'],
  ['Built for India', 'Designed for how people here search: on their phones, with WhatsApp close at hand, and with RERA in mind.'],
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <style>{css}</style>
      <main className="ab">
        <section>
          <div className="wrap hero-grid">
            <div>
              <h1>Finding a home in India should not feel like guesswork.</h1>
              <p className="lede muted">
                GoNest is a residential marketplace where buyers, renters, owners, agents and builders meet around
                listings that are reviewed, details that are clear, and a path that continues all the way to move-in.
              </p>
              <div className="actions">
                <Link className="btn" href="/buy">Browse homes</Link>
                <Link className="btn ghost" href="/rent">Find a rental</Link>
              </div>
            </div>
            <aside className="proof" aria-label="What a Verified badge means on GoNest">
              <h3>What “Verified” means here</h3>
              <p className="sub">We say exactly what was checked, nothing more.</p>
              <ul>
                <li><i>✓</i><span>The GoNest team checked the submitted details before it went live.</span></li>
                <li><i>✓</i><span>Duplicate and unusual-price warnings were reviewed.</span></li>
                <li><i>✓</i><span>Agent RERA details are shown when provided.</span></li>
                <li><i>✓</i><span>Each badge names the specific review step completed.</span></li>
              </ul>
              <div className="not">
                Verified is not a guarantee of legal title or a financial recommendation.{' '}
                <Link href="/trust" style={{ textDecoration: 'underline' }}>How trust works</Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="band">
          <div className="wrap split">
            <h2>Why we started GoNest</h2>
            <div>
              <p>Looking for a home is one of the biggest decisions a family makes, yet the search is often tiring. People repeat the same experience again and again:</p>
              <div className="problems">
                <div><strong>Listings that are already gone.</strong><span className="muted">You call, and the home was rented last month.</span></div>
                <div><strong>Prices that change on the phone.</strong><span className="muted">The number on the screen is not the number you are quoted.</span></div>
                <div><strong>Costs nobody mentions early.</strong><span className="muted">Deposit, maintenance and brokerage appear only after you are interested.</span></div>
                <div><strong>No one to follow up with.</strong><span className="muted">Enquiries disappear, visits get missed, and there is no record of what was said.</span></div>
              </div>
              <p style={{ marginTop: 22 }}>We believe a marketplace should fix these problems, not hide them. GoNest was built to make the information honest first, and the experience smooth second.</p>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <h2>Our purpose</h2>
            <p className="lede muted">To help every person in India find, choose and move into the right home with clarity and confidence, and to give the people who supply homes a fair, professional place to do business.</p>
            <p className="lede muted" style={{ marginTop: 0 }}>Our long-term vision is to become the operating system for the residential real-estate journey, one trusted step at a time.</p>
            <div className="loops">
              {loops.map((l) => (
                <div className="loop" key={l.title}>
                  <h3>{l.title}</h3>
                  <ol className="steps">{l.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="band">
          <div className="wrap">
            <h2>Who GoNest is for</h2>
            <div className="who">
              {audiences.map(([t, b]) => (<div key={t}><h3>{t}</h3><p>{b}</p></div>))}
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <h2>What we stand for</h2>
            <div className="values">
              {values.map(([t, b]) => (<div key={t}><h3>{t}</h3><p>{b}</p></div>))}
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="now">
              <h2>Where we are today</h2>
              <p>GoNest is an early-stage company with homes across Mumbai, Bengaluru, Delhi NCR, Pune and Hyderabad. We would rather be excellent in a few neighbourhoods than average everywhere, so we are building our listings carefully, one area at a time.</p>
              <ul>
                <li>The marketplace is live for buying, renting, new projects and agents.</li>
                <li>Owners, agents and builders each have a dashboard to manage listings and leads.</li>
                <li>Our team reviews listings before they reach the public site.</li>
                <li>We are adding more reviewed homes as quality allows.</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 style={{ maxWidth: '20ch' }}>Discover. Connect. Move forward.</h2>
            <p className="muted" style={{ marginTop: 16 }}>Whether you are searching for a home or listing one, we would love to have you with us from the start.</p>
            <div className="actions">
              <Link className="btn" href="/buy">Browse homes</Link>
              <Link className="btn ghost" href="/list-with-gonest">List with GoNest</Link>
              <Link className="btn ghost" href="/contact">Contact us</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
