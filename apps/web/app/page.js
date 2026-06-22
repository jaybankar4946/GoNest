"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("properties").select("*");
      setProperties(data || []);
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>GoNest MVP</h1>

      <a href="/add">➕ Add Property</a>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {properties.map((p) => (
          <a key={p.id} href={`/property/${p.id}`}>
            <div style={{ border: "1px solid #ccc", padding: 10 }}>
              <img src={p.image} width="100%" height="150" />
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