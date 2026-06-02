# Guía 02 — Ejecutar el Proyecto Completo

> **Tiempo estimado:** 45–60 minutos
> **Nivel:** Principiante
> **Antes de esta guía:** Completa la [Guía 01 — Preparación del Entorno](./01-preparacion-del-entorno.md)

En esta guía vamos a ir desde cero hasta tener la DApp corriendo en tu navegador, con MetaMask
conectado y capaz de emitir y verificar certificados académicos en la blockchain local.

---

## Tabla de contenidos

1. [Clonar el repositorio](#1-clonar-el-repositorio)
2. [Instalar dependencias](#2-instalar-dependencias)
3. [Compilar el contrato](#3-compilar-el-contrato)
4. [Ejecutar las pruebas](#4-ejecutar-las-pruebas)
5. [Levantar la DApp completa](#5-levantar-la-dapp-completa)
6. [Configurar MetaMask para la red local](#6-configurar-metamask-para-la-red-local)
7. [Usar la DApp desde el navegador](#7-usar-la-dapp-desde-el-navegador)
8. [Errores frecuentes y soluciones](#8-errores-frecuentes-y-soluciones)
9. [Checklist final](#9-checklist-final)

---

## 1. Clonar el repositorio

Clonar significa descargar una copia del repositorio de Git a tu computadora.

**Paso 1:** Abre una terminal.

**Paso 2:** Navega al directorio donde quieres guardar el proyecto. Por ejemplo, tu carpeta de documentos:

```bash
# En macOS o Linux:
cd ~/Documentos

# En Windows (PowerShell):
cd $HOME\Documents
```

**Paso 3:** Clona el repositorio (reemplaza la URL con la URL real que te proporcione tu docente):

```bash
git clone https://github.com/tu-organizacion/repoSemanaUno.git
```

**Paso 4:** Entra al directorio del proyecto:

```bash
cd repoSemanaUno
```

**Paso 5:** Verifica que estás en el lugar correcto. Deberías ver estos archivos:

```bash
ls
```

La salida esperada incluye: `contracts/`, `test/`, `scripts/`, `frontend/`, `docs/`, `guias/`,
`hardhat.config.js`, `package.json`, `plan.md`.

---

## 2. Instalar dependencias

El proyecto usa varias librerías (Hardhat, ethers.js, Chai, etc.). Todas están listadas en
`package.json`. Un solo comando las descarga todas:

```bash
npm install
```

Verás cómo npm descarga los paquetes. Puede tardar 1–3 minutos según tu conexión. Al terminar,
se crea la carpeta `node_modules/`.

> **¿Ves advertencias de "deprecated"?** No te preocupes. Son avisos normales de que algunas
> dependencias tienen versiones más nuevas, pero no afectan el funcionamiento del proyecto.

> **¿Error de permisos en macOS/Linux?** No uses `sudo npm install`. Si necesitas permisos, vuelve
> a la [Guía 01](./01-preparacion-del-entorno.md) y verifica que estás usando nvm correctamente.

---

## 3. Compilar el contrato

Compilar significa traducir el código Solidity (que es legible para humanos) a bytecode (que
entiende la blockchain de Ethereum):

```bash
npm run compile
```

Verás una salida similar a esta:

```
Downloading compiler 0.8.24
Compiled 1 Solidity file successfully (evm target: paris).
```

Esto crea la carpeta `artifacts/` con el ABI (la "interfaz pública") del contrato y el bytecode
compilado. El script de despliegue y el frontend los usan más adelante.

> **¿Qué es el ABI?** Mira el [Glosario Rápido](./05-glosario-rapido.md).

---

## 4. Ejecutar las pruebas

Este proyecto tiene **12 pruebas automatizadas** que verifican que el contrato funciona
correctamente. Correrlas es tan sencillo como:

```bash
npm test
```

### ¿Qué significan las 12 pruebas?

Las pruebas están organizadas en cuatro grupos:

| Grupo | Pruebas | Qué verifican |
|-------|---------|---------------|
| Despliegue | 3 | El propietario se asigna correctamente, el primer emisor se autoriza, el contador empieza en 0 |
| Gestión de emisores | 3 | El propietario puede autorizar/revocar emisores, los no-propietarios no pueden |
| Emisión y verificación | 3 | Se puede emitir un certificado, verificarlo, y el hash es único |
| Revocación y seguridad | 3 | Se puede revocar, no se puede revocar dos veces, los no-autorizados no pueden emitir |

### Salida esperada

```
  RegistroCertificados
    Despliegue
      ✓ asigna al desplegador como propietario
      ✓ autoriza al propietario como primer emisor
      ✓ inicia con cero certificados
    Gestión de emisores
      ✓ el propietario puede autorizar un emisor
      ✓ rechaza que un no-propietario autorice emisores
      ✓ rechaza autorizar la dirección cero
    Emisión de certificados
      ✓ emite un certificado y devuelve su hash
      ✓ verifica un certificado válido
      ✓ rechaza hash que no existe
    Revocación y seguridad
      ✓ revoca un certificado
      ✓ rechaza revocar dos veces
      ✓ rechaza que no-emisor emita

  12 passing (Xms)
```

Ver **12 passing** y cero errores significa que el contrato está funcionando perfectamente.
Si ves algún error rojo, revisa la sección de [errores frecuentes](#8-errores-frecuentes-y-soluciones).

---

## 5. Levantar la DApp completa

La DApp tiene tres partes que debes levantar en orden. Necesitas **dos terminales abiertas al mismo tiempo**.

### Terminal 1 — Nodo local de Ethereum

El nodo local simula una blockchain de Ethereum en tu propia computadora. Es como tener
"Ethereum en miniatura" que funciona solo para ti, sin internet.

```bash
npm run node
```

Verás una lista de **20 cuentas de prueba** con sus claves privadas y sus saldos en ETH falso.
Anota (o deja esta terminal abierta) porque necesitarás una de estas claves en el siguiente paso.

La salida se verá así (los valores son de ejemplo, los tuyos serán iguales):

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

... (más cuentas)
```

> **Estas claves privadas son públicas y conocidas por todos.** Por eso solo sirven para
> pruebas locales. NUNCA las uses para nada real.

**Deja esta terminal abierta y abre una segunda terminal.**

### Terminal 2 — Desplegar el contrato

```bash
npm run deploy:local
```

Verás algo como:

```
Red:          localhost
Desplegando con la cuenta: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ RegistroCertificados desplegado en: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📄 Datos de despliegue guardados en: .../frontend/deployment.json
```

Este comando compiló y desplegó el contrato en tu nodo local, y guardó la dirección en
`frontend/deployment.json`. La DApp usará ese archivo automáticamente.

### Terminal 2 (o 3) — Servir el frontend

El frontend es un archivo HTML que necesita un servidor web para que MetaMask pueda cargar
`deployment.json` correctamente. Desde el directorio raíz del proyecto:

```bash
# Opción A (si tienes npx disponible, es lo más sencillo):
npx serve frontend

# Opción B (si tienes Python 3):
cd frontend && python3 -m http.server 8080

# Opción C (si tienes Node.js http-server global):
npx http-server frontend -p 8080
```

Verás un mensaje indicando la URL donde sirve:

```
   ┌───────────────────────────────────────────────┐
   │                                               │
   │   Serving!                                    │
   │                                               │
   │   - Local:    http://localhost:3000           │
   │                                               │
   └───────────────────────────────────────────────┘
```

Abre esa URL en tu navegador (generalmente `http://localhost:3000` o `http://localhost:8080`).

---

## 6. Configurar MetaMask para la red local

MetaMask, por defecto, apunta a la red principal de Ethereum (Mainnet). Necesitas agregar
la red local de Hardhat.

### Agregar la red local (Hardhat / Localhost)

1. Haz clic en el ícono de MetaMask en tu navegador.
2. Haz clic en el selector de redes (parte superior, donde dice "Ethereum Mainnet").
3. Haz clic en **"Agregar red"** o **"Add network"**.
4. Haz clic en **"Agregar una red manualmente"**.
5. Rellena los campos con exactamente estos valores:

| Campo | Valor |
|-------|-------|
| Nombre de la red | `Hardhat Local` |
| Nueva URL de RPC | `http://127.0.0.1:8545` |
| ID de cadena | `31337` |
| Símbolo de moneda | `ETH` |
| URL del explorador de bloques | (déjalo vacío) |

6. Haz clic en **"Guardar"**.

MetaMask debería cambiar automáticamente a "Hardhat Local".

### Importar una cuenta de prueba

Necesitas importar una de las cuentas que imprimió `npm run node` en la Terminal 1.
Vamos a usar la Cuenta #0:

1. En MetaMask, haz clic en el ícono de tu cuenta (círculo de colores en la esquina superior derecha).
2. Haz clic en **"Importar cuenta"**.
3. Pega la clave privada de la Cuenta #0:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Haz clic en **"Importar"**.

Deberías ver la cuenta importada con **10,000 ETH** de prueba.

> **Por qué tiene 10,000 ETH:** Hardhat crea estas cuentas con ETH falso para que puedas
> pagar las comisiones (gas) de las transacciones sin gastar dinero real.

---

## 7. Usar la DApp desde el navegador

Con el navegador abierto en `http://localhost:3000` (o el puerto que uses), deberías ver la
interfaz de la DApp "Registro de Certificados Académicos".

### Conectar MetaMask

1. Haz clic en el botón **"Conectar MetaMask"**.
2. MetaMask te pedirá permiso para conectarse al sitio. Haz clic en **"Conectar"**.
3. Si todo va bien, verás:
   ```
   ✅ Conectado: 0xf39Fd6e51...
   Contrato: 0x5FbDB231... (localhost)
   ```

### Emitir un certificado

1. En la sección **"Emitir Certificado"**, completa los campos:
   - **Nombre del estudiante:** `Ana López`
   - **Curso:** `Blockchain DevOps 2026`
2. Haz clic en **"Emitir Certificado"**.
3. MetaMask mostrará una ventana pidiendo confirmar la transacción. Haz clic en **"Confirmar"**.
4. Espera unos segundos. La DApp mostrará:
   ```
   ✅ Certificado emitido.
   Hash: 0x7a3f8c1e2b...
   ```
5. **Copia ese hash**. Lo necesitas para verificar.

> **¿Qué pasó internamente?** Enviaste una transacción a la blockchain local. Hardhat la
> procesó, ejecutó la función `emitirCertificado` del contrato, y guardó los datos en el
> estado de la blockchain. El hash es el identificador único del certificado.

### Verificar un certificado

1. En la sección **"Verificar Certificado"**, pega el hash que copiaste en el paso anterior.
2. Haz clic en **"Verificar"**.
3. La DApp mostrará los datos del certificado:
   ```
   Estudiante: Ana López
   Curso: Blockchain DevOps 2026
   Emitido: [fecha y hora]
   Estado: ✅ VÁLIDO
   ```

¡Felicidades! Acabas de registrar y verificar tu primer certificado en la blockchain.

---

## 8. Errores frecuentes y soluciones

### Error: "No se encontró deployment.json"

**Mensaje:** `No se encontró deployment.json. Ejecuta primero: npm run deploy:local`

**Causa:** la DApp no puede cargar los datos del contrato porque el despliegue no se hizo.

**Solución:**
1. Asegúrate de que el nodo local está corriendo (`npm run node` en la Terminal 1).
2. Ejecuta `npm run deploy:local` en la Terminal 2.
3. Recarga la página del navegador.

---

### Error: "Puerto 8545 ya está en uso"

**Mensaje en la Terminal 1:** `Error: listen EADDRINUSE: address already in use 127.0.0.1:8545`

**Causa:** ya hay otro proceso usando ese puerto (quizás una sesión anterior de `npm run node`).

**Solución:**

```bash
# En macOS/Linux, encuentra y termina el proceso:
lsof -ti:8545 | xargs kill -9

# En Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 8545).OwningProcess | Stop-Process -Force
```

Luego vuelve a ejecutar `npm run node`.

---

### MetaMask — Error de nonce incorrecto

**Mensaje en la DApp:** algo como `nonce too low` o `replacement transaction underpriced`

**Causa:** MetaMask guarda un contador de transacciones (nonce) que se desincroniza cuando
reinicias el nodo local. Cada vez que reinicias `npm run node`, el nodo empieza desde cero
pero MetaMask recuerda el historial anterior.

**Solución:** reinicia el estado de tu cuenta en MetaMask:
1. Haz clic en el ícono de MetaMask.
2. Haz clic en los tres puntos (...) → Configuración.
3. Ve a **Avanzado** → **Limpiar datos de actividad** (o "Reset account").
4. Confirma.

---

### MetaMask no detecta la red local

**Causa:** MetaMask bloquea conexiones a redes locales por defecto en algunas versiones.

**Solución:**
1. En MetaMask, ve a Configuración → Seguridad y privacidad.
2. Activa **"Detectar automáticamente redes"** si está desactivado.
3. Si el problema persiste, agrega la red manualmente como se describe en el [paso 6](#6-configurar-metamask-para-la-red-local).

---

### La página carga pero el botón "Conectar MetaMask" no hace nada

**Causa:** el frontend se abrió directamente como archivo (`file://`) en vez de desde un servidor.

**Solución:** asegúrate de estar sirviendo el frontend con un servidor web, no abriendo el archivo
directamente con el navegador. Usa `npx serve frontend` o `python3 -m http.server`.

---

### Error: "HardhatError: Cannot connect to the network localhost"

**Causa:** ejecutaste `npm run deploy:local` sin que el nodo local esté corriendo.

**Solución:** primero `npm run node` en la Terminal 1, luego `npm run deploy:local` en la Terminal 2.

---

## 9. Checklist final

- [ ] Cloné el repositorio con `git clone`
- [ ] Ejecuté `npm install` sin errores
- [ ] `npm run compile` muestra "Compiled 1 Solidity file successfully"
- [ ] `npm test` muestra "12 passing"
- [ ] `npm run node` está corriendo en la Terminal 1 y veo las cuentas de prueba
- [ ] `npm run deploy:local` mostró la dirección del contrato y creó `frontend/deployment.json`
- [ ] El frontend está siendo servido y se ve en el navegador
- [ ] MetaMask tiene configurada la red "Hardhat Local" (chainId 31337)
- [ ] Importé la Cuenta #0 en MetaMask y tiene 10,000 ETH de prueba
- [ ] Emití un certificado exitosamente y obtuve un hash
- [ ] Verifiqué el certificado con ese hash y vi los datos correctos

Si completaste todo: **pasa a la [Guía 03 — Laboratorio DevOps](./03-laboratorio-devops.md)**
o a la [Guía 04 — Laboratorio DevSecOps](./04-laboratorio-devsecops.md). ¡Excelente trabajo!

---

*¿Dudas? Revisa las [preguntas frecuentes](./preguntas-frecuentes.md).*
