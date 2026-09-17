import { useMemo } from "react";

import {
  resolveNeuralCoreRendererConfig,
  type NeuralCoreResolvedRendererConfig,
  type NeuralCoreRendererConfigInput,
} from "../../../visualization/config/neural-core-renderer-config.resolver";

export const useNeuralCoreRendererConfig = (
  config: NeuralCoreRendererConfigInput,
  reducedMotion: boolean,
): NeuralCoreResolvedRendererConfig => useMemo(
  () => resolveNeuralCoreRendererConfig(config, reducedMotion),
  [config, reducedMotion],
);
