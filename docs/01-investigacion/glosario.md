# Glosario — Unidad 1: Blockchain DevOps

> **Módulo:** [Marco Teórico](./README.md)
> Este glosario cubre los términos técnicos usados en los documentos de investigación y en el resto del repositorio. Está ordenado alfabéticamente. Para contexto adicional, consulta las [referencias](./referencias.md).

---

## A

**ABI (Application Binary Interface)**
Interfaz binaria de aplicación: la descripción en formato JSON de las funciones, eventos y errores públicos de un contrato inteligente. El ABI es el "puente" que permite al frontend (ethers.js) llamar funciones del contrato y leer sus respuestas. Se genera automáticamente por el compilador de Solidity y se guarda en `artifacts/`.

**Automatización (Automation)**
Pilar A del modelo CALMS. En DevOps, significa reemplazar tareas manuales repetibles (compilar, probar, desplegar) con scripts y herramientas que se ejecutan de forma autónoma. Reduce errores humanos y acelera el ciclo de entrega.

---

## B

**Blockchain**
Registro distribuido, cronológico e inmutable de transacciones, organizado en bloques encadenados mediante criptografía. Cada bloque contiene un hash del bloque anterior, lo que hace computacionalmente inviable modificar el historial. En Ethereum, la blockchain almacena tanto transacciones en ether como el estado de los contratos inteligentes.

**Bytecode**
Código de bajo nivel generado por el compilador de Solidity, que es el que realmente se ejecuta en la EVM (Ethereum Virtual Machine). No es legible por humanos directamente; el ABI es la interfaz legible correspondiente.

---

## C

**CALMS**
Acrónimo que resume los cinco pilares de DevOps: Culture (Cultura), Automation (Automatización), Lean (Flujo delgado), Measurement (Medición) y Sharing (Compartir). Fue popularizado por Jez Humble y es ampliamente referenciado en *The DevOps Handbook*.

**CEI (Checks-Effects-Interactions)**
Patrón de diseño seguro para funciones de contratos inteligentes. Establece el orden correcto de operaciones: (1) verificar condiciones (checks), (2) actualizar el estado del contrato (effects) y (3) realizar llamadas externas (interactions). Previene ataques de reentrancia. Aplicado en `emitirCertificado` de `RegistroCertificados.sol`.

**CI (Continuous Integration — Integración Continua)**
Práctica de integrar el código de todos los desarrolladores en un repositorio central varias veces al día, con verificación automática mediante compilación y pruebas. El objetivo es detectar conflictos e incompatibilidades cuanto antes. En este repositorio, GitHub Actions implementa CI en cada `git push`.

**CD (Continuous Delivery / Continuous Deployment)**
**Entrega Continua:** el código que pasa el pipeline de CI queda listo para desplegarse en producción, pero el despliegue final requiere aprobación humana.
**Despliegue Continuo:** el despliegue a producción es completamente automático si el pipeline pasa. Ver la distinción detallada en [1.1 Fundamentos de DevOps](./1.1-fundamentos-devops.md).

**CVE (Common Vulnerabilities and Exposures)**
Sistema estándar de identificación de vulnerabilidades de seguridad públicamente conocidas. Cada CVE tiene un identificador único (ej. CVE-2023-12345). `npm audit` usa la base de datos de CVEs para detectar dependencias vulnerables.

---

## D

**DAST (Dynamic Application Security Testing)**
Análisis dinámico de seguridad: técnica que prueba una aplicación mientras está en ejecución, enviando entradas maliciosas y observando el comportamiento. Detecta vulnerabilidades que no son visibles analizando solo el código fuente.

**DApp (Decentralized Application)**
Aplicación descentralizada: aplicación cuya lógica de negocio está implementada en uno o más contratos inteligentes en una blockchain, con una interfaz de usuario (frontend) que interactúa con ellos. En este repositorio: `frontend/index.html` + `ethers.js` + `RegistroCertificados.sol`.

**Deployment Frequency (Frecuencia de despliegue)**
Una de las cuatro métricas DORA. Mide con qué frecuencia un equipo despliega código a producción. Los equipos élite despliegan múltiples veces al día.

**DevOps**
Filosofía y conjunto de prácticas que une a los equipos de Desarrollo (Dev) y Operaciones (Ops) para acortar el ciclo de vida del desarrollo, aumentar la frecuencia de despliegues y mejorar la confiabilidad del software.

**DevSecOps**
Extensión de DevOps que integra la seguridad (Sec) como responsabilidad compartida desde las primeras etapas del desarrollo, en lugar de tratarla como una actividad final o externa. Principio central: "shift-left security".

