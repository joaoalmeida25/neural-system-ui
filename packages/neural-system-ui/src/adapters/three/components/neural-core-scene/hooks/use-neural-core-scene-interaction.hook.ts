import { OrbitControls } from "@react-three/drei";
import {
  useCallback,
  useEffect,
  useRef,
  type ComponentRef,
  type RefObject,
} from "react";
import { Camera, Group, Raycaster, Sphere, Vector2, Vector3 } from "three";

import type {
  NeuralCoreInspectionConfig,
  NeuralCoreInspectionState,
} from "../../../../../domain/inspection/neural-core-inspection.types";
import type { NeuralCoreTopology } from "../../../../../domain/topology/neural-core-topology.types";
import { isNeuralCoreInspectionPickCandidateBetter } from "../../../../../visualization/inspection/neural-core-inspection-focus.utils";
import type {
  NeuralCoreInspectionFocusState,
  NeuralCoreInspectionPickCandidate,
} from "../../../../../visualization/inspection/neural-core-inspection-focus.types";
import type { NeuralCoreTopologyVisualState } from "../../../../../visualization/topology/neural-core-topology-visual.types";
import type { NeuralCoreVector3 } from "../../../../../visualization/graph/neural-core-graph.types";

export type NeuralCoreCameraTransitionKind = "focus" | "overview" | "presentation";

export interface NeuralCoreCameraTransitionRuntime {
  active: boolean;
  elapsedSeconds: number;
  durationSeconds: number;
  kind: NeuralCoreCameraTransitionKind;
  startPosition: Vector3;
  startTarget: Vector3;
  endPosition: Vector3;
  endTarget: Vector3;
}

interface UseNeuralCoreSceneInteractionParams {
  cameraResetRevision: number;
  cameraWorldTargetRef: RefObject<NeuralCoreVector3>;
  canvas: HTMLCanvasElement;
  inspectionConfig: NeuralCoreInspectionConfig;
  inspectionFocus: NeuralCoreInspectionFocusState;
  inspectionState: NeuralCoreInspectionState;
  networkRef: RefObject<Group | null>;
  onCameraTransitioningChange: (transitioning: boolean) => void;
  onSelectCluster: (clusterId?: string) => void;
  orbitControlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>;
  sceneCamera: Camera;
  spatialTopology: NeuralCoreTopology;
  topologyVisualState: NeuralCoreTopologyVisualState;
}

interface UseNeuralCoreSceneInteractionResult {
  cameraTransitionRef: RefObject<NeuralCoreCameraTransitionRuntime>;
  cancelCameraTransition: () => void;
  inspectionViewDirectionRef: RefObject<Vector3>;
  inspectionWorldCenterRef: RefObject<Vector3>;
  pickingCenterRef: RefObject<Vector3>;
  pickingHitRef: RefObject<Vector3>;
}

