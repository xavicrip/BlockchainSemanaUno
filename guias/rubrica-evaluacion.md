# Rúbrica de evaluación — Unidad 1: Blockchain DevOps

> Propuesta de evaluación para el docente y guía de autoevaluación para el estudiante.
> Total: **100 puntos**. Ajusta los pesos según el plan del curso.

---

## Criterios y pesos

| # | Criterio | Peso |
|---|----------|------|
| 1 | Comprensión teórica (DevOps y DevSecOps) | 20 pts |
| 2 | Ejecución del proyecto (DApp funcionando) | 25 pts |
| 3 | Laboratorio DevOps (pipeline CI/CD) | 20 pts |
| 4 | Laboratorio DevSecOps (seguridad) | 20 pts |
| 5 | Reto / extensión | 15 pts |
| | **Total** | **100 pts** |

---

## Niveles de logro por criterio

### 1. Comprensión teórica (20 pts)

| Nivel | Descripción | Puntos |
|-------|-------------|--------|
| Excelente | Explica con claridad CALMS, el ciclo CI/CD, métricas DORA y el concepto "shift-left"; relaciona la teoría con el caso del repositorio. | 18–20 |
| Bueno | Comprende los conceptos principales pero con algunas imprecisiones o sin conectarlos al proyecto. | 13–17 |
| En proceso | Identifica términos sueltos sin integrarlos. | 7–12 |
| Inicial | No demuestra comprensión de los fundamentos. | 0–6 |

### 2. Ejecución del proyecto (25 pts)

| Nivel | Descripción | Puntos |
|-------|-------------|--------|
| Excelente | Instala, pasa las 12 pruebas, despliega en la red local y emite/verifica un certificado desde la DApp sin ayuda. | 22–25 |
| Bueno | Logra ejecutar el proyecto con apoyo puntual; resuelve la mayoría de los errores. | 16–21 |
| En proceso | Ejecuta parcialmente (p.ej. pruebas sí, DApp no). | 9–15 |
| Inicial | No logra poner en marcha el proyecto. | 0–8 |

### 3. Laboratorio DevOps (20 pts)

| Nivel | Descripción | Puntos |
|-------|-------------|--------|
| Excelente | Ejecuta lint y cobertura, explica cada etapa del pipeline `ci.yml` y demuestra el ciclo "romper prueba → CI rojo → arreglar → CI verde". | 18–20 |
| Bueno | Completa el laboratorio pero explica el pipeline de forma superficial. | 13–17 |
| En proceso | Corre algunos comandos sin entender el flujo de CI. | 7–12 |
| Inicial | No completa el laboratorio. | 0–6 |

### 4. Laboratorio DevSecOps (20 pts)

| Nivel | Descripción | Puntos |
|-------|-------------|--------|
| Excelente | Corre Slither e interpreta su salida, explica por qué los secretos no van al repo y analiza el control de acceso del contrato. | 18–20 |
| Bueno | Realiza el análisis de seguridad con comprensión parcial de los hallazgos. | 13–17 |
| En proceso | Ejecuta herramientas sin interpretar resultados. | 7–12 |
| Inicial | No completa el laboratorio. | 0–6 |

### 5. Reto / extensión (15 pts)

| Nivel | Descripción | Puntos |
|-------|-------------|--------|
| Excelente | Implementa un reto completo con su prueba automatizada y lo documenta. | 13–15 |
| Bueno | Implementa el reto con pruebas incompletas o documentación mínima. | 9–12 |
| En proceso | Intenta el reto sin completarlo. | 4–8 |
| Inicial | No aborda el reto. | 0–3 |

---

## Ideas de reto / extensión

Elige **uno** (o propón el tuyo, sujeto a aprobación del docente):

### Reto A — Nueva función en el contrato *(nivel: intermedio)*
Añade una función `totalCertificadosPorEmisor(address)` que cuente cuántos certificados ha emitido
una dirección. Requisitos:
- Modifica `contracts/RegistroCertificados.sol`.
- Añade **al menos 2 pruebas** en `test/RegistroCertificados.test.js`.
- Las 12 pruebas existentes deben seguir pasando.
- `npm run lint:sol` sin errores.

### Reto B — Ampliar el pipeline *(nivel: intermedio)*
Agrega un nuevo *job* o paso al workflow `.github/workflows/ci.yml`. Por ejemplo:
- Un paso que ejecute `npm run format` y verifique el formato, **o**
- Un *job* que publique el reporte de cobertura como artefacto.
Documenta qué hace y por qué aporta valor DevOps.

### Reto C — Mejora de seguridad *(nivel: avanzado)*
Identifica una mejora de seguridad en el contrato (p.ej. un evento adicional para auditoría, una
validación extra de entradas, o un patrón de pausa de emergencia) e impleméntala con su prueba.
Justifica la mejora citando una vulnerabilidad de
[02-vulnerabilidades-smart-contracts.md](../docs/04-devsecops/02-vulnerabilidades-smart-contracts.md).

---

## Autoevaluación rápida (checklist del estudiante)

Antes de entregar, marca lo que puedes hacer **sin ayuda**:

- [ ] Explico la diferencia entre DevOps y DevSecOps con un ejemplo.
- [ ] Las 12 pruebas pasan en mi máquina (`npm test`).
- [ ] Desplegué el contrato y emití un certificado desde la DApp.
- [ ] Entiendo cada etapa del pipeline `ci.yml`.
- [ ] Corrí Slither y sé leer un hallazgo.
- [ ] Sé por qué `.env` no se sube al repositorio.
- [ ] Completé y documenté un reto.

> Si marcaste 6 o 7: ¡excelente dominio! Si marcaste 3–5: repasa las guías de laboratorio.
> Si marcaste menos de 3: vuelve a la [guía 02](./02-ejecutar-el-proyecto.md) y a la teoría en
> [`../docs/01-investigacion/`](../docs/01-investigacion/).
