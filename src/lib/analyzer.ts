import { PropertyAnalysis, CriticalFlaw } from "@/types/property";

export interface ListingInputData {
  city: "Bogotá" | "Medellín" | "Cali" | "Barranquilla" | "Bucaramanga" | "Cartagena";
  barrio: string;
  address?: string;
  ownerName?: string;
  m2: number;
  bedrooms: number;
  bathrooms: number;
  askingPriceCop: number;
  daysStuck: number;
  sourcePortal?: "Metrocuadrado" | "Fincaraiz" | "Ciencuadras";
  originalListingText: string;
  barrioAvgPricePerM2?: number;
  agencyName?: string;
  agentName?: string;
}

export const CITY_DEFAULT_M2_AVERAGES: Record<string, number> = {
  Bogotá: 8200000,
  Medellín: 8900000,
  Cali: 4900000,
  Barranquilla: 5600000,
  Bucaramanga: 4800000,
  Cartagena: 11200000,
};

export function runLocalListingAnalysis(input: ListingInputData, fallbackReason?: string): PropertyAnalysis {
  const m2 = Math.max(1, input.m2);
  const askingPricePerM2 = Math.round(input.askingPriceCop / m2);
  const avgPricePerM2 = input.barrioAvgPricePerM2 || CITY_DEFAULT_M2_AVERAGES[input.city] || 6500000;
  const priceDiffPercent = ((askingPricePerM2 - avgPricePerM2) / avgPricePerM2) * 100;

  const textLength = (input.originalListingText || "").trim().length;
  const lineCount = (input.originalListingText || "").split("\n").filter((l) => l.trim().length > 0).length;

  const textLower = (input.originalListingText || "").toLowerCase();
  const hasPlano = textLower.includes("plano") || textLower.includes("distribución") || textLower.includes("distribucion");
  const hasParqueadero = textLower.includes("parqueadero") || textLower.includes("garaje") || textLower.includes("parqueaderos");
  const hasEstrato = textLower.includes("estrato");
  const hasAdmin = textLower.includes("administración") || textLower.includes("administracion") || textLower.includes("admon");

  const criticalFlaws: CriticalFlaw[] = [];
  const problemTags: string[] = [];

  // 1. Price analysis
  let priceScore = 80;
  if (priceDiffPercent > 15) {
    priceScore = 32;
    problemTags.push(`Sobreprecio +${Math.round(priceDiffPercent)}%`);
    criticalFlaws.push({
      id: "flaw-price-1",
      category: "precio",
      title: `Sobreprecio crítico del ${Math.round(priceDiffPercent)}% frente al promedio de ${input.barrio}`,
      explanation: `El valor de $${askingPricePerM2.toLocaleString("es-CO")}/m2 supera sensiblemente la absorción real del sector ($${avgPricePerM2.toLocaleString("es-CO")}/m2). Los compradores calificados filtran por debajo de este rango, invisibilizando el inmueble.`,
      estimatedCostCop: Math.round(input.askingPriceCop * 0.08),
    });
  } else if (priceDiffPercent > 5) {
    priceScore = 55;
    problemTags.push(`Sobreprecio +${Math.round(priceDiffPercent)}%`);
    criticalFlaws.push({
      id: "flaw-price-2",
      category: "precio",
      title: `Desfase de precio del ${Math.round(priceDiffPercent)}% respecto al mercado`,
      explanation: `El precio pretendido está ligeramente por encima de los comparables cerrados recientemente en la zona, frenando las solicitudes de visita.`,
      estimatedCostCop: Math.round(input.askingPriceCop * 0.04),
    });
  } else if (priceDiffPercent < -8) {
    priceScore = 65;
    problemTags.push("Subvalorado potencial");
  } else {
    priceScore = 88;
  }

  // 2. Text flaws
  let textScore = 75;
  if (lineCount <= 2 || textLength < 120) {
    textScore = 25;
    problemTags.push("Descripción de solo 2 líneas");
    criticalFlaws.push({
      id: "flaw-text-1",
      category: "texto",
      title: "Descripción telegráfica sin propuesta de valor",
      explanation: "El texto original solo enumera características básicas sin transmitir la experiencia espacial, acabados, orientación lumínica ni estilo de vida, perdiendo el 70% del interés calificado.",
      estimatedCostCop: Math.round(input.askingPriceCop * 0.03),
    });
  } else if (textLength < 250) {
    textScore = 48;
    problemTags.push("Descripción escasa");
  }

  if (!hasPlano) {
    problemTags.push("Sin plano arquitectónico");
    criticalFlaws.push({
      id: "flaw-plan-1",
      category: "filtrado",
      title: "Ausencia de plano acotado o esquema de distribución",
      explanation: "Los compradores de perfil corporativo e inversionistas descartan anuncios sin plano porque no pueden verificar la circulación ni la modularidad de las áreas.",
      estimatedCostCop: Math.round(input.askingPriceCop * 0.02),
    });
  }

  // 3. Photo & Visual presentation
  let photoScore = 40;
  if (input.daysStuck > 40) {
    photoScore = 35;
    problemTags.push("Fotos sin staging profesional");
    criticalFlaws.push({
      id: "flaw-photo-1",
      category: "fotos",
      title: "Fotografía aficionada con iluminación deficiente",
      explanation: "Tomas tomadas con smartphone en ángulos cerrados, contraluces y sin estilismo de home staging reducen el valor percibido del metro cuadrado en portales.",
      estimatedCostCop: Math.round(input.askingPriceCop * 0.05),
    });
  } else {
    photoScore = 55;
    problemTags.push("Reportaje fotográfico mejorable");
  }

  // 4. Filtering score
  let filteringScore = 50;
  if (!hasParqueadero || !hasEstrato || !hasAdmin) {
    filteringScore = 40;
    criticalFlaws.push({
      id: "flaw-filt-1",
      category: "filtrado",
      title: "Ficha técnica incompleta en portales",
      explanation: "Al no especificar claramente valor de administración, estrato o características del parqueadero, el algoritmo de búsqueda de los portales ubica el anuncio en posiciones secundarias.",
      estimatedCostCop: Math.round(input.askingPriceCop * 0.015),
    });
  }

  // Calculate Opportunity Score (higher means higher urgency/opportunity for agency capture)
  // High days stuck + high flaws + high price gap = high opportunity for exclusive representation
  const daysWeight = Math.min(35, Math.round(input.daysStuck * 0.4));
  const flawWeight = Math.min(35, criticalFlaws.length * 9);
  const priceGapWeight = Math.min(30, Math.max(0, Math.round(priceDiffPercent * 1.5)));
  const opportunityScore = Math.min(98, Math.max(45, daysWeight + flawWeight + priceGapWeight));

  // Recommended optimal closing price
  const optimalPriceAdjustment = priceDiffPercent > 3 ? (priceDiffPercent - 2) / 100 : 0;
  const recommendedOptimalPriceCop = Math.round((input.askingPriceCop * (1 - optimalPriceAdjustment * 0.85)) / 1000000) * 1000000;
  const recommendedOptimalPricePerM2 = Math.round(recommendedOptimalPriceCop / m2);

  const estimatedDaysCurrentPrice = Math.max(60, Math.round(input.daysStuck + (priceDiffPercent > 10 ? 90 : 45)));
  const estimatedDaysOptimalPrice = Math.min(45, Math.max(20, Math.round(25 + (priceDiffPercent > 10 ? 10 : 0))));

  // Professional Rewrite
  const agencyName = input.agencyName || "Inmobiliaria Singular";
  const agentName = input.agentName || "Consultor Patrimonial";
  const ownerName = input.ownerName || "Propietario";

  const optimizedHeadline = `Exclusivo apartamento en ${input.barrio}: luz natural, serenidad y óptima conectividad`;
  const optimizedDescription = `Ubicado en una de las zonas de mayor valorización y tranquilidad de ${input.barrio} (${input.city}), este inmueble de ${m2} m2 ofrece un equilibrio singular entre espacialidad y confort residencial.

La zona social goza de iluminación natural continua gracias a sus ventanales de altura completa, conectando de manera fluida el salón principal con un comedor independiente de generosas dimensiones. Cuenta con ${input.bedrooms} alcobas espaciosas, la principal provista de baño privado con ventilación natural y vestier funcional, complementadas por ${input.bathrooms} baños con acabados contemporáneos.

Su cocina integral se integra con precisión al área de servicio, manteniendo privacidad y ergonomía. La propiedad incluye parqueadero privado cubierto y depósito independiente en edificio con estricta portería y vigilancia las 24 horas.

Un inmueble ideal tanto para familias que priorizan ubicación y seguridad como para perfiles que valoran la estabilidad patrimonial en ${input.city}.`;

  const highlights = [
    `Espacio total de ${m2} m2 optimizado para máxima iluminación natural`,
    `${input.bedrooms} habitaciones espaciosas y ${input.bathrooms} baños completos`,
    `Edificio seguro con control de acceso 24/7 y ubicación privilegiada en ${input.barrio}`,
    `Oportunidad de inversión con alta liquidez y retorno patrimonial`,
  ];

  const keyAttributes = [
    { label: "Área construida", value: `${m2} m2` },
    { label: "Habitaciones", value: `${input.bedrooms}` },
    { label: "Baños", value: `${input.bathrooms}` },
    { label: "Ciudad y Sector", value: `${input.city}, ${input.barrio}` },
    { label: "Valor / m2 óptimo", value: `$${recommendedOptimalPricePerM2.toLocaleString("es-CO")}` },
  ];

  // WhatsApp icebreaker (completely honest, gives value first, no fake buyer, no pressure)
  const portalName = input.sourcePortal || "el portal";
  const whatsappIcebreaker = `Buenas tardes, señor(a) ${ownerName}. Le saluda ${agentName}, de ${agencyName} en ${input.city}.

He seguido con interés la publicación de su apartamento en ${input.barrio} a través de ${portalName}. Observamos que lleva varias semanas en vitrina comercial sin cerrar la operación y, como especialistas en el corredor residencial de ${input.barrio}, preparamos un informe analítico comparativo con las ventas efectivas registradas en su misma cuadra durante el último trimestre.

Con mucho gusto se lo comparto en formato digital (PDF), sin costo alguno y sin compromiso de intermediación. Consideramos que contar con este estudio técnico de valor por metro cuadrado le permitirá tomar decisiones informadas sobre su patrimonio.

¿Desea que se lo envíe por este medio para su revisión?`;

  const callScript = {
    greeting: `Buenos días, señor(a) ${ownerName}. Le saluda ${agentName}, de ${agencyName}. ¿Cómo se encuentra hoy?`,
    hook: `Le llamo puntualmente respecto a su apartamento ubicado en ${input.barrio}, el cual vi publicado directamente en ${portalName}. Sé que como propietario particular recibe frecuentes llamadas de personas improvisadas, por lo que seré completamente directo y respetuoso con su tiempo.`,
    valueOffer: `En nuestro equipo analizamos semanalmente el comportamiento real de cierres en ${input.barrio}. Al revisar su publicación notamos tres detalles técnicos de posicionamiento en portales y un desfase respecto al precio de absorción de la zona que están frenando la llegada de compradores con capacidad de pago inmediata. Elaboramos un dossier de valoración y diagnóstico comercial que condensa estos datos.`,
    callToAction: `No busco pedirle que me entregue el inmueble hoy. Mi propósito es enviarle este informe técnico en PDF para que usted conozca exactamente lo que está ocurriendo en su cuadra. ¿Le parece conveniente que se lo comparta hoy mismo por WhatsApp o correo electrónico?`,
  };

  const objectionReplies = {
    noAgencias: {
      objection: "No tengo interés en trabajar con inmobiliarias, lo estoy vendiendo directo.",
      response: "Entiendo perfectamente su posición y es muy respetable que busque maximizar su utilidad neta. De hecho, no le estoy pidiendo que me contrate ni que retire su anuncio. El informe que le preparé es un estudio técnico objetivo del valor por metro cuadrado en su calle que le servirá a usted para negociar con cualquier interesado particular. ¿Le incomodaría recibirlo de manera gratuita para tener esa herramienta a su favor?",
      keyInsight: "Valida la autonomía del propietario y elimina la fricción comercial entregando valor sin contraprestación inmediata.",
    },
    muchasLlamadas: {
      objection: "Me llaman 20 inmobiliarias todos los días ofreciendo lo mismo y solo me quitan tiempo.",
      response: "Comprendo su frustración. La mayoría de intermediarios llaman pidiendo fotos para publicar el mismo anuncio en los mismos portales, lo cual solo satura el mercado y desgasta el inmueble. Nosotros no trabajamos con volumen desordenado sino con análisis de datos y cartera filtrada de compradores solventes. Permítame enviarle únicamente el diagnóstico con los errores que detectamos en su publicación; si tras revisarlo considera que le aportó valor, conversamos cinco minutos; de lo contrario, no volveré a contactarlo.",
      keyInsight: "Diferencia la consultoría patrimonial del corretaje informal y ofrece una salida limpia con compromiso de respeto.",
    },
    noComision: {
      objection: "No estoy dispuesto a pagar comisión del 3% o 4%.",
      response: "Es comprensible: nadie quiere pagar honorarios que no representen un retorno claro. Sin embargo, nuestro estudio demuestra que tener el inmueble 90 días estancado con sobreprecio o fotos deficientes genera gastos acumulados de administración, predial e hipoteca que superan con creces el costo del servicio, además de obligar a rebajas finales de hasta el 10% por cansancio en el mercado. Nuestro trabajo no le cuesta: le ahorra dinero frente a una mala negociación. Revise el informe y juzgue usted mismo los números.",
      keyInsight: "Reencuadra la comisión no como un gasto, sino como un mecanismo de protección patrimonial frente al desgaste de vitrina.",
    },
  };

  return {
    opportunityScore,
    problemTags: problemTags.slice(0, 4),
    diagnosis: {
      photoScore,
      textScore,
      priceScore,
      filteringScore,
      criticalFlaws,
    },
    valuation: {
      askingPriceCop: input.askingPriceCop,
      m2,
      askingPricePerM2,
      barrioAvgPricePerM2: avgPricePerM2,
      priceDifferencePercent: Math.round(priceDiffPercent * 10) / 10,
      recommendedOptimalPriceCop,
      recommendedOptimalPricePerM2,
      estimatedDaysCurrentPrice,
      estimatedDaysOptimalPrice,
    },
    optimizedListing: {
      headline: optimizedHeadline,
      description: optimizedDescription,
      highlights,
      keyAttributes,
    },
    contactKit: {
      whatsappIcebreaker,
      callScript,
      objectionReplies,
    },
    engine: "local",
    fallbackReason,
    analyzedAt: new Date().toISOString(),
  };
}
