const API_URL =" https://gonest-1.onrender.com";

export async function getListings() {
  const res = await fetch(`${API_URL}/listings`);
  return res.json();
}

export async function getListingById(id: string) {
  const res = await fetch(`${API_URL}/listings/${id}`);
  return res.json();
}
