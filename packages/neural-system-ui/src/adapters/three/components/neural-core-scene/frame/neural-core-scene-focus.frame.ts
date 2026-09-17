import type { RefObject } from "react";
import type {
  Camera,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  Vector3,
} from "three";

import type {
  NeuralCoreInspectionConfig,
} from "../../../../../domain/inspection/neural-core-inspection.types";
import type {
  NeuralCoreNarrativeConfig,
} from "../../../../../domain/narrative/neural-core-narrative.types";
import type {
  NeuralCoreClusterGrammarState,
} from "../../../../../visualization/cluster-grammar/neural-core-cluster-grammar.types";
import type {
  NeuralCoreSceneDirectionConfig,
  NeuralCoreSceneDirectionState,
} from "../../../../../visualization/direction/neural-core-scene-direction.types";
import type {
  NeuralCoreVector3,
} from "../../../../../visualization/graph/neural-core-graph.types";
import type {
  NeuralCoreInspectionFocusState,
} from "../../../../../visualization/inspection/neural-core-inspection-focus.types";
import type {
  NeuralCoreInspectionVisibilityState,
} from "../../../../../visualization/inspection/neural-core-inspection-visibility.types";
import type {
  NeuralCoreSemanticVisualRuntime,
} from "../../../../../visualization/semantic/neural-core-semantic-visual.mapper";
import type {
  NeuralCoreSemanticVisualState,
  NeuralCoreSemanticVisualizationConfig,
} from "../../../../../visualization/semantic/neural-core-semantic-visual.types";
import {
  dampNeuralCoreSceneDirectionValue,
} from "../../../../../visualization/direction/neural-core-scene-direction.utils";
import type {
  NeuralCoreTopologyVisualState,
} from "../../../../../visualization/topology/neural-core-topology-visual.types";

export interface NeuralCoreSceneFocusFrameContext {
  clusterGrammar: NeuralCoreClusterGrammarState;
  focusHaloMaterialRef: RefObject<MeshBasicMaterial | null>;
  focusHaloRef: RefObject<Mesh | null>;
  haloTargetColor: Color;
  haloWorldPosition: NeuralCoreVector3;
  inspectionConfig: NeuralCoreInspectionConfig;
  inspectionFocus: NeuralCoreInspectionFocusState;
  inspectionVisibility: NeuralCoreInspectionVisibilityState;
  narrativeConfig: NeuralCoreNarrativeConfig;
  networkRef: RefObject<Group | null>;
  pickingCenter: Vector3;
  sceneDirectionConfig: NeuralCoreSceneDirectionConfig;
  selectedEnvelopeMaterialRef: RefObject<ShaderMaterial | null>;
  selectedEnvelopeRef: RefObject<Mesh | null>;
  semanticVisualRuntime?: NeuralCoreSemanticVisualRuntime;
  semanticVisualizationConfig: NeuralCoreSemanticVisualizationConfig;
  topologyVisualState: NeuralCoreTopologyVisualState;
}