**DORA (DevOps Research and Assessment)**
Programa de investigación liderado por Nicole Forsgren, Jez Humble y Gene Kim, que durante años estudió miles de equipos de TI para identificar qué prácticas distinguen a los equipos de alto rendimiento. Sus hallazgos están publicados en el libro *Accelerate* y definen cuatro métricas clave.

---

## E

**EVM (Ethereum Virtual Machine)**
Máquina virtual que ejecuta el bytecode de los contratos inteligentes en todos los nodos de la red Ethereum. Garantiza que el mismo contrato produce los mismos resultados independientemente del hardware del nodo.

**Evento (Event)**
Mecanismo de Solidity para registrar información en el log de transacciones de la blockchain. Los eventos son más baratos en gas que almacenar datos en variables de estado, y son la principal forma de comunicación entre el contrato y el frontend. En `RegistroCertificados.sol`: `CertificadoEmitido`, `CertificadoRevocado`, `EmisorAutorizado`.

---

## F

**Front-running**
Ataque en el que un actor malintencionado observa una transacción pendiente en la mempool y envía su propia transacción con mayor precio de gas para que sea procesada primero, obteniendo una ventaja económica o informativa.

---

## G

**Gas**
Unidad que mide el trabajo computacional requerido para ejecutar operaciones en la EVM. Cada instrucción del bytecode tiene un costo en gas. El usuario que envía una transacción paga el gas en ether. Optimizar el gas es una buena práctica de DevOps en blockchain (los errores personalizados de `RegistroCertificados.sol` son más baratos en gas que los `require` con strings).

**Git**
Sistema de control de versiones distribuido. Base de toda práctica DevOps: permite rastrear cambios, colaborar en ramas paralelas y revertir a cualquier estado anterior del código.

**GitHub Actions**
Plataforma de automatización integrada en GitHub que permite ejecutar workflows (flujos de trabajo) en respuesta a eventos del repositorio (push, pull request, etc.). En este repositorio, implementa el pipeline de CI/CD y los análisis de seguridad.

---

## H

**Hardhat**
Entorno de desarrollo para Ethereum basado en Node.js. Proporciona: compilador de Solidity, red local para pruebas, framework de scripts de despliegue y consola interactiva. Es el equivalente de "webpack + servidor de desarrollo + herramienta de build" para proyectos Solidity.

**Hash**
Resultado de una función criptográfica que transforma una entrada de cualquier longitud en una cadena de longitud fija. En este repositorio, cada certificado se identifica por su `bytes32 hashCertificado`, calculado con `keccak256`. Cualquier cambio en los datos de entrada produce un hash completamente diferente.

---

## I

**IaC (Infrastructure as Code — Infraestructura como Código)**
Práctica de gestionar y provisionar infraestructura mediante archivos de configuración versionados, en lugar de procesos manuales. Garantiza reproducibilidad, auditabilidad y consistencia entre entornos.

**Infinity Loop**
Representación visual del ciclo de vida DevOps como un lazo infinito (∞) que conecta las fases de desarrollo (Plan, Code, Build, Test) con las de operaciones (Release, Deploy, Operate, Monitor). Simboliza la naturaleza continua y cíclica del proceso.

---

## L

**Lead Time for Changes (Tiempo de ciclo)**
Métrica DORA: tiempo transcurrido desde que un desarrollador confirma un cambio en el repositorio hasta que ese cambio está disponible en producción. Los equipos élite logran tiempos menores a una hora.

---

## M

**Mainnet**
La red principal de Ethereum, donde las transacciones tienen valor económico real. Un contrato desplegado en mainnet es permanente e inmutable. Equivalente al entorno de "producción" en DevOps.

**mempool (Memory Pool)**
Cola de transacciones pendientes que esperan ser incluidas en un bloque por los validadores. Las transacciones con mayor precio de gas tienen prioridad. La mempool es pública, lo que habilita el ataque de front-running.

**MetaMask**
Extensión de navegador y wallet de Ethereum más popular. Permite a los usuarios gestionar sus claves privadas, firmar transacciones y conectarse a DApps sin ejecutar un nodo completo.

**MTTR (Mean Time to Recovery — Tiempo Medio de Recuperación)**
Métrica DORA: tiempo promedio que tarda un equipo en restaurar el servicio después de un fallo en producción. Los equipos élite logran MTTR menor a una hora.

---

## N

