# 02 — Vulnerabilidades en Smart Contracts

> **Módulo:** 04 DevSecOps · **Sección:** 1.2 Fundamentos DevSecOps
> **Referencia:** SWC Registry (Smart Contract Weakness Classification) · SCWE
> **Contrato analizado:** `contracts/RegistroCertificados.sol`
> **Marco de seguridad del contrato:** [docs/02-arquitectura/05-modelo-roles-seguridad.md](../02-arquitectura/05-modelo-roles-seguridad.md)

---

## Introducción

Los contratos inteligentes manejan activos reales —dinero, identidades, certificados— y son inmutables una vez desplegados. Esto los convierte en objetivos de alto valor para atacantes. A diferencia del software tradicional, **no existe un parche de seguridad retroactivo**: si el contrato tiene una vulnerabilidad y ya está en mainnet, la única salida suele ser perder los fondos o desplegar un contrato nuevo con migración de estado.

Esta sección cubre las **ocho vulnerabilidades más comunes**, siguiendo la nomenclatura del [SWC Registry](https://swcregistry.io/) (Smart Contract Weakness Classification), el equivalente blockchain del CWE (Common Weakness Enumeration). Para cada una se muestra: qué es, código vulnerable vs. seguro, y cómo `RegistroCertificados.sol` la previene.

---

## Vulnerabilidad 1 — Reentrancy (Re-entrada)

**Referencia:** SWC-107 · SCWE-036

### ¿Qué es?

La reentrancy ocurre cuando un contrato realiza una llamada externa a otro contrato (o a una dirección controlada por un atacante) **antes de actualizar su propio estado**. El contrato atacante puede aprovechar esta llamada para volver a entrar en la función original y ejecutarla repetidamente, drenando fondos o alterando el estado antes de que el contrato víctima pueda registrar el cambio.

El ataque más famoso de la historia blockchain —el hack de The DAO (2016, 60 millones de USD)— fue un ataque de reentrancy.

### Código vulnerable

```solidity
// VULNERABLE: SWC-107
// El saldo se actualiza DESPUÉS de enviar ETH — ventana de reentrancy
contract BancoVulnerable {
    mapping(address => uint256) public saldos;

    function retirar(uint256 cantidad) external {
        require(saldos[msg.sender] >= cantidad, "Saldo insuficiente");
        
        // PELIGRO: llamada externa ANTES de actualizar el estado
        (bool exito,) = msg.sender.call{value: cantidad}("");
        require(exito, "Transferencia fallida");
        
        // Un contrato atacante puede llamar retirar() de nuevo
        // desde su fallback() ANTES de llegar aquí
        saldos[msg.sender] -= cantidad;  // Actualización TARDÍA
    }
}
```

### Código seguro (patrón Checks-Effects-Interactions)

```solidity
// SEGURO: Patrón CEI — Checks, Effects, Interactions
contract BancoSeguro {
    mapping(address => uint256) public saldos;

    function retirar(uint256 cantidad) external {
        // 1. CHECKS: validaciones primero
        require(saldos[msg.sender] >= cantidad, "Saldo insuficiente");
        
        // 2. EFFECTS: actualizar estado ANTES de la llamada externa
        saldos[msg.sender] -= cantidad;
        
        // 3. INTERACTIONS: llamada externa al final
        (bool exito,) = msg.sender.call{value: cantidad}("");
        require(exito, "Transferencia fallida");
    }
}
```

### Cómo lo previene RegistroCertificados.sol

`RegistroCertificados.sol` **no maneja ETH** (no tiene función `payable`, no recibe fondos ni los transfiere), por lo que el vector de reentrancy ETH no aplica. Sin embargo, aplica el patrón CEI correctamente en `emitirCertificado`:

```solidity
// contracts/RegistroCertificados.sol — función emitirCertificado (líneas 138-152)
// 1. CHECKS
if (certificados[hashCertificado].existe) revert CertificadoYaExiste();

// 2. EFFECTS: escritura en estado ANTES de cualquier interacción
certificados[hashCertificado] = Certificado({ ... });
totalCertificados++;

// 3. Evento de auditoría (no es una llamada externa, es un log)
emit CertificadoEmitido(...);
// No hay llamadas externas (INTERACTIONS vacío = sin riesgo)
```

---

## Vulnerabilidad 2 — Control de Acceso Roto

**Referencia:** SWC-105 · SWC-106 · SCWE-001

### ¿Qué es?

Las funciones privilegiadas (emitir, revocar, destruir, pausar) sin modificadores de control de acceso pueden ser llamadas por **cualquier dirección**. También incluye el uso incorrecto de `tx.origin` en lugar de `msg.sender` para verificar identidad.

### Código vulnerable

```solidity
// VULNERABLE: SWC-105
// Cualquier dirección puede emitir certificados
contract RegistroVulnerable {
    mapping(bytes32 => bool) public certificados;

    // Sin modificador de acceso — función completamente pública
    function emitirCertificado(bytes32 hash) external {
        certificados[hash] = true;
    }

    // VULNERABLE: SWC-115 — tx.origin para autenticación
    address public propietario;
    function funcionAdministrativa() external {
        // tx.origin puede ser manipulado por contratos intermediarios (phishing)
        require(tx.origin == propietario, "No autorizado");
        // ...
    }
}
```

### Código seguro

```solidity
// SEGURO: modificadores explícitos con msg.sender
contract RegistroSeguro {
    address public propietario;
    mapping(address => bool) public emisorAutorizado;

    error NoEsPropietario();
    error NoAutorizado();

    modifier soloPropietario() {
        if (msg.sender != propietario) revert NoEsPropietario();
        _;
    }

    modifier soloEmisor() {
        if (!emisorAutorizado[msg.sender]) revert NoAutorizado();
        _;
    }

    // msg.sender — siempre el llamador directo e inmediato (no phisheable)
    function emitirCertificado(bytes32 hash) external soloEmisor {
        // Solo emisores autorizados pueden llegar aquí
    }
}
```

### Cómo lo previene RegistroCertificados.sol

El contrato implementa un **sistema de roles de dos niveles** con modificadores explícitos:

```solidity
// Nivel 1: propietario (la institución educativa)
modifier soloPropietario() {
    if (msg.sender != propietario) revert NoEsPropietario();
    _;
}

// Nivel 2: emisores autorizados por el propietario
modifier soloEmisor() {
    if (!emisorAutorizado[msg.sender]) revert NoAutorizado();
    _;
}
```

Cada función sensible declara explícitamente qué rol requiere:
- `autorizarEmisor` y `revocarEmisor` → `soloPropietario`
- `emitirCertificado` y `revocarCertificado` → `soloEmisor`

---

## Vulnerabilidad 3 — Overflow y Underflow Aritmético

**Referencia:** SWC-101 · SCWE-020

### ¿Qué es?

En versiones anteriores de Solidity (<0.8.0), las operaciones aritméticas envolvían silenciosamente: `uint8(255) + 1 = 0` (overflow), `uint8(0) - 1 = 255` (underflow). Esto permitía eludir controles de saldo o cantidad.

### Código vulnerable (pre-0.8.0)

```solidity
// VULNERABLE en Solidity < 0.8.0: SWC-101
pragma solidity ^0.7.6;

contract TokenVulnerable {
    mapping(address => uint256) public saldos;

    function transferir(address a, uint256 cantidad) external {
        // Si saldos[msg.sender] = 0 y cantidad = 1:
        // 0 - 1 = 2^256 - 1 (underflow silencioso)
        saldos[msg.sender] -= cantidad;  // No falla — se vuelve enorme
        saldos[a] += cantidad;
    }
}
```

### Código seguro

```solidity
// SEGURO: Solidity >= 0.8.0 revierte automáticamente en overflow/underflow
pragma solidity ^0.8.24;

contract TokenSeguro {
    mapping(address => uint256) public saldos;

    function transferir(address a, uint256 cantidad) external {
        // En Solidity 0.8+, esto revierte automáticamente si saldos[msg.sender] < cantidad
        saldos[msg.sender] -= cantidad;
        saldos[a] += cantidad;
    }
}
```

### Cómo lo previene RegistroCertificados.sol

El contrato usa `pragma solidity ^0.8.24`, que activa las **verificaciones aritméticas por defecto** en el compilador. Todo overflow o underflow revierte la transacción automáticamente. No es necesario usar SafeMath (que era la solución pre-0.8.0).

---

## Vulnerabilidad 4 — Uso de tx.origin para Autenticación

**Referencia:** SWC-115 · SCWE-008

### ¿Qué es?

`tx.origin` devuelve la dirección de la cuenta externamente controlada (EOA) que **originó** la cadena de transacciones. `msg.sender` devuelve el llamador **inmediato**. Si el contrato usa `tx.origin` para autenticación, un contrato malicioso puede intermediar y engañarlo: la víctima llama al contrato malicioso, que luego llama al contrato vulnerable, y `tx.origin` sigue siendo la víctima.

### Código vulnerable

```solidity
// VULNERABLE: SWC-115 — phishing con tx.origin
pragma solidity ^0.8.24;

contract WalletVulnerable {
    address public propietario;

    function transferirFondos(address payable destino, uint256 monto) external {
        // tx.origin puede ser el usuario real aunque el llamador inmediato
        // sea un contrato malicioso (ataque de phishing)
        require(tx.origin == propietario, "No autorizado");
        destino.transfer(monto);
    }
}

// Contrato atacante: la víctima llama a atacar(), que luego llama
// a transferirFondos() — tx.origin sigue siendo la víctima
contract ContratoAtacante {
    WalletVulnerable objetivo;
    address payable ladron;

    function atacar() external {
        objetivo.transferirFondos(ladron, address(objetivo).balance);
    }
}
```

### Código seguro

```solidity
// SEGURO: msg.sender es el llamador inmediato, no manipulable por intermediarios
pragma solidity ^0.8.24;

contract WalletSegura {
    address public propietario;

    function transferirFondos(address payable destino, uint256 monto) external {
        require(msg.sender == propietario, "No autorizado");
        destino.transfer(monto);
    }
}
```

### Cómo lo previene RegistroCertificados.sol

El contrato usa **exclusivamente `msg.sender`** en todos sus modificadores y lógica de control de acceso. La palabra `tx.origin` no aparece en ninguna línea del contrato. Solhint con la regla `no-tx-origin` refuerza esto automáticamente en el pipeline.

---

## Vulnerabilidad 5 — Front-Running (Manipulación del Order de Transacciones)

**Referencia:** SWC-114 · SCWE-035

### ¿Qué es?

Las transacciones Ethereum son públicas antes de ser incluidas en un bloque (mempool visible). Un atacante puede observar una transacción pendiente ventajosa, publicar una transacción similar con mayor gas para que sea procesada primero, y obtener un beneficio. Es especialmente relevante en DEX (exchanges descentralizados) y subastas.

### Código vulnerable

```solidity
// VULNERABLE: SWC-114
// Subasta donde el frente-corredor puede ver la mejor oferta y superarla
pragma solidity ^0.8.24;

contract SubastaVulnerable {
    address public mejorPostor;
    uint256 public mejorOferta;

    function pujar() external payable {
        // Un observador de la mempool puede ver esta transacción y enviar
        // una con más gas para que se mine antes, ganando la subasta
        require(msg.value > mejorOferta, "Oferta insuficiente");
        mejorPostor = msg.sender;
        mejorOferta = msg.value;
    }
}
```

### Mitigaciones

```solidity
// MITIGACIÓN: esquema commit-reveal
pragma solidity ^0.8.24;

contract SubastaSegura {
    mapping(address => bytes32) public compromisos;

    // Fase 1: publicar el hash de la oferta (el valor real está oculto)
    function comprometer(bytes32 hashOferta) external {
        compromisos[msg.sender] = hashOferta;
    }

    // Fase 2: revelar la oferta real (ya no hay nada que front-runear)
    function revelar(uint256 oferta, bytes32 salt) external payable {
        require(
            compromisos[msg.sender] == keccak256(abi.encodePacked(oferta, salt)),
            "Compromiso inválido"
        );
        // Procesar oferta...
    }
}
```

### Cómo lo previene RegistroCertificados.sol

El contrato **no maneja competencia económica** (no hay subastas, intercambios ni sorteos). La emisión de certificados es una operación administrativa, no una carrera entre participantes. El front-running no representa un vector de ataque relevante para este caso de uso. Sin embargo, vale destacar que el hash del certificado incorpora `block.timestamp` y `totalCertificados` para garantizar unicidad, no para ocultar información.

---

## Vulnerabilidad 6 — Secretos Expuestos en el Repositorio

**Referencia:** SWC-136 · SCWE-050

### ¿Qué es?

Variables de estado privadas en Solidity, comentarios con claves, o archivos `.env` subidos al repositorio son vectores de exposición de secretos. En blockchain, el almacenamiento de un contrato es público: `private` solo significa que otros contratos no pueden leerla directamente, pero cualquier nodo puede consultar el almacenamiento con `eth_getStorageAt`.

### Código vulnerable

```solidity
// VULNERABLE: SWC-136
// Las variables "private" en Solidity NO son privadas en la blockchain
pragma solidity ^0.8.24;

contract SecretoFalso {
    // PELIGRO: cualquiera puede leer esto con eth_getStorageAt
    bytes32 private claveSecreta = 0xdeadbeef...;
    string private passwordAdmin = "contraseña123";

    function verificar(bytes32 clave) external view returns (bool) {
        return clave == claveSecreta;  // La clave es pública en la cadena
    }
}
```

```bash
# Cualquier persona puede leer el slot 0 del contrato con:
cast storage <DIRECCION_CONTRATO> 0 --rpc-url https://mainnet.infura.io/v3/...
```

### Código y prácticas seguras

```solidity
// SEGURO: no almacenar secretos en el contrato
// Los secretos van FUERA de la cadena (base de datos privada, HSM)
pragma solidity ^0.8.24;

contract VerificacionSegura {
    // Solo se guarda el hash del secreto, no el secreto mismo
    bytes32 public hashContrasena;

    constructor(bytes32 _hash) {
        hashContrasena = _hash;
    }

    // La cadena verifica sin revelar el secreto original
    function verificar(bytes32 contrasena) external view returns (bool) {
        return keccak256(abi.encodePacked(contrasena)) == hashContrasena;
    }
}
```

### Cómo lo previene RegistroCertificados.sol

1. El contrato **no almacena secretos**. Solo almacena datos de certificados (nombres, cursos, fechas) que son información pública por diseño.
2. El archivo `.gitignore` excluye `.env`, `*.key` y `*.pem` explícitamente.
3. El archivo `.env.example` documenta qué variables son necesarias sin revelar valores reales.
4. Gitleaks en el pipeline escanea todo el historial de git buscando patrones de claves privadas.

> Para más detalle, ver: [03-gestion-de-secretos.md](./03-gestion-de-secretos.md)

---

## Vulnerabilidad 7 — Denegación de Servicio (DoS)

**Referencia:** SWC-113 · SWC-128 · SCWE-037

### ¿Qué es?

Patrones que permiten a un atacante bloquear permanentemente funciones del contrato. Los vectores más comunes son: iteraciones sobre arrays que crecen sin límite (gas infinito), contratos que rechazan ETH en su `fallback`, y dependencia de contratos externos que pueden ser destruidos.

### Código vulnerable

```solidity
// VULNERABLE: SWC-128 — DoS por array sin límite
pragma solidity ^0.8.24;

contract VotacionVulnerable {
    address[] public participantes;
    mapping(address => uint256) public votos;

    function agregarParticipante(address p) external {
        participantes.push(p);  // El array puede crecer indefinidamente
    }

    // Si hay miles de participantes, esta función supera el límite de gas
    function calcularGanador() external view returns (address ganador) {
        uint256 maxVotos = 0;
        for (uint256 i = 0; i < participantes.length; i++) {  // PELIGRO
            if (votos[participantes[i]] > maxVotos) {
                maxVotos = votos[participantes[i]];
                ganador = participantes[i];
            }
        }
    }
}
```

### Código seguro

```solidity
// SEGURO: evitar iteraciones sobre estructuras de tamaño ilimitado
pragma solidity ^0.8.24;

contract VotacionSegura {
    mapping(address => uint256) public votos;
    address public ganadorActual;
    uint256 public maxVotosActual;

    // Actualización incremental en O(1) — sin loops
    function votar(address candidato) external {
        votos[candidato]++;
        if (votos[candidato] > maxVotosActual) {
            maxVotosActual = votos[candidato];
            ganadorActual = candidato;
        }
    }
}
```

### Cómo lo previene RegistroCertificados.sol

El contrato usa **mappings en lugar de arrays** para almacenar certificados (`mapping(bytes32 => Certificado)`). Las operaciones son siempre O(1): buscar, escribir o revocar un certificado no requiere iterar. No existe ningún loop en el código del contrato.

---

## Vulnerabilidad 8 — Aleatoriedad Insegura

**Referencia:** SWC-120 · SCWE-031

### ¿Qué es?

`block.timestamp`, `block.number`, `blockhash` y `block.prevrandao` son **predecibles o manipulables** por los validadores. Usarlos como fuente de aleatoriedad en sorteos, juegos o selección de ganadores permite a un validador manipular el resultado en su favor.

### Código vulnerable

```solidity
// VULNERABLE: SWC-120
pragma solidity ^0.8.24;

contract LoteriaPredecible {
    address[] public jugadores;

    function elegirGanador() external {
        // PELIGRO: block.timestamp puede ser manipulado ~15 segundos
        // por el validador para favorecer su propia dirección
        uint256 indice = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.difficulty))
        ) % jugadores.length;
        
        payable(jugadores[indice]).transfer(address(this).balance);
    }
}
```

### Código seguro (usando Chainlink VRF)

```solidity
// SEGURO: aleatoriedad verificable con Chainlink VRF
pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";

contract LoteriaSegura is VRFConsumerBaseV2Plus {
    // Chainlink VRF genera números aleatorios verificables off-chain
    // y los entrega al contrato mediante un callback criptográficamente seguro
    function fulfillRandomWords(uint256, uint256[] calldata randomWords) internal override {
        uint256 ganador = randomWords[0] % jugadores.length;
        // ...
    }
}
```

### Cómo lo previene RegistroCertificados.sol

El contrato **no implementa aleatoriedad**. El uso de `block.timestamp` en `emitirCertificado` es únicamente para **registrar la fecha de emisión** del certificado, no para seleccionar un ganador ni tomar decisiones de control de flujo basadas en él. La regla `not-rely-on-time: "off"` en `.solhint.json` refleja que este uso controlado es intencional y documentado.

---

## Resumen comparativo

| # | Vulnerabilidad | SWC | RegistroCertificados | Herramienta que detecta |
|---|----------------|-----|---------------------|------------------------|
| 1 | Reentrancy | SWC-107 | No aplica (sin ETH); CEI aplicado | Slither (`reentrancy-eth`) |
| 2 | Control de acceso roto | SWC-105/106 | `soloPropietario` + `soloEmisor` | Slither + Solhint |
| 3 | Overflow/Underflow | SWC-101 | Solidity ^0.8.24 revierte automáticamente | Slither (`integer-overflow`) |
| 4 | tx.origin | SWC-115 | Solo usa `msg.sender` | Solhint (`no-tx-origin`) |
| 5 | Front-running | SWC-114 | No aplica (sin competencia económica) | Revisión manual |
| 6 | Secretos expuestos | SWC-136 | .gitignore + .env.example + Gitleaks | Gitleaks |
| 7 | DoS por gas | SWC-113/128 | Solo mappings O(1), sin loops | Slither + revisión |
| 8 | Aleatoriedad insegura | SWC-120 | No implementa aleatoriedad | Slither (`weak-prng`) |

---

## Preguntas de reflexión

1. ¿Por qué la inmutabilidad de los contratos en blockchain hace que la seguridad "shift-left" sea más importante que en el software tradicional?
2. `RegistroCertificados.sol` usa `block.timestamp` para registrar la fecha de emisión. ¿Podría un validador manipular este valor para su beneficio? ¿Qué impacto tendría en la seguridad del sistema?
3. ¿Qué pasaría si se eliminara el modificador `soloEmisor` de `emitirCertificado`? ¿Cómo lo detectaría el pipeline de seguridad?

---

*Siguiente: [03-gestion-de-secretos.md](./03-gestion-de-secretos.md) — Manejo de claves privadas y secretos en el pipeline.*
