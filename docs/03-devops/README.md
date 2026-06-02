# Módulo 03 — DevOps Práctico: CI/CD para Blockchain

> **Curso:** Blockchain · UTPL · Unidad 1, sección 1.1 Fundamentos DevOps
> **Caso de estudio:** DApp "Registro de Certificados" sobre Ethereum

---

## Descripción del módulo

Este módulo traduce los conceptos de DevOps a acciones concretas sobre el repositorio del
curso. Partimos del contrato `RegistroCertificados.sol` y su suite de pruebas para construir,
paso a paso, un **pipeline de Integración Continua (CI)** real usando GitHub Actions.

La filosofía es **aprender haciendo**: cada archivo de este directorio tiene un equivalente
directo en el código o en la configuración del proyecto. No hay teoría desconectada de la
práctica.

---

## Objetivos de aprendizaje

Al finalizar este módulo, el estudiante será capaz de:

1. Describir las etapas del ciclo CI/CD y mapearlas a los comandos `npm` del proyecto.
2. Leer e interpretar el archivo `.github/workflows/ci.yml` línea por línea.
3. Ejecutar localmente el mismo flujo que corre el servidor de CI (lint → compile → test).
4. Identificar y corregir una falla en el pipeline usando los logs de GitHub Actions.
5. Explicar por qué en blockchain el despliegue exige que todas las etapas previas pasen.
6. Aplicar buenas prácticas de reproducibilidad: `npm ci`, `.env.example`, `package-lock.json`.

---

## Contenido del módulo

| Archivo | Tema |
|---|---|
| `01-ciclo-cicd.md` | El ciclo CI/CD aplicado a este proyecto: diagrama, etapas y relación con los scripts `npm` |
| `02-pipeline-github-actions.md` | Guía línea por línea del archivo `ci.yml`; cómo leer los resultados en GitHub |
| `03-automatizacion-local.md` | Scripts `npm`, pre-commit hooks, reproducibilidad y gestión de secretos |
| `04-laboratorio-devops.md` | Laboratorio práctico: desde el fork hasta ver pasar y fallar el pipeline |

---

## Relación con otros módulos

```
docs/
├── 01-investigacion/   ← Marco teórico y conceptos DevOps/DevSecOps
├── 02-arquitectura/    ← Diseño de la DApp (C4, diagramas de secuencia)
├── 03-devops/          ← ESTÁS AQUÍ — Pipeline CI/CD práctico
├── 04-devsecops/       ← Seguridad automatizada (Slither, auditorías, SAST)
└── 05-nube/            ← Despliegue en la nube (Vercel, RPC gestionado, IaC)
```

- Para entender **qué es** DevOps antes de practicarlo, lee [`../01-investigacion/`](../01-investigacion/).
- Para entender **cómo está construida** la DApp que estamos probando, lee [`../02-arquitectura/`](../02-arquitectura/).
- Para agregar controles de **seguridad** al pipeline, continúa en [`../04-devsecops/`](../04-devsecops/).

---

## Archivo central de este módulo

El artefacto principal que produce este módulo es el workflow de CI:

```
.github/workflows/ci.yml
```

Todo lo que se documenta aquí tiene reflejo directo en ese archivo.

---

## Cómo usar este módulo

**Lectura lineal recomendada:**

```
01-ciclo-cicd.md  →  02-pipeline-github-actions.md  →  03-automatizacion-local.md  →  04-laboratorio-devops.md
```

**Lectura rápida (solo práctica):**

1. Ve directamente a `04-laboratorio-devops.md`.
2. Cuando necesites entender *por qué* algo funciona así, vuelve a los archivos anteriores.

---

*Módulo mantenido por el equipo DevOps — UTPL Blockchain 2026.*
