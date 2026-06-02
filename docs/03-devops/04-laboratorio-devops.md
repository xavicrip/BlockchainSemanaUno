# 04 — Laboratorio Práctico: DevOps en Acción

> **Módulo:** 03 DevOps Práctico · UTPL Blockchain 2026
> **Duración estimada:** 60–90 minutos
> **Nivel:** principiante — se asume solo conocimiento básico de Git y terminal

---

## Objetivo del laboratorio

Al terminar este laboratorio habrás:

1. Clonado el repositorio y verificado que el entorno local funciona.
2. Visto cómo se ejecutan las 12 pruebas automatizadas.
3. Roto una prueba a propósito y observado el pipeline de CI fallar.
4. Arreglado la prueba y visto el pipeline ponerse en verde.
5. Configurado protección de rama en GitHub para exigir CI verde antes del merge.

---

## Prerrequisitos

Antes de empezar, verifica que tienes instalado:

```bash
# Node.js 20 LTS o superior
node --version
# Debe mostrar: v20.x.x (o superior)

# npm 10+
npm --version
# Debe mostrar: 10.x.x (o superior)

# Git
git --version
# Debe mostrar: git version 2.x.x
```

Si necesitas instalar Node.js: https://nodejs.org/en/download (descarga la versión **LTS**).

---

## Parte 1 — Preparar el entorno

### Paso 1.1 — Fork del repositorio

1. Abre el repositorio del curso en GitHub.
2. Haz clic en **Fork** (esquina superior derecha).
3. Selecciona tu cuenta personal como destino.
4. GitHub crea una copia del repositorio en tu cuenta: `https://github.com/TU_USUARIO/repoSemanaUno`.

> **¿Por qué hacer fork?** Necesitas un repositorio en tu cuenta para que los workflows
> de GitHub Actions se ejecuten bajo tu control. El fork también es la forma estándar de
> contribuir a proyectos open source.

### Paso 1.2 — Clonar tu fork

```bash
# Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
git clone https://github.com/TU_USUARIO/repoSemanaUno.git

# Entra al directorio del proyecto
cd repoSemanaUno
```

### Paso 1.3 — Instalar dependencias

```bash
# IMPORTANTE: usa npm ci, no npm install
npm ci
```

Deberías ver algo como:

```
added 347 packages, and audited 348 packages in 12s
found 0 vulnerabilities
```

> Si ves errores, verifica que estás usando Node.js 20 LTS (`node --version`).

### Paso 1.4 — Verificar la instalación

```bash
# Compila los contratos
npm run compile
```

Salida esperada:

```
Compiling 1 file with Solidity 0.8.24
Compilation finished successfully
```

---

## Parte 2 — Ejecutar el pipeline localmente

### Paso 2.1 — Lint del contrato

```bash
npm run lint:sol
```

Si no hay violaciones, el comando termina sin salida (código de salida 0). Si hay
advertencias o errores, los verás listados con archivo, línea y descripción.

### Paso 2.2 — Ejecutar las pruebas

```bash
npm test
```

Deberías ver las 12 pruebas en verde:

```
  RegistroCertificados
    Despliegue
      ✔ asigna al desplegador como propietario (123ms)
      ✔ autoriza al propietario como primer emisor (45ms)
      ✔ inicia con cero certificados (32ms)
    Gestión de emisores
      ✔ el propietario puede autorizar un emisor (67ms)
      ✔ rechaza que un no-propietario autorice emisores (44ms)
      ✔ rechaza autorizar la dirección cero (38ms)
    Emisión de certificados
      ✔ un emisor autorizado emite un certificado y emite el evento (89ms)
      ✔ rechaza emisión de una cuenta no autorizada (41ms)
    Verificación y revocación
      ✔ verifica como válido un certificado recién emitido (78ms)
      ✔ permite revocar y marca el certificado como inválido (91ms)
      ✔ rechaza revocar dos veces el mismo certificado (55ms)
      ✔ rechaza revocar un certificado inexistente (43ms)

  12 passing (1s)
```

### Paso 2.3 — Cobertura (opcional, tarda ~2 min)

```bash
npm run coverage
```

Verás un reporte de tabla al final:

