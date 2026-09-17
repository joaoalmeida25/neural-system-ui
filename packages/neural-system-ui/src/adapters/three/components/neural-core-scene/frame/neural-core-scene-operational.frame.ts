import type { RefObject } from "react";
import { Vector2, type BufferAttribute, type BufferGeometry, type ShaderMaterial } from "three";

import type { NeuralCoreNarrativeState } from "../../../../../domain/narrative/neural-core-narrative.types";
import {
  updateNeuralCoreClusterGrammarBuffers,
  updateNeuralCoreClusterGrammarRuntime,
} from "../../../../../visualization/cluster-grammar/neural-core-cluster-expansion.mapper";
import {
  updateNeuralCoreAggregatedPulseField,
  updateNeuralCoreAggregatedRouteRenderField,
} from "../../../../../visualization/cluster-grammar/neural-core-cluster-grammar-render.mapper";
import type {
  NeuralCoreAggregatedPulseField,
  NeuralCoreAggregatedRouteRenderField,
  NeuralCoreClusterGrammarBufferState,
  NeuralCoreClusterGrammarConfig,
  NeuralCoreClusterGrammarDensity,
  NeuralCoreClusterGrammarFocus,
  NeuralCoreClusterGrammarRuntime,
  NeuralCoreClusterGrammarState,
} from "../../../../../visualization/cluster-grammar/neural-core-cluster-grammar.types";
import type {
  NeuralCoreOperationalRouteVisualChannel,
} from "../../../../../visualization/cluster-grammar/neural-core-operational-route-visual-channel.types";
import type {
  NeuralCoreSceneDirectionState,
} from "../../../../../visualization/direction/neural-core-scene-direction.types";
import type {
  NeuralCoreSemanticFocusLensConfig,
  NeuralCoreSemanticFocusLensState,
} from "../../../../../visualization/focus-lens/neural-core-semantic-focus-lens.types";
import type { NeuralCoreGraph } from "../../../../../visualization/graph/neural-core-graph.types";
import type {
  NeuralCoreInspectionFocusState,
} from "../../../../../visualization/inspection/neural-core-inspection-focus.types";
import type {
  NeuralCoreOperationalVisualOverlay,
} from "../../../../../visualization/operational-runtime/mappers/neural-core-operational-visual-state.mapper";
import {
  NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG,
} from "../../../../../visualization/propagation/neural-core-operational-protagonist-marker.constants";
import type {
  NeuralCorePropagationVisualState,
} from "../../../../../visualization/propagation/neural-core-propagation-visual.types";
import type {
  NeuralCoreSemanticVisualizationConfig,
} from "../../../../../visualization/semantic/neural-core-semantic-visual.types";
import { dampNeuralCoreSceneDirectionValue } from "../../../../../visualization/direction/neural-core-scene-direction.utils";
import { markAttributeForUpdate } from "../neural-core-scene-frame.utils";

const EMPTY_NEURAL_CORE_CLUSTER_IDS: readonly string[] = [];

