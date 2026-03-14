---
description: Lint + typecheck + tests unitarios en un solo pase — reporte de estado completo
agent: build
---
Ejecuta el pipeline de calidad completo del proyecto en secuencia:

**1. Lint**
!`npm run lint 2>&1`

**2. TypeScript**
!`npx tsc --noEmit 2>&1`

**3. Tests unitarios**
!`npm run test:run 2>&1`

Una vez que tengas los tres resultados, presenta un reporte con este formato:

```
## Estado del proyecto

| Check | Estado | Detalles |
|-------|--------|----------|
| ESLint | ✅/❌ | N errores / warnings |
| TypeScript | ✅/❌ | N errores |
| Tests unitarios | ✅/❌ | N passed, N failed |

## Problemas encontrados
[Solo si hay errores — lista priorizada con el fix sugerido para cada uno]

## Próximos pasos
[Qué debería resolverse primero]
```

Si todo está verde, confirma el estado con un resumen positivo.
No modifiques ningún archivo hasta que yo lo pida explícitamente.
