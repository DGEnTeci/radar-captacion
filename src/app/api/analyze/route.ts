import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runLocalListingAnalysis } from "@/lib/analyzer";
import { PropertyAnalysis } from "@/types/property";

// In-memory rate limiting: max 25 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 25) {
    return false;
  }

  entry.count += 1;
  return true;
}

const AnalyzeRequestSchema = z.object({
  city: z.enum(["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Cartagena"]),
  barrio: z.string().min(1).max(100),
  address: z.string().max(150).optional(),
  ownerName: z.string().max(100).optional(),
  m2: z.number().positive().max(5000),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  askingPriceCop: z.number().positive(),
  daysStuck: z.number().int().min(0).max(2000),
  sourcePortal: z.enum(["Metrocuadrado", "Fincaraiz", "Ciencuadras"]).optional(),
  originalListingText: z.string().min(5).max(5000),
  barrioAvgPricePerM2: z.number().positive().optional(),
  model: z.string().max(100).optional(),
  agencyName: z.string().max(100).optional(),
  agentName: z.string().max(100).optional(),
  agentRole: z.string().max(100).optional(),
  agencyPhone: z.string().max(50).optional(),
});

// Zod schema to validate OpenRouter structured output
const AnalysisResponseSchema = z.object({
  opportunityScore: z.number().min(0).max(100),
  problemTags: z.array(z.string()).min(1).max(6),
  diagnosis: z.object({
    photoScore: z.number().min(0).max(100),
    textScore: z.number().min(0).max(100),
    priceScore: z.number().min(0).max(100),
    filteringScore: z.number().min(0).max(100),
    criticalFlaws: z.array(
      z.object({
        id: z.string(),
        category: z.enum(["fotos", "texto", "precio", "filtrado"]),
        title: z.string(),
        explanation: z.string(),
        estimatedCostCop: z.number(),
      })
    ),
  }),
  valuation: z.object({
    askingPriceCop: z.number(),
    m2: z.number(),
    askingPricePerM2: z.number(),
    barrioAvgPricePerM2: z.number(),
    priceDifferencePercent: z.number(),
    recommendedOptimalPriceCop: z.number(),
    recommendedOptimalPricePerM2: z.number(),
    estimatedDaysCurrentPrice: z.number(),
    estimatedDaysOptimalPrice: z.number(),
  }),
  optimizedListing: z.object({
    headline: z.string(),
    description: z.string(),
    highlights: z.array(z.string()),
    keyAttributes: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    ),
  }),
  contactKit: z.object({
    whatsappIcebreaker: z.string(),
    callScript: z.object({
      greeting: z.string(),
      hook: z.string(),
      valueOffer: z.string(),
      callToAction: z.string(),
    }),
    objectionReplies: z.object({
      noAgencias: z.object({
        objection: z.string(),
        response: z.string(),
        keyInsight: z.string(),
      }),
      muchasLlamadas: z.object({
        objection: z.string(),
        response: z.string(),
        keyInsight: z.string(),
      }),
      noComision: z.object({
        objection: z.string(),
        response: z.string(),
        keyInsight: z.string(),
      }),
    }),
  }),
});

export async function POST(req: NextRequest) {
  // Rate limiting check
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : "127.0.0.1").trim();

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Límite de solicitudes superado. Intente de nuevo en un minuto." },
      { status: 429 }
    );
  }

  // Check payload size (limit 20 KB)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 20 * 1024) {
    return NextResponse.json(
      { error: "El tamaño del anuncio excede el límite permitido de 20 KB." },
      { status: 413 }
    );
  }

  let rawBodyText = "";
  try {
    rawBodyText = await req.text();
  } catch {
    return NextResponse.json(
      { error: "No fue posible leer el cuerpo de la solicitud." },
      { status: 400 }
    );
  }

  if (rawBodyText.length > 20 * 1024) {
    return NextResponse.json(
      { error: "El tamaño del anuncio excede el límite permitido de 20 KB." },
      { status: 413 }
    );
  }

  let jsonBody: unknown;
  try {
    jsonBody = JSON.parse(rawBodyText);
  } catch {
    return NextResponse.json(
      { error: "Formato JSON inválido." },
      { status: 400 }
    );
  }

  const parsedInput = AnalyzeRequestSchema.safeParse(jsonBody);
  if (!parsedInput.success) {
    return NextResponse.json(
      {
        error: "Datos de entrada incompletos o inválidos.",
        details: parsedInput.error.format(),
      },
      { status: 422 }
    );
  }

  const input = parsedInput.data;

  // Retrieve OpenRouter key strictly without ever logging or exposing it
  const headerKey = req.headers.get("x-openrouter-key")?.trim();
  const envKey = process.env.OPENROUTER_API_KEY?.trim();
  const apiKey = headerKey || envKey;
  const chosenModel = input.model?.trim() || "openai/gpt-4o-mini";

  // If no API key provided, immediately use local rules engine
  if (!apiKey) {
    const localResult = runLocalListingAnalysis(input, "Sin clave de API de OpenRouter");
    return NextResponse.json({
      engine: "local",
      fallbackReason: "Sin clave de API de OpenRouter configurada en la agencia.",
      data: localResult,
    });
  }

  // Attempt OpenRouter call with 30s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const systemPrompt = `Eres un auditor inmobiliario de alta gama en Colombia para la plataforma B2B "Radar de Captación".
