# Radar de Captación

Plataforma B2B de inteligencia de mercado inmobiliario y captación en exclusiva de inmuebles para agencias inmobiliarias en Colombia.

El sistema detecta apartamentos ofertados por particulares estancados en portales colombianos (Metrocuadrado, Fincaraiz, Ciencuadras), diagnostica las causas de su estancamiento comercial, calcula el valor de mercado por metro cuadrado, y genera un dossier editorial de valoración en formato A4 listo para impresión o descarga PDF, además de un kit de contacto con mensaje rompehielos para WhatsApp sin engaños ni presiones agresivas.

> **Aviso sobre los datos:** Los inmuebles precargados corresponden a simulaciones técnicas controladas ("Datos de ejemplo"). No corresponden a operaciones reales ni constituyen avalúos formales bajo la legislación colombiana (Ley 1673 de 2013 o Decreto 1420 de 1998).

---

## Características Principales

1. **Radar Comercial de Particulares:**
   - Panel de métricas en tiempo real: particulares detectados, comisión potencial acumulada en COP (configurable, por defecto 3,5%), dossiers enviados y exclusivas cerradas.
   - Filtros combinados por ciudad (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Cartagena), portal de origen y estado de prospección.
   - Índice de Oportunidad IA (0 a 100) con etiquetas de diagnóstico de fallas comerciales.
   - Interruptor para ocultar los datos de ejemplo y visualizar únicamente los inmuebles reales de la agencia.

2. **Alta Manual e Importación Masiva por CSV:**
   - **Formulario de alta:** Registro de inmuebles individuales con validación estricta en Zod (mensajes en español) y análisis instantáneo.
   - **Importador CSV:** Descarga de plantilla oficial, soporte para codificación UTF-8 con o sin BOM de Excel, separadores por coma o punto y coma, normalización de precios colombianos (con puntos, símbolos `$` o `COP`), y procesamiento sin costo mediante motor local (0 créditos de IA).
   - Generación de identificadores únicos con `crypto.randomUUID` para evitar colisiones.

3. **Auditoría Técnica y Valoración Comercial:**
   - Diagnóstico cuantitativo de 4 factores críticos: fotografía, redacción, sobreprecio relativo y filtrado de solventes.
   - Curva de absorción y comparables del sector por metro cuadrado.
   - Calculadora de cierre en vivo con simulación de días en mercado y neto para el propietario.

4. **Kit de Contacto Ético y WhatsApp Directo:**
   - Redacción editorial profesional optimizada para portales colombianos.
   - Enlace directo a `https://wa.me/57...` con el número del propietario normalizado (se antepone `57` automáticamente para números colombianos de 10 dígitos) y texto rompehielos precargado.
   - Si el propietario no dispone de teléfono válido, el botón se desactiva e informa al usuario.
   - Guión estructurado para llamadas de 2 minutos y argumentario para desactivar las 3 objeciones más comunes.

5. **Dossier Editorial A4 para Propietarios:**
   - Maquetación de alta gama de 2 páginas A4 (`@media print` y `@page { size: A4 }`), lista para imprimir o guardar como PDF.
   - Encabezados institucionales con el nombre de la agencia, asesor, cargo y teléfono configurados.
   - Descargo de responsabilidad técnica legalmente calibrado.

6. **Respaldo y Portabilidad de Datos:**
   - Exportación de todos los inmuebles, estados de captación y ajustes de agencia en un archivo JSON portátil.
   - Importación de respaldos con validación en Zod.
   - Por estricta seguridad, la clave API nunca se incluye en el archivo de respaldo exportado.

---

## Requisitos y Puesta en Marcha

Se requiere **Node.js 20 o superior** y el gestor de paquetes **pnpm**.

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servidor de desarrollo
pnpm dev

# 3. Compilar para producción
pnpm build

# 4. Comprobación estática de código (linter)
pnpm lint
```

Abra [http://localhost:3000](http://localhost:3000) en su navegador.

---

## Modo Demostración (`NEXT_PUBLIC_DEMO_MODE`)

La aplicación incluye un modo demo configurable mediante variable de entorno.

1. Cree un archivo `.env.local` a partir de `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
2. Defina `NEXT_PUBLIC_DEMO_MODE=true`:
   ```env
   NEXT_PUBLIC_DEMO_MODE=true
   ```
3. Reinicie el servidor de desarrollo (`pnpm dev`).

**Comportamiento en Modo Demo:**
- Muestra una franja superior discreta de aviso: *"Versión de demostración"*.
- Utiliza en todo momento el **motor heurístico local determinista**, sin solicitar ni enviar claves de OpenRouter a ningún servidor.
- Desactiva los botones de eliminación de inmuebles para proteger la integridad de la muestra.

---

## Formato del Archivo CSV para Importación

La plantilla oficial puede descargarse directamente desde el botón **"Importar CSV"** en la barra superior. Las columnas admitidas son:

| Columna | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `ciudad` | Bogotá, Medellín, Cali, Barranquilla, Bucaramanga o Cartagena | `Bogotá` |
| `barrio` | Nombre del sector o barrio | `Rosales` |
| `direccion` | Dirección o nomenclatura | `Cra. 4 # 71-30` |
| `propietario` | Nombre del propietario particular | `Felipe Santamaría` |
| `telefono` | Celular colombiano (10 dígitos o con +57) | `+57 300 789 0123` |
| `m2` | Área construida en metros cuadrados | `130` |
| `habitaciones` | Número de alcobas o habitaciones | `3` |
| `banos` | Número de baños | `3` |
| `precio_cop` | Precio pedido en pesos (números, con puntos o `$`) | `1150000000` o `$1.150.000.000` |
| `dias_estancado`| Días transcurridos en el portal | `68` |
| `portal` | Metrocuadrado, Fincaraiz o Ciencuadras | `Metrocuadrado` |
| `texto_anuncio` | Texto descriptivo original del particular | `"Vendo apartamento en Rosales..."` |

- **Codificación:** UTF-8 (compatible con archivos generados en Excel con BOM `\uFEFF`).
- **Separadores:** Admite tanto coma (`,`) como punto y coma (`;`).

---

## Limitaciones Actuales

1. **Almacenamiento en el navegador (`localStorage`):**
   Todos los inmuebles reales agregados, estados de captación modificados y datos de la agencia residen de forma privada en el almacenamiento local del navegador web del usuario. No se transmiten ni persisten en ningún servidor externo.
2. **Sin cuentas de usuario ni autenticación centralizada:**
   Actualmente no existe sistema de registro, inicio de sesión ni roles de equipo multi-asesor. Para transferir los datos entre computadores o asesores, utilice la función **"Exportar respaldo (JSON)"** e **"Importar respaldo"** en el panel de Configuración.
3. **Sin base de datos relacional:**
   La aplicación funciona como una SPA/PWA estática con SSR ligero; no cuenta con conexión a PostgreSQL, MySQL ni ORMs.