export const useNeuralCoreSceneInteraction = ({
  cameraResetRevision,
  cameraWorldTargetRef,
  canvas,
  inspectionConfig,
  inspectionFocus,
  inspectionState,
  networkRef,
  onCameraTransitioningChange,
  onSelectCluster,
  orbitControlsRef,
  sceneCamera,
  spatialTopology,
  topologyVisualState,
}: UseNeuralCoreSceneInteractionParams): UseNeuralCoreSceneInteractionResult => {
  const cameraTransitionRef = useRef<NeuralCoreCameraTransitionRuntime>({
    active: false,
    elapsedSeconds: 0,
    durationSeconds: inspectionConfig.camera.focusTransitionSeconds,
    kind: "overview",
    startPosition: new Vector3(),
    startTarget: new Vector3(),
    endPosition: new Vector3(),
    endTarget: new Vector3(),
  });
  const inspectionWorldCenterRef = useRef(new Vector3());
  const inspectionViewDirectionRef = useRef(new Vector3());
  const pickingRaycasterRef = useRef(new Raycaster());
  const pickingPointerRef = useRef(new Vector2());
  const pickingSphereRef = useRef(new Sphere());
  const pickingCenterRef = useRef(new Vector3());
  const pickingHitRef = useRef(new Vector3());
  const pickingScaleRef = useRef(new Vector3());
  const pointerRuntimeRef = useRef({ clientX: 0, clientY: 0, pointerId: -1 });

  const beginCameraTransition = useCallback((
    kind: NeuralCoreCameraTransitionKind,
    endTarget: Vector3,
    endPosition: Vector3,
  ): void => {
    const transition = cameraTransitionRef.current;
    const controls = orbitControlsRef.current;
    transition.active = true;
    transition.elapsedSeconds = 0;
    transition.durationSeconds = inspectionConfig.camera.focusTransitionSeconds;
    transition.kind = kind;
    transition.startPosition.copy(sceneCamera.position);
    transition.startTarget.copy(controls?.target ?? inspectionWorldCenterRef.current);
    transition.endTarget.copy(endTarget);
    transition.endPosition.copy(endPosition);
    onCameraTransitioningChange(true);
  }, [
    inspectionConfig.camera.focusTransitionSeconds,
    onCameraTransitioningChange,
    orbitControlsRef,
    sceneCamera,
  ]);

  const cancelCameraTransition = useCallback((): void => {
    if (!cameraTransitionRef.current.active) {
      return;
    }
    cameraTransitionRef.current.active = false;
    onCameraTransitioningChange(false);
  }, [onCameraTransitioningChange]);

  const previousInteractionModeRef = useRef(inspectionState.mode);
  useEffect(() => {
    const previousMode = previousInteractionModeRef.current;
    previousInteractionModeRef.current = inspectionState.mode;
    if (previousMode === inspectionState.mode) {
      return;
    }
    const controls = orbitControlsRef.current;
    if (inspectionState.mode === "inspection") {
      cameraTransitionRef.current.active = false;
      inspectionWorldCenterRef.current.set(
        cameraWorldTargetRef.current[0],
        cameraWorldTargetRef.current[1],
        cameraWorldTargetRef.current[2],
      );
      controls?.target.copy(inspectionWorldCenterRef.current);
      controls?.update();
      onCameraTransitioningChange(false);
      return;
    }
    inspectionWorldCenterRef.current.set(
      cameraWorldTargetRef.current[0],
      cameraWorldTargetRef.current[1],
      cameraWorldTargetRef.current[2],
    );
    inspectionViewDirectionRef.current.copy(sceneCamera.position);
    beginCameraTransition(
      "presentation",
      inspectionWorldCenterRef.current,
      inspectionViewDirectionRef.current,
    );
  }, [
    beginCameraTransition,
    cameraWorldTargetRef,
    inspectionState.mode,
    onCameraTransitioningChange,
    orbitControlsRef,
    sceneCamera,
  ]);

  useEffect(() => {
    if (
      inspectionState.mode !== "inspection"
      || !inspectionConfig.behavior.focusSelectedCluster
      || !inspectionFocus.selectedClusterId
    ) {
      return;
    }
    const region = topologyVisualState.lookups.clusterRegionById[
      inspectionFocus.selectedClusterId
    ];
    const network = networkRef.current;
    if (!region || !network) {
      return;
    }
    network.updateWorldMatrix(true, false);
    const focusCenter = inspectionWorldCenterRef.current;
    focusCenter.set(region.center[0], region.center[1], region.center[2]);
    focusCenter.applyMatrix4(network.matrixWorld);
    const controlsTarget = orbitControlsRef.current?.target ?? focusCenter;
    const viewDirection = inspectionViewDirectionRef.current;
    viewDirection.subVectors(sceneCamera.position, controlsTarget);
    if (viewDirection.lengthSq() <= 0.000001) {
      viewDirection.set(0, 0, 1);
    } else {
      viewDirection.normalize();
    }
    const transition = cameraTransitionRef.current;
    transition.endPosition.copy(focusCenter).addScaledVector(
      viewDirection,
      inspectionConfig.camera.focusDistance,
    );
    beginCameraTransition("focus", focusCenter, transition.endPosition);
  }, [
    beginCameraTransition,
    inspectionConfig.behavior.focusSelectedCluster,
    inspectionConfig.camera.focusDistance,
    inspectionFocus.selectedClusterId,
    inspectionState.mode,
    networkRef,
    orbitControlsRef,
    sceneCamera,
    topologyVisualState,
  ]);

  const previousCameraResetRevisionRef = useRef(cameraResetRevision);
  useEffect(() => {
    if (previousCameraResetRevisionRef.current === cameraResetRevision) {
      return;
    }
    previousCameraResetRevisionRef.current = cameraResetRevision;
    if (inspectionState.mode !== "inspection") {
      return;
    }
    const network = networkRef.current;
    const center = inspectionWorldCenterRef.current;
    if (network) {
      network.updateWorldMatrix(true, false);
      network.getWorldPosition(center);
    } else {
      center.set(0, 0, 0);
    }
    const transition = cameraTransitionRef.current;
    transition.endPosition.set(
      center.x,
      center.y,
      center.z + Math.min(
        inspectionConfig.camera.maximumDistance,
        Math.max(inspectionConfig.camera.minimumDistance, 4.35),
      ),
    );
    beginCameraTransition("overview", center, transition.endPosition);
  }, [
    beginCameraTransition,
    cameraResetRevision,
    inspectionConfig.camera.maximumDistance,
    inspectionConfig.camera.minimumDistance,
    inspectionState.mode,
    networkRef,
  ]);

  useEffect(() => {
    const pointerRuntime = pointerRuntimeRef.current;
    const handlePointerDown = (event: PointerEvent): void => {
      if (inspectionState.mode !== "inspection" || event.button !== 0) {
        return;
      }
      pointerRuntime.clientX = event.clientX;
      pointerRuntime.clientY = event.clientY;
      pointerRuntime.pointerId = event.pointerId;
    };
    const handlePointerUp = (event: PointerEvent): void => {
      if (
        inspectionState.mode !== "inspection"
        || event.button !== 0
        || pointerRuntime.pointerId !== event.pointerId
      ) {
        return;
      }
      pointerRuntime.pointerId = -1;
      if (Math.hypot(
        event.clientX - pointerRuntime.clientX,
        event.clientY - pointerRuntime.clientY,
      ) > 5) {
        return;
      }
      const network = networkRef.current;
      if (!network) {
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      const pointer = pickingPointerRef.current;
      pointer.set(
        (event.clientX - bounds.left) / bounds.width * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      const raycaster = pickingRaycasterRef.current;
      raycaster.setFromCamera(pointer, sceneCamera);
      network.updateWorldMatrix(true, false);
      network.getWorldScale(pickingScaleRef.current);
      const worldScale = Math.max(
        Math.abs(pickingScaleRef.current.x),
        Math.abs(pickingScaleRef.current.y),
        Math.abs(pickingScaleRef.current.z),
      );
      let bestCandidate: NeuralCoreInspectionPickCandidate | undefined;
      for (const region of topologyVisualState.clusterRegions) {
        const center = pickingCenterRef.current;
        center.set(region.center[0], region.center[1], region.center[2]);
        center.applyMatrix4(network.matrixWorld);
        const sphere = pickingSphereRef.current;
        sphere.center.copy(center);
        sphere.radius = region.radius * worldScale;
        if (!raycaster.ray.intersectSphere(sphere, pickingHitRef.current)) {
          continue;
        }
        const cluster = spatialTopology.clusters.find(
          (candidate) => candidate.id === region.clusterId,
        );
        const candidate: NeuralCoreInspectionPickCandidate = {
          clusterId: region.clusterId,
          distanceToCamera: sceneCamera.position.distanceTo(center),
          distanceToRay: Math.sqrt(raycaster.ray.distanceSqToPoint(center))
            / Math.max(0.0001, sphere.radius),
          priority: cluster?.positionHint?.priority ?? cluster?.importance ?? 0,
        };
        if (isNeuralCoreInspectionPickCandidateBetter(candidate, bestCandidate)) {
          bestCandidate = candidate;
        }
      }
      if (bestCandidate) {
        onSelectCluster(bestCandidate.clusterId);
      }
    };
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    return (): void => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    canvas,
    inspectionState.mode,
    networkRef,
    onSelectCluster,
    sceneCamera,
    spatialTopology.clusters,
    topologyVisualState.clusterRegions,
  ]);

  return {
    cameraTransitionRef,
    cancelCameraTransition,
    inspectionViewDirectionRef,
    inspectionWorldCenterRef,
    pickingCenterRef,
    pickingHitRef,
  };
};
