// HeaderPlaceholder.tsx
// ──────────────────────────────────────────────────────────────────────────────
// SLOT: Antigravity Header
// Este componente será substituído pelo Header do Antigravity quando
// a integração do ecossistema estiver completa.
//
// Para integrar: importe o componente Header do Antigravity e substitua
// o conteúdo abaixo. Não é necessário alterar nenhum outro arquivo.
// ──────────────────────────────────────────────────────────────────────────────

export function HeaderPlaceholder() {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 1.5rem',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-secondary)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.1rem',
          color: 'var(--accent-sage)',
          letterSpacing: '0.05em',
        }}
      >
        A Guilda
      </span>

      {/* TODO: Substituir por <AntigravityHeader /> */}
      <span
        style={{
          fontSize: '0.7rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          border: '1px dashed var(--border-subtle)',
          padding: '2px 8px',
          borderRadius: '3px',
        }}
      >
        header · antigravity pending
      </span>
    </header>
  );
}
