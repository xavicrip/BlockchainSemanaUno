# 06 — Vista de Despliegue

> **Módulo:** Modelado y Arquitectura · Unidad 1 Blockchain DevOps · UTPL

---

## ¿Por qué una vista de despliegue?

El código fuente y el sistema en producción son cosas distintas.
La vista de despliegue responde: **¿dónde vive cada artefacto cuando el sistema está ejecutando?**
En una DApp, esta pregunta tiene una complejidad especial porque los artefactos están distribuidos
en infraestructuras muy diferentes: un navegador, un servidor de hosting, la blockchain global, y pipelines en la nube.

---

## Diagrama de despliegue — Vista de artefactos y nodos

```mermaid
flowchart TB
    subgraph BROWSER["Nodo: Navegador del usuario"]
        DAPP_UI["Artefacto: index.html\nArtefacto: app.js\nArtefacto: deployment.json\n(cargados desde CDN/hosting)"]
        MM_EXT["Extensión: MetaMask\n(instalada en el navegador)"]
    end

    subgraph HOSTING["Nodo: Hosting estático"]
        subgraph VERCEL["Vercel / IPFS"]
            STATIC["Artefactos:\nindex.html\napp.js\ndeployment.json"]
            CDN["CDN global\n(distribución geográfica)"]
        end
    end

    subgraph ETHEREUM["Nodo: Red Ethereum"]
        subgraph SEPOLIA["Entorno: Sepolia Testnet"]
            CONTRACT_TEST["Artefacto: RegistroCertificados\n(bytecode desplegado)\nDirección: 0x..."]
        end
        subgraph MAINNET["Entorno: Mainnet (producción)"]
            CONTRACT_MAIN["Artefacto: RegistroCertificados\n(bytecode desplegado)\nDirección: 0x..."]
        end
    end

    subgraph RPC_NODE["Nodo: Proveedor RPC gestionado"]
        ALCHEMY["Alchemy / Infura\nAPI JSON-RPC HTTPS\nAPI WebSocket (eventos)"]
    end

    subgraph CICD["Nodo: GitHub Actions (nube de GitHub)"]
        PIPELINE_CI["Pipeline: ci.yml\nCompilación + pruebas + lint"]
        PIPELINE_SEC["Pipeline: devsecops.yml\nSlither + Solhint + npm audit"]
        PIPELINE_DEPLOY["Pipeline: deploy\nscripts/deploy.js\n→ genera deployment.json"]
    end

    subgraph LOCAL["Nodo: Entorno local del desarrollador"]
        HARDHAT["Hardhat Node\n(blockchain local\npuerto 8545)"]
        CONTRACT_LOCAL["Artefacto: RegistroCertificados\n(bytecode en nodo local)\nDirección: 0x5FbDB2..."]
    end

    BROWSER -- "HTTP/HTTPS carga DApp" --> HOSTING
    DAPP_UI -- "window.ethereum" --> MM_EXT
    MM_EXT -- "JSON-RPC HTTPS/WSS" --> RPC_NODE
    RPC_NODE -- "transacciones / eth_call" --> ETHEREUM

    PIPELINE_DEPLOY -- "despliega contrato" --> ETHEREUM
    PIPELINE_DEPLOY -- "genera deployment.json" --> STATIC
    PIPELINE_CI -- "activa con push/PR" --> PIPELINE_SEC
    PIPELINE_CI -- "activa con merge a main" --> PIPELINE_DEPLOY

    LOCAL -- "despliegue manual en dev" --> HARDHAT
```

---

## Los tres entornos y la promoción entre ellos

