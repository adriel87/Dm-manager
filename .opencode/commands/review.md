---
description: Code review del estado actual — analiza límites de capas, convenciones y cobertura de tests
agent: plan
---
Haz un code review del estado actual del proyecto. Primero obtén el diff:

!`git diff HEAD 2>&1`
!`git status 2>&1`

Revisa los cambios considerando estos puntos, organizando el feedback por severidad:

**🔴 Crítico** (viola arquitectura o puede causar bugs):
- ¿Algún use case importa una implementación concreta en lugar de recibir el repositorio como parámetro?
- ¿Alguna capa importa de una capa exterior (domain→application, domain→infrastructure, application→infrastructure)?
- ¿Hay rutas relativas cruzando capas en lugar del alias `@/*`?
- ¿Los IDs se manipulan como ObjectId fuera del mapper?

**🟡 Importante** (convenciones del proyecto):
- ¿Los nombres de archivos siguen el patrón correcto? (ver `docs/conventions.md`)
- ¿Los nuevos componentes UI son SC cuando podrían serlo?
- ¿Los tests usan `vi.fn()` o tienen conexiones reales?
- ¿Los locators E2E usan `getByRole`/`getByLabel` o selectores CSS?

**🟢 Sugerencias** (mejoras opcionales):
- Oportunidades de simplificación
- Consistencia con patrones existentes

No modifiques ningún archivo. Solo analiza y reporta.
