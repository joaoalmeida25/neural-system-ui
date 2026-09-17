import type { RefObject } from "react";
import type {
  BufferAttribute,
  FogExp2,
  Group,
  ShaderMaterial,
} from "three";
import { Fog } from "three";

import type {
  NeuralCoreInspectionConfig,
  NeuralCoreInspectionState,
} from "../../../../../domain/inspection/neural-core-inspection.types";
import type { NeuralCoreNarrativeState } from "../../../../../domain/narrative/neural-core-narrative.types";
import type {
  NeuralCoreClusterGrammarBufferState,
  NeuralCoreClusterGrammarState,
} from "../../../../../visualization/cluster-grammar/neural-core-cluster-grammar.types";
import type {
  NeuralCoreSceneDirectionConfig,
  NeuralCoreSceneDirectionState,
} from "../../../../../visualization/direction/neural-core-scene-direction.types";
import {
  dampNeuralCoreSceneDirectionValue,
} from "../../../../../visualization/direction/neural-core-scene-direction.utils";
import type {
  NeuralCoreSemanticFocusLensState,
} from "../../../../../visualization/focus-lens/neural-core-semantic-focus-lens.types";
import type { NeuralCoreGraph } from "../../../../../visualization/graph/neural-core-graph.types";
import type {
  NeuralCoreCameraRenderingProfile,
} from "../../../../../visualization/inspection/neural-core-camera-rendering.types";
import type {
  NeuralCoreElementVisualComposition,
} from "../../../../../visualization/inspection/neural-core-element-visual-composition.types";
import {
  writeNeuralCoreElementVisualComposition,
} from "../../../../../visualization/inspection/neural-core-element-visual-composition.utils";
import type {
  NeuralCoreInspectionVisibilityState,
} from "../../../../../visualization/inspection/neural-core-inspection-visibility.types";
import {
  NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG,
} from "../../../../../visualization/propagation/neural-core-operational-protagonist-marker.constants";
import type {
  NeuralCorePropagationBufferState,
} from "../../../../../visualization/propagation/neural-core-propagation-buffer.types";
import type {
  NeuralCoreSemanticBufferState,
} from "../../../../../visualization/semantic/neural-core-semantic-buffer.types";
import type {
  NeuralCoreSemanticVisualizationConfig,
} from "../../../../../visualization/semantic/neural-core-semantic-visual.types";
import type {
  NeuralCoreSceneMotionRuntime,
} from "./neural-core-scene-camera.frame";
import {
  animatePulseGroup,
  animateRingGroup,
  updateAmbientPulseAttributes,
  updateDecorativeGroupOpacity,
  updateParticlePositions,
} from "../neural-core-scene-frame.utils";

const PRESENTATION_FOG_NEAR = 3.9;
const PRESENTATION_FOG_FAR = 6.8;

export interface NeuralCoreSceneEnvironmentFrameContext {
  ambientPulseMaterialRef: RefObject<ShaderMaterial | null>;
  baseRef: RefObject<Group | null>;
  cameraProfile: NeuralCoreCameraRenderingProfile;
  clusterGrammar: NeuralCoreClusterGrammarState;
  clusterGrammarBuffers: NeuralCoreClusterGrammarBufferState;
  coreRef: RefObject<Group | null>;
  focusLensRuntime: NeuralCoreSemanticFocusLensState;
  graph: NeuralCoreGraph;
  hubRef: RefObject<Group | null>;
  inspectionConfig: NeuralCoreInspectionConfig;
  inspectionState: NeuralCoreInspectionState;
  inspectionVisibility: NeuralCoreInspectionVisibilityState;
  motion: NeuralCoreSceneMotionRuntime;
  networkRef: RefObject<Group | null>;
  particleMaterialRef: RefObject<ShaderMaterial | null>;
  particlePositionRef: RefObject<BufferAttribute | null>;
  propagationBuffers: NeuralCorePropagationBufferState;
  pulseColorRef: RefObject<BufferAttribute | null>;
  pulsePositionRef: RefObject<BufferAttribute | null>;
  ringRef: RefObject<Group | null>;
  sceneDirectionConfig: NeuralCoreSceneDirectionConfig;
  semanticBuffers: NeuralCoreSemanticBufferState;
  semanticVisualizationConfig: NeuralCoreSemanticVisualizationConfig;
  visualComposition: NeuralCoreElementVisualComposition;
}