```mermaid
flowchart LR
    subgraph LOCAL["Entorno Local\n(desarrollo)"]
        direction TB
        HH["Hardhat Node\nnpm run node"]
        DEPLOY_L["npm run deploy:local\nscripts/deploy.js"]
        CONTRACT_L["Contrato local\n0x5FbDB2315678..."]
        HH --> DEPLOY_L --> CONTRACT_L
    end

    subgraph TESTNET["Entorno Testnet\n(integración / QA)"]
        direction TB
        SEP["Red Sepolia\n(Ethereum testnet pública)"]
        DEPLOY_T["CI deploy on push\na branch develop"]
        CONTRACT_T["Contrato en Sepolia\n0xAbCd..."]
        SEP --> DEPLOY_T --> CONTRACT_T
    end

    subgraph PROD["Entorno Producción\n(mainnet)"]
        direction TB
        MAIN["Red Ethereum Mainnet"]
        DEPLOY_M["CI deploy on merge\na main (aprobación manual)"]
        CONTRACT_M["Contrato en Mainnet\n0x1234...\n(INMUTABLE para siempre)"]
        MAIN --> DEPLOY_M --> CONTRACT_M
    end

    LOCAL -- "push a develop\nCI verifica y despliega en testnet" --> TESTNET
    TESTNET -- "PR aprobado + merge a main\nCI despliega en mainnet" --> PROD

    style PROD fill:#ffcccc,stroke:#cc0000
    style CONTRACT_M fill:#ffcccc,stroke:#cc0000
```

### Criterios de promoción entre entornos

| Criterio | Local → Testnet | Testnet → Mainnet |
|---|---|---|
| Pruebas unitarias | Deben pasar (CI bloquea) | Deben pasar (CI bloquea) |
| Análisis Slither | Opcional (local) | Sin findings críticos |
| Revisión de código | No requerida | PR aprobado por revisor |
| Gas estimado | No aplica | Verificado y aceptable |
| Dirección del contrato | Temporal (cada deploy cambia) | Fija para siempre |
| Aprobación manual | No requerida | Requerida (environment protection en GitHub) |

---

## Diagrama de despliegue — Flujo del pipeline CI/CD

```mermaid
sequenceDiagram
    actor Dev as Desarrollador
    participant GIT as GitHub<br/>(repositorio)
    participant CI as GitHub Actions<br/>(ci.yml)
    participant SEC as GitHub Actions<br/>(devsecops.yml)
    participant HARDHAT as Hardhat<br/>(en runner)
    participant VERCEL as Vercel<br/>(hosting)
    participant ETH as Ethereum<br/>(Sepolia)

    Dev->>GIT: git push (branch feature/x)

    GIT->>CI: trigger: push

    CI->>HARDHAT: npm install
    CI->>HARDHAT: npx hardhat compile
    CI->>HARDHAT: npx hardhat test
    HARDHAT-->>CI: 12 pruebas OK

    CI->>SEC: trigger devsecops.yml
    SEC-->>CI: Slither OK, Solhint OK, audit OK

    CI-->>Dev: PR checks verdes

    Dev->>GIT: merge a main (PR aprobado)

    GIT->>CI: trigger: push to main

    CI->>HARDHAT: deploy a Sepolia\nnpx hardhat run scripts/deploy.js --network sepolia
    HARDHAT->>ETH: transacción de despliegue

    ETH-->>HARDHAT: dirección del contrato desplegado

    HARDHAT-->>CI: genera frontend/deployment.json\n{address: "0x...", abi: [...]}

    CI->>VERCEL: vercel deploy --prod\n(incluye deployment.json actualizado)

    VERCEL-->>CI: URL de producción

    CI-->>Dev: despliegue completado\nURL lista
```

---

## Artefactos y su ubicación por entorno

| Artefacto | Entorno local | Testnet Sepolia | Mainnet |
|---|---|---|---|
| `RegistroCertificados.sol` (fuente) | `contracts/` en el repo | `contracts/` en el repo | `contracts/` en el repo |
| Bytecode compilado | `artifacts/` (generado) | `artifacts/` (generado en CI) | `artifacts/` (generado en CI) |
| Dirección del contrato | `frontend/deployment.json` (local) | `frontend/deployment.json` (CI) | `frontend/deployment.json` (CI) |
| ABI del contrato | `frontend/deployment.json` | `frontend/deployment.json` | `frontend/deployment.json` |
| Frontend (`index.html`, `app.js`) | Local (servidor estático) | Vercel (preview URL) | Vercel (URL de producción) |
| Logs de eventos | Nodo Hardhat local | Explorador Sepolia Etherscan | Explorador Etherscan |

