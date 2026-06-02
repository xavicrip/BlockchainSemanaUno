const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Suite de pruebas del contrato RegistroCertificados.
 *
 * Estas pruebas son parte del pipeline de CI (DevOps): cada push las ejecuta
 * automáticamente. También sirven como documentación viva del comportamiento
 * esperado del contrato. Cobertura:
 *   - Despliegue e inicialización.
 *   - Control de acceso (DevSecOps).
 *   - Emisión, verificación y revocación de certificados.
 *   - Gestión de emisores.
 */
describe("RegistroCertificados", function () {
  let registro;
  let propietario, emisor, estudiante, atacante;

  beforeEach(async function () {
    [propietario, emisor, estudiante, atacante] = await ethers.getSigners();
    const Registro = await ethers.getContractFactory("RegistroCertificados");
    registro = await Registro.deploy();
    await registro.waitForDeployment();
  });

  describe("Despliegue", function () {
    it("asigna al desplegador como propietario", async function () {
      expect(await registro.propietario()).to.equal(propietario.address);
    });

    it("autoriza al propietario como primer emisor", async function () {
      expect(await registro.emisorAutorizado(propietario.address)).to.equal(true);
    });

    it("inicia con cero certificados", async function () {
      expect(await registro.totalCertificados()).to.equal(0);
    });
  });

  describe("Gestión de emisores", function () {
    it("el propietario puede autorizar un emisor", async function () {
      await expect(registro.autorizarEmisor(emisor.address))
        .to.emit(registro, "EmisorAutorizado")
        .withArgs(emisor.address, propietario.address);
      expect(await registro.emisorAutorizado(emisor.address)).to.equal(true);
    });

    it("rechaza que un no-propietario autorice emisores", async function () {
      await expect(
        registro.connect(atacante).autorizarEmisor(atacante.address)
      ).to.be.revertedWithCustomError(registro, "NoEsPropietario");
    });

    it("rechaza autorizar la dirección cero", async function () {
      await expect(
        registro.autorizarEmisor(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(registro, "DireccionInvalida");
    });
  });

  describe("Emisión de certificados", function () {
    it("un emisor autorizado emite un certificado y emite el evento", async function () {
      await expect(registro.emitirCertificado("Ada Lovelace", "Blockchain DevOps"))
        .to.emit(registro, "CertificadoEmitido");
      expect(await registro.totalCertificados()).to.equal(1);
    });

    it("rechaza emisión de una cuenta no autorizada", async function () {
      await expect(
        registro.connect(atacante).emitirCertificado("Mallory", "Hacking")
      ).to.be.revertedWithCustomError(registro, "NoAutorizado");
    });
  });

  describe("Verificación y revocación", function () {
    let hash;

    beforeEach(async function () {
      const tx = await registro.emitirCertificado("Grace Hopper", "Cloud Architecture");
      const recibo = await tx.wait();
      // Extrae el hash desde el evento emitido.
      const evento = recibo.logs.find((l) => l.fragment && l.fragment.name === "CertificadoEmitido");
      hash = evento.args[0];
    });

    it("verifica como válido un certificado recién emitido", async function () {
      const [valido, cert] = await registro.verificarCertificado(hash);
      expect(valido).to.equal(true);
      expect(cert.nombreEstudiante).to.equal("Grace Hopper");
      expect(cert.revocado).to.equal(false);
    });

    it("permite revocar y marca el certificado como inválido", async function () {
      await expect(registro.revocarCertificado(hash))
        .to.emit(registro, "CertificadoRevocado")
        .withArgs(hash, propietario.address);

      const [valido, cert] = await registro.verificarCertificado(hash);
      expect(valido).to.equal(false);
      expect(cert.revocado).to.equal(true);
    });

    it("rechaza revocar dos veces el mismo certificado", async function () {
      await registro.revocarCertificado(hash);
      await expect(
        registro.revocarCertificado(hash)
      ).to.be.revertedWithCustomError(registro, "CertificadoYaRevocado");
    });

    it("rechaza revocar un certificado inexistente", async function () {
      const hashFalso = ethers.keccak256(ethers.toUtf8Bytes("no-existe"));
      await expect(
        registro.revocarCertificado(hashFalso)
      ).to.be.revertedWithCustomError(registro, "CertificadoNoExiste");
    });
  });
});
