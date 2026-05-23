# API y modelo de datos para frontend

Este documento resume la estructura actual de Strapi y las APIs que debe consumir el frontend Next.js.

## URLs base actuales

```env
STRAPI_API_URL=https://admin-dagendang.or-gm.com
STRAPI_ASSETS_URL=https://s3-dagendang.or-gm.com/dagendang-assets
```

Strapi Admin/API:

```txt
https://admin-dagendang.or-gm.com
```

Assets públicos S3/MinIO:

```txt
https://s3-dagendang.or-gm.com/dagendang-assets
```

## Variables `.env` recomendadas en Next.js

Usar en el servidor de Next.js, no exponer tokens en el browser:

```env
STRAPI_API_URL=https://admin-dagendang.or-gm.com
STRAPI_READONLY_TOKEN=poner_token_readonly_de_strapi
POLL_VOTE_TOKEN=poner_token_de_votacion
NEXT_PUBLIC_SITE_URL=https://dagendang.or-gm.com
NEXT_PUBLIC_STRAPI_ASSETS_URL=https://s3-dagendang.or-gm.com/dagendang-assets
```

Importante:

- `STRAPI_READONLY_TOKEN` debe usarse solo en Server Components, Route Handlers o Server Actions.
- No usar `NEXT_PUBLIC_` para tokens.
- `POLL_VOTE_TOKEN` tampoco debe ir al browser; usar una ruta interna de Next.js para votar.

## Autenticación hacia Strapi

Para solicitudes protegidas:

```http
Authorization: Bearer ${STRAPI_READONLY_TOKEN}
```

Ejemplo:

```ts
const res = await fetch(`${process.env.STRAPI_API_URL}/api/articles?populate=*`, {
  headers: {
    Authorization: `Bearer ${process.env.STRAPI_READONLY_TOKEN}`,
  },
  next: { revalidate: 60 },
});
```

## Notas Strapi v5

- Las respuestas usan `documentId` como identificador público de documento.
- Para actualizar/votar en endpoints custom se usa `documentId`, no `id`.
- Las relaciones/media necesitan `populate`.
- Artículos migrados están publicados.

---

# Modelo de datos principal

## `Article`

Noticias editoriales.

Campos principales:

```txt
title
subtitle
slug
publishedDate
body
legacyContent
coverImage
articleImages
secondaryImage1
secondaryImage2
adImages
highlightQuote1
highlightQuote2
authorName
authorProfile
sourceUrl
legacyId
legacyImageUrl
isPremium
status
category
```

Relaciones:

```txt
category → Category
authorProfile → Personality
coverImage/secondaryImage*/articleImages/adImages → Media
```

Notas:

- `coverImage` es la imagen principal.
- `articleImages` permite varias imágenes por noticia; las imágenes migradas quedaron alineadas ahí también.
- `secondaryImage1` y `secondaryImage2` se mantienen para ubicaciones editoriales específicas si se quieren usar.
- `adImages` permite subir varias imágenes de anuncio asociadas al artículo, aunque los anuncios viejos no fueron migrados.

Uso frontend:

- Portada/listado de noticias.
- Página detalle de noticia.
- Filtrado por categoría.
- Bloqueo premium con `isPremium`.

Endpoints:

```txt
GET /api/articles?populate=*
GET /api/articles/:documentId?populate=*
GET /api/articles?filters[slug][$eq]=mi-slug&populate=*
GET /api/articles?filters[category][slug][$eq]=economia&populate=*
```

Ejemplo para últimas noticias:

```txt
/api/articles?sort[0]=publishedDate:desc&pagination[pageSize]=10&populate=*
```

## `Category`

Categorías editoriales.

Campos:

```txt
name
slug
description
order
isActive
```

Endpoints:

```txt
GET /api/categories?sort[0]=order:asc
GET /api/categories?filters[slug][$eq]=economia
```

## `Personality`

Perfil público/editorial de autores, columnistas y personalidades.

Campos:

```txt
fullName
slug
photo
position
dedication
shortCurriculum
birthDate
birthPlace
profileType
isActive
authUser
```