---

## Decisiones arquitectónicas y trade-offs

| Decisión | Alternativa | Ventaja de la decisión tomada | Trade-off / Limitación |
|---|---|---|---|
| **Vercel para hosting del frontend** | IPFS / Filecoin | Despliegue simple, previsualizaciones de PR, dominio personalizado gratis | Centralizado: si Vercel falla, la UI no está disponible (pero el contrato sí) |
| **IPFS como opción alternativa** | Solo Vercel | Descentralizado: el frontend sobrevive aunque el dominio falle | Más complejo de actualizar; sin previsualizaciones automáticas |
| **Alchemy/Infura como nodo RPC** | Nodo propio (geth/reth) | Sin infraestructura propia que mantener; SLA gestionado | Dependencia de tercero; si la API cambia, hay que actualizar |
| **Hardhat para entorno local** | Foundry / Ganache | Toolchain madura, bien integrada con ethers.js; el mismo framework para CI y local | Hardhat Node no persiste estado entre reinicios (intencional en dev) |
| **GitHub Actions para CI/CD** | Jenkins / GitLab CI | Gratuito en repos públicos; integrado con el repositorio; amplia documentación | Dependencia de GitHub; límites de minutos en repos privados |
| **Un solo contrato sin upgrades** | Patrón Proxy (EIP-1967) | Simplicidad: el estudiante ve exactamente lo que se despliega | No actualizable; un bug crítico requeriría redespliegue y migración |
| **Deployment.json generado en CI** | ABI hardcodeado en app.js | La DApp siempre apunta al contrato correcto del entorno | Si el CI falla antes de generar el JSON, el frontend podría apuntar a la versión anterior |

---

## Consideraciones de costo en la nube

```mermaid
flowchart LR
    subgraph GRATIS["Costo cero (o gratuito)"]
        GH_FREE["GitHub: repositorio + Actions\n(repos públicos ilimitados)"]
        VERCEL_FREE["Vercel: hosting frontend\n(tier gratuito)"]
        SEPOLIA_FREE["Sepolia testnet: ETH de prueba\n(faucets gratuitos)"]
    end

    subgraph PAGO["Costo variable"]
        ALCHEMY_PAY["Alchemy/Infura: RPC\n(tier gratuito hasta ~300M CU/mes;\ntier pago para producción)"]
        GAS_PAY["Gas de Ethereum mainnet:\n~0.50–5 USD por certificado emitido\n(variable según precio ETH y gas)"]
    end

    subgraph ALTO_COSTO["Costo evitado por el diseño"]
        NODO_PROPIO["Nodo Ethereum propio:\n~50–200 USD/mes en servidor dedicado"]
        STORAGE_ONCHAIN["Almacenar PDFs on-chain:\n~miles de USD por documento"]
    end

    GRATIS --> Sistema["DApp funcional\ncon costo mínimo"]
    PAGO --> Sistema
    ALTO_COSTO -. "decisión de diseño\nevita estos costos" .-> Sistema
```

---

## Relación con otros módulos del curso

- El pipeline CI/CD está documentado en detalle en [`../03-devops/`](../03-devops/).
- Los controles de seguridad del pipeline (Slither, Solhint, auditoría) están en [`../04-devsecops/`](../04-devsecops/).
- La arquitectura en la nube (Vercel, Alchemy, IPFS, costos detallados) está en [`../05-nube/`](../05-nube/).

---

## Navegación del módulo

- Anterior: [05-modelo-roles-seguridad.md](05-modelo-roles-seguridad.md)
- Volver al índice: [README.md](README.md)
