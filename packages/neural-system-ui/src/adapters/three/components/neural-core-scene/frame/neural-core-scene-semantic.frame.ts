import type { RefObject } from "react";
import type {
  BufferAttribute,
  BufferGeometry,
  Group,
  Points,
  ShaderMaterial,
} from "three";

import type {
  NeuralCoreChoreography,
  NeuralCoreChoreographyEvaluation,
} from "../../../../../domain/choreography/neural-core-choreography.types";
import type { NeuralCoreNarrativeState } from "../../../../../domain/narrative/neural-core-narrative.types";
import type {
  NeuralCorePropagationConfig,
} from "../../../../../domain/propagation/neural-core-propagation.types";
import type {
  NeuralCoreClusterGrammarBufferState,
  NeuralCoreClusterGrammarRuntime,
  NeuralCoreClusterGrammarState,
} from "../../../../../visualization/cluster-grammar/neural-core-cluster-grammar.types";
import type {
  NeuralCoreOperationalRouteVisualChannel,
} from "../../../../../visualization/cluster-grammar/neural-core-operational-route-visual-channel.types";
import type {
  NeuralCoreNarrativeVisualState,
} from "../../../../../visualization/narrative/neural-core-narrative-visual.types";
import type {
  NeuralCoreSceneDirectionConfig,
  NeuralCoreSceneDirectionState,
} from "../../../../../visualization/direction/neural-core-scene-direction.types";
import type {
  NeuralCoreSemanticFocusLensState,
} from "../../../../../visualization/focus-lens/neural-core-semantic-focus-lens.types";
import type { NeuralCoreGraph } from "../../../../../visualization/graph/neural-core-graph.types";
import type {
  NeuralCoreCameraRenderingProfile,
} from "../../../../../visualization/inspection/neural-core-camera-rendering.types";
import type {
  NeuralCoreInspectionFocusState,
} from "../../../../../visualization/inspection/neural-core-inspection-focus.types";
import type {
  NeuralCoreInspectionVisibilityState,
} from "../../../../../visualization/inspection/neural-core-inspection-visibility.types";
import type {
  NeuralCoreOperationalVisualOverlay,
} from "../../../../../visualization/operational-runtime/mappers/neural-core-operational-visual-state.mapper";
import type {
  NeuralCorePropagationBufferState,
} from "../../../../../visualization/propagation/neural-core-propagation-buffer.types";
import {
  updateNeuralCorePropagationBuffers,
} from "../../../../../visualization/propagation/neural-core-propagation-buffer.utils";
import type {
  NeuralCorePropagationVisualState,
} from "../../../../../visualization/propagation/neural-core-propagation-visual.types";
import type {
  NeuralCoreSemanticBufferState,
} from "../../../../../visualization/semantic/neural-core-semantic-buffer.types";
import {
  updateNeuralCoreSemanticBuffers,
} from "../../../../../visualization/semantic/neural-core-semantic-buffer.utils";
import { EMPTY_NEURAL_CORE_SEMANTIC_VISUAL_STATE } from "../../../../../visualization/semantic/neural-core-semantic-visual.constants";
import {
  updateNeuralCoreSemanticVisualRuntime,
  type NeuralCoreSemanticVisualRuntime,
} from "../../../../../visualization/semantic/neural-core-semantic-visual.mapper";
import type {
  NeuralCoreSemanticVisualState,
  NeuralCoreSemanticVisualizationConfig,
} from "../../../../../visualization/semantic/neural-core-semantic-visual.types";
import type {
  NeuralCoreTopologyVisualState,
} from "../../../../../visualization/topology/neural-core-topology-visual.types";
import {
  markAttributeForUpdate,
  markConnectionAttributesForUpdate,
  updateClusterTerritoryVisuals,
  updatePointCloudMaterials,
} from "../neural-core-scene-frame.utils";

export interface NeuralCoreSceneChoreographyLoopRuntime {
  choreographyId?: string;
  timelineSeconds: number;
}

