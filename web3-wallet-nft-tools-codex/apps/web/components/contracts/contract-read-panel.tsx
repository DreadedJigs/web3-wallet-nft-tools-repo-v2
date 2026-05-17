"use client";

import { useMemo, useState } from "react";
import { isAddress } from "viem";
import { useReadContract } from "wagmi";
import { erc721MinimalAbi } from "@web3-wallet-nft-tools/sdk";

export function ContractReadPanel() {
  const [contractAddress, setContractAddress] = useState("");
  const safeAddress = useMemo(() => (isAddress(contractAddress) ? contractAddress : undefined), [contractAddress]);

  const { data: name, isLoading: nameLoading } = useReadContract({
    abi: erc721MinimalAbi,
    address: safeAddress,
    functionName: "name",
    query: { enabled: Boolean(safeAddress) },
  });

  const { data: symbol, isLoading: symbolLoading } = useReadContract({
    abi: erc721MinimalAbi,
    address: safeAddress,
    functionName: "symbol",
    query: { enabled: Boolean(safeAddress) },
  });

  return (
    <section className="card">
      <h2>NFT contract read</h2>
      <p className="muted">Paste an ERC-721 contract address and read safe public fields first.</p>
      <label htmlFor="contract-address" className="muted">
        Contract address
      </label>
      <input
        id="contract-address"
        value={contractAddress}
        onChange={(event) => setContractAddress(event.target.value.trim())}
        placeholder="0x..."
        style={{
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.8rem",
          borderRadius: "0.75rem",
          border: "1px solid var(--border)",
          background: "#090914",
          color: "var(--foreground)",
        }}
      />
      <dl style={{ display: "grid", gap: "0.65rem", marginTop: "1.25rem" }}>
        <div>
          <dt className="muted">Valid address</dt>
          <dd>{safeAddress ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="muted">Name</dt>
          <dd>{nameLoading ? "Loading..." : String(name ?? "—")}</dd>
        </div>
        <div>
          <dt className="muted">Symbol</dt>
          <dd>{symbolLoading ? "Loading..." : String(symbol ?? "—")}</dd>
        </div>
      </dl>
    </section>
  );
}
