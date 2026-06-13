import { getListings } from "@/lib/api";

export default async function Home() {
  const listings = await getListings();

  return (
    <div>
      <h1>GoNest Listings</h1>

      {listings.map((item: any) => (
        <div key={item.id}>
          <h2>{item.title}</h2>
        </div>
      ))}
    </div>
  );
}