**npm audit**
Comando de Node.js que compara las dependencias del proyecto contra la base de datos de vulnerabilidades de npm y reporta aquellas con CVEs conocidos. Implementa SCA (Software Composition Analysis) en el pipeline de este repositorio.

---

## O

**Overflow / Underflow**
En aritmética de enteros de bits fijos, overflow ocurre cuando el resultado excede el valor máximo representable (regresa al mínimo), y underflow cuando cae por debajo del mínimo (salta al máximo). En Solidity 0.8+, ambas condiciones causan un revert automático, eliminando esta clase de vulnerabilidad.

---

## P

**Pipeline (Pipeline de CI/CD)**
Secuencia automatizada de pasos (etapas) que el código atraviesa desde el commit hasta el despliegue, incluyendo compilación, pruebas, análisis de seguridad y despliegue. Implementado en este repositorio con GitHub Actions.

**Private Key (Clave privada)**
Número secreto que permite a su titular firmar transacciones en la blockchain. Quien posee la clave privada controla todos los fondos y contratos asociados a la dirección correspondiente. En DevOps de blockchain, la protección de la clave privada del deployer es la medida de seguridad más crítica.

---

## R

**Reentrancy (Reentrancia)**
Vulnerabilidad en smart contracts donde un contrato atacante puede volver a llamar a la función de la víctima antes de que esta termine de actualizar su estado. Causó el hackeo del DAO en 2016. Se mitiga con el patrón CEI o con `ReentrancyGuard`.

**RPC (Remote Procedure Call)**
Protocolo que permite a una aplicación (como el frontend con ethers.js) comunicarse con un nodo de Ethereum para leer datos o enviar transacciones. Proveedores gestionados: Alchemy, Infura, QuickNode.

---

## S

**SAST (Static Application Security Testing)**
Análisis estático de seguridad: examina el código fuente sin ejecutarlo, buscando patrones conocidos de vulnerabilidades. En este repositorio: Slither analiza `RegistroCertificados.sol`.

**SCA (Software Composition Analysis)**
Análisis de composición de software: examina las dependencias de terceros de un proyecto en busca de vulnerabilidades conocidas. En este repositorio: `npm audit`.

**Secret Scanning**
Búsqueda automatizada de credenciales, tokens de API o claves privadas que hayan sido accidentalmente incluidas en el código. GitHub lo ofrece como funcionalidad integrada.

**Shift-left security**
Principio de DevSecOps que propone mover los controles de seguridad hacia las fases más tempranas del ciclo de desarrollo (hacia la "izquierda" en el diagrama temporal), donde son más baratos y efectivos.

**Slither**
Framework de análisis estático (SAST) para contratos Solidity, desarrollado por Trail of Bits. Cuenta con más de 90 detectores de vulnerabilidades y se integra fácilmente en pipelines de CI/CD.

**Smart Contract (Contrato inteligente)**
Programa que se ejecuta en la blockchain de forma determinista y automática cuando se cumplen ciertas condiciones. Una vez desplegado, su código es inmutable. En este repositorio: `RegistroCertificados.sol`.

**Solhint**
Linter para el lenguaje Solidity. Verifica convenciones de estilo y reglas de buenas prácticas de seguridad configurables. Es el equivalente de ESLint para JavaScript.

**Solidity**
Lenguaje de programación de alto nivel, tipado estáticamente, diseñado para escribir contratos inteligentes en Ethereum. La versión `0.8.24` usada en este repositorio incluye protecciones nativas contra overflow/underflow.

**SWC Registry (Smart Contract Weakness Classification)**
Clasificación de debilidades de contratos inteligentes, análoga al CWE (Common Weakness Enumeration) para software general. Documenta vulnerabilidades conocidas de Solidity con descripciones, ejemplos y contramedidas.

---

## T

**Testnet**
Red de prueba de Ethereum que usa ETH sin valor económico. Simula el comportamiento de mainnet. Equivalente al entorno de "staging" en DevOps. Ejemplos: Sepolia, Holesky.

**tx.origin**
Variable global de Solidity que contiene la dirección de la cuenta que originó la cadena de llamadas (el usuario final). Diferente de `msg.sender`, que es quien llamó directamente al contrato. Usar `tx.origin` para autenticación es una vulnerabilidad (SWC-115).

---

## W

**Wallet (Cartera)**
Software o dispositivo que almacena claves privadas y permite a su titular firmar transacciones en blockchain. MetaMask es la wallet de navegador más popular para DApps.

---

*Para más contexto sobre estos términos, consulta las [referencias del módulo](./referencias.md).*
