"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Role = "Owner" | "Agent" | "Builder";
type Listing = {
  id: string;
  title: string;
  role: Role;
  city: string;
  locality: string;
  purpose: string;
  price: number;
  beds: number;
  status: "Pending review";
  photoLabel: string;
  createdAt: string;
};

const demoAccounts: Record<Role, { name: string; email: string; subtitle: string }> = {
  Owner: { name: "Sample Owner Account", email: "owner.demo@gonest.example", subtitle: "Individual property owner" },
  Agent: { name: "Sample Agent Account", email: "agent.demo@gonest.example", subtitle: "Local property professional" },
  Builder: { name: "Sample Builder Account", email: "builder.demo@gonest.example", subtitle: "Developer inventory manager" },
};

const seedListings: Listing[] = [
  { id: "OWN-001", title: "Sample 2 BHK Apartment", role: "Owner", city: "Mumbai", locality: "Powai", purpose: "Rent", price: 48000, beds: 2, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
  { id: "AGT-001", title: "Sample 1 BHK Apartment", role: "Agent", city: "Mumbai", locality: "Kandivali East", purpose: "Rent", price: 28000, beds: 1, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
  { id: "AGT-002", title: "Sample 2 BHK Apartment", role: "Agent", city: "Mumbai", locality: "Thane West", purpose: "Rent", price: 36000, beds: 2, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
  { id: "AGT-003", title: "Sample 2 BHK Resale Home", role: "Agent", city: "Pune", locality: "Kharadi", purpose: "Buy", price: 9800000, beds: 2, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
  { id: "AGT-004", title: "Sample 3 BHK Apartment", role: "Agent", city: "Pune", locality: "Baner", purpose: "Rent", price: 52000, beds: 3, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
  { id: "AGT-005", title: "Sample 1 BHK Apartment", role: "Agent", city: "Mumbai", locality: "Goregaon East", purpose: "Rent", price: 32000, beds: 1, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
  { id: "BLD-001", title: "Sample New Project · 1 BHK", role: "Builder", city: "Mumbai", locality: "Thane West", purpose: "New project", price: 7600000, beds: 1, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
  { id: "BLD-002", title: "Sample New Project · 2 BHK", role: "Builder", city: "Mumbai", locality: "Mulund West", purpose: "New project", price: 12500000, beds: 2, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
  { id: "BLD-003", title: "Sample New Project · 2 BHK", role: "Builder", city: "Pune", locality: "Hinjawadi", purpose: "New project", price: 8900000, beds: 2, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
  { id: "BLD-004", title: "Sample New Project · 3 BHK", role: "Builder", city: "Pune", locality: "Wakad", purpose: "New project", price: 14800000, beds: 3, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
  { id: "BLD-005", title: "Sample New Project · 2 BHK", role: "Builder", city: "Mumbai", locality: "Powai", purpose: "New project", price: 18200000, beds: 2, status: "Pending review", photoLabel: "Sample photo · actual image pending", createdAt: "Demo seed" },
];

const money = (n: number, purpose: string) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}${purpose === "Rent" ? "/mo" : ""}`;

export default function RoleWorkflowQAPage() {
  const [role, setRole] = useState<Role>("Owner");
  const [listings, setListings] = useState<Listing[]>(seedListings);
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [locality, setLocality] = useState("");
  const [purpose, setPurpose] = useState("Rent");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("2");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("All");
  const visibleListings = useMemo(() => listings.filter((item) => filter === "All" || item.role === filter), [listings, filter]);
  const countFor = (r: Role) => listings.filter((item) => item.role === r).length;

  function submitListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !locality.trim() || !price || Number(price) <= 0) {
      setNotice("Please complete the title, locality and a valid price.");
      return;
    }
    const item: Listing = {
      id: `QA-${Date.now().toString().slice(-7)}`,
      title: title.trim(),
      role,
      city,
      locality: locality.trim(),
      purpose,
      price: Number(price),
      beds: Number(beds),
      status: "Pending review",
      photoLabel: "Sample photo · actual image pending",
      createdAt: "Just now · browser demo",
    };
    setListings((current) => [item, ...current]);
    setTitle("");
    setLocality("");
    setPrice("");
    setNotice(`${role} submission added to the demo review queue. It is not published to public search or saved to the live database.`);
    setFilter("All");
  }

  const styles: Record<string, React.CSSProperties> = {
    page: { maxWidth: 1180, margin: "0 auto", padding: "34px 20px 64px", color: "#18232d" },
    muted: { color: "#647382", fontSize: 14, lineHeight: 1.55 },
    panel: { background: "#fff", border: "1px solid #dfe6eb", borderRadius: 16, padding: 20, boxShadow: "0 4px 18px rgba(18,42,60,.04)" },
    button: { border: "1px solid #cbd6de", background: "#fff", color: "#263746", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontWeight: 650 },
    input: { width: "100%", padding: "11px 12px", border: "1px solid #cbd6de", borderRadius: 9, background: "#fff", color: "#18232d", marginTop: 6 },
    label: { display: "block", fontSize: 13, fontWeight: 700, color: "#425364" },
  };

  return (
    <main style={{ background: "#f5f8fa", minHeight: "100vh" }}>
      <div style={styles.page}>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
          <div>
            <p style={{ ...styles.muted, textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 800, marginBottom: 8 }}>GoNest · Preview QA Lab</p>
            <h1 style={{ fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.1, letterSpacing: "-.04em", fontWeight: 800, margin: "0 0 12px" }}>Owner, Agent & Builder workflows</h1>
            <p style={{ ...styles.muted, maxWidth: 720, fontSize: 16 }}>A role-by-role sample workspace to exercise listing submission, inventory ownership, review status and trust labels before enabling live publishing.</p>
          </div>
          <Link href="/demo-inventory" style={{ color: "#1263a5", fontWeight: 700, textDecoration: "none", paddingTop: 8 }}>Open inventory QA →</Link>
        </header>

        <div role="alert" style={{ background: "#fff8e8", border: "1px solid #f1d9a7", borderRadius: 12, padding: "14px 16px", marginBottom: 22, color: "#6d4c13", fontSize: 14, lineHeight: 1.5 }}>
          <strong>Preview-only sample data.</strong> All accounts and properties below are synthetic. New submissions stay in this browser session, are marked pending review, and do not enter public search or modify Production. Sample photos are placeholders—not actual property photos. No real account login is being simulated.
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 24 }}>
          {(["Owner", "Agent", "Builder"] as Role[]).map((r) => (
            <button key={r} type="button" onClick={() => { setRole(r); setNotice(""); }} style={{ ...styles.panel, textAlign: "left", cursor: "pointer", border: role === r ? "2px solid #1263a5" : "1px solid #dfe6eb", background: role === r ? "#f0f7ff" : "#fff" }}>
              <span style={{ fontSize: 12, color: "#647382", fontWeight: 800, textTransform: "uppercase" }}>Sample role</span>
              <span style={{ display: "block", fontSize: 22, fontWeight: 800, margin: "8px 0 4px" }}>{r}</span>
              <span style={{ display: "block", color: "#647382", fontSize: 13 }}>{countFor(r)} sample submissions</span>
            </button>
          ))}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 18, alignItems: "start", marginBottom: 26 }}>
          <div style={styles.panel}>
            <p style={{ ...styles.muted, textTransform: "uppercase", fontWeight: 800, letterSpacing: ".08em", fontSize: 11 }}>Active sample identity</p>
            <h2 style={{ fontSize: 23, fontWeight: 800, margin: "6px 0" }}>{demoAccounts[role].name}</h2>
            <p style={{ ...styles.muted, marginBottom: 12 }}>{demoAccounts[role].subtitle}</p>
            <div style={{ background: "#f5f8fa", borderRadius: 10, padding: 12, fontSize: 14 }}>
              <div><strong>Demo email:</strong> {demoAccounts[role].email}</div>
              <div style={{ marginTop: 5 }}><strong>Account mode:</strong> simulated · no password or real sign-in</div>
            </div>
            <h3 style={{ fontWeight: 800, margin: "20px 0 10px" }}>Workflow checklist</h3>
            {[
              "Choose a role",
              "Create a property or project submission",
              "Receive a pending-review state",
              "Keep sample data out of public search",
              "Require genuine photos and availability confirmation before publication",
            ].map((step, i) => <div key={step} style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "10px 0", fontSize: 14 }}><span style={{ width: 22, height: 22, flex: "0 0 22px", borderRadius: 99, background: "#eaf3fb", color: "#1263a5", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800 }}>{i + 1}</span><span>{step}</span></div>)}
          </div>

          <form onSubmit={submitListing} style={styles.panel}>
            <p style={{ ...styles.muted, textTransform: "uppercase", fontWeight: 800, letterSpacing: ".08em", fontSize: 11 }}>Submission form · {role}</p>
            <h2 style={{ fontSize: 23, fontWeight: 800, margin: "6px 0 18px" }}>{role === "Builder" ? "Submit project inventory" : role === "Agent" ? "Add a client listing" : "List your property"}</h2>
            <label style={styles.label}>Listing / project title<input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={role === "Builder" ? "Sample project · 2 BHK" : "Sample 2 BHK apartment"} style={styles.input} /></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              <label style={styles.label}>City<select value={city} onChange={(e) => setCity(e.target.value)} style={styles.input}><option>Mumbai</option><option>Pune</option></select></label>
              <label style={styles.label}>Purpose<select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={styles.input}>{(role === "Builder" ? ["New project", "Buy"] : ["Rent", "Buy"]).map((p) => <option key={p}>{p}</option>)}</select></label>
            </div>
            <label style={{ ...styles.label, marginTop: 14 }}>Locality<input required value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="e.g. Powai / Baner" style={styles.input} /></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              <label style={styles.label}>Price (INR){purpose === "Rent" ? " / month" : ""}<input required type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={purpose === "Rent" ? "35000" : "9500000"} style={styles.input} /></label>
              <label style={styles.label}>Bedrooms<select value={beds} onChange={(e) => setBeds(e.target.value)} style={styles.input}><option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3 BHK</option><option value="4">4+ BHK</option></select></label>
            </div>
            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#f5f8fa", fontSize: 13, color: "#526371" }}><strong>Trust gate:</strong> Sample photo · actual image pending<br />Availability: needs confirmation<br />Review status: pending review · not publicly visible</div>
            <button type="submit" style={{ marginTop: 16, width: "100%", border: 0, borderRadius: 10, padding: 13, color: "#fff", background: "#1263a5", fontWeight: 800, cursor: "pointer" }}>Submit to demo review queue</button>
            {notice && <p role="status" style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, color: notice.startsWith("Please") ? "#a23434" : "#17623a" }}>{notice}</p>}
          </form>
        </section>

        <section style={styles.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <div><h2 style={{ fontSize: 23, fontWeight: 800, margin: 0 }}>Sample inventory & review queue</h2><p style={styles.muted}>Five agent and five builder examples, plus an owner example. Newly submitted rows appear first.</p></div>
            <select aria-label="Filter sample submissions" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...styles.input, width: "auto", minWidth: 150, marginTop: 0 }}><option>All</option><option>Owner</option><option>Agent</option><option>Builder</option></select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 12 }}>
            {visibleListings.map((item) => <article key={item.id} style={{ border: "1px solid #e0e7ec", borderRadius: 12, padding: 15, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 800, color: "#526371" }}>{item.role} · {item.id}</span><span style={{ fontSize: 11, padding: "4px 7px", borderRadius: 99, background: "#fff1d7", color: "#805412", fontWeight: 800 }}>Pending review</span></div>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: "12px 0 5px" }}>{item.title}</h3>
              <p style={styles.muted}>{item.locality}, {item.city} · {item.beds} BHK</p>
              <p style={{ fontSize: 20, fontWeight: 800, margin: "10px 0" }}>{money(item.price, item.purpose)}</p>
              <div style={{ fontSize: 12, color: "#805412", background: "#fff8e8", borderRadius: 8, padding: 9 }}>{item.photoLabel}<br />Availability unconfirmed · sample record</div>
              <p style={{ ...styles.muted, fontSize: 11, marginTop: 9 }}>Not published · {item.createdAt}</p>
            </article>)}
          </div>
          {visibleListings.length === 0 && <p style={styles.muted}>No sample submissions for this role yet.</p>}
        </section>

        <footer style={{ ...styles.muted, marginTop: 24, borderTop: "1px solid #dfe6eb", paddingTop: 18 }}>
          This QA Lab tests the interaction design only. It does not create authenticated users, persist records to Supabase, upload real photos, send enquiries, or approve listings. Those live integrations still require separate end-to-end verification. <Link href="/rent" style={{ color: "#1263a5", fontWeight: 700 }}>Check public Rent search →</Link>
        </footer>
      </div>
    </main>
  );
}
