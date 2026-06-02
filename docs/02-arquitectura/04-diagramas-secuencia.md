# 04 — Diagramas de Secuencia

> **Módulo:** Modelado y Arquitectura · Unidad 1 Blockchain DevOps · UTPL

---

## Concepto clave: Transacciones vs. Llamadas view

Antes de ver los diagramas, es fundamental entender la distinción más importante en la interacción con un contrato inteligente:

| Característica | Transacción (escritura) | Llamada view (lectura) |
|---|---|---|
| **Modifica estado** | Sí | No |
| **Cuesta gas** | Sí (pagado por el firmante) | No (ejecutada localmente por el nodo) |
| **Requiere firma** | Sí (con clave privada via MetaMask) | No |
| **Es asíncrona** | Sí (espera confirmación de la red) | No (respuesta inmediata) |
| **Queda en la blockchain** | Sí (permanente e inmutable) | No |
| **Funciones del contrato** | `emitirCertificado`, `revocarCertificado`, `autorizarEmisor`, `revocarEmisor` | `verificarCertificado` |

```mermaid
flowchart LR
    subgraph ESCRITURA["Escritura (modifica estado)"]
        TX["Transacción\nfirmada"]
        GAS["Gas pagado\npor el emisor"]
        CONFIRM["Incluida en\nun bloque"]
        INMUT["Estado actualizado\npermanentemente"]
        TX --> GAS --> CONFIRM --> INMUT
    end

    subgraph LECTURA["Lectura (no modifica estado)"]
        CALL["Llamada view\nsin firma"]
        LOCAL["Ejecutada localmente\npor el nodo RPC"]
        RESP["Respuesta\ninmediata"]
        CALL --> LOCAL --> RESP
    end
```

---

## Flujo A — Emitir un certificado

Este es el flujo más complejo: implica una transacción que modifica el estado del contrato
y emite un evento que el frontend puede capturar.

```mermaid
sequenceDiagram
    actor Emisor as Emisor (docente)
    participant Frontend as Frontend<br/>app.js
    participant MM as MetaMask
    participant RPC as Nodo RPC<br/>Alchemy/Infura
    participant Contrato as RegistroCertificados.sol
    participant Blockchain as Red Ethereum

    Emisor->>Frontend: completa formulario<br/>(nombre, curso) y hace clic en "Emitir"

    Note over Frontend: Verifica que hay wallet conectada<br/>y que el signer está disponible

    Frontend->>MM: contrato.emitirCertificado(nombre, curso)<br/>(ethers.js construye la transacción)

    Note over MM: Muestra popup de confirmación:<br/>dirección del contrato, gas estimado,<br/>datos de la llamada

    MM->>Emisor: solicita aprobación

    Emisor->>MM: aprueba (firma con clave privada)

    MM->>RPC: eth_sendRawTransaction<br/>(transacción firmada)

    RPC->>Blockchain: difunde la transacción<br/>a la red P2P

    Note over Blockchain: La transacción espera<br/>en el mempool hasta ser<br/>incluida en un bloque

    Blockchain->>Contrato: ejecuta emitirCertificado(nombre, curso)<br/>con msg.sender = direcciónEmisor

    Note over Contrato: Verifica modificador soloEmisor<br/>Calcula hash keccak256(...)<br/>Almacena struct Certificado<br/>Incrementa totalCertificados

    Contrato-->>Blockchain: emite evento CertificadoEmitido<br/>(hashCertificado, nombre, curso, emisor, timestamp)

    Blockchain-->>RPC: recibo de transacción<br/>(txHash, blockNumber, logs)

    RPC-->>MM: recibo confirmado

    MM-->>Frontend: recibo de transacción

    Frontend-->>Emisor: muestra hash del certificado<br/>y mensaje de éxito
```

### Puntos pedagógicos del flujo A

1. **MetaMask como guardián de claves:** el usuario nunca expone su clave privada a `app.js`. MetaMask firma la transacción de forma aislada.
2. **Latencia de red:** hay un tiempo de espera entre el envío y la confirmación (segundos en Sepolia, hasta minutos en mainnet congestionada). `ethers.js` espera con `tx.wait()`.
3. **El hash se genera on-chain:** `keccak256(abi.encodePacked(nombre, curso, msg.sender, block.timestamp, totalCertificados))`. Esto garantiza unicidad y que el emisor no pueda predecir el hash antes de la transacción.
4. **El evento `CertificadoEmitido`** sirve como recibo semántico: el frontend lo captura para mostrar confirmación y el log de la blockchain lo preserva para siempre.

---

## Flujo B — Verificar un certificado

Este flujo es completamente diferente: es una **llamada view**, sin firma, sin gas, instantánea.
Cualquier persona en el mundo puede verificar un certificado.

```mermaid
sequenceDiagram
    actor Verificador as Verificador<br/>(empresa, persona)
    participant Frontend as Frontend<br/>app.js
    participant RPC as Nodo RPC<br/>Alchemy/Infura
    participant Contrato as RegistroCertificados.sol

    Note over Verificador: Tiene el bytes32 hash<br/>del certificado (lo recibió<br/>del titular o lo escaneó)

    Verificador->>Frontend: ingresa el hash en el formulario<br/>y hace clic en "Verificar"

    Note over Frontend: NO requiere MetaMask<br/>NO requiere cuenta conectada<br/>Se usa el provider de solo lectura

    Frontend->>RPC: eth_call<br/>contrato.verificarCertificado(hash)<br/>(llamada view, sin firma)

    Note over RPC: El nodo ejecuta la función<br/>localmente en su copia del estado<br/>Sin modificar nada

    RPC->>Contrato: ejecuta verificarCertificado(hash)<br/>(lectura del mapping privado)

    Note over Contrato: cert = certificados[hash]<br/>valido = cert.existe AND NOT cert.revocado<br/>retorna (valido, cert)

    Contrato-->>RPC: (bool valido, Certificado cert)

    RPC-->>Frontend: resultado inmediato<br/>(sin recibo, sin bloque)

    Frontend-->>Verificador: muestra resultado:<br/>- Nombre del estudiante<br/>- Curso<br/>- Fecha de emisión<br/>- Emisor (dirección)<br/>- Estado: VÁLIDO / REVOCADO / NO EXISTE
```

