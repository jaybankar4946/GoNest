const API_URL = "https://gonest-1.onrender.com";

export async function getListings() {
  const res = await fetch(`${API_URL}/listings`);
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function getListingById(id: string) {
  const res = await fetch(`${API_URL}/listings/${id}`);
  if (!res.ok) throw new Error("Failed to fetch listing");
  return res.json();
}
