import { WalletPanel } from "../components/wallet/wallet-panel";
import { NftToolsPanel } from "../components/nft/nft-tools-panel";
import { ContractReadPanel } from "../components/contracts/contract-read-panel";

export default function Home() {
  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <section style={{ marginBottom: "2rem" }}>
        <p className="badge">Codex-ready Web3 starter</p>
        <h1 style={{ fontSize: "clamp(2.25rem, 6vw, 5rem)", lineHeight: 1, margin: "1rem 0" }}>
          Wallet + NFT tools without unsafe shortcuts.
        </h1>
        <p className="muted" style={{ maxWidth: "760px", fontSize: "1.1rem" }}>
          Connect a wallet, read NFT contracts, generate collection metadata, and build mint tooling from a testnet-first base.
        </p>
      </section>

      <div className="grid">
        <WalletPanel />
        <ContractReadPanel />
        <NftToolsPanel />
      </div>
    </main>
  );
}
