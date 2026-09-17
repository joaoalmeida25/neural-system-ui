import type { RefObject } from "react";
import type { Camera, Group, Vector3 } from "three";

import type {
  NeuralCoreInspectionConfig,
  NeuralCoreInspectionState,
} from "../../../../../domain/inspection/neural-core-inspection.types";
import type { NeuralCoreNarrativeState } from "../../../../../domain/narrative/neural-core-narrative.types";
import type {
  NeuralCoreClusterGrammarDensity,
} from "../../../../../visualization/cluster-grammar/neural-core-cluster-grammar.types";
import type {
  NeuralCoreSceneDirectionConfig,
  NeuralCoreSceneDirectionState,
} from "../../../../../visualization/direction/neural-core-scene-direction.types";
import {
  updateNeuralCoreSemanticFocusLensRuntime,
} from "../../../../../visualization/focus-lens/neural-core-semantic-focus-lens.utils";
import {
  writeNeuralCoreSemanticFocusLensTarget,
} from "../../../../../visualization/focus-lens/neural-core-semantic-focus-lens.mapper";
import type {
  NeuralCoreSemanticFocusLensConfig,
  NeuralCoreSemanticFocusLensState,
  WriteNeuralCoreSemanticFocusLensTargetParams,
} from "../../../../../visualization/focus-lens/neural-core-semantic-focus-lens.types";
import type {
  NeuralCoreCameraRenderingProfile,
} from "../../../../../visualization/inspection/neural-core-camera-rendering.types";
import {
  updateNeuralCoreCameraRenderingProfile,
} from "../../../../../visualization/inspection/neural-core-camera-rendering.utils";
import type {
  NeuralCoreElementVisualComposition,
} from "../../../../../visualization/inspection/neural-core-element-visual-composition.types";
import {
  writeNeuralCoreElementVisualComposition,
} from "../../../../../visualization/inspection/neural-core-element-visual-composition.utils";
import type {
  NeuralCoreInspectionFocusState,
} from "../../../../../visualization/inspection/neural-core-inspection-focus.types";
import type {
  NeuralCoreInspectionVisibilityState,
} from "../../../../../visualization/inspection/neural-core-inspection-visibility.types";
import {
  updateNeuralCoreInspectionVisibilityState,
} from "../../../../../visualization/inspection/neural-core-inspection-visibility.utils";
import type {
  NeuralCoreVisualDensityRuntime,
} from "../../../../../visualization/inspection/neural-core-visual-density.types";
import {
  updateNeuralCoreVisualDensityRuntime,
} from "../../../../../visualization/inspection/neural-core-visual-density.utils";
import type {
  NeuralCoreTopologyVisualState,
} from "../../../../../visualization/topology/neural-core-topology-visual.types";

export interface NeuralCoreSceneInspectionFrameContext {
  cameraDistanceTargetWorld: Vector3;
  cameraProfile: NeuralCoreCameraRenderingProfile;
  clusterGrammarDensity: NeuralCoreClusterGrammarDensity;
  focusLensParams: WriteNeuralCoreSemanticFocusLensTargetParams;
  focusLensRuntime: NeuralCoreSemanticFocusLensState;
  focusLensTarget: NeuralCoreSemanticFocusLensState;
  inspectionConfig: NeuralCoreInspectionConfig;
  inspectionCssValuesRef: RefObject<{
    base: string;
    globalGlow: string;
    microFocus: string;
  }>;
  inspectionFocus: NeuralCoreInspectionFocusState;
  inspectionRootRef: RefObject<HTMLElement | null>;
  inspectionState: NeuralCoreInspectionState;
  inspectionVisibility: NeuralCoreInspectionVisibilityState;
  networkRef: RefObject<Group | null>;
  orbitControlsRef: RefObject<{ target: Vector3 } | null>;
  runtimeFocusedClusterId?: string;
  sceneDirectionConfig: NeuralCoreSceneDirectionConfig;
  semanticFocusLensConfig: NeuralCoreSemanticFocusLensConfig;
  topologyVisualState: NeuralCoreTopologyVisualState;
  visualComposition: NeuralCoreElementVisualComposition;
  visualDensityRuntime: NeuralCoreVisualDensityRuntime;
}

export const updateNeuralCoreSceneInspectionDensityFrame = (
  context: NeuralCoreSceneInspectionFrameContext,
  camera: Camera,
  safeDeltaSeconds: number,
): number => {
  const cameraDistanceTargetWorld = context.cameraDistanceTargetWorld;
  const networkForDensity = context.networkRef.current;
  if (networkForDensity) {
    networkForDensity.updateWorldMatrix(true, false);
    const selectedDensityRegion = context.inspectionFocus.selectedClusterId
      ? context.topologyVisualState.lookups.clusterRegionById[
        context.inspectionFocus.selectedClusterId
      ]
      : undefined;
    if (selectedDensityRegion) {
      cameraDistanceTargetWorld.set(
        selectedDensityRegion.center[0],
        selectedDensityRegion.center[1],
        selectedDensityRegion.center[2],
      );
      cameraDistanceTargetWorld.applyMatrix4(networkForDensity.matrixWorld);
    } else if (context.orbitControlsRef.current) {
      cameraDistanceTargetWorld.copy(context.orbitControlsRef.current.target);
    } else {
      networkForDensity.getWorldPosition(cameraDistanceTargetWorld);
    }
  } else {
    cameraDistanceTargetWorld.set(0, 0, 0);
  }
  const relevantCameraDistance = camera.position.distanceTo(cameraDistanceTargetWorld);
  const visualDensity = updateNeuralCoreVisualDensityRuntime(
    context.visualDensityRuntime,
    context.inspectionConfig.visualDensity,
    relevantCameraDistance,
    safeDeltaSeconds,
    context.inspectionState.mode,
  );
  updateNeuralCoreCameraRenderingProfile(
    context.cameraProfile,
    relevantCameraDistance,
    context.inspectionConfig.camera.minimumDistance,
    context.inspectionConfig.camera.maximumDistance,
    context.inspectionConfig.cameraRendering,
    context.inspectionState.mode === "inspection",
  );
  updateNeuralCoreInspectionVisibilityState(
    context.inspectionVisibility,
    context.inspectionConfig.visualDensity,
    context.inspectionState.mode,
    context.inspectionState.mode === "inspection"
      && context.inspectionConfig.panel.enabled
      && context.inspectionFocus.selectedClusterId !== undefined,
    visualDensity.macroWeight,
    visualDensity.mesoWeight,
    visualDensity.microWeight,
  );
  return relevantCameraDistance;
};

