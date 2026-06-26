import { supabase } from "../../../lib/supabase";

export default async function Page({ params }) {
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();

  return (
    <div style={{ padding: 20 }}>
      <img src={data.image} width="100%" />

      <h1>{data.title}</h1>
      <h2>{data.price}</h2>
      <p>{data.location}</p>
      <p>{data.description}</p>

      <a href={`https://wa.me/${data.whatsapp}`}>
        Contact on WhatsApp
      </a>
    </div>
  );
}