"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Add() {
  const [form, setForm] = useState({});

  const save = async () => {
    await supabase.from("properties").insert([form]);
    alert("Saved");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Add Property</h1>

      <input placeholder="Title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <input placeholder="Price" onChange={(e) => setForm({ ...form, price: e.target.value })} />
      <input placeholder="Location" onChange={(e) => setForm({ ...form, location: e.target.value })} />
      <input placeholder="Image URL" onChange={(e) => setForm({ ...form, image: e.target.value })} />
      <input placeholder="WhatsApp" onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />

      <button onClick={save}>Save</button>
    </div>
  );
}