export const updateNeuralCoreSceneFocusHaloFrame = (
  context: NeuralCoreSceneFocusFrameContext,
  camera: Camera,
  effectiveDirectionState: NeuralCoreSceneDirectionState,
  networkScale: number,
  safeDeltaSeconds: number,
  semanticVisualState: NeuralCoreSemanticVisualState,
): void => {
  const focusRegion = effectiveDirectionState.focusTargetType === "cluster"
    && effectiveDirectionState.focusTargetId
    ? context.topologyVisualState.lookups.clusterRegionById[
      effectiveDirectionState.focusTargetId
    ]
    : undefined;
  if (context.focusHaloRef.current && context.focusHaloMaterialRef.current) {
    const halo = context.focusHaloRef.current;
    const material = context.focusHaloMaterialRef.current;
    const haloResponse = context.semanticVisualizationConfig.transition.activationResponse;
    halo.quaternion.copy(camera.quaternion);
    if (focusRegion) {
      if (context.networkRef.current) {
        context.pickingCenter.set(
          focusRegion.center[0],
          focusRegion.center[1],
          focusRegion.center[2],
        );
        context.pickingCenter.applyMatrix4(context.networkRef.current.matrixWorld);
        context.haloWorldPosition[0] = context.pickingCenter.x;
        context.haloWorldPosition[1] = context.pickingCenter.y;
        context.haloWorldPosition[2] = context.pickingCenter.z;
      }
      halo.position.x = dampNeuralCoreSceneDirectionValue(
        halo.position.x,
        context.haloWorldPosition[0],
        context.sceneDirectionConfig.camera.targetResponse,
        safeDeltaSeconds,
      );
      halo.position.y = dampNeuralCoreSceneDirectionValue(
        halo.position.y,
        context.haloWorldPosition[1],
        context.sceneDirectionConfig.camera.targetResponse,
        safeDeltaSeconds,
      );
      halo.position.z = dampNeuralCoreSceneDirectionValue(
        halo.position.z,
        context.haloWorldPosition[2],
        context.sceneDirectionConfig.camera.targetResponse,
        safeDeltaSeconds,
      );
      const haloScale = focusRegion.radius * networkScale
        * (1.2 + effectiveDirectionState.targetEmphasis * 0.1)
        * context.narrativeConfig.focusIndicator.scaleMultiplier;
      const nextScale = dampNeuralCoreSceneDirectionValue(
        halo.scale.x,
        haloScale,
        haloResponse,
        safeDeltaSeconds,
      );
      halo.scale.setScalar(nextScale);
      const clusterIndex = context.semanticVisualRuntime
        ?.clusterIndexById[focusRegion.clusterId];
      const clusterColor = clusterIndex === undefined
        ? context.semanticVisualizationConfig.color.active
        : semanticVisualState.clusterEffects[clusterIndex]?.color
          ?? context.semanticVisualizationConfig.color.active;
      context.haloTargetColor.set(clusterColor);
      material.color.lerp(
        context.haloTargetColor,
        1 - Math.exp(
          -context.semanticVisualizationConfig.transition.colorResponse * safeDeltaSeconds,
        ),
      );
    }
    const focusIndicatorVisible = context.narrativeConfig.focusIndicator.enabled
      && context.narrativeConfig.focusIndicator.mode !== "hidden";
    const inspectionEnvelopeActive = context.inspectionVisibility.enabled
      && (
        context.clusterGrammar.enabled
        || context.inspectionConfig.visualDensity.selectedClusterEnvelope.enabled
      );
    const targetHaloOpacity = focusRegion
      && focusIndicatorVisible
      && !inspectionEnvelopeActive
      ? Math.min(
        context.narrativeConfig.focusIndicator.maximumOpacity,
        effectiveDirectionState.haloIntensity
          * (0.026 + Math.min(1.35, effectiveDirectionState.targetEmphasis) * 0.038),
      )
      : 0;
    material.opacity = dampNeuralCoreSceneDirectionValue(
      material.opacity,
      targetHaloOpacity,
      focusRegion
        ? haloResponse
        : context.semanticVisualizationConfig.transition.releaseResponse,
      safeDeltaSeconds,
    );
    halo.visible = material.opacity > 0.001;
  }
};

