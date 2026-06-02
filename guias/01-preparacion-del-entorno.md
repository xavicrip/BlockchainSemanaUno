# Guía 01 — Preparación del Entorno de Desarrollo

> **Tiempo estimado:** 30–45 minutos
> **Nivel:** Principiante absoluto
> **Antes de esta guía:** Lee la teoría en [`../docs/01-investigacion/`](../docs/01-investigacion/)

En esta guía vas a instalar y configurar **todo** lo que necesitas para trabajar con el proyecto.
Al final tendrás Node.js, Git, VS Code y MetaMask listos para usar.

---

## Tabla de contenidos

1. [¿Qué vamos a instalar y por qué?](#1-qué-vamos-a-instalar-y-por-qué)
2. [Instalar Node.js con nvm](#2-instalar-nodejs-con-nvm)
3. [Instalar Git](#3-instalar-git)
4. [Instalar VS Code y extensiones recomendadas](#4-instalar-vs-code-y-extensiones-recomendadas)
5. [Instalar MetaMask](#5-instalar-metamask)
6. [Verificar que todo funciona](#6-verificar-que-todo-funciona)
7. [Solución de problemas comunes](#7-solución-de-problemas-comunes)
8. [Checklist final](#8-checklist-final)

---

## 1. ¿Qué vamos a instalar y por qué?

| Herramienta | Para qué la necesitamos |
|-------------|------------------------|
| **Node.js** | Ejecutar Hardhat (el entorno de desarrollo de Ethereum), correr pruebas y scripts |
| **npm** | Gestor de paquetes; viene incluido con Node.js |
| **nvm** | Gestor de versiones de Node.js; permite tener varias versiones sin conflictos |
| **Git** | Control de versiones; para clonar el repositorio y gestionar cambios |
| **VS Code** | Editor de código con soporte excelente para Solidity y JavaScript |
| **MetaMask** | Wallet (billetera) de prueba en el navegador; con ella interactuamos con la DApp |

---

## 2. Instalar Node.js con nvm

Usamos **nvm** (Node Version Manager) porque nos permite cambiar fácilmente de versión de Node.js.
El proyecto requiere Node.js LTS 20 o 22.

### En macOS y Linux

**Paso 1:** Abre una terminal. En macOS usa `Terminal.app` o `iTerm2`. En Linux usa el terminal de tu distribución.

**Paso 2:** Instala nvm ejecutando este comando (cópialo completo):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

**Paso 3:** Cierra y vuelve a abrir tu terminal (o recarga el perfil):

```bash
# En bash:
source ~/.bashrc

# En zsh (macOS por defecto desde Catalina):
source ~/.zshrc
```

**Paso 4:** Verifica que nvm esté instalado:

```bash
nvm --version
```

Deberías ver algo como `0.39.7`.

**Paso 5:** Instala Node.js LTS 22:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

---

### En Windows

En Windows tienes dos opciones. La más sencilla es **nvm-windows**:

**Opción A — nvm-windows (recomendada):**

1. Ve a [https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)
2. Descarga el archivo `nvm-setup.exe` de la última versión.
3. Ejecuta el instalador y sigue los pasos (acepta los valores por defecto).
4. Abre una nueva ventana de **PowerShell como Administrador** y ejecuta:

```powershell
nvm install 22
nvm use 22
```

**Opción B — Instalador directo (si tienes problemas con nvm-windows):**

1. Ve a [https://nodejs.org](https://nodejs.org)
2. Descarga la versión **LTS** (aparece marcada como "Recommended For Most Users").
3. Ejecuta el instalador `.msi` y sigue los pasos.

> **Importante en Windows:** después de instalar, cierra y vuelve a abrir PowerShell o la
> terminal para que los cambios surtan efecto.

---

## 3. Instalar Git

### En macOS

macOS suele tener Git preinstalado. Verifica con:

```bash
git --version
```

Si no está instalado, te pedirá instalar las Xcode Command Line Tools. Acepta la instalación.
Alternativamente, instala Git directamente desde [https://git-scm.com](https://git-scm.com).

### En Linux

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install git -y
```

**Fedora/RHEL:**

```bash
sudo dnf install git -y
```

**Arch Linux:**

```bash
sudo pacman -S git
```

### En Windows

1. Ve a [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Descarga el instalador y ejecútalo.
3. Durante la instalación, deja todas las opciones por defecto, **excepto** en la pantalla
   "Adjusting your PATH environment" selecciona **"Git from the command line and also from 3rd-party software"**.

**Configuración inicial de Git** (hazlo en todos los sistemas operativos):

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu.correo@utpl.edu.ec"
```

---

## 4. Instalar VS Code y extensiones recomendadas

### Instalar VS Code

1. Ve a [https://code.visualstudio.com](https://code.visualstudio.com)
2. Descarga el instalador para tu sistema operativo.
3. Instala siguiendo los pasos del asistente.

### Extensiones recomendadas

Abre VS Code y ve a la sección de Extensiones (icono de cuatro cuadros en la barra lateral, o
`Ctrl+Shift+X` / `Cmd+Shift+X` en macOS). Busca e instala las siguientes:

| Extensión | Identificador | Para qué sirve |
|-----------|--------------|----------------|
| **Solidity** de Nomic Foundation | `NomicFoundation.hardhat-solidity` | Resaltado de sintaxis, autocompletado y errores en tiempo real para Solidity |
| **ESLint** | `dbaeumer.vscode-eslint` | Detecta errores de JavaScript |
| **Prettier** | `esbenp.prettier-vscode` | Formatea el código automáticamente |
| **GitLens** | `eamodio.gitlens` | Visualiza el historial de Git dentro del editor |
| **DotENV** | `mikestead.dotenv` | Resaltado para archivos `.env` |

> **Consejo:** la extensión de Solidity de Nomic Foundation (la empresa que hace Hardhat) es
> la más completa para este proyecto. Si ves advertencias del contrato en el editor, muchas veces
> las puedes resolver directamente desde ahí.

---

## 5. Instalar MetaMask

MetaMask es una extensión de navegador que actúa como tu **wallet** (billetera digital) para
interactuar con aplicaciones blockchain. En este proyecto la usaremos con dinero de mentira
(cuentas de prueba locales).

### Instalar la extensión

1. Abre **Chrome**, **Brave**, **Firefox** o **Edge**.
2. Ve a [https://metamask.io/download](https://metamask.io/download)
3. Haz clic en **"Install MetaMask for Chrome"** (o el navegador que uses).
4. Se abrirá la tienda de extensiones de tu navegador. Haz clic en **"Agregar a Chrome"** (o equivalente).
5. Confirma la instalación.

> **Solo descarga MetaMask desde el sitio oficial (metamask.io) o la tienda oficial de
> extensiones de tu navegador. Existen extensiones falsas que roban wallets.**

### Crear una wallet de PRUEBA

> **MUY IMPORTANTE:** Vas a crear una wallet *exclusivamente para este laboratorio*.
> NO uses esta wallet para guardar criptomonedas reales. NO importes tu wallet personal aquí.

1. Haz clic en el ícono del zorro naranja (MetaMask) en la barra de herramientas del navegador.
2. Selecciona **"Crear una nueva billetera"**.
3. Acepta los términos de uso.
4. Crea una contraseña para esta instalación de MetaMask (puedes usar algo sencillo como
   `LabBlockchain2026` ya que es solo para pruebas).
5. MetaMask te mostrará tu **frase semilla** (12 palabras). Esta frase permite recuperar tu
   wallet si olvidas la contraseña.

> **Para esta wallet de prueba:** anota la frase semilla en un lugar seguro y úsala solo
> para el laboratorio. En una wallet real con fondos, la frase semilla se guarda offline y
> NUNCA se comparte con nadie.

6. Confirma las palabras en el orden correcto.
7. ¡Tu wallet de prueba está creada!

### Habilitar redes de prueba

MetaMask oculta las redes de prueba por defecto. Para verlas:

1. Haz clic en el ícono de MetaMask.
2. Haz clic en el selector de redes (donde dice "Ethereum Mainnet" en la parte superior).
3. Haz clic en **"Mostrar redes de prueba"** o actívalo en Configuración → Avanzado → "Mostrar redes de prueba".

---

## 6. Verificar que todo funciona

Abre una terminal nueva (importante: nueva, para que cargue las variables actualizadas) y ejecuta
estos comandos uno por uno:

```bash
# Verificar Node.js
node --version
# Esperado: v22.x.x (o v20.x.x)

# Verificar npm
npm --version
# Esperado: 10.x.x o superior

# Verificar Git
git --version
# Esperado: git version 2.x.x
```

Si los tres comandos muestran una versión, ¡estás listo!

---

## 7. Solución de problemas comunes

### "command not found: nvm" o "nvm: command not found"

**Causa:** nvm no se cargó en tu sesión de terminal.

**Solución:**
```bash
# Agrega estas líneas al final de ~/.zshrc (macOS) o ~/.bashrc (Linux):
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

Luego ejecuta `source ~/.zshrc` (o el archivo correspondiente) y vuelve a intentar `nvm --version`.

---

### "command not found: node" después de instalar

**Causa:** la terminal no reconoce la nueva instalación.

**Solución:**
- Cierra completamente la terminal y ábrela de nuevo.
- En Windows, cierra PowerShell y ábrela como Administrador.
- Verifica con `nvm list` que la versión esté instalada, luego `nvm use 22`.

---

### Error de permisos en macOS/Linux al instalar paquetes globales

**Causa:** intentas instalar algo con `sudo npm install -g` y hay conflictos.

**Solución:** con nvm no necesitas `sudo`. Si usas nvm correctamente, los paquetes globales
se instalan en tu directorio de usuario sin permisos de administrador:

```bash
npm install -g <paquete>   # Sin sudo si usas nvm
```

---

### MetaMask no aparece en la barra de herramientas del navegador

**Solución:** haz clic en el ícono de piezas de rompecabezas (extensiones) en Chrome/Brave y
fija MetaMask haciendo clic en el ícono de chincheta junto a MetaMask.

---

### MetaMask pide actualización constantemente

**Solución:** actualiza MetaMask desde la tienda de extensiones. Usar la última versión evita
problemas de compatibilidad.

---

## 8. Checklist final

Antes de pasar a la siguiente guía, confirma que puedes marcar todos estos puntos:

- [ ] `node --version` muestra `v20.x.x` o `v22.x.x`
- [ ] `npm --version` muestra una versión (`10.x.x` o similar)
- [ ] `git --version` muestra una versión
- [ ] VS Code está instalado y se abre correctamente
- [ ] La extensión de Solidity (NomicFoundation.hardhat-solidity) está instalada en VS Code
- [ ] MetaMask está instalado en tu navegador y tienes una wallet de **prueba** creada
- [ ] MetaMask muestra la opción de redes de prueba

Si todo está marcado: **pasa a la [Guía 02 — Ejecutar el Proyecto](./02-ejecutar-el-proyecto.md)**. ¡Vamos!

---

*¿Algo no funciona? Revisa las [preguntas frecuentes](./preguntas-frecuentes.md) o consulta
la sección de errores comunes de esta guía.*
