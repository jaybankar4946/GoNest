"use client";

import { useEffect, useState } from "react";

export default function Listings() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://gonest-2.onrender.com/listings")
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Listings</h1>

      {data.map((item, i) => (
        <div
          key={i}
          style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
        >
          <h3>{item.title}</h3>
          <p>{item.location}</p>
          <p>{item.price}</p>
        </div>
      ))}
    </div>
  );
}