export interface NeuralCoreSceneOperationalFrameContext {
  aggregatedPulseColorRef: RefObject<BufferAttribute | null>;
  aggregatedPulseField: NeuralCoreAggregatedPulseField;
  aggregatedPulseGeometryRef: RefObject<BufferGeometry | null>;
  aggregatedPulseOpacityRef: RefObject<BufferAttribute | null>;
  aggregatedPulsePositionRef: RefObject<BufferAttribute | null>;
  aggregatedPulseSizeRef: RefObject<BufferAttribute | null>;
  aggregatedPulseSuppressionRef: RefObject<number>;
  aggregatedRouteField: NeuralCoreAggregatedRouteRenderField;
  aggregatedRouteOpacityRef: RefObject<BufferAttribute | null>;
  aggregatedRouteThicknessRef: RefObject<BufferAttribute | null>;
  clusterGrammar: NeuralCoreClusterGrammarState;
  clusterGrammarBuffers: NeuralCoreClusterGrammarBufferState;
  clusterGrammarConfig: NeuralCoreClusterGrammarConfig;
  clusterGrammarConnectionOpacityRefs: readonly RefObject<BufferAttribute | null>[];
  clusterGrammarDensity: NeuralCoreClusterGrammarDensity;
  clusterGrammarFocus: NeuralCoreClusterGrammarFocus;
  clusterGrammarNodeOpacityRefs: readonly RefObject<BufferAttribute | null>[];
  clusterGrammarRibbonOpacityRef: RefObject<BufferAttribute | null>;
  clusterGrammarRuntime: NeuralCoreClusterGrammarRuntime;
  focusLensRuntime: NeuralCoreSemanticFocusLensState;
  graph: NeuralCoreGraph;
  inspectionFocus: NeuralCoreInspectionFocusState;
  operationalProtagonistMarkerMaterialRef: RefObject<ShaderMaterial | null>;
  operationalRouteOpacityMultiplierRef: RefObject<number>;
  operationalRouteRenderIndexRef: RefObject<number | undefined>;
  operationalRouteThicknessMultiplierRef: RefObject<number>;
  semanticFocusLensConfig: NeuralCoreSemanticFocusLensConfig;
  semanticVisualizationConfig: NeuralCoreSemanticVisualizationConfig;
}

export const updateNeuralCoreSceneOperationalRouteFrame = (
  context: NeuralCoreSceneOperationalFrameContext,
  operationalTransmissionActive: boolean,
  operationalRouteVisualChannel: NeuralCoreOperationalRouteVisualChannel | undefined,
  safeDeltaSeconds: number,
  viewportWidth: number,
  viewportHeight: number,
  viewportDpr: number,
): void => {
  context.aggregatedPulseSuppressionRef.current = dampNeuralCoreSceneDirectionValue(
    context.aggregatedPulseSuppressionRef.current,
    operationalTransmissionActive
      ? NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG
        .backgroundAggregatedPulseMultiplier
      : 1,
    operationalTransmissionActive
      ? context.semanticVisualizationConfig.transition.activationResponse
      : context.semanticVisualizationConfig.transition.releaseResponse,
    safeDeltaSeconds,
  );
  const activeOperationalRouteIndex = operationalTransmissionActive
    && operationalRouteVisualChannel
    ? context.clusterGrammar.lookups.routeIndexById[
      operationalRouteVisualChannel.geometryId
    ]
    : undefined;
  if (activeOperationalRouteIndex !== undefined) {
    context.operationalRouteRenderIndexRef.current = activeOperationalRouteIndex;
  }
  context.operationalRouteOpacityMultiplierRef.current =
    dampNeuralCoreSceneDirectionValue(
      context.operationalRouteOpacityMultiplierRef.current,
      operationalTransmissionActive
        ? NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG
          .activeRouteOpacityMultiplier
        : 1,
      operationalTransmissionActive
        ? context.semanticVisualizationConfig.transition.activationResponse
        : context.semanticVisualizationConfig.transition.releaseResponse,
      safeDeltaSeconds,
    );
  context.operationalRouteThicknessMultiplierRef.current =
    dampNeuralCoreSceneDirectionValue(
      context.operationalRouteThicknessMultiplierRef.current,
      operationalTransmissionActive
        ? NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG
          .activeRouteThicknessMultiplier
        : 1,
      operationalTransmissionActive
        ? context.semanticVisualizationConfig.transition.activationResponse
        : context.semanticVisualizationConfig.transition.releaseResponse,
      safeDeltaSeconds,
    );
  if (
    !operationalTransmissionActive
    && context.operationalRouteOpacityMultiplierRef.current >= 0.999
    && context.operationalRouteThicknessMultiplierRef.current >= 0.999
  ) {
    context.operationalRouteRenderIndexRef.current = undefined;
  }
  const markerViewportUniform = context.operationalProtagonistMarkerMaterialRef.current
    ?.uniforms.uViewport?.value;
  if (markerViewportUniform instanceof Vector2) {
    markerViewportUniform.set(
      viewportWidth * viewportDpr,
      viewportHeight * viewportDpr,
    );
  }
};

