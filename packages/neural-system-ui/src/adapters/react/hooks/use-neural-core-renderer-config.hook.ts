import { useMemo } from "react";

import {
  adaptNeuralCoreConfig,
  type NeuralCoreConfigAdapterResult,
  type NeuralCoreRendererConfigInput,
} from "../../../visualization/config/neural-core-renderer-config.mapper";

export const useNeuralCoreRendererConfig = (
  config: NeuralCoreRendererConfigInput,
  reducedMotion: boolean,
): NeuralCoreConfigAdapterResult => useMemo(
  () => adaptNeuralCoreConfig(config, reducedMotion),
  [config, reducedMotion],
);
