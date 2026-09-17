import type { NeuralCoreState } from "../../domain/contract/neural-core-contract.types";
import { createNeuralCoreTopologyFromState } from "../../domain/topology/neural-core-topology.mapper";
import type { NeuralCoreTopologyCompatibilityData } from "../../domain/topology/neural-core-topology-compatibility.types";
import type { NeuralCorePathway } from "../../domain/topology/neural-core-topology.types";
import type { NeuralCoreApplicationModel } from "./neural-core-application-model.types";

export interface CreateNeuralCoreApplicationModelParams {
  readonly modelId: string;
  readonly state: NeuralCoreState;
  readonly compatibility?: NeuralCoreTopologyCompatibilityData;
  readonly pathways: readonly NeuralCorePathway[];
  readonly internalClusterIdByEntityId: ReadonlyMap<string, string>;
  readonly publicClusterIdByInternalClusterId: ReadonlyMap<string, string>;
}

export const createNeuralCoreApplicationModel = ({
  modelId,
  state,
  compatibility,
  pathways,
  internalClusterIdByEntityId,
  publicClusterIdByInternalClusterId,
}: CreateNeuralCoreApplicationModelParams): NeuralCoreApplicationModel => {
  const topology = createNeuralCoreTopologyFromState(state, {
    clusterDataById: compatibility?.clusterDataById ?? new Map(),
    pathways: [...pathways],
  });
  state.topology = topology;

  return Object.freeze({
    modelId,
    state,
    topology,
    internalClusterIdByEntityId,
    publicClusterIdByInternalClusterId,
  });
};
