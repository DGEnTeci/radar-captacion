export type PropertyStatus =
  | "sin_contactar"
  | "dossier_enviado"
  | "reunion_agendada"
  | "captado_exclusiva";

export interface ComparableSale {
  id: string;
  address: string;
  m2: number;
  soldPriceCop: number;
  pricePerM2: number;
  daysToSell: number;
  soldDate: string;
}

export interface CriticalFlaw {
  id: string;
  category: "fotos" | "texto" | "precio" | "filtrado";
  title: string;
  explanation: string;
  estimatedCostCop: number;
}

export interface AuditDiagnosis {
  photoScore: number;
  textScore: number;
  priceScore: number;
  filteringScore: number;
  criticalFlaws: CriticalFlaw[];
}

export interface MarketValuationStudy {
  askingPriceCop: number;
  m2: number;
  askingPricePerM2: number;
  barrioAvgPricePerM2: number;
  priceDifferencePercent: number;
  recommendedOptimalPriceCop: number;
  recommendedOptimalPricePerM2: number;
  estimatedDaysCurrentPrice: number;
  estimatedDaysOptimalPrice: number;
}

export interface OptimizedListing {
  headline: string;
  description: string;
  highlights: string[];
  keyAttributes: { label: string; value: string }[];
}

export interface ContactKit {
  whatsappIcebreaker: string;
  callScript: {
    greeting: string;
    hook: string;
    valueOffer: string;
    callToAction: string;
  };
  objectionReplies: {
    noAgencias: {
      objection: string;
      response: string;
      keyInsight: string;
    };
    muchasLlamadas: {
      objection: string;
      response: string;
      keyInsight: string;
    };
    noComision: {
      objection: string;
      response: string;
      keyInsight: string;
    };
  };
}

export interface PropertyAnalysis {
  opportunityScore: number;
  problemTags: string[];
  diagnosis: AuditDiagnosis;
  valuation: MarketValuationStudy;
  optimizedListing: OptimizedListing;
  contactKit: ContactKit;
  engine: "openrouter" | "local";
  modelUsed?: string;
  fallbackReason?: string;
  analyzedAt: string;
}

export interface Property {
  id: string;
  city: "Bogotá" | "Medellín" | "Cali" | "Barranquilla" | "Bucaramanga" | "Cartagena";
  barrio: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  askingPriceCop: number;
  m2: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  estrato: number;
  adminFeeCop: number;
  daysStuck: number;
  sourcePortal: "Metrocuadrado" | "Fincaraiz" | "Ciencuadras";
  originalListingText: string;
  detectedFlaws: string[];
  barrioAvgPricePerM2: number;
  comparables: ComparableSale[];
  imagePath: string;
  status: PropertyStatus;
  analysis: PropertyAnalysis;
}

export interface AgencyConfig {
  agencyName: string;
  agentName: string;
  agentRole: string;
  agencyPhone: string;
  commissionPercent: number;
  openRouterModel: string;
  openRouterApiKey: string;
}

