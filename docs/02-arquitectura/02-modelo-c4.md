# 02 — Modelo C4 de la DApp

> **Módulo:** Modelado y Arquitectura · Unidad 1 Blockchain DevOps · UTPL

---

## ¿Qué es el modelo C4?

El modelo C4 (Context, Containers, Components, Code) es una forma sistemática de documentar la arquitectura de software con cuatro niveles de zoom progresivo.
No es una notación estricta como UML; es más bien una forma estructurada de **pensar y comunicar** la arquitectura.
En este módulo usamos los tres primeros niveles, que son los más útiles para un equipo de desarrollo.

```
Nivel 1 – Contexto  →  ¿Quién usa el sistema y con qué sistemas se relaciona?
Nivel 2 – Contenedores →  ¿Qué piezas desplegables conforman el sistema?
Nivel 3 – Componentes  →  ¿Qué módulos internos tiene cada contenedor?
```

---

## Nivel 1 — Diagrama de Contexto

**Pregunta central:** ¿Quiénes interactúan con la DApp y qué sistemas externos están involucrados?

```mermaid
flowchart TB
    subgraph ACTORES["Actores (personas)"]
        EST["Estudiante / Titulado\n\nQuiere verificar\nsu certificado"]
        EMISOR["Emisor / Institución\n(docente, secretaría)\n\nEmite y revoca\ncertificados"]
        VER["Verificador externo\n(empresa, entidad)\n\nValida la autenticidad\nde un certificado"]
        ADMIN["Propietario / Admin\n(institución UTPL)\n\nAutoriza y revoca\nemisores"]
    end

    subgraph SISTEMA["Sistema: DApp Registro de Certificados"]
        DAPP["RegistroCertificados\nDApp"]
    end

    subgraph EXTERNOS["Sistemas externos"]
        MM["MetaMask\nBilletera / Firmador\nde transacciones"]
        ETH["Red Ethereum\n(Sepolia testnet\no mainnet)"]
        RPC["Nodo RPC gestionado\nAlchemy / Infura"]
    end

    EST -- "verifica su certificado\n(consulta pública, gratis)" --> DAPP
    EMISOR -- "emite / revoca certificados\n(requiere firma y gas)" --> DAPP
    VER -- "verifica autenticidad\n(consulta pública, gratis)" --> DAPP
    ADMIN -- "autoriza / revoca emisores\n(requiere firma y gas)" --> DAPP

    DAPP -- "solicita firma\nde transacciones" --> MM
    MM -- "envía transacciones\nfirmadas" --> RPC
    RPC -- "difunde tx / ejecuta\nllamadas view" --> ETH
    ETH -- "confirmaciones\neventos" --> RPC
    RPC -- "respuestas" --> DAPP
```

### Observaciones del Nivel 1

- **Tres tipos de actores** con permisos distintos: el verificador no necesita MetaMask (solo lee), el emisor sí (escribe), el propietario tiene el nivel máximo de privilegio.
- **MetaMask** es un sistema externo, no parte de la DApp: su comportamiento no está bajo control del equipo de desarrollo.
- La **red Ethereum** es también un sistema externo; la DApp confía en su correcto funcionamiento pero no lo controla.
- El **nodo RPC** es la única puerta de entrada programática a Ethereum; en producción se usa un servicio gestionado para garantizar disponibilidad (SLA).

---

## Nivel 2 — Diagrama de Contenedores

**Pregunta central:** ¿Qué piezas desplegables (contenedores) forman el sistema y cómo se comunican?

> En el modelo C4, "contenedor" no significa Docker; significa cualquier unidad ejecutable desplegable de forma independiente (aplicación web, proceso, base de datos, etc.).

```mermaid
flowchart LR
    subgraph USUARIO["Usuario (navegador)"]
        BROWSER["Navegador Web\n+ MetaMask extension"]
    end

    subgraph CONTENEDORES["Contenedores del sistema"]
        FRONTEND["Contenedor: Frontend\n\nindex.html + app.js\nHosting estático\nVercel / IPFS\n\nTecnología: HTML + ethers.js v6"]
        CONTRATO["Contenedor: Contrato Inteligente\n\nRegistroCertificados.sol\nDesplegado en Ethereum\n\nTecnología: Solidity 0.8.24"]
        PIPELINE["Contenedor: Pipeline CI/CD\n\nci.yml + devsecops.yml\nGitHub Actions\n\nTecnología: YAML + Node.js + Slither"]
    end

    subgraph EXTERNOS["Sistemas externos"]
        ALCHEMY["Nodo RPC\nAlchemy / Infura\nAPI JSON-RPC"]
        ETHNET["Red Ethereum\nSepolia / Mainnet"]
    end

    BROWSER -- "HTTP/HTTPS\ncarga la DApp" --> FRONTEND
    BROWSER -- "inyecta window.ethereum\n(MetaMask)" --> FRONTEND
    FRONTEND -- "JSON-RPC\neth_call / eth_sendRawTransaction" --> ALCHEMY
    ALCHEMY -- "transacciones / consultas" --> CONTRATO
    CONTRATO -- "estado + logs" --> ETHNET
    PIPELINE -- "npm test + Hardhat deploy\n(entorno local/testnet)" --> CONTRATO
    PIPELINE -- "vercel deploy\n(en merge a main)" --> FRONTEND
```

### Observaciones del Nivel 2