export interface NeuralCoreSceneNarrativeFrameContext {
  choreography?: NeuralCoreChoreography;
  choreographyLoopRuntime: NeuralCoreSceneChoreographyLoopRuntime;
  narrativePhaseKeyRef: RefObject<string>;
  onNarrativeStateChange: (state: NeuralCoreNarrativeState) => void;
  operationalVisualOverlay?: NeuralCoreOperationalVisualOverlay;
  resetPropagation: () => void;
  semanticVisualRuntime?: NeuralCoreSemanticVisualRuntime;
  semanticVisualizationConfig: NeuralCoreSemanticVisualizationConfig;
}

export interface NeuralCoreScenePropagationFrameContext {
  clusterActivationColorRef: RefObject<BufferAttribute | null>;
  clusterActivationGeometryRef: RefObject<BufferGeometry | null>;
  clusterActivationOpacityRef: RefObject<BufferAttribute | null>;
  clusterActivationPositionRef: RefObject<BufferAttribute | null>;
  clusterActivationSizeRef: RefObject<BufferAttribute | null>;
  clusterGrammar: NeuralCoreClusterGrammarState;
  clusterGrammarBuffers: NeuralCoreClusterGrammarBufferState;
  clusterGrammarRuntime: NeuralCoreClusterGrammarRuntime;
  clusterTerritoryRefs: readonly RefObject<Group | null>[];
  focusLensRuntime: NeuralCoreSemanticFocusLensState;
  inspectionFocus: NeuralCoreInspectionFocusState;
  inspectionVisibility: NeuralCoreInspectionVisibilityState;
  operationalProtagonistMarkerColorRef: RefObject<BufferAttribute | null>;
  operationalProtagonistMarkerGeometryRef: RefObject<BufferGeometry | null>;
  operationalProtagonistMarkerOpacityRef: RefObject<BufferAttribute | null>;
  operationalProtagonistMarkerPositionRef: RefObject<BufferAttribute | null>;
  operationalProtagonistMarkerSizeRef: RefObject<BufferAttribute | null>;
  operationalProtagonistMarkerTangentRef: RefObject<BufferAttribute | null>;
  propagationBuffers: NeuralCorePropagationBufferState;
  propagationConfig: NeuralCorePropagationConfig;
  propagationPulseColorRef: RefObject<BufferAttribute | null>;
  propagationPulseGeometryRef: RefObject<BufferGeometry | null>;
  propagationPulseOpacityRef: RefObject<BufferAttribute | null>;
  propagationPulsePositionRef: RefObject<BufferAttribute | null>;
  propagationPulseSizeRef: RefObject<BufferAttribute | null>;
  sceneDirectionConfig: NeuralCoreSceneDirectionConfig;
  topologyVisualState: NeuralCoreTopologyVisualState;
}

export interface NeuralCoreSceneSemanticBufferFrameContext {
  cameraProfile: NeuralCoreCameraRenderingProfile;
  clusterGrammar: NeuralCoreClusterGrammarState;
  connectionRef: RefObject<Group | null>;
  focusLensRuntime: NeuralCoreSemanticFocusLensState;
  graph: NeuralCoreGraph;
  inspectionVisibility: NeuralCoreInspectionVisibilityState;
  nodeCloudRef: RefObject<Group | null>;
  propagationConfig: NeuralCorePropagationConfig;
  sceneDirectionConfig: NeuralCoreSceneDirectionConfig;
  semanticBuffers: NeuralCoreSemanticBufferState;
  semanticRibbonColorRef: RefObject<BufferAttribute | null>;
  semanticRibbonFragmentationRef: RefObject<BufferAttribute | null>;
  semanticRibbonInstabilityRef: RefObject<BufferAttribute | null>;
  semanticRibbonInterruptionRef: RefObject<BufferAttribute | null>;
  semanticRibbonMaterialRef: RefObject<ShaderMaterial | null>;
  semanticRibbonOpacityRef: RefObject<BufferAttribute | null>;
  semanticRibbonPulseFrequencyRef: RefObject<BufferAttribute | null>;
  semanticRibbonPulseIntensityRef: RefObject<BufferAttribute | null>;
  semanticRibbonThicknessRef: RefObject<BufferAttribute | null>;
  semanticVisualizationConfig: NeuralCoreSemanticVisualizationConfig;
}