```
--------------------|----------|----------|----------|----------|
File                | % Stmts  | % Branch | % Funcs  | % Lines  |
--------------------|----------|----------|----------|----------|
 contracts/         |          |          |          |          |
  RegistroCertif... |   100    |   87.5   |   100    |   100    |
--------------------|----------|----------|----------|----------|
All files           |   100    |   87.5   |   100    |   100    |
--------------------|----------|----------|----------|----------|
```

---

## Parte 3 — Hacer fallar el pipeline (a propósito)

Esta es la parte más importante del laboratorio: ver qué pasa cuando el CI detecta un error.

### Paso 3.1 — Crear una rama nueva

Siempre trabaja en una rama; nunca directamente en `main`.

```bash
git checkout -b feat/prueba-fallida
```

### Paso 3.2 — Romper una prueba

Abre el archivo `test/RegistroCertificados.test.js` en tu editor y busca esta prueba:

```javascript
it("inicia con cero certificados", async function () {
  expect(await registro.totalCertificados()).to.equal(0);
});
```

Cambia el valor esperado de `0` a `999` para que la prueba falle:

```javascript
it("inicia con cero certificados", async function () {
  // CAMBIO INTENCIONAL: esperamos 999 pero el contrato devuelve 0
  expect(await registro.totalCertificados()).to.equal(999);
});
```

### Paso 3.3 — Verificar que falla localmente

```bash
npm test
```

Deberías ver:

```
  11 passing (1s)
  1 failing

  1) RegistroCertificados Despliegue
       inicia con cero certificados:
     AssertionError: expected 0n to equal 999n
     + expected - actual

     -0n
     +999n
```

El pipeline local ya está rojo. Vamos a enviarlo al servidor.

### Paso 3.4 — Subir el cambio al servidor

```bash
# Agrega el archivo modificado
git add test/RegistroCertificados.test.js

# Crea el commit
git commit -m "chore: prueba rota (a propósito, laboratorio DevOps)"

# Sube la rama a tu fork
git push origin feat/prueba-fallida
```

### Paso 3.5 — Abrir un Pull Request

1. Ve a `https://github.com/TU_USUARIO/repoSemanaUno`.
2. GitHub mostrará un banner amarillo: **"feat/prueba-fallida had recent pushes"**.
3. Haz clic en **Compare & pull request**.
4. Título: `[LAB] Prueba rota a propósito`.
5. Haz clic en **Create pull request**.

### Paso 3.6 — Observar el pipeline fallar

1. En la página del PR, haz clic en la pestaña **Checks** o mira la sección de checks
   al final de la página.
2. Verás el job `Lint · Compilar · Probar` corriendo (círculo amarillo girando).
3. En ~1 minuto cambiará a **rojo** con el mensaje de falla.
4. Haz clic en **Details** para ver el log completo del step fallido.

El botón **Merge pull request** estará bloqueado (si tienes configurada la protección
de rama; si no, el botón existe pero el check muestra rojo — el equipo sabe que no debe
hacer merge).

---

## Parte 4 — Arreglar el error y ver el CI ponerse en verde

### Paso 4.1 — Revertir el cambio

Abre `test/RegistroCertificados.test.js` y restaura el valor correcto:

```javascript
it("inicia con cero certificados", async function () {
  expect(await registro.totalCertificados()).to.equal(0);
});
```

### Paso 4.2 — Verificar localmente

```bash
npm test
# → 12 passing
```

### Paso 4.3 — Commitear y hacer push

```bash
git add test/RegistroCertificados.test.js
git commit -m "fix: restaurar prueba correcta del contador inicial"
git push origin feat/prueba-fallida
```

### Paso 4.4 — Observar el CI ponerse en verde

1. El push al PR dispara automáticamente una nueva ejecución del workflow.
2. En la pestaña **Checks** del PR, verás el job correr de nuevo.
3. En ~1 minuto todos los checks se pondrán en verde.
4. El botón **Merge pull request** (si la protección está activa) se desbloqueará.

---

## Parte 5 — Configurar protección de rama (bonus)

Si tienes permisos de administrador en tu fork, configura la protección de rama:

