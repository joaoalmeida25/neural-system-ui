import type { RefObject } from "react";

import type { NeuralCoreOperationalExecution } from "../../../domain/operational-runtime/types/neural-core-operational-execution.types";
import type { NeuralCoreOperationalEvent } from "../../../domain/operational-runtime/types/neural-core-operational-event.types";
import type { NeuralCoreOperationalScenario } from "../../../domain/operational-runtime/types/neural-core-operational-scenario.types";
import type {
  NeuralCoreOperationalRuntimeConfigInput,
  NeuralCoreOperationalRuntimeController,
  NeuralCoreOperationalRouteIndex,
  NeuralCoreOperationalRuntimeValueRef,
} from "../../../domain/operational-runtime/runtime/neural-core-operational-runtime.types";
import type {
  NeuralCoreOperationalPresentationEvent,
  NeuralCoreOperationalPresentationTimeline,
} from "../../../domain/operational-runtime/runtime/neural-core-operational-presentation.types";

export interface NeuralCoreOperationalRuntimeProgressRefs {
  progressBarRef: RefObject<HTMLDivElement | null>;
  progressLabelRef: RefObject<HTMLOutputElement | null>;
  elapsedMsRef: NeuralCoreOperationalRuntimeValueRef;
  progressRef: NeuralCoreOperationalRuntimeValueRef;
  activeRouteProgressRef: NeuralCoreOperationalRuntimeValueRef;
}

export interface UseNeuralCoreOperationalRuntimeParams {
  execution: NeuralCoreOperationalExecution;
  scenario: NeuralCoreOperationalScenario;
  config?: NeuralCoreOperationalRuntimeConfigInput;
  suspended?: boolean;
  resetKey?: string;
}

export interface UseNeuralCoreOperationalRuntimeResult
  extends NeuralCoreOperationalRuntimeController,
  NeuralCoreOperationalRuntimeProgressRefs {
  autoFollowInPresentation: boolean;
  activeRouteEvent?: NeuralCoreOperationalEvent;
  activeRoutePresentationEvent?: NeuralCoreOperationalPresentationEvent;
  activeRoute?: NeuralCoreOperationalRouteIndex["route"];
  presentationTimeline: NeuralCoreOperationalPresentationTimeline;
}
