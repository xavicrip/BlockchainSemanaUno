# Guía 04 — Laboratorio DevSecOps

> **Tiempo estimado:** 30 minutos
> **Nivel:** Principiante con el proyecto ya corriendo
> **Antes de esta guía:** Completa la [Guía 02 — Ejecutar el Proyecto](./02-ejecutar-el-proyecto.md)
> **Profundizar:** Lee [`../docs/04-devsecops/`](../docs/04-devsecops/) para el contexto teórico completo

En esta guía vas a explorar las prácticas de **DevSecOps** del proyecto: análisis estático de
seguridad con Slither, gestión de secretos y revisión de los controles de acceso del contrato.

DevSecOps significa incorporar la seguridad **desde el principio** del desarrollo, no al final.
No se trata de tener a alguien que "revise seguridad" antes de lanzar: se trata de herramientas
automatizadas que detectan vulnerabilidades en cada cambio de código.

---

## Tabla de contenidos

1. [¿Qué es DevSecOps y por qué importa en blockchain?](#1-qué-es-devsecops-y-por-qué-importa-en-blockchain)
2. [Instalar y ejecutar Slither](#2-instalar-y-ejecutar-slither)
3. [Entender el reporte de Slither](#3-entender-el-reporte-de-slither)
4. [Gestión de secretos: el archivo .env.example](#4-gestión-de-secretos-el-archivo-envexample)
5. [Revisar los modificadores de acceso del contrato](#5-revisar-los-modificadores-de-acceso-del-contrato)
6. [Explorar el pipeline de seguridad CI](#6-explorar-el-pipeline-de-seguridad-ci)
7. [Ejercicio de análisis: ¿qué pasaría si...?](#7-ejercicio-de-análisis-qué-pasaría-si)
8. [Reflexión y preguntas de consolidación](#8-reflexión-y-preguntas-de-consolidación)

---

## 1. ¿Qué es DevSecOps y por qué importa en blockchain?

**DevSecOps** = Development + Security + Operations. Es la práctica de integrar controles de
seguridad automáticos en el pipeline DevOps, en vez de tratarlos como una fase separada.

En el mundo tradicional del software, si hay un bug de seguridad puedes lanzar un parche.
En blockchain, **un contrato inteligente desplegado es inmutable**: no puedes modificarlo.
Si hay un error de seguridad y alguien lo explota, puedes perder todos los fondos que ese
contrato maneja. Por eso la seguridad en blockchain es especialmente crítica.

**Ejemplos reales de pérdidas por falta de seguridad:**
- The DAO (2016): ~$60M USD perdidos por un bug de reentrancy.
- Poly Network (2021): ~$600M USD robados por control de acceso incorrecto.
- Nomad Bridge (2022): ~$190M USD por una validación de entrada defectuosa.

La buena noticia: muchos de estos errores son **detectables automáticamente** con herramientas
como Slither.

> Para el marco conceptual (shift-left, SAST, DAST, SCA), consulta
> [`../docs/04-devsecops/`](../docs/04-devsecops/).

---

## 2. Instalar y ejecutar Slither

**Slither** es un analizador estático de seguridad para Solidity, desarrollado por Trail of Bits
(una de las empresas de seguridad blockchain más reconocidas). Analiza el bytecode y el código
fuente buscando vulnerabilidades conocidas.

### Requisitos previos

Slither está escrito en Python, así que necesitas Python 3 y pip instalados.

**Verificar Python:**

```bash
python3 --version
# Esperado: Python 3.8 o superior

pip3 --version
# Esperado: pip 21.x o superior
```

Si no tienes Python:
- **macOS:** instala con `brew install python` (requiere Homebrew) o descárgalo de [python.org](https://python.org).
- **Linux (Ubuntu/Debian):** `sudo apt install python3 python3-pip`
- **Windows:** descarga de [python.org](https://python.org) y marca "Add Python to PATH" durante la instalación.

### Instalar Slither

```bash
pip3 install slither-analyzer
```

> En algunos sistemas puede ser necesario `pip install slither-analyzer` (sin el 3).
> En Windows puede ser `py -m pip install slither-analyzer`.

Verifica la instalación:

```bash
slither --version
# Esperado: 0.10.x o similar
```

### Ejecutar Slither en el proyecto

Desde el directorio raíz del proyecto:

```bash
npm run security:slither
```

O directamente:

```bash
slither .
```

Slither analizará el contrato y generará un reporte.

---

## 3. Entender el reporte de Slither

Slither puede generar varias categorías de hallazgos:

| Nivel | Significado | ¿Qué hacer? |
|-------|-------------|-------------|
| `High` | Vulnerabilidad crítica | Corregir antes de desplegar |
| `Medium` | Riesgo moderado | Evaluar y probablemente corregir |
| `Low` | Riesgo bajo | Documentar por qué se acepta o corregir |
| `Informational` | Información o mejora de calidad | Considerar |
| `Optimization` | Oportunidad de ahorro de gas | Opcional |

### Salida esperada para este proyecto

Nuestro contrato fue diseñado con buenas prácticas de seguridad, así que Slither debería
encontrar **pocos o ningún hallazgo** de nivel `High` o `Medium`. Puede mostrar informacionales
como:

```
INFO:Detectors:
RegistroCertificados.emitirCertificado(string,string) (contracts/RegistroCertificados.sol)
  uses timestamp for comparisons (comparisons with timestamp)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#block-timestamp
```

### ¿Qué es el detector `block-timestamp`?

Este es un hallazgo muy común e **informacional**. Significa que el contrato usa `block.timestamp`
(la marca de tiempo del bloque) para registrar cuándo se emitió un certificado. Slither avisa
porque los mineros pueden manipular ligeramente el timestamp (~15 segundos), pero en nuestro
caso no es un riesgo de seguridad real: no usamos el timestamp para lógica crítica como pagos
o desbloqueos, solo para registro histórico.

Este es un buen ejemplo de cómo **leer y entender** un hallazgo antes de decidir si es un
problema real o un falso positivo.

### Ejercicio: leer la documentación de un detector

Para cualquier hallazgo que muestre Slither, sigue el enlace de `Reference:`. Por ejemplo:

```
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#block-timestamp
```

Abre ese enlace y lee:
- ¿Qué tipo de vulnerabilidad detecta?
- ¿En qué condiciones es peligroso?
- ¿Hay un ejemplo de código vulnerable?

---

## 4. Gestión de secretos: el archivo .env.example

Uno de los errores más comunes (y devastadores) en blockchain es **subir claves privadas o
URLs de nodos RPC a un repositorio público en GitHub**. Si alguien encuentra tu clave privada,
puede vaciar tu wallet.

### Ver el archivo .env.example

```bash
cat .env.example
```

Verás algo como:

```
# Archivo de ejemplo — copia a .env y completa los valores reales.
# NUNCA subas .env al repositorio.
# .env está en .gitignore para protegerte.

# Clave privada de tu cuenta (SOLO para testnets, NUNCA para mainnet)
PRIVATE_KEY=tu_clave_privada_aqui

# URL del nodo RPC (ej: Alchemy o Infura)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY
```

### Verificar que .env está protegido por .gitignore

```bash
cat .gitignore | grep env
```

Deberías ver una línea como `.env` o `.env*`. Esto le dice a Git que **nunca incluya** el
archivo `.env` en los commits, aunque exista en tu computadora.

### El flujo correcto de trabajo con secretos

```
┌─────────────────────────────────────────────────────────┐
│ .env.example  → Se sube a GitHub (sin valores reales)   │
│ .env          → NUNCA se sube (está en .gitignore)      │
│                 Cada desarrollador crea su propio .env  │
│                 con sus propias credenciales             │
└─────────────────────────────────────────────────────────┘
```

### Cómo usar .env en este proyecto

Si quisieras desplegar en la red de prueba Sepolia (fuera de este laboratorio básico):

```bash
# 1. Copia el archivo de ejemplo:
cp .env.example .env

# 2. Edita .env con tu editor y completa los valores reales.
# 3. El hardhat.config.js lee automáticamente las variables:
#    process.env.PRIVATE_KEY y process.env.SEPOLIA_RPC_URL
```

> **Para esta unidad**, trabajamos solo con la red local (sin .env necesario). Este ejercicio
> es para que entiendas el patrón, no para que lo uses ahora.

---

## 5. Revisar los modificadores de acceso del contrato

El contrato `RegistroCertificados.sol` implementa un **sistema de control de acceso por roles**.
Vamos a revisarlo para entender qué protege y cómo funciona.

### Abrir el contrato

```bash
cat contracts/RegistroCertificados.sol
```

O ábrelo en VS Code.

### Los dos modificadores de control de acceso

Busca estas secciones en el contrato:

```solidity
modifier soloPropietario() {
    if (msg.sender != propietario) revert NoEsPropietario();
    _;
}

modifier soloEmisor() {
    if (!emisorAutorizado[msg.sender]) revert NoAutorizado();
    _;
}
```

**¿Qué hace `msg.sender`?** Es la dirección de quien llama a la función. En Ethereum, cada
transacción tiene un origen criptográficamente verificado: no se puede falsificar.

**¿Qué hace `revert`?** Cancela la transacción y devuelve el gas no usado. El estado del
contrato no cambia. Es como una transacción que nunca ocurrió.

### Mapa de permisos del contrato

| Función | Quién puede llamarla | Modificador |
|---------|---------------------|-------------|
| `autorizarEmisor()` | Solo el propietario | `soloPropietario` |
| `revocarEmisor()` | Solo el propietario | `soloPropietario` |
| `emitirCertificado()` | Solo emisores autorizados | `soloEmisor` |
| `revocarCertificado()` | Solo emisores autorizados | `soloEmisor` |
| `verificarCertificado()` | Cualquiera (pública) | (ninguno, es `view`) |
| `totalCertificados` | Cualquiera (lectura) | (variable `public`) |
| `propietario` | Cualquiera (lectura) | (variable `public`) |

### ¿Por qué `verificarCertificado` no tiene restricción de acceso?

Porque en un sistema de certificados académicos, **la verificación debe ser pública**. Cualquier
persona (un empleador, otra institución) debería poder verificar que un certificado es válido
sin necesitar permiso. La emisión y revocación sí requieren autorización porque son operaciones
que modifican el estado.

### Prueba de seguridad: intentar emitir sin autorización

Recuerda que las pruebas en `test/RegistroCertificados.test.js` ya cubren esto. Busca esta prueba:

```javascript
it("rechaza que no-emisor emita", async function () {
  await expect(
    registro.connect(atacante).emitirCertificado("Ana", "Blockchain")
  ).to.be.revertedWithCustomError(registro, "NoAutorizado");
});
```

Esta prueba simula a un atacante intentando emitir un certificado sin estar autorizado.
El contrato lo rechaza con el error personalizado `NoAutorizado`. Esto es **seguridad por diseño**,
no por esperanza.

---

## 6. Explorar el pipeline de seguridad CI

Además del pipeline de CI básico, el proyecto tiene un pipeline específico de seguridad.
Ábrelo:

```bash
cat .github/workflows/devsecops.yml
```

Busca los jobs (tareas) que define:
- `slither` — ejecuta el análisis estático de Slither
- `solhint` — ejecuta el linter de seguridad de Solidity
- `npm-audit` — verifica vulnerabilidades en las dependencias de npm
- (posiblemente) `secret-scan` — escanea el repositorio buscando secretos expuestos

> **¿Por qué tener dos pipelines (`ci.yml` y `devsecops.yml`)?** Porque algunos análisis de
> seguridad tardan más que las pruebas normales, y a veces se corren en horarios diferentes
> o con triggers diferentes (ej: solo en PRs a `main`, no en todas las ramas).

---

## 7. Ejercicio de análisis: ¿qué pasaría si...?

Analiza cada escenario y piensa qué consecuencia de seguridad tendría:

### Escenario A: remover el modificador `soloEmisor`

¿Qué pasaría si la función `emitirCertificado` no tuviera el modificador `soloEmisor`?

```solidity
// Versión insegura (hipotética):
function emitirCertificado(string calldata nombreEstudiante, string calldata curso)
    external
    // soloEmisor  ← eliminado
    returns (bytes32 hashCertificado)
```

**Pregunta:** ¿Cualquier persona en el mundo podría emitir certificados? ¿Es eso un problema?

### Escenario B: subir el archivo .env a GitHub

¿Qué pasaría si accidentalmente haces `git add .env` y `git push`?

**Pregunta:** ¿Qué información estaría expuesta? ¿Qué podría hacer alguien con esa información?

### Escenario C: usar block.timestamp para desbloquear fondos

Imagina un contrato que paga a alguien *solo si* `block.timestamp > fecha_pago`.

**Pregunta:** ¿Por qué es riesgoso usar `block.timestamp` para lógica financiera crítica?
(Pista: lee el hallazgo de Slither de la sección anterior.)

---

## 8. Reflexión y preguntas de consolidación

1. **¿Cuál es la diferencia entre un linter (Solhint) y un analizador de seguridad (Slither)?**
   ¿Cuándo usarías uno vs. el otro?

2. **¿Por qué es "inmutable" un contrato desplegado en Ethereum?**
   ¿Cómo cambia eso el nivel de cuidado necesario en la revisión de seguridad?

3. **En el sistema de roles del contrato,** ¿quién puede revocar el acceso al propietario?
   ¿Es eso un riesgo o una característica de diseño? ¿Cómo lo mejorarías para un sistema real?

4. **`shift-left security` significa mover la seguridad más temprano en el proceso.**
   ¿En qué momento del ciclo de vida del proyecto está el análisis de Slither?
   ¿Cómo compara eso con hacer una auditoría de seguridad justo antes del lanzamiento?

---

*Siguiente: [`../docs/05-nube/`](../docs/05-nube/) para despliegue en la nube.*

*Para el marco teórico completo de DevSecOps, consulta [`../docs/04-devsecops/`](../docs/04-devsecops/).*
