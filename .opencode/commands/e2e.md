---
description: Ejecuta los tests E2E con Playwright, analiza fallos y propone correcciones
agent: build
---
Ejecuta los tests E2E del proyecto:

!`npm run test:e2e 2>&1`

Analiza el resultado:
- Si todos pasan: muestra un resumen por spec file (campaigns, characters, campaign-detail) con los TCs ejecutados.
- Si hay fallos: por cada test fallido indica:
  1. El TC afectado y su spec file
  2. El locator o paso que falló
  3. Si es un problema del test o de la UI
  4. El fix propuesto (en el spec o en el componente)
  No modifiques nada hasta que yo lo confirme.

Contexto del proyecto:
- Specs: `e2e/campaigns.spec.ts` (TC-01–06), `e2e/characters.spec.ts` (TC-13–18), `e2e/campaign-detail.spec.ts` (TC-07–12)
- Page Object Models en `e2e/pages/`
- API helpers en `e2e/helpers/api.ts`
- Locators: siempre `getByRole`/`getByLabel` primero, nunca selectores CSS
- Requiere servidor corriendo en localhost:3000 y MongoDB activo
