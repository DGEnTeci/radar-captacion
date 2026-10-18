import { Suspense } from "react";
import { SAMPLE_PROPERTIES_DATA } from "@/data/properties";
import { PropertyDetailClient } from "@/components/property/PropertyDetailClient";

export function generateStaticParams() {
  return SAMPLE_PROPERTIES_DATA.map((p) => ({
    id: p.id,
  }));
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs font-mono text-[#565C62]">
          Cargando estudio patrimonial...
        </div>
      }
    >
      <PropertyDetailClient id={id} />
    </Suspense>
  );
}
