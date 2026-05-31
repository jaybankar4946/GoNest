"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function Listings() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/listings").then(res => setData(res.data));
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
