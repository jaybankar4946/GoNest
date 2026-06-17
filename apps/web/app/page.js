import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data } = await supabase.from("properties").select("*");

  return (
    <div style={{ padding: 20 }}>
      <h1>GoNest</h1>

      <a href="/add">➕ Add Property</a>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {data?.map((p) => (
          <a key={p.id} href={`/property/${p.id}`}>
            <div style={{ border: "1px solid #ccc", padding: 10 }}>
              <img src={p.images?.[0]} width="100%" height="150" />
              <h3>{p.title}</h3>
              <p>{p.location}</p>
              <b>{p.price}</b>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}