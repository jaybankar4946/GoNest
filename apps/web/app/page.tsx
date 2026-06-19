import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>🏘️ GoNest - Property Listings</h1>
      <p>Welcome to GoNest - your go-to platform for property listings.</p>
      
      <div style={{ marginTop: "30px" }}>
        <Link href="/listings" style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px",
          display: "inline-block"
        }}>
          View All Listings →
        </Link>
      </div>

      <div style={{ marginTop: "50px", color: "#666" }}>
        <p>✅ Website is live and ready to use.</p>
        <p>📊 Performance monitoring enabled.</p>
      </div>
    </div>
  );
}
