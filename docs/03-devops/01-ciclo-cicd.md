# 01 — El Ciclo CI/CD Aplicado a Este Proyecto

> **Módulo:** 03 DevOps Práctico · UTPL Blockchain 2026
> **Prerequisito:** haber leído [`../01-investigacion/`](../01-investigacion/) para los conceptos base de DevOps.

---

## 1. ¿Qué es el ciclo CI/CD?

**CI (Integración Continua)** significa que cada cambio de código se integra al repositorio
principal de forma frecuente y que, al hacerlo, se ejecuta automáticamente una batería de
verificaciones (lint, compilación, pruebas). El objetivo es detectar errores en minutos, no
en días.

**CD (Entrega/Despliegue Continuo)** extiende CI: si todas las verificaciones pasan, el
artefacto resultante se entrega (o incluso se despliega) automáticamente.

```
Desarrollador                Servidor CI/CD                     Destino
──────────                   ──────────────                     ───────
  git push  ──────────────►  lint + compile + test  ──────►  deploy (si todo pasa)
               (automático)         (automático)
```

---

## 2. Diagrama del pipeline de este proyecto

El siguiente diagrama muestra el pipeline **real** definido en `.github/workflows/ci.yml`.
Cada nodo se corresponde con un paso o job concreto del archivo YAML.

```mermaid
flowchart TD
    A([fa:fa-code git push / Pull Request]) --> B

    subgraph JOB1["Job: ci-pipeline (ubuntu-latest)"]
        B[Checkout del código\nactions/checkout@v4]
        B --> C[Setup Node.js 20 LTS\nactions/setup-node@v4\ncaché npm activa]
        C --> D[npm ci\nInstalación reproducible]
        D --> E{npm run lint:sol\nSolhint — reglas de estilo\ny buenas prácticas}
        E -->|FALLA| FAIL1([Pipeline rojo\nCódigo rechazado])
        E -->|OK| F{npm run compile\nhardhat compile\nsolc 0.8.24}
        F -->|FALLA| FAIL2([Pipeline rojo\nError de compilación])
        F -->|OK| G{npm test\n12 pruebas Mocha+Chai\nEVM en memoria}
        G -->|FALLA| FAIL3([Pipeline rojo\nPrueba fallida])
        G -->|OK| SUCCESS1([✔ Job ci-pipeline pasó])
    end

    SUCCESS1 --> H

    subgraph JOB2["Job: coverage (ubuntu-latest, continue-on-error)"]
        H[Checkout + Setup Node + npm ci]
        H --> I[npm run coverage\nhardhat coverage\nInstrumenta el contrato]
        I --> COVI([Reporte de cobertura\nen el log de Actions])
    end

    SUCCESS1 --> DEPLOY

    subgraph DEPLOY_FASE["Fase CD (futura extensión del pipeline)"]
        DEPLOY([fa:fa-rocket deploy:local / deploy:sepolia\ncuando la rama sea main\ny todos los checks pasen])
    end

    style FAIL1 fill:#d73a49,color:#fff
    style FAIL2 fill:#d73a49,color:#fff
    style FAIL3 fill:#d73a49,color:#fff
    style SUCCESS1 fill:#28a745,color:#fff
    style DEPLOY fill:#0366d6,color:#fff
    style COVI fill:#6f42c1,color:#fff
```

---

## 3. Etapas del pipeline y su script npm

Cada etapa del diagrama tiene un script `npm` equivalente que puedes correr **localmente**
para obtener el mismo resultado que el servidor de CI.

| # | Etapa en CI | Script npm local | Herramienta | ¿Qué verifica? |
|---|---|---|---|---|
| 1 | Checkout | — | `git` / Actions | Obtiene los archivos del repositorio |
| 2 | Setup Node | — | `actions/setup-node` | Entorno reproducible (Node 20 LTS) |
| 3 | Instalar deps | `npm ci` | npm | Instala dependencias idénticas a `package-lock.json` |
| 4 | Lint | `npm run lint:sol` | Solhint | Estilo, seguridad y convenciones de Solidity |
| 5 | Compilar | `npm run compile` | Hardhat + solc | El contrato compila sin errores ni warnings fatales |
| 6 | Pruebas | `npm test` | Mocha + Chai + Hardhat | Las 12 pruebas del comportamiento del contrato pasan |
| 7 | Cobertura | `npm run coverage` | hardhat-coverage | Porcentaje de líneas/ramas cubiertas por las pruebas |

