import type { RefObject } from "react";
import type { Camera, Group, Vector3 } from "three";

import type {
  NeuralCoreInspectionConfig,
  NeuralCoreInspectionState,
} from "../../../../../domain/inspection/neural-core-inspection.types";
import type { NeuralCoreNarrativeState } from "../../../../../domain/narrative/neural-core-narrative.types";
import type {
  NeuralCorePropagationConfig,
} from "../../../../../domain/propagation/neural-core-propagation.types";
import type {
  AdvanceNeuralCoreClusterLabelsParams,
} from "../../../hooks/use-neural-core-cluster-labels/use-neural-core-cluster-labels.types";
import type {
  NeuralCoreClusterGrammarRuntime,
  NeuralCoreClusterGrammarState,
} from "../../../../../visualization/cluster-grammar/neural-core-cluster-grammar.types";
import type {
  NeuralCoreSceneDirectionState,
  NeuralCoreSceneMotionConfig,
} from "../../../../../visualization/direction/neural-core-scene-direction.types";
import {
  dampNeuralCoreSceneDirectionAngle,
  dampNeuralCoreSceneDirectionValue,
} from "../../../../../visualization/direction/neural-core-scene-direction.utils";
import type {
  NeuralCoreVector3,
} from "../../../../../visualization/graph/neural-core-graph.types";
import type {
  NeuralCoreInspectionFocusState,
} from "../../../../../visualization/inspection/neural-core-inspection-focus.types";
import { dampNeuralCoreValue } from "../../../../../visualization/semantic/neural-core-semantic-transition.utils";
import type {
  NeuralCoreSemanticVisualizationConfig,
} from "../../../../../visualization/semantic/neural-core-semantic-visual.types";
import type {
  NeuralCoreCameraTransitionRuntime,
} from "../hooks/use-neural-core-scene-interaction.hook";
import { writeRotatedSceneVector } from "../neural-core-scene-frame.utils";

export interface NeuralCoreSceneMotionRuntime {
  particleTime: number;
  rotationSpeed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  smoothedActivity: number;
  smoothedBreathingMultiplier: number;
  smoothedParticleMultiplier: number;
  smoothedRotationMultiplier: number;
}

export interface NeuralCoreSceneCameraFrameContext {
  cameraLocalPosition: NeuralCoreVector3;
  cameraLocalVector: Vector3;
  cameraTransition: NeuralCoreCameraTransitionRuntime;
  cameraWorldPosition: NeuralCoreVector3;
  cameraWorldTarget: NeuralCoreVector3;
  clusterGrammar: NeuralCoreClusterGrammarState;
  clusterGrammarRuntime: NeuralCoreClusterGrammarRuntime;
  inspectionConfig: NeuralCoreInspectionConfig;
  inspectionFocus: NeuralCoreInspectionFocusState;
  inspectionState: NeuralCoreInspectionState;
  inspectionViewDirection: Vector3;
  inspectionWorldCenter: Vector3;
  labelsAdvance: (params: AdvanceNeuralCoreClusterLabelsParams) => void;
  motion: NeuralCoreSceneMotionRuntime;
  networkRef: RefObject<Group | null>;
  onCameraTransitioningChange: (transitioning: boolean) => void;
  orbitControlsRef: RefObject<{
    target: Vector3;
    update: () => void;
  } | null>;
  pickingHit: Vector3;
  propagationConfig: NeuralCorePropagationConfig;
  sceneMotionConfig: NeuralCoreSceneMotionConfig;
  semanticVisualizationConfig: NeuralCoreSemanticVisualizationConfig;
}