Relaciones:

```txt
authUser → users-permissions.user
articles → Article
dailyOpinions → Daily Opinion
polls → Poll
```

Uso frontend:

- Perfil de Tony D Reyes.
- Perfil de autores/columnistas.
- Mostrar foto, cargo, dedicación y currículum corto.

Endpoints:

```txt
GET /api/personalities?populate=*
GET /api/personalities?filters[slug][$eq]=tony-d-reyes&populate=*
```

## `Daily Opinion`

Columna diaria/programada de opinión.

Campos:

```txt
title
slug
date
summary
body
image
scheduledAt
isActive
authorName
columnistProfile
```

Relaciones:

```txt
columnistProfile → Personality
image → Media
```

Uso frontend:

- Columna derecha de la portada.
- Página/listado de opiniones.
- Columna de Tony D Reyes u otros columnistas.

Endpoints:

```txt
GET /api/daily-opinions?populate=*
GET /api/daily-opinions?filters[slug][$eq]=mi-columna&populate=*
```

Opinión activa más reciente:

```txt
/api/daily-opinions?filters[isActive][$eq]=true&sort[0]=date:desc&pagination[pageSize]=1&populate=*
```

## `Poll`

Encuesta simple de una sola tabla.

Campos:

```txt
title
slug
question
description
startsAt
endsAt
isActive
order
optionA
countA
optionB
countB
optionC
countC
optionD
countD
optionE
countE
optionF
countF
optionG
countG
optionH
countH
optionI
countI
authorProfile
```

Relaciones:

```txt
authorProfile → Personality
```

Uso frontend:

- Mostrar encuesta activa.
- Al terminar `endsAt`, el frontend debe pedir la siguiente encuesta activa por fecha/orden.
- Las opciones vacías no se muestran.
- Los contadores se modifican mediante endpoint protegido por token.

Encuesta activa actual:

```txt
/api/polls?filters[isActive][$eq]=true&filters[startsAt][$lte]=FECHA_ACTUAL&filters[endsAt][$gte]=FECHA_ACTUAL&sort[0]=order:asc&sort[1]=startsAt:desc&pagination[pageSize]=1&populate=*
```

Como Strapi filters con fecha dinámica pueden ser incómodos, también se puede pedir:

```txt
/api/polls?filters[isActive][$eq]=true&sort[0]=order:asc&sort[1]=startsAt:desc&populate=*
```

y filtrar en Next.js usando `startsAt` y `endsAt`.

### Votar en encuesta

Endpoint Strapi interno:

```txt
POST /api/polls/:documentId/vote
```

Headers:

```http
Content-Type: application/json
X-Poll-Vote-Token: ${POLL_VOTE_TOKEN}
```

Body:

```json
{
  "option": "A"
}
```

Respuesta esperada:

```json
{
  "data": {
    "documentId": "...",
    "option": "A",
    "countA": 12,
    "counts": {
      "A": 12,
      "B": 4,
      "C": 0,
      "D": 0,
      "E": 0,
      "F": 0,
      "G": 0,
      "H": 0,
      "I": 0
    }
  }
}
```

Recomendación: crear una ruta Next.js:

```txt
POST /api/polls/:documentId/vote
```

que reciba del browser:

```json
{ "option": "A" }
```

y desde el servidor Next.js haga la solicitud real a Strapi con `POLL_VOTE_TOKEN`.

## `Advertisement`

Anuncios gestionados manualmente. Los anuncios viejos no se migraron ni se referenciaron.

Campos:

```txt
title
slug
images
linkUrl
position
isActive
startsAt
endsAt
order
metadata
```

`images` acepta múltiples fotos.

Endpoints:

```txt
GET /api/advertisements?filters[isActive][$eq]=true&sort[0]=order:asc&populate=*
GET /api/advertisements?filters[position][$eq]=home_side&populate=*
```

## `User Profile`

Perfil extendido de usuarios del frontend.

Campos:

```txt
displayName
username
email privado
externalUserId
avatar
bio
subscriptionStatus
metadata
isActive
authUser
```

