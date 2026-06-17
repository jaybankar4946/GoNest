"use client";

import { useEffect, useState } from "react";

const API = {
  getListings: async () =>
    fetch("https://gonest-2.onrender.com//listings")").then(r => r.json())
};

export default function Listings() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    API.getListings().then(setData);
  }, []);

  return (
    <div>
      <h1>Listings</h1>

      {data.map((l: any) => (
        <div key={l.id}>
          <h3>{l.title}</h3>
          <p>{l.city}</p>
        </div>
      ))}
    </div>
  );
}