export const advanceNeuralCoreSceneNarrativeFrame = (
  context: NeuralCoreSceneNarrativeFrameContext,
  choreographyEvaluation: NeuralCoreChoreographyEvaluation,
  narrativeState: NeuralCoreNarrativeState,
  propagationVisualState: NeuralCorePropagationVisualState,
): NeuralCoreSemanticVisualState => {
  const narrativePhaseKey = `${narrativeState.narrativeId ?? "none"}:${
    narrativeState.activePhaseId ?? "idle"
  }:${narrativeState.isActive ? "active" : "inactive"}`;
  if (context.narrativePhaseKeyRef.current !== narrativePhaseKey) {
    context.narrativePhaseKeyRef.current = narrativePhaseKey;
    context.onNarrativeStateChange(narrativeState);
  }
  const choreographyLoopRuntime = context.choreographyLoopRuntime;
  const choreographyLoops = context.choreography?.loop
    ?? context.semanticVisualizationConfig.choreography.loopDemoChoreographies;
  if (
    choreographyLoops
    && choreographyLoopRuntime.choreographyId === choreographyEvaluation.choreographyId
    && choreographyEvaluation.timelineSeconds + 0.0001
      < choreographyLoopRuntime.timelineSeconds
  ) {
    context.resetPropagation();
  }
  choreographyLoopRuntime.choreographyId = choreographyEvaluation.choreographyId;
  choreographyLoopRuntime.timelineSeconds = choreographyEvaluation.timelineSeconds;
  return context.semanticVisualRuntime
    ? updateNeuralCoreSemanticVisualRuntime(
      context.semanticVisualRuntime,
      propagationVisualState,
      choreographyEvaluation,
      context.semanticVisualizationConfig,
      context.operationalVisualOverlay,
    )
    : EMPTY_NEURAL_CORE_SEMANTIC_VISUAL_STATE;
};

export const updateNeuralCoreScenePropagationFrame = (
  context: NeuralCoreScenePropagationFrameContext,
  cameraProfile: NeuralCoreCameraRenderingProfile,
  effectiveDirectionState: NeuralCoreSceneDirectionState,
  operationalRouteVisualChannel: NeuralCoreOperationalRouteVisualChannel | undefined,
  operationalTransmissionId: string | undefined,
  propagationElapsedTime: number,
  propagationVisualState: NeuralCorePropagationVisualState,
): void => {
  const {
    clusterPointCount,
    operationalProtagonistMarkerCount,
    pulsePointCount,
  } = updateNeuralCorePropagationBuffers(
    context.propagationBuffers,
    propagationVisualState,
    context.topologyVisualState,
    context.propagationConfig.pulse.trailSampleCount,
    effectiveDirectionState,
    context.sceneDirectionConfig,
    context.propagationConfig,
    cameraProfile,
    context.inspectionVisibility,
    operationalRouteVisualChannel,
    operationalTransmissionId,
  );
  if (context.clusterGrammar.enabled) {
    updateClusterTerritoryVisuals(
      context.clusterTerritoryRefs,
      context.clusterGrammarRuntime.clusterStates,
      context.propagationBuffers.operationalEndpointReactionState,
      propagationElapsedTime,
    );
  }
  if (context.clusterGrammar.enabled) {
    const detailedPulseWeight = context.focusLensRuntime.enabled
      ? context.focusLensRuntime.realActivityWeight
      : context.inspectionFocus.selectedClusterId
        ? context.inspectionVisibility.mesoWeight * 0.42
          + context.inspectionVisibility.microWeight
        : 0.035;
    for (let index = 0; index < pulsePointCount; index += 1) {
      context.propagationBuffers.pulseField.opacities[index] *= detailedPulseWeight;
    }
    if (context.focusLensRuntime.enabled) {
      for (let index = 0; index < clusterPointCount; index += 1) {
        context.propagationBuffers.clusterField.opacities[index] *=
          context.focusLensRuntime.aggregatedActivityWeight;
      }
    }
  }
  context.propagationPulseGeometryRef.current?.setDrawRange(0, pulsePointCount);
  context.operationalProtagonistMarkerGeometryRef.current?.setDrawRange(
    0,
    operationalProtagonistMarkerCount,
  );
  context.clusterActivationGeometryRef.current?.setDrawRange(0, clusterPointCount);
  markAttributeForUpdate(context.propagationPulsePositionRef.current);
  markAttributeForUpdate(context.propagationPulseColorRef.current);
  markAttributeForUpdate(context.propagationPulseOpacityRef.current);
  markAttributeForUpdate(context.propagationPulseSizeRef.current);
  markAttributeForUpdate(context.operationalProtagonistMarkerPositionRef.current);
  markAttributeForUpdate(context.operationalProtagonistMarkerTangentRef.current);
  markAttributeForUpdate(context.operationalProtagonistMarkerColorRef.current);
  markAttributeForUpdate(context.operationalProtagonistMarkerOpacityRef.current);
  markAttributeForUpdate(context.operationalProtagonistMarkerSizeRef.current);
  markAttributeForUpdate(context.clusterActivationPositionRef.current);
  markAttributeForUpdate(context.clusterActivationColorRef.current);
  markAttributeForUpdate(context.clusterActivationOpacityRef.current);
  markAttributeForUpdate(context.clusterActivationSizeRef.current);
};

