"use client";

import { useEffect, useState } from "react";

const API = {
  getListings: async () =>
    fetch("https://gonest-1.onrender.com/listings").then(r => r.json())
};

export default function Listings() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.getListings()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div><p>Loading listings...</p></div>;
  if (error) return <div><p style={{ color: 'red' }}>Error: {error}</p></div>;

  return (
    <div>
      <h1>Listings</h1>

      {data.map((l: any) => (
        <div key={l.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
          <h3>{l.title}</h3>
          <p>{l.city}</p>
        </div>
      ))}
    </div>
  );
}