1. Ve a **Settings → Branches**.
2. Haz clic en **Add branch protection rule**.
3. En "Branch name pattern": `main`.
4. Activa:
   - **Require status checks to pass before merging**
   - Busca y agrega: `Lint · Compilar · Probar`
   - **Require branches to be up to date before merging**
5. Guarda los cambios.

Ahora ningún PR puede hacerse merge a `main` si el CI está rojo.

---

## Criterios de "hecho" (Definition of Done)

Marca cada item al completarlo:

- [ ] Hice fork del repositorio en mi cuenta de GitHub.
- [ ] Cloné el fork y ejecuté `npm ci` sin errores.
- [ ] Ejecuté `npm test` y vi las 12 pruebas en verde en mi máquina local.
- [ ] Creé la rama `feat/prueba-fallida` y rompí una prueba a propósito.
- [ ] Abrí un Pull Request y observé el job `Lint · Compilar · Probar` en rojo.
- [ ] Hice clic en "Details" e identifiqué el error en el log del step fallido.
- [ ] Arreglé la prueba, hice push y vi el CI ponerse en verde.
- [ ] (Bonus) Configuré la protección de rama en `main`.
- [ ] (Bonus) Ejecuté `npm run coverage` y anoté el porcentaje de cobertura por líneas.

---

## Preguntas de reflexión

Responde estas preguntas en tu bitácora o en un comentario del PR:

1. ¿En qué step del pipeline falló el workflow cuando rompiste la prueba? ¿Por qué los
   steps siguientes no se ejecutaron?

2. ¿Qué ventaja tiene que el CI falle rápido (fail fast) en lugar de continuar ejecutando
   todos los steps?

3. Si tuvieras que agregar una prueba que verifique el control de acceso de la función
   `emitirCertificado` para un emisor recién autorizado, ¿en qué bloque `describe` la
   agregarías? ¿Qué ventaja tiene que el CI lo verifique automáticamente?

4. ¿Por qué en un contrato Solidity que ya está desplegado en mainnet no puedes hacer
   lo que hiciste en el Paso 4.1 (revertir el bug fácilmente)?

---

## Extensiones opcionales

Si terminas antes de tiempo, intenta:

**Extensión A — Romper el lint:**

```bash
# Agrega una variable de estado sin visibilidad explícita en el contrato
# (viola la regla state-visibility de Solhint)
# Observa cómo el pipeline falla en el step de lint, antes de llegar a los tests
```

**Extensión B — Explorar el reporte de cobertura HTML:**

```bash
npm run coverage
# Abre coverage/index.html en tu navegador
# Identifica qué ramas no están cubiertas (aparecen en rojo)
```

**Extensión C — Revisar el workflow de DevSecOps:**

Explora [`../04-devsecops/`](../04-devsecops/) para ver cómo se agrega el análisis de
seguridad con Slither y `npm audit` al pipeline, complementando lo que construiste aquí.

---

## Solución de problemas frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| `npm ci` falla con "Missing package-lock.json" | El archivo no está en el repo | Corre `npm install` una vez y commitea `package-lock.json` |
| `npm test` falla con "Cannot find module" | `node_modules` corrupta | Borra `node_modules/` y corre `npm ci` de nuevo |
| El workflow no se dispara en GitHub | GitHub Actions desactivado en el fork | Ve a Actions → "I understand my workflows, go ahead and enable them" |
| `npm run coverage` tarda mucho | Normal la primera vez | Espera hasta 3–4 minutos; la instrumentación es costosa |
| `npx hardhat compile` falla | Versión incorrecta de Node.js | Verifica `node --version` — debe ser v18+ (recomendado v20 LTS) |

---

## Lecturas relacionadas

- [`01-ciclo-cicd.md`](./01-ciclo-cicd.md) — Por qué el orden lint → compile → test es deliberado.
- [`02-pipeline-github-actions.md`](./02-pipeline-github-actions.md) — Análisis del `ci.yml` línea por línea.
- [`03-automatizacion-local.md`](./03-automatizacion-local.md) — Tabla completa de scripts y buenas prácticas locales.
- [`../04-devsecops/`](../04-devsecops/) — El siguiente paso: automatizar la seguridad.
- [`../02-arquitectura/`](../02-arquitectura/) — Entender la arquitectura de la DApp que estás probando.
