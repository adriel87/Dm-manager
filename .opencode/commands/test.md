---
description: Ejecuta los tests unitarios, analiza fallos y sugiere fixes
agent: build
---
Ejecuta los tests unitarios del proyecto con el siguiente comando:

!`npm run test:run 2>&1`

Analiza el resultado:
- Si todos pasan: muestra un resumen con el número de tests por entidad y confirma que todo está verde.
- Si hay fallos: identifica exactamente qué falló, explica la causa raíz y propón el fix concreto en el código afectado. No modifiques nada hasta que yo lo confirme.

Contexto del proyecto:
- Tests en `__test__/` (nota: la carpeta usa `usaCases`, no `useCases`)
- Framework: Vitest con `vi.fn()` mocks — nunca hay conexiones reales a DB
- Entidades con tests: campaign, character, mission, session, group, dashboard
