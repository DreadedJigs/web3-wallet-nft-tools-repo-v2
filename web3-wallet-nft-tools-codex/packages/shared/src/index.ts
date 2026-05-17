export type NftAttribute = {
  trait_type: string;
  value: string | number;
};

export type NftMetadata = {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: NftAttribute[];
};

export type ChainScopedAddress = {
  chainId: number;
  address: `0x${string}`;
  label: string;
};
