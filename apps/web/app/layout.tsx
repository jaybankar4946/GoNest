import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GoNest",
  description: "Find your next home",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