Relaciones:

```txt
authUser → users-permissions.user
avatar → Media
```

Uso frontend:

- Avatar del usuario.
- Nombre visible.
- Estado de suscripción.
- Datos públicos simples sin tocar directamente la tabla de auth.

## `Subscription Plan`

Planes de suscripción.

Campos:

```txt
name
slug
billingPeriod
price
currency
features
isActive
order
```

Endpoints:

```txt
GET /api/subscription-plans?filters[isActive][$eq]=true&sort[0]=order:asc
```

## `Price Board Item`

Página única para monedas, combustibles, energía y otros precios.

Campos:

```txt
name
slug
type
value
buyValue
sellValue
unit
source
externalKey
updatedAtExternal
isActive
order
metadata
```

Tipos:

```txt
currency
fuel
energy
other
```

Uso frontend:

- Página de precios/cambios.
- Puede mezclar datos guardados en Strapi con datos que vengan de FastAPI/APIs externas.

Endpoints:

```txt
GET /api/price-board-items?filters[isActive][$eq]=true&sort[0]=type:asc&sort[1]=order:asc
GET /api/price-board-items?filters[type][$eq]=currency
GET /api/price-board-items?filters[type][$eq]=fuel
GET /api/price-board-items?filters[type][$eq]=energy
```

## `Site Setting`

Configuración global simple del sitio.

Campos:

```txt
siteName
mainLogo
tagline
metadata
```

Endpoint:

```txt
GET /api/site-setting?populate=*
```

---

# APIs externas / FastAPI

Strapi manejará contenido. FastAPI puede seguir manejando datos dinámicos que no conviene guardar manualmente en Strapi.

Variables sugeridas:

```env
FASTAPI_API_URL=http://backend:8000
# o URL pública si aplica:
# FASTAPI_API_URL=https://api-dagendang.or-gm.com
```

Datos esperados desde FastAPI/APIs externas:

```txt
monedas: USD, EUR, CAD, GBP
combustibles
energía: BT, MT, AT
otros precios futuros
```

La página de precios puede combinar:

1. `Price Board Item` desde Strapi para etiquetas/configuración/orden.
2. FastAPI para valores dinámicos actuales.

---

# Helpers sugeridos en Next.js

## Cliente Strapi server-only

```ts
const STRAPI_API_URL = process.env.STRAPI_API_URL!;
const STRAPI_READONLY_TOKEN = process.env.STRAPI_READONLY_TOKEN!;

export async function strapiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${STRAPI_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${STRAPI_READONLY_TOKEN}`,
      ...(init?.headers || {}),
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${path}`);
  }

  return res.json();
}
```

## Resolver URL de media

Las URLs de MinIO ya deben venir absolutas desde Strapi, por ejemplo:

```txt
https://s3-dagendang.or-gm.com/dagendang-assets/archivo.jpg
```

Aun así, usar helper defensivo:

```ts
export function mediaUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_STRAPI_ASSETS_URL}${url}`;
}
```

---

# Endpoints mínimos para portada

```txt
GET /api/site-setting?populate=*
GET /api/categories?sort[0]=order:asc
GET /api/articles?sort[0]=publishedDate:desc&pagination[pageSize]=12&populate=*
GET /api/daily-opinions?filters[isActive][$eq]=true&sort[0]=date:desc&pagination[pageSize]=1&populate=*
GET /api/polls?filters[isActive][$eq]=true&sort[0]=order:asc&sort[1]=startsAt:desc&populate=*
GET /api/price-board-items?filters[isActive][$eq]=true&sort[0]=type:asc&sort[1]=order:asc
```

# Endpoints mínimos para detalle de noticia

```txt
GET /api/articles?filters[slug][$eq]=SLUG&populate=*
```

# Endpoints mínimos para perfil de columnista

```txt
GET /api/personalities?filters[slug][$eq]=SLUG&populate=*
GET /api/daily-opinions?filters[columnistProfile][slug][$eq]=SLUG&sort[0]=date:desc&populate=*
```