### Puntos pedagógicos del flujo B

1. **Sin MetaMask ni gas:** la verificación es gratuita y pública. Esto implementa directamente el valor de confianza descentralizada de blockchain: no se necesita confiar en ninguna institución para verificar.
2. **El nodo RPC ejecuta localmente:** `eth_call` no crea una transacción; el nodo ejecuta el código del contrato sobre su copia local del estado y devuelve el resultado.
3. **El mapping es privado, la función es pública:** `certificados` tiene visibilidad `private` en Solidity, lo que significa que no se puede leer directamente por su clave. Pero `verificarCertificado` es `public view` y sí devuelve los datos. El contrato controla qué se expone.
4. **Latencia nula:** el verificador obtiene la respuesta en milisegundos, no en segundos.

---

## Flujo C — Autorizar un emisor

Este flujo es exclusivo del propietario del contrato (la institución).
También es una transacción (modifica estado), similar al flujo A.

```mermaid
sequenceDiagram
    actor Admin as Propietario<br/>(institución UTPL)
    participant Frontend as Frontend<br/>app.js
    participant MM as MetaMask
    participant RPC as Nodo RPC<br/>Alchemy/Infura
    participant Contrato as RegistroCertificados.sol
    participant Blockchain as Red Ethereum

    Admin->>Frontend: ingresa dirección del nuevo emisor<br/>y hace clic en "Autorizar Emisor"

    Frontend->>MM: contrato.autorizarEmisor(direccionNuevoEmisor)<br/>(ethers.js construye la transacción)

    Note over MM: Popup de confirmación:<br/>dirección del contrato,<br/>gas estimado

    MM->>Admin: solicita aprobación

    Admin->>MM: aprueba (firma)

    MM->>RPC: eth_sendRawTransaction

    RPC->>Blockchain: difunde la transacción

    Blockchain->>Contrato: ejecuta autorizarEmisor(cuenta)<br/>con msg.sender = propietario

    Note over Contrato: Verifica modificador soloPropietario<br/>if (msg.sender != propietario) revert NoEsPropietario()<br/>Verifica que cuenta != address(0)<br/>emisorAutorizado[cuenta] = true

    Contrato-->>Blockchain: emite evento EmisorAutorizado<br/>(cuenta, autorizadoPor)

    Blockchain-->>RPC: recibo confirmado

    RPC-->>MM: recibo

    MM-->>Frontend: transacción completada

    Frontend-->>Admin: muestra confirmación<br/>"Emisor autorizado exitosamente"

    Note over Frontend,Contrato: A partir de este momento,<br/>la nueva dirección puede llamar<br/>a emitirCertificado() y revocarCertificado()
```

### Puntos pedagógicos del flujo C

1. **El modificador actúa como guardián:** si `msg.sender != propietario`, la transacción revierte con el error `NoEsPropietario()` antes de ejecutar ninguna lógica. El gas ya consumido para llegar a ese punto se pierde, pero el estado no se modifica.
2. **Transitividad de confianza:** el propietario autoriza emisores; los emisores emiten certificados. Esta cadena de confianza es auditable en la blockchain a través de los eventos `EmisorAutorizado`.
3. **`address(0)` como validación:** el contrato verifica que no se autorice la dirección cero (equivalente a un puntero nulo), que es una dirección inválida en Ethereum.

---

## Comparación de los tres flujos

```mermaid
flowchart LR
    subgraph FLUJOS["Tres flujos de interacción"]
        FA["Flujo A\nEmitir certificado\n\nTX escritura\nRequiere soloEmisor\nCuesta gas\nEmite CertificadoEmitido"]
        FB["Flujo B\nVerificar certificado\n\nLlamada view\nSin restricción de acceso\nGratis\nRespuesta inmediata"]
        FC["Flujo C\nAutorizar emisor\n\nTX escritura\nRequiere soloPropietario\nCuesta gas\nEmite EmisorAutorizado"]
    end

    ESCRIBE["Transacción\n(modifica estado)"]
    LEE["Llamada view\n(solo lee)"]

    FA --- ESCRIBE
    FC --- ESCRIBE
    FB --- LEE
```

| Flujo | Tipo | Actor | Modificador | Gas | Evento emitido |
|---|---|---|---|---|---|
| Emitir certificado | Transacción | Emisor autorizado | `soloEmisor` | ~120 000 gas | `CertificadoEmitido` |
| Verificar certificado | Llamada view | Cualquiera (público) | Ninguno | 0 | Ninguno |
| Autorizar emisor | Transacción | Propietario | `soloPropietario` | ~50 000 gas | `EmisorAutorizado` |
| Revocar certificado | Transacción | Emisor autorizado | `soloEmisor` | ~30 000 gas | `CertificadoRevocado` |
| Revocar emisor | Transacción | Propietario | `soloPropietario` | ~30 000 gas | `EmisorRevocado` |

---

## Navegación del módulo

- Anterior: [03-modelo-de-datos.md](03-modelo-de-datos.md)
- Siguiente: [05-modelo-roles-seguridad.md](05-modelo-roles-seguridad.md)
- Ver también: [../04-devsecops/](../04-devsecops/) donde estos flujos son analizados desde la perspectiva de seguridad
