# Preguntas frecuentes (FAQ)

> Dudas reales de estudiantes que llegan por primera vez a un proyecto blockchain.
> Si tu pregunta no está aquí, revisa el [glosario rápido](./05-glosario-rapido.md) o la
> guía correspondiente.

---

### 1. ¿Necesito dinero real para hacer las prácticas?

**No.** Todo el curso se hace sobre una **red local** (Hardhat) que crea dinero de prueba ilimitado
y cuentas falsas. No se gasta ni un centavo. Más adelante, si quieres practicar en una **testnet**
(Sepolia), también es gratis: se usan "ETH de prueba" que se piden en un *faucet*.

### 2. ¿Qué es MetaMask y por qué lo necesito?

Es una extensión del navegador que actúa como tu **billetera**: guarda tus cuentas y te pide
confirmar cada transacción. La DApp la usa para saber "quién eres" y para firmar tus operaciones.
Sin una wallet, la blockchain no sabe de parte de quién viene una acción. Instálala siguiendo la
[guía 01](./01-preparacion-del-entorno.md).

### 3. ¿Es seguro instalar MetaMask?

Sí, instalándola desde el sitio oficial (`metamask.io`). Para este curso **crea una wallet nueva de
prueba** y no le pongas fondos reales. Nunca compartas tu *frase secreta de recuperación* de una
wallet real.

### 4. ¿Por qué falla mi transacción?

Las causas más comunes:
- **No estás en la red correcta** en MetaMask (debe ser la red local, *chainId* `31337`).
- **No reiniciaste la cuenta** tras reiniciar el nodo local → error de *nonce*. Solución en
  MetaMask: *Configuración → Avanzado → Borrar datos de actividad*.
- **No tienes permiso**: el contrato solo deja emitir certificados a cuentas autorizadas
  (ver pregunta 11).
- **`deployment.json` no existe**: aún no desplegaste el contrato (`npm run deploy:local`).

### 5. ¿Qué red debo usar?

Para todas las prácticas de esta unidad: la **red local de Hardhat** (`http://127.0.0.1:8545`,
*chainId* `31337`). Es rápida, gratis y reiniciable.

### 6. ¿Por qué leer un certificado es gratis pero emitirlo cuesta gas?

Porque **leer** (función `verificarCertificado`) no cambia nada en la blockchain: cada nodo ya tiene
los datos. **Escribir** (función `emitirCertificado`) modifica el estado compartido por toda la red,
y ese trabajo se paga con *gas*. Es la diferencia entre *consultar* y *modificar*.

### 7. ¿Puedo borrar un certificado emitido?

**No se borra: se revoca.** La blockchain es inmutable, así que el certificado siempre queda
registrado, pero se le marca como `revocado = true` y deja de ser válido. Esto es a propósito:
permite auditar el historial completo. Ver
[modelo de datos](../docs/02-arquitectura/03-modelo-de-datos.md).

### 8. Reinicié el nodo y ahora todo falla, ¿qué pasó?

Al reiniciar `npm run node`, la blockchain local vuelve a cero: el contrato desplegado **desaparece**.
Debes volver a ejecutar `npm run deploy:local` y, en MetaMask, borrar los datos de actividad de la
cuenta (por el *nonce*).

### 9. Las 12 pruebas pasan, ¿qué significa eso?

Que el comportamiento del contrato es el esperado: despliegue, control de acceso, emisión,
verificación y revocación funcionan correctamente. Las pruebas son tu **red de seguridad**: si más
adelante rompes algo, te avisan. Es la base del enfoque DevOps.

### 10. ¿Qué diferencia hay entre DevOps y DevSecOps?

DevOps automatiza desarrollar y desplegar de forma rápida y confiable. **DevSecOps** añade la
seguridad **dentro** de esa automatización, desde el primer día ("shift-left"), en vez de revisarla
al final. Ver [fundamentos](../docs/01-investigacion/1.2-fundamentos-devsecops.md).

### 11. Intenté emitir un certificado y me dice "NoAutorizado", ¿por qué?

Porque solo las cuentas **autorizadas como emisor** pueden emitir. La cuenta que desplegó el
contrato (la primera de Hardhat) ya es emisora. Si conectaste otra cuenta, el propietario debe
autorizarla con `autorizarEmisor`. Es una medida de seguridad intencional (control de acceso).

### 12. ¿Necesito saber Solidity para hacer las prácticas?

No para *ejecutar* el proyecto. Para *entenderlo* a fondo y hacer los retos, te conviene leer el
contrato `contracts/RegistroCertificados.sol`, que está muy comentado en español. Solidity se
parece a JavaScript/Java en su sintaxis.

### 13. ¿Por qué no subimos el archivo `.env` a GitHub?

Porque contiene **secretos** (claves privadas, llaves de API). Si se filtran, alguien podría usar
tus cuentas o servicios. Por eso `.env` está en `.gitignore` y solo compartimos `.env.example` (la
plantilla sin valores). Ver [gestión de secretos](../docs/04-devsecops/03-gestion-de-secretos.md).

### 14. El comando `npm run node` "se queda pegado" sin volver a la terminal, ¿está mal?

No, es correcto. El nodo local es un proceso que **sigue corriendo** para atender peticiones. Déjalo
abierto en esa terminal y abre **otra** para los demás comandos.

### 15. ¿Esto sirve para algo en el mundo real?

Sí. El patrón "registro verificable e inmutable" se usa para diplomas, propiedad, trazabilidad de
productos y más. Y las prácticas DevOps/DevSecOps que aprendes aquí son las mismas que usan los
equipos profesionales de software, con o sin blockchain.

---

¿Sigues atascado? Revisa la sección **"Solución de problemas"** al final de la
[guía 02 — Ejecutar el proyecto](./02-ejecutar-el-proyecto.md).
