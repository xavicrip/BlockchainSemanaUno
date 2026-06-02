# Módulo 04 — DevSecOps en Blockchain

> **Curso:** Blockchain · UTPL · Ciclo Abril–Agosto 2026
> **Unidad:** 1 — Blockchain DevOps
> **Sección:** 1.2 Fundamentos DevSecOps
> **Directorio:** `docs/04-devsecops/`

---

## Objetivos de aprendizaje

Al completar este módulo, el estudiante será capaz de:

1. **Definir** DevSecOps y el principio "shift-left security" y contrastarlos con el enfoque tradicional de seguridad al final del ciclo.
2. **Identificar** las cuatro categorías de análisis de seguridad automatizado presentes en este repositorio: SAST, lint de seguridad, SCA y secret scanning.
3. **Interpretar** la salida de herramientas reales (Slither, Solhint, npm audit, Gitleaks) y clasificar sus hallazgos.
4. **Reconocer** las ocho vulnerabilidades más frecuentes en smart contracts y verificar cómo `RegistroCertificados.sol` las mitiga.
5. **Aplicar** las buenas prácticas de gestión de secretos: uso de `.env`, GitHub Secrets y rotación de claves.
6. **Ejecutar** el laboratorio DevSecOps completo: introducir una vulnerabilidad deliberada, detectarla y revertirla.

---

## ¿Qué es "Shift-Left Security"?

En el modelo tradicional de desarrollo, la seguridad se evaluaba al final: el producto se construía, se probaba funcionalmente y, justo antes del despliegue, un equipo de seguridad lo revisaba. Este enfoque tiene un problema fundamental: **cuanto más tarde se detecta un defecto de seguridad, más caro es corregirlo**.

```
Modelo tradicional (Shift-Right):
  Diseño → Código → Build → Test → [SEGURIDAD] → Deploy

Modelo DevSecOps (Shift-Left):
  [SEC] Diseño → [SEC] Código → [SEC] Build → [SEC] Test → [SEC] Deploy
```

**"Shift-left"** significa mover los controles de seguridad hacia la izquierda del ciclo de vida, integrándolos desde el diseño, en el editor del desarrollador, en cada commit y en cada pull request. En el mundo blockchain esto es especialmente crítico: **un contrato inteligente desplegado en mainnet no puede parchearse**. Un error de seguridad en producción puede significar la pérdida irreversible de fondos o la corrupción del registro de certificados.

### Costo relativo de corregir un defecto de seguridad

| Momento de detección | Costo relativo |
|----------------------|---------------|
| Durante el diseño | 1x |
| Durante el desarrollo (linter en el editor) | 5x |
| Durante la revisión de código (PR) | 10x |
| Durante pruebas (CI) | 15x |
| En producción (post-despliegue) | 100x–1000x |
| En blockchain mainnet (inmutable) | **Irreversible** |

---

## Contenido del módulo

| Archivo | Tema | Tiempo estimado |
|---------|------|-----------------|
| [01-pipeline-seguro.md](./01-pipeline-seguro.md) | El pipeline DevSecOps completo: diagrama, SAST, lint, SCA y secret scanning | ~20 min |
| [02-vulnerabilidades-smart-contracts.md](./02-vulnerabilidades-smart-contracts.md) | Top 8 vulnerabilidades en contratos: qué son, código vulnerable vs seguro, cómo las mitiga RegistroCertificados | ~35 min |
| [03-gestion-de-secretos.md](./03-gestion-de-secretos.md) | Manejo de claves privadas y secretos: .env, GitHub Secrets, rotación, riesgo específico en blockchain | ~15 min |
| [04-laboratorio-devsecops.md](./04-laboratorio-devsecops.md) | Laboratorio paso a paso: Slither, Solhint, introducir y detectar vulnerabilidades, security gate | ~45 min |

---

## Relación con el resto del repositorio

```
docs/01-investigacion/1.2-fundamentos-devsecops.md  ← Base teórica de este módulo
docs/02-arquitectura/05-modelo-roles-seguridad.md   ← Diseño de seguridad del contrato
docs/03-devops/                                     ← Pipeline CI/CD (no modificar)
docs/04-devsecops/                                  ← Aquí estás: seguridad automatizada
.github/workflows/devsecops.yml                     ← El workflow que implementa este módulo
contracts/RegistroCertificados.sol                  ← El contrato bajo análisis
```

---

## Herramientas de seguridad del pipeline

| Herramienta | Tipo | Job en devsecops.yml | Qué detecta |
|-------------|------|----------------------|-------------|
| **Slither** | SAST | `sast-slither` | Vulnerabilidades en bytecode y AST de Solidity |
| **Solhint** | Lint de seguridad | `lint-solhint` | Patrones inseguros en código fuente Solidity |
| **npm audit** | SCA | `sca-npm-audit` | CVEs en dependencias de Node.js/Hardhat |
| **Gitleaks** | Secret scanning | `secret-scanning-gitleaks` | Claves privadas y tokens en el historial de git |
| **Hardhat tests** | DAST ligero | `tests-cobertura` | Lógica de acceso, validaciones, invariantes |

---

## Referencia al marco teórico

Este módulo aplica en la práctica los conceptos descritos en:
- [docs/01-investigacion/1.2-fundamentos-devsecops.md](../01-investigacion/1.2-fundamentos-devsecops.md) — Fundamentos teóricos de DevSecOps, tipos de análisis y el modelo de madurez.

El diseño de seguridad del contrato analizado en este módulo está documentado en:
- [docs/02-arquitectura/05-modelo-roles-seguridad.md](../02-arquitectura/05-modelo-roles-seguridad.md) — Roles, modificadores y matriz de permisos de `RegistroCertificados.sol`.

---

*Módulo elaborado para el repositorio didáctico UTPL — Blockchain DevOps 2026.*
