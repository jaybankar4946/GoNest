import { ReferenceHomeDetail } from "../ReferenceHomeDetail";

export default async function HomeReferencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ReferenceHomeDetail slug={slug} />;
}
