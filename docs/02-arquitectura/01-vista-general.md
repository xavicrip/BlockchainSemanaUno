# 01 — Arquitectura en Capas

> **Módulo:** Modelado y Arquitectura · Unidad 1 Blockchain DevOps · UTPL

---

## ¿Qué es la arquitectura en capas?

Una arquitectura en capas organiza un sistema en niveles con responsabilidades bien definidas,
de modo que cada capa solo se comunica con la inmediatamente adyacente.
En una DApp (aplicación descentralizada) esta separación tiene una dimensión extra:
la frontera entre lo que vive en la blockchain (on-chain) y lo que vive fuera de ella (off-chain)
no es solo organizativa, es **física y económica**: cruzar esa frontera cuesta gas.

---

## Diagrama de bloques — Cuatro capas de la DApp

```mermaid
flowchart TB
    subgraph CAPA1["Capa 1 · Presentación (DApp Frontend)"]
        direction LR
        HTML["index.html\nInterfaz de usuario"]
        JS["app.js\nethers.js v6"]
        DEPLOY_JSON["deployment.json\nDirección + ABI"]
    end

    subgraph CAPA2["Capa 2 · Integración (Wallet + RPC)"]
        direction LR
        MM["MetaMask\nProveedor Web3 / Firmador"]
        RPC["Nodo RPC gestionado\nAlchemy · Infura"]
    end

    subgraph CAPA3["Capa 3 · On-Chain (Contrato Inteligente)"]
        direction LR
        SC["RegistroCertificados.sol\nSolidity 0.8.24"]
        EVENTS["Logs de eventos\nCertificadoEmitido · Revocado\nEmisorAutorizado · Revocado"]
        STATE["Estado global\nmapping certificados\nmapping emisorAutorizado\ntotalCertificados"]
    end

    subgraph CAPA4["Capa 4 · Plataforma DevOps / Nube"]
        direction LR
        GIT["Repositorio Git\nGitHub"]
        CI["Pipeline CI\nGitHub Actions\nci.yml"]
        SEC["Pipeline DevSecOps\nSlither · Solhint\naudit"]
        HOST["Hosting estático\nVercel / IPFS"]
        RPC2["Nodo RPC\nAlchemy / Infura\n(infraestructura)"]
    end

    CAPA1 -- "JSON-RPC (eth_call / eth_sendRawTransaction)" --> CAPA2
    CAPA2 -- "transacciones firmadas / llamadas view" --> CAPA3
    CAPA3 -- "confirmaciones + eventos" --> CAPA2
    CAPA2 -- "respuestas / recibos" --> CAPA1
    CAPA4 -- "despliega frontend" --> HOST
    CAPA4 -- "despliega contrato (script)" --> CAPA3
    HOST -- "sirve" --> CAPA1
```

---

## Responsabilidades de cada capa

### Capa 1 — Presentación (DApp Frontend)

Es la única parte del sistema que el usuario final ve y toca directamente.

| Componente | Responsabilidad |
|---|---|
| `index.html` | Estructura HTML de la interfaz: formularios de emisión, verificación y gestión de emisores |
| `app.js` | Lógica de interacción: inicializa ethers.js, detecta MetaMask, construye llamadas al contrato, muestra resultados |
| `deployment.json` | Configuración en tiempo de ejecución: contiene la dirección del contrato desplegado y el ABI; lo genera `scripts/deploy.js` automáticamente |

**Por qué importa:** el frontend es completamente reemplazable sin tocar el contrato.
Si mañana se quiere una interfaz React o una app móvil, el contrato no cambia.
Esto ilustra el principio de **desacoplamiento** de DevOps.

---

### Capa 2 — Integración (Wallet + RPC)

Esta capa actúa como puente entre el mundo off-chain (JavaScript en el navegador)
y el mundo on-chain (la blockchain de Ethereum).

| Componente | Responsabilidad |
|---|---|
| **MetaMask** | Gestiona las claves privadas del usuario; firma transacciones sin exponer la clave; inyecta el proveedor `window.ethereum` |
| **Nodo RPC** | Recibe las transacciones firmadas, las difunde a la red Ethereum, y responde a las consultas view; en producción es un servicio gestionado (Alchemy/Infura) |

