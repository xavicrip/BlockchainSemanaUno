# Referencias y Recursos — Unidad 1: Blockchain DevOps

> **Módulo:** [Marco Teórico](./README.md)
> Esta bibliografía respalda los contenidos de [1.1 Fundamentos de DevOps](./1.1-fundamentos-devops.md) y [1.2 Fundamentos de DevSecOps](./1.2-fundamentos-devsecops.md). Los recursos están organizados por categoría y ordenados de mayor a menor relevancia para los temas del módulo.

---

## 1. Libros fundamentales de DevOps

**Kim, G., Behr, K. y Spafford, G. (2013). *The Phoenix Project: A Novel About IT, DevOps, and Helping Your Business Win*. IT Revolution Press.**
Novela de negocios que narra la transformación de una empresa de TI disfuncional. Introduce de forma narrativa conceptos como los Tres Caminos, el flujo de valor y la importancia de la cultura. Lectura esencial y muy accesible para quienes inician en DevOps.

**Kim, G., Humble, J., Debois, P. y Willis, J. (2016). *The DevOps Handbook: How to Create World-Class Agility, Reliability, and Security in Your Technology Organization*. IT Revolution Press.**
La contraparte técnica de *The Phoenix Project*. Describe en detalle cómo implementar las prácticas DevOps: pipelines de CI/CD, pruebas automatizadas, despliegue continuo, cultura de mejora. Referencia principal para el modelo CALMS y los Tres Caminos.

**Forsgren, N., Humble, J. y Kim, G. (2018). *Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations*. IT Revolution Press.**
Investigación científica rigurosa que respalda las cuatro métricas DORA con datos de más de 30.000 profesionales. Demuestra la correlación entre prácticas DevOps, rendimiento de entrega de software y rendimiento organizacional. Indispensable para justificar la adopción de DevOps con evidencia.

**Kim, G., Spafford, G., Behr, K. y Humble, J. (2021). *The Unicorn Project: A Novel About Developers, Digital Disruption, and Thriving in the Age of Data*. IT Revolution Press.**
Novela complementaria a *The Phoenix Project*, narrada desde la perspectiva de la desarrolladora principal. Introduce las Cinco Ideales de DevOps: Localidad, Enfoque, Flujo, Mejora diaria y Seguridad psicológica.

---

## 2. Libros de seguridad y DevSecOps

**Kim, G. y Johnson, J. (2023). *The Hacker and the State: Hacking for Development, Cybersecurity, and the Role of Governments*. MIT Press.**
Contexto más amplio sobre la importancia de la seguridad en el ecosistema tecnológico moderno.

**OWASP Foundation. *OWASP DevSecOps Guideline*.**
Guía práctica de la Open Web Application Security Project para integrar seguridad en el ciclo DevOps. Cubre threat modeling, análisis de código, pruebas de seguridad y monitoreo en producción. Disponible de forma gratuita en el sitio oficial de OWASP.

---

## 3. Documentación oficial — Stack técnico del repositorio

**Ethereum Foundation. *Documentación oficial de Solidity*. docs.soliditylang.org**
Referencia autoritativa sobre el lenguaje Solidity: sintaxis, tipos de datos, características de seguridad de la versión 0.8.x (overflow nativo, errores personalizados), patrones recomendados y guías de seguridad. La sección "Security Considerations" es lectura obligatoria para cualquier desarrollador de contratos.

**Nomic Foundation. *Documentación oficial de Hardhat*. hardhat.org/docs**
Documentación completa del entorno de desarrollo Ethereum usado en este repositorio. Cubre: compilación, red local, scripts de despliegue, plugins y configuración de redes.

