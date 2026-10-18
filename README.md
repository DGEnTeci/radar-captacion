# Radar de Captación

Herramienta de inteligencia de mercado inmobiliario y captación en exclusiva de inmuebles para agencias inmobiliarias en Colombia.

El sistema detecta apartamentos publicados por propietarios particulares que llevan semanas sin venderse en portales (Metrocuadrado, Fincaraiz, Ciencuadras), diagnostica las causas del estancamiento comercial, calcula el valor de mercado por m2, y genera tanto un dossier editorial de valoración en formato A4 listo para impresión o descarga PDF, como un kit de contacto con mensaje rompehielos para WhatsApp sin engaños ni falsas promesas.

> **Aviso sobre los datos:** Todos los inmuebles, propietarios, números de contacto, valores de cierre y transacciones comparables incluidos en esta aplicación son datos simulados con fines demostrativos ("Datos de ejemplo"). No corresponden a operaciones reales ni constituyen avalúos formales.

---

## Características Principales

1. **Radar de Particulares:**
   - Panel de métricas en tiempo real: particulares detectados, comisión potencial acumulada (configurable, por defecto 3,5%), dossiers enviados y exclusivas cerradas.
   - Listado interactivo con filtros por ciudad, portal y estado de captación.
   - Índice de Oportunidad IA (0 a 100) con etiquetas de diagnóstico rápido (sobreprecio, descripciones deficientes, fotos oscuras, ausencia de planos).
   - Analizador de nuevos anuncios con motor dual (OpenRouter IA y motor heurístico local).

2. **Auditoría y Valoración Inmobiliaria:**
   - Desglose de deficiencias críticas que frenan la venta (calidad fotográfica, redacción, sobreprecio relativo y filtrado de compradores).
   - Estudio comparativo de valor por m2 frente al promedio del barrio.
   - Calculadora interactiva de cierre: simulador de precio de venta, comisión y días estimados en mercado, con detalle neto estimado para el propietario.

3. **Reescritura y Kit de Contacto:**
   - Comparador antes y después: anuncio original deficiente frente a propuesta editorial profesional optimizada para portales colombianos.
   - Mensaje rompehielos para WhatsApp enfocado en aportar valor (entrega gratuita del estudio de mercado) sin presionar captación directa.
   - Argumentario comercial para el manejo de tres objeciones habituales: rechazo a agencias, saturación de llamadas y negativa al pago de honorarios.

4. **Dossier de Valoración Editorial (A4):**
   - Maquetación de alta gama inspirada en publicaciones de banca privada y arquitectura editorial.
   - Portada personalizada, diagnóstico visual, comparativa de mercado, plan de acción comercial de 4 fases y cláusula de exoneración técnica.
   - Optimizado para impresión directa y exportación a PDF desde el navegador (`@media print` y `@page { size: A4 }`), ocultando la navegación del sistema.

5. **Motor IA Híbrido y Privacidad:**
   - Integración con OpenRouter para análisis avanzado vía modelos LLM.
   - Motor heurístico local determinista como respaldo inmediato si no hay clave configurada o si ocurre algún error o límite de tiempo.
   - Almacenamiento de claves API exclusivamente en el navegador local (`localStorage`), sin registro de textos confidenciales en el servidor.

---

## Requisitos y Puesta en Marcha

Se requiere Node.js (v20 o superior) y el gestor de paquetes **pnpm**.

Comandos de gestión:
- Instalación de dependencias: `pnpm` `install`
- Servidor de desarrollo: `pnpm` `dev`
- Compilación para producción: `pnpm` `build`
- Verificación estática de código: `pnpm` `lint`

Abra [http://localhost:3000](http://localhost:3000) en su navegador para interactuar con la plataforma.
