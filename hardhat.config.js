require("@nomicfoundation/hardhat-toolbox");

/**
 * Configuración de Hardhat (entorno de desarrollo de Ethereum).
 *
 * Las variables sensibles (claves privadas, URLs RPC) se leen de variables de
 * entorno y NUNCA se escriben en el código (principio DevSecOps: secretos fuera
 * del repositorio). Ver .env.example.
 */
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Red local en memoria (por defecto al correr pruebas).
    hardhat: {},
    // Nodo local persistente: `npm run node`.
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Red de pruebas pública Sepolia (solo si hay credenciales configuradas).
    ...(SEPOLIA_RPC_URL && PRIVATE_KEY
      ? {
          sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
          },
        }
      : {}),
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};
