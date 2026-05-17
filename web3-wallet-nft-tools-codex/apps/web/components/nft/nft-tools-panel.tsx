export function NftToolsPanel() {
  return (
    <section className="card">
      <h2>NFT tools</h2>
      <p className="muted">The included TypeScript package can generate and validate metadata before upload.</p>
      <ol style={{ lineHeight: 1.8 }}>
        <li>Define traits in <code>packages/nft-tools/examples/traits.json</code>.</li>
        <li>Run <code>pnpm nft:generate</code>.</li>
        <li>Run <code>pnpm nft:validate</code>.</li>
        <li>Pin images + metadata only after validation.</li>
      </ol>
    </section>
  );
}
