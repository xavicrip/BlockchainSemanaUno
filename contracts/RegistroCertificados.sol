// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RegistroCertificados
 * @author Repositorio Didáctico UTPL - Blockchain DevOps
 * @notice Contrato didáctico para registrar y verificar certificados académicos
 *         en la blockchain. Se usa como caso de estudio de la Unidad 1
 *         (Blockchain DevOps / DevSecOps).
 *
 * @dev El diseño prioriza la CLARIDAD y la enseñanza de buenas prácticas de
 *      seguridad (DevSecOps) por encima de la optimización. Patrones aplicados:
 *      - Control de acceso por roles (propietario + emisores autorizados).
 *      - Patrón Checks-Effects-Interactions y errores personalizados (gas-eficientes).
 *      - Eventos para trazabilidad/auditoría off-chain.
 *      - Inmutabilidad del registro (un certificado no se modifica; se revoca).
 */
contract RegistroCertificados {
    // ---------------------------------------------------------------------
    // Tipos de datos
    // ---------------------------------------------------------------------

    /// @notice Información de un certificado académico.
    struct Certificado {
        string nombreEstudiante; // Nombre del titular del certificado
        string curso; // Curso o programa cursado
        uint256 fechaEmision; // Marca de tiempo (timestamp) de emisión
        address emisor; // Dirección que emitió el certificado
        bool revocado; // true si el certificado fue revocado
        bool existe; // true si el hash corresponde a un certificado real
    }

    // ---------------------------------------------------------------------
    // Variables de estado
    // ---------------------------------------------------------------------

    /// @notice Propietario del contrato (la institución educativa).
    address public propietario;

    /// @notice Direcciones autorizadas a emitir/revocar certificados.
    mapping(address => bool) public emisorAutorizado;

    /// @notice Registro de certificados indexado por su hash único.
    mapping(bytes32 => Certificado) private certificados;

    /// @notice Número total de certificados emitidos (incluye revocados).
    uint256 public totalCertificados;

    // ---------------------------------------------------------------------
    // Eventos (trazabilidad para auditoría y para el frontend)
    // ---------------------------------------------------------------------

    event CertificadoEmitido(
        bytes32 indexed hashCertificado,
        string nombreEstudiante,
        string curso,
        address indexed emisor,
        uint256 fechaEmision
    );

    event CertificadoRevocado(bytes32 indexed hashCertificado, address indexed emisor);
    event EmisorAutorizado(address indexed cuenta, address indexed autorizadoPor);
    event EmisorRevocado(address indexed cuenta, address indexed revocadoPor);

    // ---------------------------------------------------------------------
    // Errores personalizados (más baratos en gas que require con string)
    // ---------------------------------------------------------------------

    error NoEsPropietario();
    error NoAutorizado();
    error CertificadoYaExiste();
    error CertificadoNoExiste();
    error CertificadoYaRevocado();
    error DireccionInvalida();

    // ---------------------------------------------------------------------
    // Modificadores de control de acceso
    // ---------------------------------------------------------------------

    modifier soloPropietario() {
        if (msg.sender != propietario) revert NoEsPropietario();
        _;
    }

    modifier soloEmisor() {
        if (!emisorAutorizado[msg.sender]) revert NoAutorizado();
        _;
    }

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    /// @notice Al desplegar, el creador es propietario y primer emisor autorizado.
    constructor() {
        propietario = msg.sender;
        emisorAutorizado[msg.sender] = true;
        emit EmisorAutorizado(msg.sender, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Gestión de emisores (solo propietario)
    // ---------------------------------------------------------------------

    /// @notice Autoriza a una cuenta a emitir y revocar certificados.
    function autorizarEmisor(address cuenta) external soloPropietario {
        if (cuenta == address(0)) revert DireccionInvalida();
        emisorAutorizado[cuenta] = true;
        emit EmisorAutorizado(cuenta, msg.sender);
    }

    /// @notice Revoca la autorización de un emisor.
    function revocarEmisor(address cuenta) external soloPropietario {
        emisorAutorizado[cuenta] = false;
        emit EmisorRevocado(cuenta, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Lógica principal de certificados
    // ---------------------------------------------------------------------

    /**
     * @notice Emite un nuevo certificado y devuelve su hash identificador.
     * @param nombreEstudiante Nombre del titular.
     * @param curso Curso o programa.
     * @return hashCertificado Identificador único del certificado.
     */
    function emitirCertificado(string calldata nombreEstudiante, string calldata curso)
        external
        soloEmisor
        returns (bytes32 hashCertificado)
    {
        // El hash combina datos + emisor + tiempo para garantizar unicidad.
        hashCertificado = keccak256(
            abi.encodePacked(nombreEstudiante, curso, msg.sender, block.timestamp, totalCertificados)
        );

        // Checks
        if (certificados[hashCertificado].existe) revert CertificadoYaExiste();

        // Effects
        certificados[hashCertificado] = Certificado({
            nombreEstudiante: nombreEstudiante,
            curso: curso,
            fechaEmision: block.timestamp,
            emisor: msg.sender,
            revocado: false,
            existe: true
        });
        totalCertificados++;

        emit CertificadoEmitido(hashCertificado, nombreEstudiante, curso, msg.sender, block.timestamp);
    }

    /// @notice Revoca un certificado existente (no se borra: queda marcado).
    function revocarCertificado(bytes32 hashCertificado) external soloEmisor {
        Certificado storage cert = certificados[hashCertificado];
        if (!cert.existe) revert CertificadoNoExiste();
        if (cert.revocado) revert CertificadoYaRevocado();

        cert.revocado = true;
        emit CertificadoRevocado(hashCertificado, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Funciones de lectura (view) - verificación pública
    // ---------------------------------------------------------------------

    /**
     * @notice Verifica el estado de un certificado.
     * @return valido true si el certificado existe y no está revocado.
     * @return cert Datos completos del certificado.
     */
    function verificarCertificado(bytes32 hashCertificado)
        external
        view
        returns (bool valido, Certificado memory cert)
    {
        cert = certificados[hashCertificado];
        valido = cert.existe && !cert.revocado;
    }
}
