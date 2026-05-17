"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useChainId } from "wagmi";
import { supportedChainNames } from "@web3-wallet-nft-tools/sdk";

export function WalletPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });

  return (
    <section className="card">
      <h2>Wallet</h2>
      <p className="muted">Connect through RainbowKit. This app never asks for seed phrases or private keys.</p>
      <ConnectButton />
      <dl style={{ display: "grid", gap: "0.65rem", marginTop: "1.25rem" }}>
        <div>
          <dt className="muted">Status</dt>
          <dd>{isConnected ? "Connected" : "Not connected"}</dd>
        </div>
        <div>
          <dt className="muted">Address</dt>
          <dd style={{ overflowWrap: "anywhere" }}>{address ?? "—"}</dd>
        </div>
        <div>
          <dt className="muted">Chain</dt>
          <dd>{supportedChainNames[chainId] ?? `Unsupported chain ${chainId}`}</dd>
        </div>
        <div>
          <dt className="muted">Balance</dt>
          <dd>{balance ? `${balance.formatted} ${balance.symbol}` : "—"}</dd>
        </div>
      </dl>
    </section>
  );
}
