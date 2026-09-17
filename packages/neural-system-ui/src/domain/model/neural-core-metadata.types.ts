export type NeuralCoreMetadataPrimitive = string | number | boolean | null;

export type NeuralCoreMetadataValue =
  | NeuralCoreMetadataPrimitive
  | NeuralCoreMetadataValue[]
  | { [key: string]: NeuralCoreMetadataValue };

export type NeuralCoreMetadata = Record<string, NeuralCoreMetadataValue>;
