import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { NeuralCoreApplicationModel } from "../../../../application/model/neural-core-application-model.types";
import type { NeuralCoreApplicationRuntime } from "../../../../application/runtime/neural-core-application-runtime.types";
import type { NeuralCoreNarrativeState } from "../../../../domain/narrative/neural-core-narrative.types";
import type { NeuralCoreInteractionMode } from "../../../../domain/inspection/neural-core-inspection.types";
import type { NeuralCoreResolvedRendererConfig } from "../../../../visualization/config/neural-core-renderer-config.resolver";
import type { NeuralCorePresentationBinding } from "../../presentation/neural-core-presentation-binding.types";
import type { NeuralCoreRuntimeBinding } from "../../runtime/neural-core-runtime-binding.context";
import type { NeuralCoreInspectionBinding } from "./neural-core-inspection-binding.context";

export interface NeuralCoreRendererInteractionState {
  readonly mode: NeuralCoreInteractionMode;
  readonly selectedClusterId?: string;
  readonly paused: boolean;
}

export interface NeuralCoreRendererInteractionController {
  readonly state: NeuralCoreRendererInteractionState;
  readonly requestMode: (mode: NeuralCoreInteractionMode) => void;
  readonly requestPaused: (paused: boolean) => void;
  readonly requestSelection: (
    clusterId: string | undefined,
    reason?: "user-action" | "reset",
  ) => void;
}

export interface NeuralCoreRendererProps {
  readonly config: NeuralCoreResolvedRendererConfig;
  readonly interaction: NeuralCoreRendererInteractionController;
  readonly inspectionBinding?: NeuralCoreInspectionBinding;
  readonly model: NeuralCoreApplicationModel;
  readonly onReady?: () => void;
  readonly onNarrativeStateChange?: (state: NeuralCoreNarrativeState) => void;
  readonly onRuntimeCompleted?: () => void;
  readonly onRuntimeEventObserved?: (eventId: string) => void;
  readonly onRuntimeStarted?: () => void;
  readonly presentationBinding?: NeuralCorePresentationBinding;
  readonly runtime?: NeuralCoreApplicationRuntime;
  readonly runtimeBinding?: NeuralCoreRuntimeBinding;
}

export interface NeuralCoreRendererViewState {
  readonly cameraResetRevision: number;
  readonly handleKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
}