export const updateNeuralCoreSceneMotionFrame = (
  context: NeuralCoreSceneCameraFrameContext,
  effectiveDirectionState: NeuralCoreSceneDirectionState,
  elapsedTime: number,
  propagationActivity: number,
  safeDeltaSeconds: number,
  simulationDeltaSeconds: number,
): void => {
  const motion = context.motion;
  motion.smoothedActivity = dampNeuralCoreValue(
    motion.smoothedActivity,
    propagationActivity,
    context.semanticVisualizationConfig.motion.activityResponse,
    safeDeltaSeconds,
  );
  const rotationActivityInfluence = Math.min(
    context.semanticVisualizationConfig.motion.maximumRotationActivityInfluence,
    Math.max(0, context.propagationConfig.motion.rotationActivityInfluence),
  );
  const targetRotationMultiplier = 1
    + motion.smoothedActivity * rotationActivityInfluence;
  const targetBreathingMultiplier = 1
    + motion.smoothedActivity * Math.min(
      0.35,
      Math.max(0, context.propagationConfig.motion.breathingActivityInfluence),
    );
  const targetParticleMultiplier = 1
    + motion.smoothedActivity * Math.min(
      0.35,
      Math.max(0, context.propagationConfig.motion.particleActivityInfluence),
    );
  motion.smoothedRotationMultiplier = dampNeuralCoreValue(
    motion.smoothedRotationMultiplier,
    targetRotationMultiplier,
    context.semanticVisualizationConfig.motion.activityResponse,
    safeDeltaSeconds,
  );
  motion.smoothedBreathingMultiplier = dampNeuralCoreValue(
    motion.smoothedBreathingMultiplier,
    targetBreathingMultiplier,
    context.semanticVisualizationConfig.motion.activityResponse,
    safeDeltaSeconds,
  );
  motion.smoothedParticleMultiplier = dampNeuralCoreValue(
    motion.smoothedParticleMultiplier,
    targetParticleMultiplier,
    context.semanticVisualizationConfig.motion.activityResponse,
    safeDeltaSeconds,
  );
  const presentationAutoRotate = context.inspectionState.mode === "presentation"
    && context.sceneMotionConfig.autoRotate;
  const targetRotationSpeed = presentationAutoRotate
    ? context.sceneMotionConfig.baseRotationSpeed
      * motion.smoothedRotationMultiplier
      * effectiveDirectionState.rotationMultiplier
    : 0;
  motion.rotationSpeed = dampNeuralCoreSceneDirectionValue(
    motion.rotationSpeed,
    targetRotationSpeed,
    context.sceneMotionConfig.rotationTransitionResponse,
    context.inspectionState.mode === "inspection" ? safeDeltaSeconds : simulationDeltaSeconds,
  );
  if (context.inspectionState.mode === "presentation") {
    motion.rotationY += motion.rotationSpeed * simulationDeltaSeconds;
  }
  if (
    context.inspectionState.mode === "presentation"
    && !context.sceneMotionConfig.autoRotate
  ) {
    motion.rotationY = dampNeuralCoreSceneDirectionAngle(
      motion.rotationY,
      context.sceneMotionConfig.horizontalOrientationY,
      context.sceneMotionConfig.rotationTransitionResponse,
      simulationDeltaSeconds,
    );
  }
  const secondaryRotationAmount = presentationAutoRotate
    ? effectiveDirectionState.rotationMultiplier
    : 0;
  const targetRotationX = context.sceneMotionConfig.horizontalOrientationX
    + Math.sin(elapsedTime * 0.14) * 0.044 * secondaryRotationAmount;
  const targetRotationZ = context.sceneMotionConfig.horizontalOrientationZ
    + Math.cos(elapsedTime * 0.09) * 0.019 * secondaryRotationAmount;
  motion.rotationX = dampNeuralCoreSceneDirectionAngle(
    motion.rotationX,
    targetRotationX,
    context.sceneMotionConfig.rotationTransitionResponse,
    simulationDeltaSeconds,
  );
  motion.rotationZ = dampNeuralCoreSceneDirectionAngle(
    motion.rotationZ,
    targetRotationZ,
    context.sceneMotionConfig.rotationTransitionResponse,
    simulationDeltaSeconds,
  );
  motion.particleTime += motion.smoothedParticleMultiplier * simulationDeltaSeconds;

  if (context.networkRef.current) {
    context.networkRef.current.rotation.y = motion.rotationY;
    context.networkRef.current.rotation.x = motion.rotationX;
    context.networkRef.current.rotation.z = motion.rotationZ;
    context.networkRef.current.scale.setScalar(
      0.95
        + Math.sin(elapsedTime * 0.31) * 0.004 * motion.smoothedBreathingMultiplier,
    );
  }
};

