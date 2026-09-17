import type { NeuralCoreState } from "../../domain/contract/neural-core-contract.types";
import type { NeuralCoreTopology } from "../../domain/topology/neural-core-topology.types";

export interface NeuralCoreApplicationModel {
  readonly modelId: string;
  readonly state: NeuralCoreState;
  readonly topology: NeuralCoreTopology;
  readonly internalClusterIdByEntityId: ReadonlyMap<string, string>;
  readonly publicClusterIdByInternalClusterId: ReadonlyMap<string, string>;
}