export const updateNeuralCoreSceneClusterGrammarFrame = (
  context: NeuralCoreSceneOperationalFrameContext,
  effectiveDirectionState: NeuralCoreSceneDirectionState,
  narrativeState: NeuralCoreNarrativeState,
  operationalTransmissionActive: boolean,
  operationalRouteVisualChannel: NeuralCoreOperationalRouteVisualChannel | undefined,
  operationalVisualOverlay: NeuralCoreOperationalVisualOverlay | undefined,
  propagationElapsedTime: number,
  propagationVisualState: NeuralCorePropagationVisualState,
  safeDeltaSeconds: number,
): void => {
  if (context.clusterGrammar.enabled) {
    const grammarFocus = context.clusterGrammarFocus;
    grammarFocus.selectedClusterId = context.focusLensRuntime.enabled
      ? context.focusLensRuntime.selectedClusterId
      : context.inspectionFocus.selectedClusterId;
    grammarFocus.relatedClusterIds = context.focusLensRuntime.enabled
      && context.focusLensRuntime.selectedClusterId === undefined
      ? EMPTY_NEURAL_CORE_CLUSTER_IDS
      : context.inspectionFocus.relatedClusterIds;
    grammarFocus.narrativeClusterIds = narrativeState.clusterIds;
    grammarFocus.narrativeSynapseIds = narrativeState.synapseIds;
    grammarFocus.narrativePathwayIds = narrativeState.pathwayIds;
    grammarFocus.protagonistClusterId = narrativeState.clusterIds[0]
      ?? (
        effectiveDirectionState.focusTargetType === "cluster"
          ? effectiveDirectionState.focusTargetId
          : undefined
      );
    updateNeuralCoreClusterGrammarRuntime(
      context.clusterGrammarRuntime,
      context.clusterGrammar,
      context.clusterGrammarConfig,
      grammarFocus,
      context.clusterGrammarDensity,
      propagationVisualState,
      context.focusLensRuntime,
      context.semanticFocusLensConfig,
      safeDeltaSeconds,
      operationalVisualOverlay,
      operationalRouteVisualChannel,
    );
    updateNeuralCoreClusterGrammarBuffers(
      context.clusterGrammarBuffers,
      context.graph,
      context.clusterGrammarRuntime,
      context.clusterGrammarDensity,
      context.focusLensRuntime,
      context.semanticFocusLensConfig,
    );
    updateNeuralCoreAggregatedRouteRenderField(
      context.aggregatedRouteField,
      context.clusterGrammarRuntime,
      context.operationalRouteRenderIndexRef.current,
      context.operationalRouteOpacityMultiplierRef.current,
      context.operationalRouteThicknessMultiplierRef.current,
    );
    const aggregatedPulsePointCount = updateNeuralCoreAggregatedPulseField(
      context.aggregatedPulseField,
      context.clusterGrammar,
      context.clusterGrammarRuntime,
      propagationElapsedTime,
      operationalTransmissionActive
        ? operationalRouteVisualChannel?.geometryId
        : undefined,
      context.aggregatedPulseSuppressionRef.current,
    );
    context.aggregatedPulseGeometryRef.current?.setDrawRange(0, aggregatedPulsePointCount);
    markAttributeForUpdate(context.aggregatedRouteOpacityRef.current);
    markAttributeForUpdate(context.aggregatedRouteThicknessRef.current);
    markAttributeForUpdate(context.aggregatedPulsePositionRef.current);
    markAttributeForUpdate(context.aggregatedPulseColorRef.current);
    markAttributeForUpdate(context.aggregatedPulseOpacityRef.current);
    markAttributeForUpdate(context.aggregatedPulseSizeRef.current);
    for (const attributeRef of context.clusterGrammarNodeOpacityRefs) {
      markAttributeForUpdate(attributeRef.current);
    }
    for (const attributeRef of context.clusterGrammarConnectionOpacityRefs) {
      markAttributeForUpdate(attributeRef.current);
    }
    markAttributeForUpdate(context.clusterGrammarRibbonOpacityRef.current);
  }
};