export const updateNeuralCoreSceneSemanticBufferFrame = (
  context: NeuralCoreSceneSemanticBufferFrameContext,
  effectiveDirectionState: NeuralCoreSceneDirectionState,
  elapsedTime: number,
  narrativeVisualState: NeuralCoreNarrativeVisualState,
  propagationElapsedTime: number,
  safeDeltaSeconds: number,
  viewportHeight: number,
  viewportWidth: number,
  viewportDpr: number,
  semanticVisualState: NeuralCoreSemanticVisualState,
): void => {
  const semanticUpdate = updateNeuralCoreSemanticBuffers(
    context.semanticBuffers,
    context.graph,
    semanticVisualState,
    context.semanticVisualizationConfig,
    effectiveDirectionState,
    context.sceneDirectionConfig,
    narrativeVisualState,
    context.propagationConfig.pulse.routeBackgroundOpacity,
    safeDeltaSeconds,
    context.cameraProfile,
    context.inspectionVisibility,
  );
  updatePointCloudMaterials(
    context.nodeCloudRef.current,
    elapsedTime,
    viewportHeight * viewportDpr * 0.5,
    semanticUpdate.nodeAttributesChanged,
  );
  if (semanticUpdate.connectionAttributesChanged) {
    markConnectionAttributesForUpdate(context.connectionRef.current);
  }
  if (semanticUpdate.ribbonAttributesChanged) {
    markAttributeForUpdate(context.semanticRibbonColorRef.current);
    markAttributeForUpdate(context.semanticRibbonFragmentationRef.current);
    markAttributeForUpdate(context.semanticRibbonInstabilityRef.current);
    markAttributeForUpdate(context.semanticRibbonInterruptionRef.current);
    markAttributeForUpdate(context.semanticRibbonOpacityRef.current);
    markAttributeForUpdate(context.semanticRibbonPulseFrequencyRef.current);
    markAttributeForUpdate(context.semanticRibbonPulseIntensityRef.current);
    markAttributeForUpdate(context.semanticRibbonThicknessRef.current);
  }
  if (context.semanticRibbonMaterialRef.current) {
    context.semanticRibbonMaterialRef.current.uniforms.uTime.value = propagationElapsedTime;
    context.semanticRibbonMaterialRef.current.uniforms.uResolution.value.x = viewportWidth;
    context.semanticRibbonMaterialRef.current.uniforms.uResolution.value.y = viewportHeight;
    context.semanticRibbonMaterialRef.current.uniforms.uFocusLensThickness.value =
      context.clusterGrammar.enabled && context.focusLensRuntime.enabled
        ? context.focusLensRuntime.detailedSynapseThickness
        : 1;
  }
  if (context.nodeCloudRef.current) {
    const maximumNodeScreenSize = context.inspectionVisibility.enabled
      ? context.cameraProfile.selectedNodeMaximumScreenSize
      : context.cameraProfile.nodeMaximumScreenSize;
    for (const child of context.nodeCloudRef.current.children) {
      const material = (child as Points).material as ShaderMaterial;
      if (material.uniforms.uMinimumScreenSize) {
        material.uniforms.uMinimumScreenSize.value =
          context.cameraProfile.nodeMinimumScreenSize;
      }
      if (material.uniforms.uMaximumScreenSize) {
        material.uniforms.uMaximumScreenSize.value = maximumNodeScreenSize;
      }
    }
  }
};