> **Clave didáctica:** si un paso falla, los siguientes **no se ejecutan**. No tiene
> sentido probar código que ni siquiera compila. Esta secuencia tiene lógica deliberada.

---

## 4. CI vs. CD — diferencias clave

| Concepto | CI | CD |
|---|---|---|
| **Significado** | Integración Continua | Entrega / Despliegue Continuo |
| **Frecuencia** | Cada push o PR | Cuando CI pasa (puede ser automático o con aprobación manual) |
| **Objetivo** | Detectar errores rápido | Reducir el tiempo entre código listo y código en producción |
| **Artefacto** | Código validado | Contrato desplegado / Frontend publicado |
| **En este proyecto** | Lint + Compile + Test | `npm run deploy:local` / `deploy:sepolia` (fases futuras) |
| **Responsable** | El servidor de CI automáticamente | El pipeline CD (o el desarrollador con aprobación manual) |

---

## 5. Por qué en blockchain el despliegue es irreversible

En una aplicación web tradicional, si detectas un bug después del despliegue puedes hacer
*rollback*: volver a la versión anterior en segundos. En blockchain, **no existe rollback**.

```
Web tradicional              Blockchain (Ethereum/Sepolia)
───────────────              ────────────────────────────
deploy v1  ──►  rollback     deploy v1  ──►  ¡permanente en la cadena!
               a v0           si hay bug, deploy v2 (nuevo contrato,
               en 30 seg      nueva dirección, migrar usuarios)
```

**Consecuencias prácticas para el pipeline:**

1. **El CI debe ser exhaustivo.** Un bug que llega a la red pública es visible para siempre
   en el explorador de bloques (Etherscan). No hay forma de borrarlo.

2. **El lint no es opcional.** Un error de control de acceso detectado por Solhint antes
   del deploy cuesta 0 €. El mismo error en producción puede costar todo lo que hay en el
   contrato.

3. **Las pruebas son la última barrera.** Las 12 pruebas de `RegistroCertificados.test.js`
   cubren todos los flujos de control de acceso (propietario, emisor autorizado, atacante).
   Si una de ellas falla, el deploy no avanza.

4. **La cobertura importa.** Un porcentaje bajo de cobertura significa que hay caminos de
   código no probados. En Solidity, esos caminos sin probar pueden contener
   vulnerabilidades críticas.

```
Costo de corregir un bug:
   En desarrollo local       →   segundos
   En el pipeline de CI      →   minutos
   En testnet (Sepolia)      →   horas (reeploy + migración)
   En mainnet (producción)   →   potencialmente irrecuperable
```

> **Regla de oro:** en un proyecto blockchain, **nada se despliega a la red hasta que
> todos los checks de CI pasan en verde**. El `ci.yml` de este proyecto hace cumplir
> esa regla automáticamente.

---

## 6. El ciclo completo: desde el editor hasta la cadena

```mermaid
sequenceDiagram
    actor Dev as Desarrolladora
    participant Git as Repositorio Git
    participant CI as GitHub Actions (CI)
    participant Net as Red Ethereum (Sepolia)

    Dev->>Git: git push origin main
    Git->>CI: Dispara workflow ci.yml
    CI->>CI: npm run lint:sol
    CI->>CI: npm run compile
    CI->>CI: npm test
    CI->>CI: npm run coverage
    CI-->>Git: Reporta resultado (verde / rojo)
    Git-->>Dev: Notificación por email / badge

    Note over CI,Net: Solo si TODOS los checks pasan:
    CI->>Net: npm run deploy:sepolia (fase CD futura)
    Net-->>Dev: Dirección del contrato desplegado
```

---

## Lecturas relacionadas

- [`02-pipeline-github-actions.md`](./02-pipeline-github-actions.md) — Análisis detallado del archivo `ci.yml`.
- [`03-automatizacion-local.md`](./03-automatizacion-local.md) — Cómo replicar el CI en tu máquina.
- [`04-laboratorio-devops.md`](./04-laboratorio-devops.md) — Practica rompiendo y arreglando el pipeline.
- [`../04-devsecops/`](../04-devsecops/) — Cómo añadir análisis de seguridad (Slither, `npm audit`) al pipeline.
