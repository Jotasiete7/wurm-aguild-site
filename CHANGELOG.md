# Changelog

All notable changes to this project will be documented in this file.

## [v2.0 Beta] - Guild Utilities Suite & Craft Pulse

### Added
- **Guild Utilities Suite:** Uma nova área central dedicada a abrigar microferramentas para uso do dia a dia.
- **Craft Pulse:** Primeira ferramenta da suite. Um timer minimalista e operacional criado especificamente para cobrir "rare windows" de crafting.
  - Sincronização ultra precisa de tela usando `requestAnimationFrame`.
  - Botão de "Open Focus Timer" abrindo janela sem bordas/chromeless, ideal para uso *Always on Top* junto a outros utilitários.
  - Alertas dinâmicos com *Web Audio API* dispensando o uso de arquivos estáticos.
  - Oito tipos de opções de som: Beep, Chime, Pulse, Subtle, Siren, Laser, Airhorn e Spring.
  - Persistência nativa de configurações do usuário via `localStorage`.
- **Integração na HomePage:**
  - Inserção da **Guild Utilities Suite** no Bento Grid da Home Page.
  - Remanejamento fluído do widget "Auctions" para a *Secondary Tools Row*.

### Changed
- Refatoração de estados no `useCraftPulse` substituindo repetições por referências otimizadas (`useRef`) para resolver bug de instabilidade de loops no Strict Mode do React.
- **Configurações Default:** Timer inicializando em modo `Both` (Visual + Som) e `soundVolume` em 10.

### Fixed
- Pequenos lints do TypeScript que bloqueavam builds de produção (variáveis não utilizadas importadas do `react`).
