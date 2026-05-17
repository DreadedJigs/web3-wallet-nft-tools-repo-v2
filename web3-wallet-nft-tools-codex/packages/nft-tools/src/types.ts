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

export type TraitLayer = {
  trait_type: string;
  values: Array<string | number>;
};

export type TraitConfig = {
  collectionName: string;
  description: string;
  imageBaseUri: string;
  externalUrlBase?: string;
  layers: TraitLayer[];
};

export type GeneratedMetadata = NftMetadata & {
  dna: string;
};