**Flujo de una transacción:** `app.js` construye la transacción → MetaMask la firma → el nodo RPC la difunde a la red → el contrato ejecuta la lógica → el nodo RPC devuelve el recibo.

**Flujo de una lectura view:** `app.js` construye la llamada → el nodo RPC la ejecuta localmente → devuelve el resultado sin gas ni firma.

---

### Capa 3 — On-Chain (Contrato Inteligente)

Es el corazón inmutable del sistema.
Una vez desplegado en la red, nadie —ni siquiera el propietario— puede modificar el código.

| Elemento | Responsabilidad |
|---|---|
| `RegistroCertificados.sol` | Lógica de negocio: emitir, revocar, verificar certificados; control de acceso por roles |
| **Estado global** | `mapping(bytes32 => Certificado)` almacena cada certificado; `mapping(address => bool)` controla emisores; `totalCertificados` lleva el conteo |
| **Logs de eventos** | Historial inmutable y eficiente en gas: `CertificadoEmitido`, `CertificadoRevocado`, `EmisorAutorizado`, `EmisorRevocado` |

**Principio clave:** el estado on-chain es la **única fuente de verdad** del sistema.
El frontend puede fallar, el hosting puede cambiar, los nodos RPC pueden rotar —
pero los certificados registrados en la blockchain son permanentes.

---

### Capa 4 — Plataforma DevOps / Nube

Esta capa no interactúa con los usuarios finales; su cliente es el **equipo de desarrollo**.

| Componente | Responsabilidad |
|---|---|
| **GitHub** | Versionado del código, revisión de código, gestión de ramas (GitFlow) |
| **GitHub Actions (`ci.yml`)** | Automatiza compilación, pruebas y análisis de seguridad en cada `push` o PR. Ver [`../03-devops/`](../03-devops/) |
| **GitHub Actions (`devsecops.yml`)** | Ejecuta Slither (análisis estático de Solidity), Solhint (linting), `npm audit`. Ver [`../04-devsecops/`](../04-devsecops/) |
| **Vercel / IPFS** | Hosting del frontend estático; Vercel ofrece previsualizaciones por PR; IPFS ofrece descentralización |
| **Alchemy / Infura** | Nodo RPC gestionado: acceso a Sepolia/mainnet sin operar hardware propio. Ver [`../05-nube/`](../05-nube/) |

---

## Principios arquitectónicos aplicados

```mermaid
flowchart LR
    P1["Separación de\nresponsabilidades\nSRP"]
    P2["Inmutabilidad\non-chain"]
    P3["Mínimo\nestado on-chain"]
    P4["Confianza\nmínima\nLeast privilege"]
    P5["Trazabilidad\npor eventos"]

    P1 --> |"cada capa tiene un rol único"| DApp["DApp de\ncertificados"]
    P2 --> |"contrato = ley, no se parcheа"| DApp
    P3 --> |"bytes32 hash, no archivos PDF"| DApp
    P4 --> |"modificadores soloPropietario/soloEmisor"| DApp
    P5 --> |"eventos indexados para auditoría"| DApp
```

| Principio | Aplicación concreta en esta DApp |
|---|---|
| Separación de responsabilidades | Frontend, wallet, contrato y CI/CD son componentes independientes |
| Inmutabilidad on-chain | El código del contrato no se modifica post-despliegue; las decisiones de diseño son permanentes |
| Mínimo estado on-chain | Se almacena el `bytes32` hash, no el PDF del certificado (ahorro masivo de gas) |
| Mínimo privilegio | Solo emisores autorizados pueden emitir; solo el propietario puede autorizar emisores |
| Trazabilidad por eventos | Cada acción relevante emite un evento indexado, consultable desde cualquier cliente |

---

## Navegación del módulo

- Siguiente: [02-modelo-c4.md](02-modelo-c4.md) — Modelo C4 con zoom progresivo
- Ver también: [../03-devops/](../03-devops/) para el detalle del pipeline de Capa 4
