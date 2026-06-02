# Glosario rápido — términos esenciales

> Definiciones cortas y con analogías para que entiendas el vocabulario del proyecto sin
> tecnicismos. Para el glosario extendido y formal, consulta
> [`../docs/01-investigacion/glosario.md`](../docs/01-investigacion/glosario.md).

| Término | En una frase | Analogía |
|---------|--------------|----------|
| **Blockchain** | Un libro de registros compartido entre muchas computadoras que nadie puede borrar ni alterar. | Un cuaderno con copias idénticas en miles de manos: si alguien tacha algo, no coincide con las demás y se rechaza. |
| **Smart contract (contrato inteligente)** | Un programa que vive en la blockchain y se ejecuta solo cuando se cumplen sus reglas. | Una máquina expendedora: pones la moneda (cumples la condición) y entrega el producto, sin un humano de por medio. |
| **DApp** | Aplicación descentralizada: una web normal que, en lugar de un servidor, habla con un contrato en la blockchain. | Un cajero automático que, en vez de conectarse al banco, se conecta a la red blockchain. |
| **Wallet (billetera)** | Programa que guarda tus llaves y firma tus operaciones. En este curso usamos **MetaMask**. | Tu llavero: no guarda el dinero, guarda las llaves que lo desbloquean. |
| **MetaMask** | La extensión del navegador que actúa como tu wallet y aprueba las transacciones. | El portero que te pide confirmar "¿seguro que quieres entrar?" antes de cada acción. |
| **Cuenta / dirección** | Tu identidad en la blockchain; un código que empieza con `0x...`. | Tu número de cuenta bancaria, pero público. |
| **Clave privada (private key)** | El secreto que controla tu cuenta. Quien la tiene, manda. **NUNCA se comparte.** | La contraseña maestra de tu caja fuerte. |
| **Gas** | Lo que cuesta ejecutar una operación que cambia datos en la blockchain. | El combustible de un viaje: cuanto más larga la operación, más gastas. |
| **Transacción** | Una operación que **cambia** datos (cuesta gas y requiere tu firma). | Enviar una carta certificada: queda registrada y tiene costo. |
| **Llamada *view*** | Una operación que solo **lee** datos (gratis, sin firma). | Mirar el saldo en la app: no cuesta nada. |
| **Hash** | Una "huella digital" única de unos datos. En el proyecto identifica cada certificado. | El número de serie irrepetible de un billete. |
| **ABI** | La "lista de funciones" del contrato que el frontend necesita para hablar con él. | El menú de un restaurante: dice qué puedes pedir y cómo. |
| **RPC** | La puerta de entrada por la que tu app se conecta a la red blockchain. | El número de teléfono al que llamas para hablar con la red. |
| **Testnet** | Una red de pruebas con dinero falso, para practicar sin riesgo (ej. Sepolia). | Un simulador de vuelo: practicas sin que un error tenga consecuencias reales. |
| **Mainnet** | La red real, con dinero real. Aquí los errores cuestan de verdad. | El vuelo real con pasajeros a bordo. |
| **Deploy (desplegar)** | Subir el contrato a una red para que empiece a funcionar. | Publicar tu app en la tienda: a partir de ahí, está disponible. |
| **CI/CD** | Automatización que prueba y publica tu código en cada cambio. | Un control de calidad automático en una fábrica: nada sale sin pasar las pruebas. |
| **DevOps** | Cultura y herramientas para desarrollar y operar software de forma rápida y confiable. | Un equipo de cocina coordinado: pedir, cocinar y servir sin cuellos de botella. |
| **DevSecOps** | DevOps con la seguridad integrada desde el inicio, no al final. | Revisar los ingredientes mientras cocinas, no cuando el plato ya está servido. |
| **Slither** | Herramienta que revisa el contrato buscando errores de seguridad. | Un corrector ortográfico, pero para vulnerabilidades. |

---

### ¿Encontraste un término que no está aquí?

Búscalo en el [glosario completo](../docs/01-investigacion/glosario.md) (más de 30 términos con
definiciones formales) o consulta las [preguntas frecuentes](./preguntas-frecuentes.md).