export const updateNeuralCoreSceneCameraFrame = (
  context: NeuralCoreSceneCameraFrameContext,
  camera: Camera,
  directionState: NeuralCoreSceneDirectionState,
  safeDeltaSeconds: number,
): number => {
  const networkScale = context.networkRef.current?.scale.x ?? 1;
  if (context.inspectionState.mode === "presentation") {
    writeRotatedSceneVector(
      directionState.target,
      context.motion.rotationX,
      context.motion.rotationY,
      context.motion.rotationZ,
      networkScale,
      context.cameraWorldTarget,
    );
    context.cameraWorldPosition[0] = context.cameraWorldTarget[0]
      + directionState.cameraPosition[0] - directionState.target[0];
    context.cameraWorldPosition[1] = context.cameraWorldTarget[1]
      + directionState.cameraPosition[1] - directionState.target[1];
    context.cameraWorldPosition[2] = context.cameraWorldTarget[2]
      + directionState.cameraPosition[2] - directionState.target[2];
  }
  const controls = context.orbitControlsRef.current;
  const cameraTransition = context.cameraTransition;
  if (cameraTransition.active) {
    if (cameraTransition.kind === "presentation") {
      cameraTransition.endTarget.set(
        context.cameraWorldTarget[0],
        context.cameraWorldTarget[1],
        context.cameraWorldTarget[2],
      );
      cameraTransition.endPosition.set(
        context.cameraWorldPosition[0],
        context.cameraWorldPosition[1],
        context.cameraWorldPosition[2],
      );
    }
    cameraTransition.elapsedSeconds += safeDeltaSeconds;
    const linearProgress = Math.min(
      1,
      cameraTransition.elapsedSeconds / Math.max(0.001, cameraTransition.durationSeconds),
    );
    const transitionProgress = linearProgress * linearProgress * (3 - 2 * linearProgress);
    camera.position.lerpVectors(
      cameraTransition.startPosition,
      cameraTransition.endPosition,
      transitionProgress,
    );
    context.inspectionWorldCenter.lerpVectors(
      cameraTransition.startTarget,
      cameraTransition.endTarget,
      transitionProgress,
    );
    if (controls) {
      controls.target.copy(context.inspectionWorldCenter);
      controls.update();
    } else {
      camera.lookAt(context.inspectionWorldCenter);
    }
    if (linearProgress >= 1) {
      cameraTransition.active = false;
      context.onCameraTransitioningChange(false);
    }
  } else if (context.inspectionState.mode === "presentation") {
    camera.position.set(
      context.cameraWorldPosition[0],
      context.cameraWorldPosition[1],
      context.cameraWorldPosition[2],
    );
    camera.lookAt(
      context.cameraWorldTarget[0],
      context.cameraWorldTarget[1],
      context.cameraWorldTarget[2],
    );
  } else if (controls && context.networkRef.current) {
    const networkCenter = context.inspectionWorldCenter;
    context.networkRef.current.getWorldPosition(networkCenter);
    const panOffset = context.inspectionViewDirection;
    panOffset.subVectors(controls.target, networkCenter);
    const maximumPanDistance = context.inspectionConfig.camera.maximumPanDistance;
    if (panOffset.lengthSq() > maximumPanDistance * maximumPanDistance) {
      panOffset.setLength(maximumPanDistance).add(networkCenter);
      context.pickingHit.subVectors(panOffset, controls.target);
      controls.target.copy(panOffset);
      camera.position.add(context.pickingHit);
      controls.update();
    }
  }
  if (context.networkRef.current) {
    const network = context.networkRef.current;
    const cameraLocalVector = context.cameraLocalVector;
    network.updateWorldMatrix(true, false);
    cameraLocalVector.copy(camera.position);
    network.worldToLocal(cameraLocalVector);
    // Anchors are consumed directly as normalized network-local graph coordinates.
    context.cameraLocalPosition[0] = Number.isFinite(cameraLocalVector.x)
      ? cameraLocalVector.x
      : 0;
    context.cameraLocalPosition[1] = Number.isFinite(cameraLocalVector.y)
      ? cameraLocalVector.y
      : 0;
    context.cameraLocalPosition[2] = Number.isFinite(cameraLocalVector.z)
      ? cameraLocalVector.z
      : 0;
  }
  return networkScale;
};

export const updateNeuralCoreSceneLabelsFrame = (
  context: NeuralCoreSceneCameraFrameContext,
  camera: Camera,
  directionState: NeuralCoreSceneDirectionState,
  elapsedSeconds: number,
  narrativeState: NeuralCoreNarrativeState,
  safeDeltaSeconds: number,
  viewportWidth: number,
  viewportHeight: number,
): void => {
  context.labelsAdvance({
    camera,
    cameraLocalPosition: context.cameraLocalPosition,
    deltaSeconds: safeDeltaSeconds,
    directionState,
    elapsedSeconds,
    inspectionFocus: context.inspectionFocus,
    interactionMode: context.inspectionState.mode,
    isContextPanelOpen: context.inspectionState.mode === "inspection"
      && context.inspectionConfig.panel.enabled
      && context.inspectionFocus.selectedClusterId !== undefined,
    narrativeState,
    network: context.networkRef.current,
    viewport: { width: viewportWidth, height: viewportHeight },
    clusterGrammarEnabled: context.clusterGrammar.enabled,
    clusterGrammarVisibleTerritoryIds: context.clusterGrammarRuntime.visibleTerritoryIds,
  });
};
