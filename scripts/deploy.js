const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script de despliegue del contrato RegistroCertificados.
 *
 * Forma parte del pipeline DevOps: el mismo script sirve para la red local,
 * una testnet o (con la configuración adecuada) la red principal. Al finalizar,
 * guarda la dirección y el ABI en frontend/deployment.json para que la DApp
 * los consuma automáticamente.
 */
async function main() {
  const [desplegador] = await ethers.getSigners();
  console.log(`Red:          ${network.name}`);
  console.log(`Desplegando con la cuenta: ${desplegador.address}`);

  const Registro = await ethers.getContractFactory("RegistroCertificados");
  const registro = await Registro.deploy();
  await registro.waitForDeployment();

  const direccion = await registro.getAddress();
  console.log(`✅ RegistroCertificados desplegado en: ${direccion}`);

  // Exporta dirección + ABI para el frontend.
  const artifact = require("../artifacts/contracts/RegistroCertificados.sol/RegistroCertificados.json");
  const salida = {
    direccion,
    red: network.name,
    abi: artifact.abi,
  };
  const rutaSalida = path.join(__dirname, "..", "frontend", "deployment.json");
  fs.writeFileSync(rutaSalida, JSON.stringify(salida, null, 2));
  console.log(`📄 Datos de despliegue guardados en: ${rutaSalida}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
