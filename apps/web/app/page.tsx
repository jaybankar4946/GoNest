"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
};

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProperties((data as Property[]) || []);
      });
  }, []);

  const filtered = properties.filter((p) =>
    p.location?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>GoNest</h1>

      <input
        placeholder="Search city..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, marginBottom: 20 }}
      />

      {filtered.map((p) => (
        <div key={p.id} style={{ marginBottom: 20 }}>
          <Image src={p.image} width={300} height={200} alt={p.title} />
          <h3>{p.title}</h3>
          <p>{p.location}</p>
          <p>{p.price}</p>
        </div>
      ))}
    </div>
  );
}