| Contenedor | Tecnología | ¿Dónde vive? | ¿Quién lo despliega? |
|---|---|---|---|
| Frontend | HTML + ethers.js v6 | Vercel / IPFS | Pipeline CI (GitHub Actions) |
| Contrato inteligente | Solidity 0.8.24 | Red Ethereum (Sepolia / mainnet) | Pipeline CI (`scripts/deploy.js`) |
| Pipeline CI/CD | YAML + Node.js + Slither | GitHub Actions (nube de GitHub) | Se activa automáticamente con cada push |

**Punto pedagógico clave:** el contrato y el frontend son **contenedores independientes**.
El frontend puede redesplegarse en cualquier momento (por ejemplo, para corregir un error de UI),
mientras que el contrato —una vez en mainnet— no puede modificarse.

---

## Nivel 3 — Diagrama de Componentes

### Componentes del Frontend

**Pregunta central:** ¿Qué módulos lógicos componen `app.js`?

```mermaid
flowchart TB
    subgraph FRONTEND_CONT["Contenedor: Frontend (app.js)"]
        direction TB

        INIT["Componente: Inicialización\n\nlee deployment.json\ncrea instancia de contrato\ndetecta window.ethereum"]

        CONN["Componente: Conexión de Wallet\n\nconectarMetaMask()\nsolicita cuentas\nobtiene signer"]

        EMIT_UI["Componente: Emisión\n\nformulario emitir\nllama emitirCertificado()\nmuestra hash resultante"]

        VERIF_UI["Componente: Verificación\n\nformulario verificar\nllama verificarCertificado()\nmuestra nombre, curso, fecha, estado"]

        AUTH_UI["Componente: Gestión de Emisores\n\nautorizarEmisor()\nrevocarEmisor()"]

        EVENT_LISTEN["Componente: Escucha de Eventos\n\nsuscribe a CertificadoEmitido\nactualiza contadores en UI"]

        INIT --> CONN
        CONN --> EMIT_UI
        CONN --> VERIF_UI
        CONN --> AUTH_UI
        INIT --> EVENT_LISTEN
    end

    DEPLOY_JSON["deployment.json\n(dirección + ABI)"]
    METAMASK_EXT["MetaMask\n(extensión del navegador)"]

    DEPLOY_JSON -- "carga en arranque" --> INIT
    METAMASK_EXT -- "window.ethereum" --> CONN
```

### Componentes del Contrato

**Pregunta central:** ¿Qué módulos lógicos componen `RegistroCertificados.sol`?

```mermaid
flowchart TB
    subgraph CONTRATO_CONT["Contenedor: Contrato RegistroCertificados.sol"]
        direction TB

        CONTROL["Componente: Control de Acceso\n\nmodifier soloPropietario\nmodifier soloEmisor\nvariable propietario"]

        EMISORES["Componente: Gestión de Emisores\n\nautorizarEmisor(address)\nrevocarEmisor(address)\nmapping emisorAutorizado"]

        CERTIFICADOS["Componente: Gestión de Certificados\n\nemitirCertificado(nombre, curso)\nrevocarCertificado(bytes32)\nmapping certificados (privado)\ntotalCertificados"]

        LECTURA["Componente: Lectura Pública\n\nverificarCertificado(bytes32)\nretorna (bool valido, Certificado)"]

        EVENTOS["Componente: Trazabilidad\n\nCertificadoEmitido (indexed)\nCertificadoRevocado (indexed)\nEmisorAutorizado (indexed)\nEmisorRevocado (indexed)"]

        ERRORES["Componente: Errores Personalizados\n\nNoEsPropietario\nNoAutorizado\nCertificadoYaExiste\nCertificadoNoExiste\nCertificadoYaRevocado\nDireccionInvalida"]
    end

    CONTROL -- "protege" --> EMISORES
    CONTROL -- "protege" --> CERTIFICADOS
    CERTIFICADOS -- "emite" --> EVENTOS
    EMISORES -- "emite" --> EVENTOS
    CERTIFICADOS -- "expone" --> LECTURA
    CONTROL -- "lanza" --> ERRORES
    CERTIFICADOS -- "lanza" --> ERRORES
    EMISORES -- "lanza" --> ERRORES
```

### Observaciones del Nivel 3

- El **componente de control de acceso** es transversal: protege tanto la gestión de emisores como la de certificados a través de modificadores.
- El **componente de lectura pública** (`verificarCertificado`) no está protegido por ningún modificador: cualquier dirección puede llamarlo, lo que implementa el valor de confianza descentralizada de blockchain.
- Los **errores personalizados** son más baratos en gas que `require(condicion, "mensaje string")` porque no almacenan el string en la transacción. Este es un ejemplo de decisión de diseño motivada por el costo on-chain.

---

## Resumen pedagógico: C4 y blockchain

```mermaid
flowchart LR
    C1["Nivel 1\nContexto\nActores + sistemas externos"]
    C2["Nivel 2\nContenedores\nFrontend + Contrato + Pipeline"]
    C3["Nivel 3\nComponentes\nMódulos internos de cada contenedor"]

    C1 -- "zoom in" --> C2
    C2 -- "zoom in" --> C3

    NOTE1["Responde: ¿qué problema resuelve?"]
    NOTE2["Responde: ¿qué se despliega dónde?"]
    NOTE3["Responde: ¿cómo está estructurado por dentro?"]

    C1 --- NOTE1
    C2 --- NOTE2
    C3 --- NOTE3
```

El modelo C4 es especialmente valioso en blockchain porque obliga a explicitar,
ya en el Nivel 2, **qué vive on-chain y qué vive off-chain**:
una decisión que en sistemas tradicionales es reversible, pero en blockchain es permanente.

---

## Navegación del módulo

- Anterior: [01-vista-general.md](01-vista-general.md)
- Siguiente: [03-modelo-de-datos.md](03-modelo-de-datos.md)