**Ethers.js Contributors. *Documentación oficial de ethers.js v6*. docs.ethers.org/v6/**
Referencia de la librería JavaScript usada en el frontend de la DApp. Cubre: conexión a wallets (MetaMask/BrowserProvider), lectura de eventos, llamadas a funciones y manejo de transacciones.

**GitHub Docs. *GitHub Actions Documentation*. docs.github.com/actions**
Documentación oficial de la plataforma de automatización usada para implementar el pipeline de CI/CD. Cubre: sintaxis de workflows, secretos cifrados, entornos de despliegue y reutilización de workflows.

---

## 4. Seguridad de smart contracts — Referencias específicas

**Trail of Bits. *Slither: Static Analysis Framework for Solidity*. github.com/crytic/slither**
Repositorio oficial de Slither con documentación, lista de detectores y ejemplos de uso. Trail of Bits es una de las firmas de auditoría de smart contracts más reconocidas del mundo. El repositorio incluye guías de integración en CI/CD.

**Trail of Bits. *Building Secure Contracts: Guidelines and Best Practices*. github.com/crytic/building-secure-contracts**
Guía práctica para escribir contratos seguros en Solidity. Incluye ejemplos de vulnerabilidades comunes, el patrón CEI, análisis de reentrancia y cómo usar Slither de forma efectiva.

**Smart Contract Security Alliance. *SWC Registry (Smart Contract Weakness Classification)*. swcregistry.io**
Registro de debilidades de contratos inteligentes, análogo al CWE para software general. Cada entrada documenta el tipo de vulnerabilidad, su descripción, ejemplos de código vulnerable y correcto, y referencias adicionales. Referencia directa para las vulnerabilidades descritas en [1.2 Fundamentos de DevSecOps](./1.2-fundamentos-devsecops.md).

**ConsenSys. *Smart Contract Best Practices (Ethereum Smart Contract Security Best Practices)*. consensys.github.io/smart-contract-best-practices/**
Guía mantenida por ConsenSys que documenta patrones de diseño seguros, vulnerabilidades conocidas y recomendaciones para auditorías. Cubre: reentrancia, control de acceso, manejo de gas, errores y más.

**Solhint Contributors. *Solhint: Solidity Linter*. protofire.github.io/solhint/**
Documentación del linter Solhint: reglas disponibles, configuración de `.solhint.json` y reglas de seguridad específicas de Solidity.

---

## 5. Estándares y frameworks de seguridad generales

**NIST (National Institute of Standards and Technology, EE.UU.). *NIST Cybersecurity Framework (CSF)*.**
Marco de referencia para gestionar riesgos de ciberseguridad en organizaciones. Organiza las prácticas de seguridad en cinco funciones: Identificar, Proteger, Detectar, Responder y Recuperar. Base conceptual para el enfoque de DevSecOps.

**NIST. *SP 800-218: Secure Software Development Framework (SSDF)*.**
Marco de desarrollo seguro de software publicado por NIST. Proporciona prácticas para reducir vulnerabilidades en el ciclo de vida del software, alineadas con el principio "shift-left security".

**OWASP Foundation. *OWASP Top 10*. owasp.org/www-project-top-ten/**
Lista de las diez vulnerabilidades más críticas en aplicaciones web, publicada por la Open Web Application Security Project. Aunque orientada a web, varios conceptos (control de acceso, inyección, exposición de datos sensibles) tienen equivalentes directos en smart contracts.

---

## 6. Recursos de investigación y comunidad

**DORA (DevOps Research and Assessment). *State of DevOps Report* (publicación anual).**
Informe anual que actualiza las métricas y tendencias del rendimiento DevOps a nivel mundial. Referencia principal para las métricas DORA descritas en [1.1 Fundamentos de DevOps](./1.1-fundamentos-devops.md). Los reportes están disponibles gratuitamente en el sitio de DORA.

**Ethereum Foundation. *Ethereum Documentation*. ethereum.org/developers/docs**
Documentación oficial sobre el protocolo Ethereum: conceptos fundamentales (cuentas, transacciones, gas, EVM), desarrollo de DApps, redes de prueba y recursos de seguridad.

**OpenZeppelin. *OpenZeppelin Contracts Documentation*. docs.openzeppelin.com/contracts**
Librería de contratos seguros y auditados para Solidity. Incluye implementaciones de `ReentrancyGuard`, control de acceso (`Ownable`, `AccessControl`), tokens estándar (ERC-20, ERC-721) y patrones de actualización (proxy). Referencia fundamental para no reinventar la rueda en seguridad.

**Alchemy. *Road to Web3 Learning Challenges*. alchemy.com/university**
Plataforma de aprendizaje gratuita sobre desarrollo Web3 y Ethereum. Cubre desde conceptos básicos hasta DApps completas con contratos en mainnet.

---

## 7. Artículos académicos y técnicos de referencia

**Humble, J. y Farley, D. (2010). *Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation*. Addison-Wesley.**
Libro que formalizó el concepto de Entrega Continua (Continuous Delivery). Define los principios del pipeline de despliegue y las diferencias entre CI, CD y Despliegue Continuo.

**Luu, L., Chu, D.-H., Olickel, H., Saxena, P. y Hobor, A. (2016). *Making Smart Contracts Smarter*. Proceedings of the ACM CCS 2016.**
Artículo académico que introdujo OYENTE (Oyente), una de las primeras herramientas de análisis estático para smart contracts, y documentó sistemáticamente vulnerabilidades como reentrancia, dependencia del orden de transacciones y dependencia del timestamp. Trabajo seminal en seguridad de contratos inteligentes.

---

*Volver al [índice del módulo](./README.md) · Consultar el [glosario](./glosario.md)*
