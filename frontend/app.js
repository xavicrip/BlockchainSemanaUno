/**
 * Lógica de la DApp (frontend) — Registro de Certificados.
 *
 * Usa ethers.js v6 para hablar con el contrato inteligente a través de
 * MetaMask. La dirección y el ABI se cargan desde deployment.json, generado
 * por el script de despliegue (scripts/deploy.js). Así el frontend nunca tiene
 * datos "quemados": siempre refleja el último despliegue.
 */

let contrato; // Instancia del contrato conectada al firmante (signer).

// Red local. chainId 0x7a69 = 31337, el valor estándar de Hardhat y Anvil
// (debe coincidir con hardhat.config.js).
const RED_LOCAL = {
  chainId: "0x7a69",
  chainName: "Hardhat Local",
  rpcUrls: ["http://127.0.0.1:8545"],
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
};

const $ = (id) => document.getElementById(id);

function mostrar(elemento, mensaje, tipo = "ok") {
  elemento.innerHTML = `<div class="resultado ${tipo}">${mensaje}</div>`;
}

/** Carga la dirección y el ABI del último despliegue. */
async function cargarDespliegue() {
  const respuesta = await fetch("./deployment.json");
  if (!respuesta.ok) {
    throw new Error(
      "No se encontró deployment.json. Ejecuta primero: npm run deploy:local"
    );
  }
  return respuesta.json();
}

/**
 * Pide a MetaMask agregar (y cambiar a) la red local de Hardhat.
 * Usa wallet_addEthereumChain: evita tener que escribir los datos a mano.
 */
async function agregarRedLocal() {
  if (!window.ethereum) {
    return mostrar($("estadoConexion"), "MetaMask no está instalado.", "error");
  }
  const RED = RED_LOCAL;
  try {
    // Primero intenta cambiar; si la red no existe, MetaMask lanza 4902.
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: RED.chainId }],
    });
    mostrar($("estadoConexion"), "✅ Cambiado a la red Hardhat Local.", "ok");
  } catch (e) {
    if (e.code === 4902 || (e.data && e.data.originalError && e.data.originalError.code === 4902)) {
      try {
        await window.ethereum.request({ method: "wallet_addEthereumChain", params: [RED] });
        mostrar($("estadoConexion"), "✅ Red Hardhat Local agregada. Ahora pulsa ② Conectar.", "ok");
      } catch (e2) {
        mostrar($("estadoConexion"), `Error al agregar la red: ${e2.message}`, "error");
      }
    } else {
      mostrar($("estadoConexion"), `Error: ${e.message}`, "error");
    }
  }
}

/** Conecta con MetaMask y prepara la instancia del contrato. */
async function conectar() {
  if (!window.ethereum) {
    mostrar($("estadoConexion"), "MetaMask no está instalado.", "error");
    return;
  }
  try {
    const despliegue = await cargarDespliegue();

    // Verifica que MetaMask esté en la red local; si no, intenta cambiarla.
    const chainActual = await window.ethereum.request({ method: "eth_chainId" });
    if (chainActual !== RED_LOCAL.chainId) {
      mostrar(
        $("estadoConexion"),
        `⚠️ Estás en la red incorrecta (chainId ${chainActual}). Cambiando a la red local…`,
        "error"
      );
      await agregarRedLocal();
      const chainTrasCambio = await window.ethereum.request({ method: "eth_chainId" });
      if (chainTrasCambio !== RED_LOCAL.chainId) {
        return mostrar(
          $("estadoConexion"),
          "❌ No se pudo cambiar a la red local. Selecciónala manualmente en MetaMask (Anvil Local) y reintenta.",
          "error"
        );
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const cuenta = await signer.getAddress();

    contrato = new ethers.Contract(despliegue.direccion, despliegue.abi, signer);

    $("estadoConexion").innerHTML =
      `✅ Conectado: <code>${cuenta}</code><br/>Contrato: <code>${despliegue.direccion}</code> (${despliegue.red})`;
  } catch (e) {
    mostrar($("estadoConexion"), `Error: ${e.message}`, "error");
  }
}

/** Emite un certificado y muestra su hash. */
async function emitir() {
  if (!contrato) return mostrar($("resultadoEmision"), "Conéctate primero.", "error");
  const nombre = $("nombre").value.trim();
  const curso = $("curso").value.trim();
  if (!nombre || !curso) {
    return mostrar($("resultadoEmision"), "Completa nombre y curso.", "error");
  }
  try {
    mostrar($("resultadoEmision"), "Enviando transacción…", "ok");
    const tx = await contrato.emitirCertificado(nombre, curso);
    const recibo = await tx.wait();
    // Recupera el hash desde el evento CertificadoEmitido.
    const evento = recibo.logs
      .map((l) => {
        try { return contrato.interface.parseLog(l); } catch { return null; }
      })
      .find((e) => e && e.name === "CertificadoEmitido");
    const hash = evento ? evento.args[0] : "(revisa la consola)";
    mostrar(
      $("resultadoEmision"),
      `✅ Certificado emitido.<br/>Hash: <code>${hash}</code>`,
      "ok"
    );
  } catch (e) {
    mostrar($("resultadoEmision"), `Error: ${e.shortMessage || e.message}`, "error");
  }
}

/** Verifica el estado de un certificado por su hash. */
async function verificar() {
  if (!contrato) return mostrar($("resultadoVerificacion"), "Conéctate primero.", "error");
  const hash = $("hash").value.trim();
  if (!hash) return mostrar($("resultadoVerificacion"), "Ingresa un hash.", "error");
  try {
    const [valido, cert] = await contrato.verificarCertificado(hash);
    if (!cert.existe) {
      return mostrar($("resultadoVerificacion"), "❌ No existe un certificado con ese hash.", "error");
    }
    const fecha = new Date(Number(cert.fechaEmision) * 1000).toLocaleString("es-EC");
    mostrar(
      $("resultadoVerificacion"),
      `Estudiante: <b>${cert.nombreEstudiante}</b><br/>` +
        `Curso: <b>${cert.curso}</b><br/>` +
        `Emitido: ${fecha}<br/>` +
        `Estado: <b>${valido ? "✅ VÁLIDO" : "⚠️ REVOCADO"}</b>`,
      valido ? "ok" : "error"
    );
  } catch (e) {
    mostrar($("resultadoVerificacion"), `Error: ${e.shortMessage || e.message}`, "error");
  }
}

$("btnRed").addEventListener("click", agregarRedLocal);
$("btnConectar").addEventListener("click", conectar);
$("btnEmitir").addEventListener("click", emitir);
$("btnVerificar").addEventListener("click", verificar);
