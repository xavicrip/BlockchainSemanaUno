# Módulo 1: Marco Teórico — DevOps y DevSecOps en Blockchain

> **Curso:** Blockchain · UTPL · Ciclo Abril–Agosto 2026
> **Unidad:** 1 — Blockchain DevOps
> **Directorio:** `docs/01-investigacion/`

---

## Propósito de este módulo

Este módulo presenta los fundamentos conceptuales que sustentan toda la práctica de la unidad.
Antes de escribir una sola línea de código o configurar un pipeline, es importante entender
**por qué** existen DevOps y DevSecOps, qué problemas resuelven y cómo se traducen al
mundo particular de los proyectos blockchain.

El hilo conductor es nuestro caso de estudio: la **DApp de Registro de Certificados Académicos**,
un contrato inteligente desplegado en Ethereum que una institución educativa podría usar para
emitir y verificar títulos de manera transparente e inmutable.

---

## Objetivos de aprendizaje

Al terminar la lectura de este módulo, el estudiante será capaz de:

1. **Describir** qué es DevOps, su origen cultural y el modelo CALMS.
2. **Explicar** el ciclo de vida DevOps (infinity loop) y las métricas DORA.
3. **Distinguir** entre Integración Continua, Entrega Continua y Despliegue Continuo.
4. **Definir** DevSecOps y el principio "shift-left security".
5. **Identificar** los principales tipos de análisis de seguridad (SAST, DAST, SCA).
6. **Relacionar** las vulnerabilidades clásicas de smart contracts con los controles aplicados
   en `RegistroCertificados.sol`.
7. **Consultar** el glosario y las referencias para profundizar en cada tema.

---

## Contenidos del módulo

| Archivo | Tema | Tiempo estimado de lectura |
|---------|------|---------------------------|
| [1.1-fundamentos-devops.md](./1.1-fundamentos-devops.md) | Fundamentos de DevOps: cultura, CALMS, ciclo CI/CD, IaC, métricas DORA y aplicación a blockchain | ~25 min |
| [1.2-fundamentos-devsecops.md](./1.2-fundamentos-devsecops.md) | Fundamentos de DevSecOps: shift-left, tipos de análisis, pipeline seguro y vulnerabilidades de smart contracts | ~25 min |
| [glosario.md](./glosario.md) | Glosario alfabético de 30+ términos clave | Referencia rápida |
| [referencias.md](./referencias.md) | Bibliografía, documentación oficial y recursos complementarios | Referencia rápida |

---

## Relación con el resto del repositorio

Este módulo es la **base teórica**. Los módulos siguientes aplican estos conceptos de forma práctica:

```
docs/01-investigacion/   <-- Aquí estás: teoría y marcos conceptuales
docs/02-arquitectura/    Modelado C4, diagramas de secuencia y despliegue
docs/03-devops/          Práctica: pipeline CI/CD con GitHub Actions
docs/04-devsecops/       Práctica: seguridad automatizada con Slither y Solhint
docs/05-nube/            Arquitectura en la nube: Vercel, IPFS, RPC gestionado
guias/                   Laboratorios y actividades para el estudiante
```

---

## Cómo usar este módulo

1. **Primera lectura:** sigue el orden de la tabla de contenidos.
2. **Durante la práctica:** consulta el [glosario](./glosario.md) cuando encuentres un término desconocido.
3. **Para profundizar:** acude a las [referencias](./referencias.md) al final de cada sección teórica.
4. **Evaluación:** al final de cada documento encontrarás preguntas de reflexión que guiarán
   el análisis crítico del material.

---

*Módulo elaborado para el repositorio didáctico UTPL — Blockchain DevOps 2026.*