export const updateNeuralCoreSceneSelectedEnvelopeFrame = (
  context: NeuralCoreSceneFocusFrameContext,
  networkScale: number,
  propagationActivity: number,
  safeDeltaSeconds: number,
  semanticVisualState: NeuralCoreSemanticVisualState,
): void => {
  if (context.selectedEnvelopeRef.current && context.selectedEnvelopeMaterialRef.current) {
    const envelope = context.selectedEnvelopeRef.current;
    const material = context.selectedEnvelopeMaterialRef.current;
    const envelopeConfig = context.inspectionConfig.visualDensity.selectedClusterEnvelope;
    const selectedRegion = context.inspectionFocus.selectedClusterId
      ? context.topologyVisualState.lookups.clusterRegionById[
        context.inspectionFocus.selectedClusterId
      ]
      : undefined;
    const envelopeActive = context.inspectionVisibility.enabled
      && !context.clusterGrammar.enabled
      && envelopeConfig.enabled
      && selectedRegion !== undefined;
    if (selectedRegion && context.networkRef.current) {
      context.pickingCenter.set(
        selectedRegion.center[0],
        selectedRegion.center[1],
        selectedRegion.center[2],
      );
      context.pickingCenter.applyMatrix4(context.networkRef.current.matrixWorld);
      envelope.position.x = dampNeuralCoreSceneDirectionValue(
        envelope.position.x,
        context.pickingCenter.x,
        context.sceneDirectionConfig.camera.targetResponse,
        safeDeltaSeconds,
      );
      envelope.position.y = dampNeuralCoreSceneDirectionValue(
        envelope.position.y,
        context.pickingCenter.y,
        context.sceneDirectionConfig.camera.targetResponse,
        safeDeltaSeconds,
      );
      envelope.position.z = dampNeuralCoreSceneDirectionValue(
        envelope.position.z,
        context.pickingCenter.z,
        context.sceneDirectionConfig.camera.targetResponse,
        safeDeltaSeconds,
      );
      context.networkRef.current.getWorldQuaternion(envelope.quaternion);
      const targetEnvelopeScale = selectedRegion.radius
        * networkScale
        * envelopeConfig.scaleMultiplier;
      envelope.scale.x = dampNeuralCoreSceneDirectionValue(
        envelope.scale.x,
        targetEnvelopeScale,
        context.semanticVisualizationConfig.transition.activationResponse,
        safeDeltaSeconds,
      );
      envelope.scale.y = dampNeuralCoreSceneDirectionValue(
        envelope.scale.y,
        targetEnvelopeScale * 0.78,
        context.semanticVisualizationConfig.transition.activationResponse,
        safeDeltaSeconds,
      );
      envelope.scale.z = dampNeuralCoreSceneDirectionValue(
        envelope.scale.z,
        targetEnvelopeScale * 0.9,
        context.semanticVisualizationConfig.transition.activationResponse,
        safeDeltaSeconds,
      );
      const clusterIndex = context.semanticVisualRuntime
        ?.clusterIndexById[selectedRegion.clusterId];
      const clusterColor = clusterIndex === undefined
        ? context.semanticVisualizationConfig.color.active
        : semanticVisualState.clusterEffects[clusterIndex]?.color
          ?? context.semanticVisualizationConfig.color.active;
      context.haloTargetColor.set(clusterColor);
      const envelopeColor = material.uniforms.uColor?.value as Color | undefined;
      envelopeColor?.lerp(
        context.haloTargetColor,
        1 - Math.exp(
          -context.semanticVisualizationConfig.transition.colorResponse * safeDeltaSeconds,
        ),
      );
    }
    const densityEnvelopeWeight = context.inspectionVisibility.microWeight
      + context.inspectionVisibility.mesoWeight * 0.28;
    const targetEnvelopeOpacity = envelopeActive
      ? envelopeConfig.maximumOpacity
        * densityEnvelopeWeight
        * (1 + propagationActivity * envelopeConfig.pulseInfluence)
      : 0;
    material.uniforms.uOpacity.value = dampNeuralCoreSceneDirectionValue(
      Number(material.uniforms.uOpacity.value),
      Math.min(envelopeConfig.maximumOpacity, targetEnvelopeOpacity),
      envelopeActive
        ? context.semanticVisualizationConfig.transition.activationResponse
        : context.semanticVisualizationConfig.transition.releaseResponse,
      safeDeltaSeconds,
    );
    material.uniforms.uEdgeSoftness.value = envelopeConfig.edgeSoftness;
    envelope.visible = Number(material.uniforms.uOpacity.value) > 0.001;
  }
};