export const updateNeuralCoreSceneEnvironmentFrame = (
  context: NeuralCoreSceneEnvironmentFrameContext,
  effectiveDirectionState: NeuralCoreSceneDirectionState,
  narrativeState: NeuralCoreNarrativeState,
  operationalTransmissionActive: boolean,
  safeDeltaSeconds: number,
): void => {
  const environmentContextAmount = context.sceneDirectionConfig.focus.maximumContextDim <= 0
    ? 0
    : Math.min(
      1,
      Math.max(
        0,
        effectiveDirectionState.contextDim
          / context.sceneDirectionConfig.focus.maximumContextDim,
      ),
    );
  const narrativeEnvironmentOpacity = narrativeState.isActive
    ? 1 - narrativeState.contextDim * 0.56
    : 1;
  const environmentOpacity = effectiveDirectionState.isOverview
    ? 1
    : Math.max(
      context.sceneDirectionConfig.focus.minimumPeripheralOpacity,
      effectiveDirectionState.peripheralOpacity,
      1 - environmentContextAmount
        * (1 - context.sceneDirectionConfig.focus.contextParticleOpacity),
    );
  const ambientComposition = writeNeuralCoreElementVisualComposition(
    context.visualComposition,
    "ambient",
    "ambient",
    environmentOpacity * narrativeEnvironmentOpacity,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    context.cameraProfile,
    context.inspectionVisibility,
  );
  const semanticLensActive = context.clusterGrammar.enabled
    && context.focusLensRuntime.enabled;
  const ambientCompositionOpacity = semanticLensActive
    ? Math.max(
      ambientComposition.opacity,
      context.focusLensRuntime.brainContext.ambientOpacity,
    )
    : ambientComposition.opacity;
  if (context.particleMaterialRef.current) {
    const opacityUniform = context.particleMaterialRef.current.uniforms.uOpacity;
    const ambientOpacity = context.graph.particleField.opacity
      * ambientCompositionOpacity;
    opacityUniform.value = dampNeuralCoreSceneDirectionValue(
      Number(opacityUniform.value),
      ambientOpacity,
      context.semanticVisualizationConfig.transition.releaseResponse,
      safeDeltaSeconds,
    );
  }
  if (context.ambientPulseMaterialRef.current) {
    const opacityUniform = context.ambientPulseMaterialRef.current.uniforms.uOpacity;
    const ambientPulseOpacity = context.graph.pulseField.opacity
      * ambientCompositionOpacity
      * (
        operationalTransmissionActive
          ? NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG
            .backgroundAmbientPulseMultiplier
          : 1
      );
    opacityUniform.value = dampNeuralCoreSceneDirectionValue(
      Number(opacityUniform.value),
      ambientPulseOpacity,
      operationalTransmissionActive
        ? context.semanticVisualizationConfig.transition.activationResponse
        : context.semanticVisualizationConfig.transition.releaseResponse,
      safeDeltaSeconds,
    );
  }

  const decorativeComposition = writeNeuralCoreElementVisualComposition(
    context.visualComposition,
    "decorative",
    "decorative",
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    context.cameraProfile,
    context.inspectionVisibility,
  );
  const decorativeOpacity = semanticLensActive
    ? Math.max(
      decorativeComposition.opacity,
      0.26 + context.focusLensRuntime.brainShellWeight * 0.12,
    )
    : decorativeComposition.opacity;
  updateDecorativeGroupOpacity(
    context.ringRef.current,
    decorativeOpacity,
    context.semanticVisualizationConfig.transition.releaseResponse,
    safeDeltaSeconds,
  );
  updateDecorativeGroupOpacity(
    context.baseRef.current,
    decorativeOpacity,
    context.semanticVisualizationConfig.transition.releaseResponse,
    safeDeltaSeconds,
  );
};

