"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
const [properties, setProperties] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    setProperties(data || []);
  };

  const filtered = properties.filter((p) =>
    p.location?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>GoNest</h1>

      <input
        placeholder="Search city..."
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, marginBottom: 20 }}
      />

      {filtered.map((p) => (
        <div key={p.id} style={{ marginBottom: 20 }}>
          <img src={p.image} width="300" />
          <h3>{p.title}</h3>
          <p>{p.location}</p>
          <p>{p.price}</p>
        </div>
      ))}
    </div>
  );
}