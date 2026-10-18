import { Suspense } from "react";
import { SAMPLE_PROPERTIES_DATA } from "@/data/properties";
import { PropertyDetailClient } from "@/components/property/PropertyDetailClient";

export function generateStaticParams() {
  return SAMPLE_PROPERTIES_DATA.map((p) => ({
    id: p.id,
  }));
}

async function PropertyDetailResolver({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  return <PropertyDetailClient id={id} />;
}

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs font-mono text-[#565C62]">
          Cargando estudio patrimonial...
        </div>
      }
    >
      <PropertyDetailResolver paramsPromise={params} />
    </Suspense>
  );
}

