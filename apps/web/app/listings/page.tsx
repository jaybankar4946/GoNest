"use client";

import { useEffect, useState } from "react";
import { getListings } from "@/lib/api";

export default function Listings() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getListings()
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load listings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Listings</h1>
        <p>Loading listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Listings</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Listings</h1>
      <div style={{ display: "grid", gap: "20px" }}>
        {data && data.length > 0 ? (
          data.map((listing: any) => (
            <div
              key={listing.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>{listing.title}</h3>
              <p style={{ margin: "5px 0", color: "#666" }}>{listing.city}</p>
            </div>
          ))
        ) : (
          <p>No listings available</p>
        )}
      </div>
    </div>
  );
}