Analiza anuncios de apartamentos publicados por particulares en portales colombianos (Metrocuadrado, Fincaraiz, Ciencuadras).
Tu tarea es diagnosticar por qué no se vende, calcular el valor de absorción por m2 en el sector, redactar una versión editorial profesional y crear un kit de contacto honesto y de alto valor para WhatsApp y llamadas.

Reglas estrictas de estilo:
- Redacta en español colombiano formal y profesional (registro inmobiliario de alto nivel).
- Moneda en pesos colombianos (COP).
- Utiliza exclusivamente las palabras "apartamento" o "inmueble".
- Prohibido utilizar em-dashes (—) y en-dashes (–). Usa comas, dos puntos o guiones simples (-).
- Prohibido incluir emojis en cualquier campo.
- El mensaje de WhatsApp debe identificarse honestamente con el nombre de la agencia y ofrecer el estudio de mercado gratis en PDF sin engaños, sin fingir ser comprador ni presionar exclusividad de entrada.
- Devuelve únicamente un objeto JSON válido conforme a la estructura requerida.`;

    const userPrompt = `Analiza este inmueble:
Ciudad: ${input.city}
Barrio: ${input.barrio}
Dirección: ${input.address || "No especificada"}
Propietario: ${input.ownerName || "Propietario"}
Área: ${input.m2} m2
Habitaciones: ${input.bedrooms}
Baños: ${input.bathrooms}
Precio pedido: $${input.askingPriceCop} COP
Días en portal: ${input.daysStuck} días
Portal fuente: ${input.sourcePortal || "Portal inmobiliario"}
Texto del anuncio original del particular:
"${input.originalListingText}"
Promedio $/m2 del sector: ${input.barrioAvgPricePerM2 || "Calcular según mercado"}
Agencia que contacta: ${input.agencyName?.trim() || "su agencia inmobiliaria"}
Asesor: ${input.agentName?.trim() || "su asesor inmobiliario"}
Cargo del asesor: ${input.agentRole?.trim() || "asesor inmobiliario"}
Teléfono de contacto: ${input.agencyPhone?.trim() || "No especificado"}`;

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://radar-captacion.proptech.co",
        "X-Title": "Radar de Captacion B2B",
      },
      body: JSON.stringify({
        model: chosenModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!openRouterResponse.ok) {
      const statusText = openRouterResponse.statusText;
      const statusCode = openRouterResponse.status;
      const fallbackReason = `OpenRouter respondió con error ${statusCode} (${statusText})`;
      const localResult = runLocalListingAnalysis(input, fallbackReason);
      return NextResponse.json({
        engine: "local",
        fallbackReason,
        data: localResult,
      });
    }

    const responseJson = await openRouterResponse.json();
    const contentString = responseJson?.choices?.[0]?.message?.content;

    if (!contentString) {
      const fallbackReason = "Respuesta vacía recibida del proveedor IA";
      const localResult = runLocalListingAnalysis(input, fallbackReason);
      return NextResponse.json({
        engine: "local",
        fallbackReason,
        data: localResult,
      });
    }

    let parsedAiJson: unknown;
    try {
      parsedAiJson = JSON.parse(contentString);
    } catch {
      const fallbackReason = "La respuesta de la IA no fue un formato JSON válido";
      const localResult = runLocalListingAnalysis(input, fallbackReason);
      return NextResponse.json({
        engine: "local",
        fallbackReason,
        data: localResult,
      });
    }

    const validatedAiResult = AnalysisResponseSchema.safeParse(parsedAiJson);
    if (!validatedAiResult.success) {
      const fallbackReason = "Estructura JSON no conforme a la validación de esquema";
      const localResult = runLocalListingAnalysis(input, fallbackReason);
      return NextResponse.json({
        engine: "local",
        fallbackReason,
        data: localResult,
      });
    }

    const fullAnalysis: PropertyAnalysis = {
      ...validatedAiResult.data,
      engine: "openrouter",
      modelUsed: chosenModel,
      analyzedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      engine: "openrouter",
      modelUsed: chosenModel,
      data: fullAnalysis,
    });
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    const fallbackReason = isAbort
      ? "Límite de tiempo agotado (30 s) al contactar OpenRouter"
      : "Fallo de conexión de red con el servicio de IA";

    const localResult = runLocalListingAnalysis(input, fallbackReason);
    return NextResponse.json({
      engine: "local",
      fallbackReason,
      data: localResult,
    });
  }
}