export const updateNeuralCoreSceneFocusLensFrame = (
  context: NeuralCoreSceneInspectionFrameContext,
  camera: Camera,
  relevantCameraDistance: number,
  safeDeltaSeconds: number,
): void => {
  const networkMatrix = context.networkRef.current?.matrixWorld.elements;
  const cameraDistanceToBrain = networkMatrix
    ? Math.hypot(
      camera.position.x - networkMatrix[12],
      camera.position.y - networkMatrix[13],
      camera.position.z - networkMatrix[14],
    )
    : relevantCameraDistance;
  const visualDensity = context.visualDensityRuntime;
  const grammarDensity = context.clusterGrammarDensity;
  grammarDensity.macroWeight = visualDensity.macroWeight;
  grammarDensity.mesoWeight = visualDensity.mesoWeight;
  grammarDensity.microWeight = visualDensity.microWeight;
  const focusLensParams = context.focusLensParams;
  focusLensParams.interactionMode = context.inspectionState.mode;
  focusLensParams.selectedClusterId = context.inspectionFocus.selectedClusterId;
  focusLensParams.runtimeFocusedClusterId = context.runtimeFocusedClusterId;
  focusLensParams.cameraDistanceToSelected = context.inspectionFocus.selectedClusterId
    ? relevantCameraDistance
    : undefined;
  focusLensParams.cameraDistanceToBrain = cameraDistanceToBrain;
  writeNeuralCoreSemanticFocusLensTarget(
    context.focusLensTarget,
    focusLensParams,
    context.semanticFocusLensConfig,
  );
  updateNeuralCoreSemanticFocusLensRuntime(
    context.focusLensRuntime,
    context.focusLensTarget,
    context.semanticFocusLensConfig,
    safeDeltaSeconds,
  );
};

export const updateNeuralCoreSceneInspectionCssFrame = (
  context: NeuralCoreSceneInspectionFrameContext,
  effectiveDirectionState: NeuralCoreSceneDirectionState,
  narrativeState: NeuralCoreNarrativeState,
): void => {
  const inspectionRoot = context.inspectionRootRef.current;
  if (inspectionRoot) {
    const cssValues = context.inspectionCssValuesRef.current;
    const inspectionVisibility = context.inspectionVisibility;
    const nextMicroFocus = (
      inspectionVisibility.hasSelection ? inspectionVisibility.microWeight : 0
    ).toFixed(3);
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
      inspectionVisibility,
    );
    const directionContextAmount = context.sceneDirectionConfig.focus.maximumContextDim > 0
      ? Math.min(
        1,
        Math.max(
          0,
          effectiveDirectionState.contextDim
            / context.sceneDirectionConfig.focus.maximumContextDim,
        ),
      )
      : 0;
    const directionFocusAmount = effectiveDirectionState.isOverview
      ? 0
      : Math.max(directionContextAmount, effectiveDirectionState.transitionProgress);
    const narrativeFocusAmount = narrativeState.isActive
      ? Math.max(0.48, Math.min(1, narrativeState.contextDim))
      : 0;
    const inspectionFocusAmount = inspectionVisibility.hasSelection
      ? 0.68 + inspectionVisibility.microWeight * 0.32
      : 0;
    const neuralFocusAmount = Math.max(
      directionFocusAmount,
      narrativeFocusAmount,
      inspectionFocusAmount,
    );
    const baseVisibility = Math.max(
      0.42,
      Math.min(
        decorativeComposition.opacity,
        inspectionVisibility.enabled ? inspectionVisibility.baseWeight : 1,
        1 - neuralFocusAmount * 0.28,
      ),
    );
    const globalGlowVisibility = Math.max(
      0.38,
      Math.min(
        decorativeComposition.opacity,
        inspectionVisibility.enabled ? inspectionVisibility.globalGlowWeight : 1,
        1 - neuralFocusAmount * 0.58,
      ),
    );
    const nextBase = baseVisibility.toFixed(3);
    const nextGlobalGlow = globalGlowVisibility.toFixed(3);
    if (cssValues.microFocus !== nextMicroFocus) {
      cssValues.microFocus = nextMicroFocus;
      inspectionRoot.style.setProperty("--neural-core-micro-focus", nextMicroFocus);
    }
    if (cssValues.base !== nextBase) {
      cssValues.base = nextBase;
      inspectionRoot.style.setProperty("--neural-core-base-visibility", nextBase);
    }
    if (cssValues.globalGlow !== nextGlobalGlow) {
      cssValues.globalGlow = nextGlobalGlow;
      inspectionRoot.style.setProperty(
        "--neural-core-global-glow-visibility",
        nextGlobalGlow,
      );
    }}

};