export const updateNeuralCoreSceneAmbientObjectsFrame = (
  context: NeuralCoreSceneEnvironmentFrameContext,
  elapsedTime: number,
): void => {
  if (context.baseRef.current) {
    context.baseRef.current.rotation.y = elapsedTime * 0.035;
    context.baseRef.current.scale.setScalar(
      1 + Math.sin(elapsedTime * 0.72) * 0.014
        * context.motion.smoothedBreathingMultiplier,
    );
  }
  if (context.ringRef.current) {
    animateRingGroup(context.ringRef.current, elapsedTime);
  }
  if (context.hubRef.current) {
    animatePulseGroup(
      context.hubRef.current,
      elapsedTime,
      0.058,
      context.propagationBuffers.nodeActivationById,
      context.semanticBuffers.nodeBufferIndexById,
      context.semanticBuffers.nodeField,
      context.semanticVisualizationConfig.failure.maximumNodeFragmentationDistance,
      context.semanticVisualizationConfig.failure.nodeDecayThresholdSpread,
      context.clusterGrammar.enabled
        ? context.clusterGrammarBuffers.nodeOpacitiesByGraphIndex
        : undefined,
    );
  }
  if (context.coreRef.current) {
    animatePulseGroup(
      context.coreRef.current,
      elapsedTime,
      0.06,
      context.propagationBuffers.nodeActivationById,
      context.semanticBuffers.nodeBufferIndexById,
      context.semanticBuffers.nodeField,
      context.semanticVisualizationConfig.failure.maximumNodeFragmentationDistance,
      context.semanticVisualizationConfig.failure.nodeDecayThresholdSpread,
      context.clusterGrammar.enabled
        ? context.clusterGrammarBuffers.nodeOpacitiesByGraphIndex
        : undefined,
    );
  }
  if (context.particlePositionRef.current) {
    updateParticlePositions(
      context.particlePositionRef.current,
      context.graph.particles,
      context.motion.particleTime,
    );
  }
  if (context.pulsePositionRef.current && context.pulseColorRef.current) {
    updateAmbientPulseAttributes(
      context.pulsePositionRef.current,
      context.pulseColorRef.current,
      context.graph.pulses,
      elapsedTime,
    );
  }
};

export const updateNeuralCoreSceneFogFrame = (
  context: NeuralCoreSceneEnvironmentFrameContext,
  networkFogDepth: number,
  relevantCameraDistance: number,
  safeDeltaSeconds: number,
  sceneFog: Fog | FogExp2 | null,
): void => {
  if (sceneFog instanceof Fog) {
    const dynamicInspectionFog = context.inspectionState.mode === "inspection"
      && context.inspectionConfig.cameraRendering.enabled
      && (
        context.inspectionConfig.cameraRendering.fog.dynamicEnvironmentFog
        || context.inspectionConfig.cameraRendering.fog.preserveFunctionalTopology
      );
    const functionalFogRelease = dynamicInspectionFog
      ? 1 - context.cameraProfile.fogInfluence
      : 0;
    const targetFogFar = dynamicInspectionFog
      ? Math.max(
        PRESENTATION_FOG_FAR,
        relevantCameraDistance
          + networkFogDepth * (context.networkRef.current?.scale.x ?? 1)
          + context.inspectionConfig.cameraRendering.fog.farMargin * functionalFogRelease,
      )
      : PRESENTATION_FOG_FAR;
    const targetFogNear = dynamicInspectionFog
      ? PRESENTATION_FOG_NEAR * (1 - functionalFogRelease)
        + (
          relevantCameraDistance
            + networkFogDepth * (context.networkRef.current?.scale.x ?? 1)
            + context.inspectionConfig.cameraRendering.fog.farMargin * 0.25
        ) * functionalFogRelease
      : PRESENTATION_FOG_NEAR;
    sceneFog.near = dampNeuralCoreSceneDirectionValue(
      sceneFog.near,
      targetFogNear,
      context.inspectionConfig.cameraRendering.transitionDamping,
      safeDeltaSeconds,
    );
    sceneFog.far = dampNeuralCoreSceneDirectionValue(
      sceneFog.far,
      targetFogFar,
      context.inspectionConfig.cameraRendering.transitionDamping,
      safeDeltaSeconds,
    );
  }
};
