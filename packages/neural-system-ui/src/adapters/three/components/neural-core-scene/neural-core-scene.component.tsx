import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  createRef,
  useEffect,
  useMemo,
  useRef,
  type ComponentRef,
  type ReactElement,
} from "react";
import {
  type BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  Points,
  ShaderMaterial,
  Vector3,
} from "three";

import {
  createNeuralCorePropagationBufferState,
  createNeuralCorePropagationBufferDimensionsKey,
} from "../../../../visualization/propagation/neural-core-propagation-buffer.utils";
import { useNeuralCorePropagation } from "../../hooks/use-neural-core-propagation/use-neural-core-propagation.hook";
import { createNeuralCoreGraph } from "../../../../visualization/graph/neural-core-graph.utils";
import { mapNeuralCoreTopologyToVisualState } from "../../../../visualization/topology/neural-core-topology-visual.mapper";
import { useNeuralCoreChoreography } from "../../hooks/use-neural-core-choreography/use-neural-core-choreography.hook";
import {
  createNeuralCoreSemanticBufferDimensionsKey,
  createNeuralCoreSemanticBufferState,
} from "../../../../visualization/semantic/neural-core-semantic-buffer.utils";
import { createNeuralCoreSemanticVisualRuntime } from "../../../../visualization/semantic/neural-core-semantic-visual.mapper";
import type {
  NeuralCoreSemanticBufferState,
} from "../../../../visualization/semantic/neural-core-semantic-buffer.types";
import type { NeuralCoreVector3 } from "../../../../visualization/graph/neural-core-graph.types";
import { useNeuralCoreSceneDirection } from "../../hooks/use-neural-core-scene-direction/use-neural-core-scene-direction.hook";
import { useNeuralCoreNarrative } from "../../hooks/use-neural-core-narrative/use-neural-core-narrative.hook";
import { mapNeuralCoreNarrativeToVisualState } from "../../../../visualization/narrative/neural-core-narrative-visual.mapper";
import { NeuralCoreSceneView } from "./neural-core-scene-view.component";
import { useNeuralCoreSceneInteraction } from "./hooks/use-neural-core-scene-interaction.hook";
import {
  updateNeuralCoreSceneCameraFrame,
  updateNeuralCoreSceneLabelsFrame,
  updateNeuralCoreSceneMotionFrame,
  type NeuralCoreSceneCameraFrameContext,
  type NeuralCoreSceneMotionRuntime,
} from "./frame/neural-core-scene-camera.frame";
import {
  updateNeuralCoreSceneAmbientObjectsFrame,
  updateNeuralCoreSceneEnvironmentFrame,
  updateNeuralCoreSceneFogFrame,
  type NeuralCoreSceneEnvironmentFrameContext,
} from "./frame/neural-core-scene-environment.frame";
import {
  updateNeuralCoreSceneFocusHaloFrame,
  updateNeuralCoreSceneSelectedEnvelopeFrame,
  type NeuralCoreSceneFocusFrameContext,
} from "./frame/neural-core-scene-focus.frame";
import {
  updateNeuralCoreSceneFocusLensFrame,
  updateNeuralCoreSceneInspectionCssFrame,
  updateNeuralCoreSceneInspectionDensityFrame,
  type NeuralCoreSceneInspectionFrameContext,
} from "./frame/neural-core-scene-inspection.frame";
import {
  updateNeuralCoreSceneClusterGrammarFrame,
  updateNeuralCoreSceneOperationalRouteFrame,
  type NeuralCoreSceneOperationalFrameContext,
} from "./frame/neural-core-scene-operational.frame";
import {
  advanceNeuralCoreSceneNarrativeFrame,
  updateNeuralCoreScenePropagationFrame,
  updateNeuralCoreSceneSemanticBufferFrame,
  type NeuralCoreSceneChoreographyLoopRuntime,
  type NeuralCoreSceneNarrativeFrameContext,
  type NeuralCoreScenePropagationFrameContext,
  type NeuralCoreSceneSemanticBufferFrameContext,
} from "./frame/neural-core-scene-semantic.frame";
import {
  getPropagationActivity,
  markAttributeForUpdate,
} from "./neural-core-scene-frame.utils";
import type { NeuralCoreSceneProps } from "./neural-core-scene-view.types";
import { EMPTY_NEURAL_CORE_TOPOLOGY } from "../../../../domain/topology/neural-core-topology.constants";
import {
  createNeuralCoreSpatialIdentityKey,
  createNeuralCoreSpatialMap,
} from "../../../../visualization/spatial/neural-core-spatial-map.mapper";
import type { NeuralCoreSpatialMap } from "../../../../visualization/spatial/neural-core-spatial-map.types";
import { useNeuralCoreClusterLabels } from "../../hooks/use-neural-core-cluster-labels/use-neural-core-cluster-labels.hook";
import { NeuralCoreClusterLabelOverlay } from "../neural-core-cluster-label-overlay/neural-core-cluster-label-overlay.component";
import { mapNeuralCoreInspectionDirectionState } from "../../../../visualization/inspection/neural-core-inspection-focus.mapper";
import { resolveNeuralCoreSimulationDelta } from "../../../../domain/inspection/neural-core-inspection.utils";
import {
  createNeuralCoreVisualDensityRuntime,
} from "../../../../visualization/inspection/neural-core-visual-density.utils";
import { mapNeuralCoreInspectionVisibilityState } from "../../../../visualization/inspection/neural-core-inspection-visibility.mapper";
import {
  createNeuralCoreCameraRenderingProfile,
} from "../../../../visualization/inspection/neural-core-camera-rendering.utils";
import type { NeuralCoreElementVisualComposition } from "../../../../visualization/inspection/neural-core-element-visual-composition.types";
import { mapNeuralCoreClusterGrammar } from "../../../../visualization/cluster-grammar/neural-core-cluster-grammar.mapper";
import {
  createNeuralCoreClusterGrammarBufferState,
  createNeuralCoreClusterGrammarRuntime,
} from "../../../../visualization/cluster-grammar/neural-core-cluster-expansion.mapper";
import {
  createNeuralCoreAggregatedPulseField,
  createNeuralCoreAggregatedRouteRenderField,
} from "../../../../visualization/cluster-grammar/neural-core-cluster-grammar-render.mapper";
import type {
  NeuralCoreAggregatedRoute,
  NeuralCoreClusterGrammarDensity,
  NeuralCoreClusterGrammarFocus,
} from "../../../../visualization/cluster-grammar/neural-core-cluster-grammar.types";
import {
  mapNeuralCoreAggregatedRoutes,
} from "../../../../visualization/cluster-grammar/neural-core-aggregated-route.mapper";
import {
  NeuralCoreClusterTerritoriesView,
} from "../neural-core-cluster-territories/neural-core-cluster-territories-view.component";
import {
  NeuralCoreAggregatedRoutesView,
} from "../neural-core-aggregated-routes/neural-core-aggregated-routes-view.component";
import {
  createNeuralCoreSemanticFocusLensRuntime,
} from "../../../../visualization/focus-lens/neural-core-semantic-focus-lens.mapper";
import type {
  WriteNeuralCoreSemanticFocusLensTargetParams,
} from "../../../../visualization/focus-lens/neural-core-semantic-focus-lens.types";
import {
  NEURAL_CORE_TOPOLOGY_STATUS_COLORS,
} from "../../../../visualization/topology/neural-core-topology-visual.constants";
import {
  mapOperationalRouteEventToVisualChannel,
} from "../../../../visualization/cluster-grammar/neural-core-operational-route-visual-channel.mapper";
import {
  mapOperationalVisualChannelToPropagation,
} from "../../../../visualization/cluster-grammar/neural-core-operational-propagation.mapper";
const EMPTY_NEURAL_CORE_AGGREGATED_ROUTES: readonly NeuralCoreAggregatedRoute[] = [];
const EMPTY_NEURAL_CORE_ROUTE_INDEX_BY_SYNAPSE_ID: Readonly<
  Record<string, number>
> = {};

const createOperationalRouteIndexBySynapseId = (
  routes: readonly NeuralCoreAggregatedRoute[],
): Readonly<Record<string, number>> => {
  const routeIndexBySynapseId: Record<string, number> = {};
  routes.forEach((route, routeIndex): void => {
    for (const synapseId of route.synapseIds) {
      routeIndexBySynapseId[synapseId] = routeIndex;
    }
  });
  return routeIndexBySynapseId;
};

const SCENE_VISUAL_COMPOSITION: NeuralCoreElementVisualComposition = {
  opacity: 1,
  brightness: 1,
  scale: 1,
  thickness: 1,
};

export const NeuralCoreScene = ({
  clusterLabelConfig,
  clusterGrammarConfig,
  semanticFocusLensConfig,
  choreography,
  lodConfig,
  narrative,
  narrativeConfig,
  topology,
  propagationConfig,
  sceneDirection,
  sceneDirectionConfig,
  sceneMotionConfig,
  semanticVisualizationConfig,
  spatialMap,
  spatialLayoutConfig,
  onNarrativeStateChange,
  onPropagationEvent,
  runtimeScenarioKey,
  runtimePlaybackStatus,
  runtimePlaybackPaused = false,
  runtimeFocusedClusterId,
  operationalVisualOverlay,
  operationalPropagationInput,
  operationalRouteProgressRef,
  cameraResetRevision,
  inspectionConfig,
  inspectionFocus,
  inspectionState,
  onCameraTransitioningChange,
  onSelectCluster,
}: NeuralCoreSceneProps): ReactElement => {
  const { camera: sceneCamera, gl, scene } = useThree();
  const ambientPulseMaterialRef = useRef<ShaderMaterial | null>(null);
  const baseRef = useRef<Group | null>(null);
  const clusterActivationColorRef = useRef<BufferAttribute | null>(null);
  const clusterActivationGeometryRef = useRef<BufferGeometry | null>(null);
  const clusterActivationPositionRef = useRef<BufferAttribute | null>(null);
  const clusterActivationOpacityRef = useRef<BufferAttribute | null>(null);
  const clusterActivationSizeRef = useRef<BufferAttribute | null>(null);
  const aggregatedPulseColorRef = useRef<BufferAttribute | null>(null);
  const aggregatedPulseGeometryRef = useRef<BufferGeometry | null>(null);
  const aggregatedPulseOpacityRef = useRef<BufferAttribute | null>(null);
  const aggregatedPulsePositionRef = useRef<BufferAttribute | null>(null);
  const aggregatedPulseSizeRef = useRef<BufferAttribute | null>(null);
  const aggregatedRouteOpacityRef = useRef<BufferAttribute | null>(null);
  const aggregatedRouteColorRef = useRef<BufferAttribute | null>(null);
  const aggregatedRouteThicknessRef = useRef<BufferAttribute | null>(null);
  const clusterGrammarRibbonOpacityRef = useRef<BufferAttribute | null>(null);
  const connectionRef = useRef<Group | null>(null);
  const coreRef = useRef<Group | null>(null);
  const focusHaloMaterialRef = useRef<MeshBasicMaterial | null>(null);
  const focusHaloRef = useRef<Mesh | null>(null);
  const selectedEnvelopeMaterialRef = useRef<ShaderMaterial | null>(null);
  const selectedEnvelopeRef = useRef<Mesh | null>(null);
  const hubRef = useRef<Group | null>(null);
  const networkRef = useRef<Group | null>(null);
  const orbitControlsRef = useRef<ComponentRef<typeof OrbitControls> | null>(null);
  const nodeCloudRef = useRef<Group | null>(null);
  const particleMaterialRef = useRef<ShaderMaterial | null>(null);
  const particlePositionRef = useRef<BufferAttribute | null>(null);
  const propagationPulseColorRef = useRef<BufferAttribute | null>(null);
  const propagationPulseGeometryRef = useRef<BufferGeometry | null>(null);
  const propagationPulsePositionRef = useRef<BufferAttribute | null>(null);
  const propagationPulseOpacityRef = useRef<BufferAttribute | null>(null);
  const propagationPulseSizeRef = useRef<BufferAttribute | null>(null);
  const operationalProtagonistMarkerColorRef = useRef<BufferAttribute | null>(null);
  const operationalProtagonistMarkerGeometryRef = useRef<BufferGeometry | null>(null);
  const operationalProtagonistMarkerMaterialRef = useRef<ShaderMaterial | null>(null);
  const operationalProtagonistMarkerOpacityRef = useRef<BufferAttribute | null>(null);
  const operationalProtagonistMarkerPositionRef = useRef<BufferAttribute | null>(null);
  const operationalProtagonistMarkerSizeRef = useRef<BufferAttribute | null>(null);
  const operationalProtagonistMarkerTangentRef = useRef<BufferAttribute | null>(null);
  const pulseColorRef = useRef<BufferAttribute | null>(null);
  const pulsePositionRef = useRef<BufferAttribute | null>(null);
  const ringRef = useRef<Group | null>(null);
  const semanticRibbonColorRef = useRef<BufferAttribute | null>(null);
  const semanticRibbonFragmentationRef = useRef<BufferAttribute | null>(null);
  const semanticRibbonInstabilityRef = useRef<BufferAttribute | null>(null);
  const semanticRibbonInterruptionRef = useRef<BufferAttribute | null>(null);
  const semanticRibbonMaterialRef = useRef<ShaderMaterial | null>(null);
  const semanticRibbonOpacityRef = useRef<BufferAttribute | null>(null);
  const semanticRibbonPulseFrequencyRef = useRef<BufferAttribute | null>(null);
  const semanticRibbonPulseIntensityRef = useRef<BufferAttribute | null>(null);
  const semanticRibbonThicknessRef = useRef<BufferAttribute | null>(null);
  const semanticBufferStateRef = useRef<NeuralCoreSemanticBufferState | undefined>(undefined);
  const initialVisualDensityRuntime = useMemo(
    () => createNeuralCoreVisualDensityRuntime(),
    [],
  );
  const initialCameraRenderingProfile = useMemo(
    () => createNeuralCoreCameraRenderingProfile(),
    [],
  );
  const visualDensityRuntimeRef = useRef(initialVisualDensityRuntime);
  const cameraRenderingProfileRef = useRef(initialCameraRenderingProfile);
  const spatialMapRuntimeRef = useRef<NeuralCoreSpatialMap | undefined>(undefined);
  const choreographyLoopRuntimeRef = useRef<NeuralCoreSceneChoreographyLoopRuntime>({
    timelineSeconds: 0,
  });
  const narrativePhaseKeyRef = useRef("");
  const simulationElapsedSecondsRef = useRef(0);
  const runtimeVisualElapsedSecondsRef = useRef(0);
  const aggregatedPulseSuppressionRef = useRef(1);
  const operationalRouteOpacityMultiplierRef = useRef(1);
  const operationalRouteThicknessMultiplierRef = useRef(1);
  const operationalRouteRenderIndexRef = useRef<number | undefined>(undefined);
  const previousRuntimePlaybackStatusRef = useRef(runtimePlaybackStatus);
  if (previousRuntimePlaybackStatusRef.current !== runtimePlaybackStatus) {
    const previousRuntimeStatus = previousRuntimePlaybackStatusRef.current;
    previousRuntimePlaybackStatusRef.current = runtimePlaybackStatus;
    if (
      runtimePlaybackStatus === "running"
      && (
        previousRuntimeStatus === undefined
        || previousRuntimeStatus === "idle"
        || previousRuntimeStatus === "completed"
      )
    ) {
      runtimeVisualElapsedSecondsRef.current = 0;
    }
  }
  const motionRuntimeRef = useRef<NeuralCoreSceneMotionRuntime>({
    particleTime: 0,
    rotationSpeed: 0,
    rotationX: sceneMotionConfig.horizontalOrientationX,
    rotationY: sceneMotionConfig.horizontalOrientationY,
    rotationZ: sceneMotionConfig.horizontalOrientationZ,
    smoothedActivity: 0,
    smoothedBreathingMultiplier: 1,
    smoothedParticleMultiplier: 1,
    smoothedRotationMultiplier: 1,
  });
  const cameraWorldPositionRef = useRef<NeuralCoreVector3>([0, 0, 4.35]);
  const cameraWorldTargetRef = useRef<NeuralCoreVector3>([0, 0, 0]);
  const cameraLocalVectorRef = useRef(new Vector3());
  const cameraDistanceTargetWorldRef = useRef(new Vector3());
  const cameraLocalPositionRef = useRef<NeuralCoreVector3>([0, 0, 4.35]);
  const haloWorldPositionRef = useRef<NeuralCoreVector3>([0, 0, 0]);
  const inspectionRootRef = useRef<HTMLElement | null>(null);
  const inspectionCssValuesRef = useRef({
    base: "1.000",
    globalGlow: "1.000",
    microFocus: "0.000",
  });
  const clusterGrammarFocusRef = useRef<NeuralCoreClusterGrammarFocus>({
    relatedClusterIds: [],
    narrativeClusterIds: [],
    narrativeSynapseIds: [],
    narrativePathwayIds: [],
  });
  const clusterGrammarDensityRef = useRef<NeuralCoreClusterGrammarDensity>({
    macroWeight: 1,
    mesoWeight: 0,
    microWeight: 0,
  });
  const focusLensParamsRef = useRef<WriteNeuralCoreSemanticFocusLensTargetParams>({
    interactionMode: "presentation",
    cameraDistanceToBrain: 4.35,
    densityWeights: clusterGrammarDensityRef.current,
  });
  const focusLensRuntime = useMemo(() => {
    return createNeuralCoreSemanticFocusLensRuntime(semanticFocusLensConfig);
  }, [semanticFocusLensConfig]);
  const focusLensTarget = useMemo(() => {
    return createNeuralCoreSemanticFocusLensRuntime(semanticFocusLensConfig);
  }, [semanticFocusLensConfig]);
  const haloTargetColor = useMemo(() => new Color("#82efff"), []);
  const graph = useMemo(() => createNeuralCoreGraph(), []);
  const spatialTopology = topology ?? EMPTY_NEURAL_CORE_TOPOLOGY;
  const spatialIdentityKey = useMemo(() => {
    return createNeuralCoreSpatialIdentityKey(
      spatialTopology,
      spatialLayoutConfig,
      spatialMap,
    );
  }, [spatialLayoutConfig, spatialMap, spatialTopology]);
  const resolvedSpatialMap = useMemo(() => {
    return createNeuralCoreSpatialMap({
      topology: spatialTopology,
      config: spatialLayoutConfig,
      explicitMap: spatialMap,
      previousMap: spatialMapRuntimeRef.current,
    });
  }, [spatialIdentityKey]);
  useEffect(() => {
    spatialMapRuntimeRef.current = resolvedSpatialMap;
  }, [resolvedSpatialMap]);
  const topologyVisualState = useMemo(() => {
    return mapNeuralCoreTopologyToVisualState({
      topology: spatialTopology,
      graph,
      config: semanticVisualizationConfig.topology,
      spatialMap: resolvedSpatialMap,
    });
  }, [graph, resolvedSpatialMap, semanticVisualizationConfig.topology, spatialTopology]);
  const {
    cameraTransitionRef,
    cancelCameraTransition,
    inspectionViewDirectionRef,
    inspectionWorldCenterRef,
    pickingCenterRef,
    pickingHitRef,
  } = useNeuralCoreSceneInteraction({
    cameraResetRevision,
    cameraWorldTargetRef,
    canvas: gl.domElement,
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
  });
  const clusterGrammar = useMemo(() => {
    return mapNeuralCoreClusterGrammar({
      config: clusterGrammarConfig,
      graph,
      topology: spatialTopology,
      topologyVisualState,
    });
  }, [clusterGrammarConfig, graph, spatialTopology, topologyVisualState]);
  const operationalFallbackRoutes = useMemo(() => {
    return clusterGrammar.enabled
      ? EMPTY_NEURAL_CORE_AGGREGATED_ROUTES
      : mapNeuralCoreAggregatedRoutes(spatialTopology, topologyVisualState);
  }, [clusterGrammar.enabled, spatialTopology, topologyVisualState]);
  const operationalFallbackRouteIndexBySynapseId = useMemo(() => {
    return operationalFallbackRoutes.length > 0
      ? createOperationalRouteIndexBySynapseId(operationalFallbackRoutes)
      : EMPTY_NEURAL_CORE_ROUTE_INDEX_BY_SYNAPSE_ID;
  }, [operationalFallbackRoutes]);
  const operationalAggregatedRoutes = clusterGrammar.enabled
    ? clusterGrammar.routes
    : operationalFallbackRoutes;
  const operationalRouteIndexBySynapseId = clusterGrammar.enabled
    ? clusterGrammar.lookups.routeIndexBySynapseId
    : operationalFallbackRouteIndexBySynapseId;
  const operationalRouteVisualChannel = useMemo(() => {
    if (!operationalPropagationInput) {
      return undefined;
    }
    return mapOperationalRouteEventToVisualChannel({
      request: operationalPropagationInput,
      aggregatedRoutes: operationalAggregatedRoutes,
      routeIndexBySynapseId: operationalRouteIndexBySynapseId,
      visualMode: "aggregated",
    });
  }, [
    operationalAggregatedRoutes,
    operationalPropagationInput,
    operationalRouteIndexBySynapseId,
  ]);
  const resolvedOperationalPropagationInput = useMemo(() => (
    operationalPropagationInput && operationalRouteVisualChannel
      ? mapOperationalVisualChannelToPropagation({
        channel: operationalRouteVisualChannel,
        request: operationalPropagationInput,
      })
      : undefined
  ), [operationalPropagationInput, operationalRouteVisualChannel]);
  const operationalTransmissionId = resolvedOperationalPropagationInput?.transmission.id;
  const operationalTransmissionActive = operationalRouteVisualChannel !== undefined
    && operationalTransmissionId !== undefined;
  const propagation = useNeuralCorePropagation({
    topology,
    config: propagationConfig,
    externalTransmission: resolvedOperationalPropagationInput?.transmission,
    externalProgressRef: operationalRouteProgressRef,
    onPropagationEvent,
    resetKey: runtimeScenarioKey,
  });
  const choreographyRuntime = useNeuralCoreChoreography({
    choreography,
    config: semanticVisualizationConfig,
    resetKey: runtimeScenarioKey,
  });
  const clusterGrammarRuntime = useMemo(() => {
    return createNeuralCoreClusterGrammarRuntime(clusterGrammar, clusterGrammarConfig);
  }, [clusterGrammar, clusterGrammarConfig]);
  const clusterTerritoryRefs = useMemo(() => {
    return clusterGrammar.territories.map(() => createRef<Group>());
  }, [clusterGrammar.territories]);
  useEffect(() => {
    clusterGrammar.territories.forEach((territory, index): void => {
      const group = clusterTerritoryRefs[index]?.current;
      if (!group) {
        return;
      }
      const status = operationalVisualOverlay?.clusterStateById[territory.clusterId]?.status;
      const color = status && status !== "idle"
        ? NEURAL_CORE_TOPOLOGY_STATUS_COLORS[status]
        : territory.color;
      const boundary = group.children[0] as Mesh | Points | undefined;
      const boundaryMaterial = boundary?.material as ShaderMaterial | undefined;
      const boundaryColor = boundaryMaterial?.uniforms.uColor?.value;
      if (boundaryColor instanceof Color) {
        boundaryColor.set(color);
      }
      const boundarySemanticColor = boundaryMaterial?.userData.semanticColor;
      if (boundarySemanticColor instanceof Color) {
        boundarySemanticColor.set(color);
      }
      const hub = group.children[1] as Group | undefined;
      for (const child of hub?.children ?? []) {
        const material = (child as Mesh).material as MeshBasicMaterial | undefined;
        material?.color?.set(color);
        const semanticColor = material?.userData.semanticColor;
        if (semanticColor instanceof Color) {
          semanticColor.set(color);
        }
      }
    });
  }, [clusterGrammar.territories, clusterTerritoryRefs, operationalVisualOverlay]);
  const networkFogDepth = useMemo(() => {
    let maximumDepth = 1.8;
    for (const region of topologyVisualState.clusterRegions) {
      maximumDepth = Math.max(
        maximumDepth,
        Math.hypot(region.center[0], region.center[1], region.center[2]) + region.radius,
      );
    }
    return maximumDepth;
  }, [topologyVisualState.clusterRegions]);
  const inspectionDirectionState = useMemo(() => {
    return mapNeuralCoreInspectionDirectionState({
      focus: inspectionFocus,
      topologyVisualState,
      dimUnrelatedContext: inspectionConfig.behavior.dimUnrelatedContext,
      highlightRelatedConnections: inspectionConfig.behavior.highlightRelatedConnections,
    });
  }, [
    inspectionConfig.behavior.dimUnrelatedContext,
    inspectionConfig.behavior.highlightRelatedConnections,
    inspectionFocus,
    topologyVisualState,
  ]);
  const inspectionVisibility = useMemo(() => {
    return mapNeuralCoreInspectionVisibilityState({
      inspectionMode: inspectionState.mode === "inspection",
      selectedClusterId: inspectionFocus.selectedClusterId,
      relatedClusterIds: inspectionFocus.relatedClusterIds,
      relatedSynapseIds: inspectionFocus.relatedSynapseIds,
      relatedPathwayIds: inspectionFocus.relatedPathwayIds,
      cameraDistance: inspectionConfig.camera.maximumDistance,
      isContextPanelOpen: inspectionState.mode === "inspection"
        && inspectionConfig.panel.enabled
        && inspectionFocus.selectedClusterId !== undefined,
      config: inspectionConfig.visualDensity,
    });
  }, [
    inspectionConfig.camera.maximumDistance,
    inspectionConfig.panel.enabled,
    inspectionConfig.visualDensity,
    inspectionFocus,
    inspectionState.mode,
  ]);
  const clusterLabels = useNeuralCoreClusterLabels({
    config: clusterLabelConfig,
    lodConfig,
    runtimeScenarioKey,
    spatialMap: resolvedSpatialMap,
    topology: spatialTopology,
    topologyVisualState,
    operationalOverlay: operationalVisualOverlay,
  });
  const directionRuntime = useNeuralCoreSceneDirection({
    timeline: sceneDirection,
    topologyVisualState,
    config: sceneDirectionConfig,
    resetKey: runtimeScenarioKey,
  });
  const narrativeRuntime = useNeuralCoreNarrative({
    narrative,
    resetKey: runtimeScenarioKey,
  });
  const bufferDimensionsKey = createNeuralCorePropagationBufferDimensionsKey(
    propagation.config,
  );
  const propagationBuffers = useMemo(() => {
    return createNeuralCorePropagationBufferState(
      graph,
      topologyVisualState,
      propagation.config,
    );
  }, [bufferDimensionsKey, graph, topologyVisualState]);
  useEffect(() => {
    const field = propagationBuffers.operationalProtagonistMarkerField;
    field.positions.fill(0);
    field.tangents.fill(0);
    field.colors.fill(0);
    field.opacities.fill(0);
    field.sizes.fill(0);
    const endpointReaction = propagationBuffers.operationalEndpointReactionState;
    endpointReaction.sourceClusterId = undefined;
    endpointReaction.sourceWeight = 0;
    endpointReaction.targetClusterId = undefined;
    endpointReaction.targetWeight = 0;
    endpointReaction.red = 0;
    endpointReaction.green = 0;
    endpointReaction.blue = 0;
    operationalProtagonistMarkerGeometryRef.current?.setDrawRange(0, 0);
    markAttributeForUpdate(operationalProtagonistMarkerPositionRef.current);
    markAttributeForUpdate(operationalProtagonistMarkerTangentRef.current);
    markAttributeForUpdate(operationalProtagonistMarkerColorRef.current);
    markAttributeForUpdate(operationalProtagonistMarkerOpacityRef.current);
    markAttributeForUpdate(operationalProtagonistMarkerSizeRef.current);
    return (): void => {
      field.positions.fill(0);
      field.tangents.fill(0);
      field.colors.fill(0);
      field.opacities.fill(0);
      field.sizes.fill(0);
      endpointReaction.sourceClusterId = undefined;
      endpointReaction.sourceWeight = 0;
      endpointReaction.targetClusterId = undefined;
      endpointReaction.targetWeight = 0;
      endpointReaction.red = 0;
      endpointReaction.green = 0;
      endpointReaction.blue = 0;
      operationalProtagonistMarkerGeometryRef.current?.setDrawRange(0, 0);
    };
  }, [operationalTransmissionId, propagationBuffers, runtimeScenarioKey]);
  useEffect(() => {
    aggregatedPulseSuppressionRef.current = 1;
    operationalRouteOpacityMultiplierRef.current = 1;
    operationalRouteThicknessMultiplierRef.current = 1;
    operationalRouteRenderIndexRef.current = undefined;
    const opacityUniform = ambientPulseMaterialRef.current?.uniforms.uOpacity;
    if (opacityUniform) {
      opacityUniform.value = graph.pulseField.opacity;
    }
  }, [clusterGrammar, graph.pulseField.opacity, runtimeScenarioKey]);
  useEffect(() => {
    return (): void => {
      aggregatedPulseSuppressionRef.current = 1;
      operationalRouteOpacityMultiplierRef.current = 1;
      operationalRouteThicknessMultiplierRef.current = 1;
      operationalRouteRenderIndexRef.current = undefined;
      const opacityUniform = ambientPulseMaterialRef.current?.uniforms.uOpacity;
      if (opacityUniform) {
        opacityUniform.value = graph.pulseField.opacity;
      }
      operationalProtagonistMarkerGeometryRef.current?.setDrawRange(0, 0);
    };
  }, [graph.pulseField.opacity]);
  const semanticBufferDimensionsKey = createNeuralCoreSemanticBufferDimensionsKey(
    semanticVisualizationConfig,
  );
  const semanticVisualRuntime = useMemo(() => {
    return propagation.plan
      ? createNeuralCoreSemanticVisualRuntime(
        propagation.plan.topology,
        topologyVisualState,
        semanticVisualizationConfig,
      )
      : undefined;
  }, [propagation.plan, semanticVisualizationConfig, topologyVisualState]);
  const semanticBuffers = useMemo(() => {
    return createNeuralCoreSemanticBufferState(
      graph,
      topologyVisualState,
      semanticVisualizationConfig,
      propagation.plan?.topology,
      semanticBufferStateRef.current,
    );
  }, [graph, propagation.plan, semanticBufferDimensionsKey, topologyVisualState]);
  const clusterGrammarBuffers = useMemo(() => {
    return createNeuralCoreClusterGrammarBufferState(
      graph,
      semanticBuffers,
      clusterGrammar,
      clusterGrammarConfig,
    );
  }, [clusterGrammar, clusterGrammarConfig, graph, semanticBuffers]);
  const clusterGrammarNodeOpacityRefs = useMemo(() => {
    return graph.nodeClouds.map(() => createRef<BufferAttribute>());
  }, [graph.nodeClouds]);
  const clusterGrammarConnectionOpacityRefs = useMemo(() => {
    return graph.connectionBuffers.map(() => createRef<BufferAttribute>());
  }, [graph.connectionBuffers]);
  const aggregatedRouteField = useMemo(() => {
    return createNeuralCoreAggregatedRouteRenderField(clusterGrammar);
  }, [clusterGrammar]);
  const aggregatedPulseField = useMemo(() => {
    return createNeuralCoreAggregatedPulseField(clusterGrammar);
  }, [clusterGrammar]);
  const aggregatedOperationalRouteColors = useMemo(() => (
    clusterGrammar.routes.map((route) => new Color(route.color))
  ), [clusterGrammar.routes]);
  useEffect(() => {
    for (let routeIndex = 0; routeIndex < clusterGrammar.routes.length; routeIndex += 1) {
      const route = clusterGrammar.routes[routeIndex];
      let status = route.status;
      for (const synapseId of route.synapseIds) {
        const operationalStatus = operationalVisualOverlay?.routeStatusById[synapseId];
        if (operationalStatus !== undefined) {
          status = operationalStatus;
          break;
        }
      }
      if (route.id === operationalRouteVisualChannel?.geometryId) {
        status = operationalRouteVisualChannel.status === "recovering"
          ? "warning"
          : operationalRouteVisualChannel.status;
      }
      const color = aggregatedOperationalRouteColors[routeIndex];
      color.set(status && status !== "idle"
        ? NEURAL_CORE_TOPOLOGY_STATUS_COLORS[status]
        : route.color);
      const routeColorOffset = routeIndex * 3;
      aggregatedPulseField.routeColors[routeColorOffset] = color.r;
      aggregatedPulseField.routeColors[routeColorOffset + 1] = color.g;
      aggregatedPulseField.routeColors[routeColorOffset + 2] = color.b;
    }
    for (
      let vertexIndex = 0;
      vertexIndex < aggregatedRouteField.routeIndices.length;
      vertexIndex += 1
    ) {
      const color = aggregatedOperationalRouteColors[
        aggregatedRouteField.routeIndices[vertexIndex]
      ];
      const colorOffset = vertexIndex * 3;
      aggregatedRouteField.colors[colorOffset] = color.r;
      aggregatedRouteField.colors[colorOffset + 1] = color.g;
      aggregatedRouteField.colors[colorOffset + 2] = color.b;
    }
    markAttributeForUpdate(aggregatedRouteColorRef.current);
  }, [
    aggregatedOperationalRouteColors,
    aggregatedPulseField,
    aggregatedRouteField,
    clusterGrammar.routes,
    operationalRouteVisualChannel,
    operationalVisualOverlay,
  ]);
  useEffect(() => {
    semanticBufferStateRef.current = semanticBuffers;
  }, [semanticBuffers]);
  useEffect(() => {
    inspectionRootRef.current = gl.domElement.closest<HTMLElement>(
      "[data-neural-core-inspection-root]",
    );
  }, [gl]);

  const inspectionFrameContext: NeuralCoreSceneInspectionFrameContext = {
    cameraDistanceTargetWorld: cameraDistanceTargetWorldRef.current,
    cameraProfile: cameraRenderingProfileRef.current,
    clusterGrammarDensity: clusterGrammarDensityRef.current,
    focusLensParams: focusLensParamsRef.current,
    focusLensRuntime,
    focusLensTarget,
    inspectionConfig,
    inspectionCssValuesRef,
    inspectionFocus,
    inspectionRootRef,
    inspectionState,
    inspectionVisibility,
    networkRef,
    orbitControlsRef,
    runtimeFocusedClusterId,
    sceneDirectionConfig,
    semanticFocusLensConfig,
    topologyVisualState,
    visualComposition: SCENE_VISUAL_COMPOSITION,
    visualDensityRuntime: visualDensityRuntimeRef.current,
  };
  const operationalFrameContext: NeuralCoreSceneOperationalFrameContext = {
    aggregatedPulseColorRef,
    aggregatedPulseField,
    aggregatedPulseGeometryRef,
    aggregatedPulseOpacityRef,
    aggregatedPulsePositionRef,
    aggregatedPulseSizeRef,
    aggregatedPulseSuppressionRef,
    aggregatedRouteField,
    aggregatedRouteOpacityRef,
    aggregatedRouteThicknessRef,
    clusterGrammar,
    clusterGrammarBuffers,
    clusterGrammarConfig,
    clusterGrammarConnectionOpacityRefs,
    clusterGrammarDensity: clusterGrammarDensityRef.current,
    clusterGrammarFocus: clusterGrammarFocusRef.current,
    clusterGrammarNodeOpacityRefs,
    clusterGrammarRibbonOpacityRef,
    clusterGrammarRuntime,
    focusLensRuntime,
    graph,
    inspectionFocus,
    operationalProtagonistMarkerMaterialRef,
    operationalRouteOpacityMultiplierRef,
    operationalRouteRenderIndexRef,
    operationalRouteThicknessMultiplierRef,
    semanticFocusLensConfig,
    semanticVisualizationConfig,
  };
  const narrativeFrameContext: NeuralCoreSceneNarrativeFrameContext = {
    choreography,
    choreographyLoopRuntime: choreographyLoopRuntimeRef.current,
    narrativePhaseKeyRef,
    onNarrativeStateChange,
    operationalVisualOverlay,
    resetPropagation: propagation.reset,
    semanticVisualRuntime,
    semanticVisualizationConfig,
  };
  const propagationFrameContext: NeuralCoreScenePropagationFrameContext = {
    clusterActivationColorRef,
    clusterActivationGeometryRef,
    clusterActivationOpacityRef,
    clusterActivationPositionRef,
    clusterActivationSizeRef,
    clusterGrammar,
    clusterGrammarBuffers,
    clusterGrammarRuntime,
    clusterTerritoryRefs,
    focusLensRuntime,
    inspectionFocus,
    inspectionVisibility,
    operationalProtagonistMarkerColorRef,
    operationalProtagonistMarkerGeometryRef,
    operationalProtagonistMarkerOpacityRef,
    operationalProtagonistMarkerPositionRef,
    operationalProtagonistMarkerSizeRef,
    operationalProtagonistMarkerTangentRef,
    propagationBuffers,
    propagationConfig: propagation.config,
    propagationPulseColorRef,
    propagationPulseGeometryRef,
    propagationPulseOpacityRef,
    propagationPulsePositionRef,
    propagationPulseSizeRef,
    sceneDirectionConfig,
    topologyVisualState,
  };
  const semanticBufferFrameContext: NeuralCoreSceneSemanticBufferFrameContext = {
    cameraProfile: cameraRenderingProfileRef.current,
    clusterGrammar,
    connectionRef,
    focusLensRuntime,
    graph,
    inspectionVisibility,
    nodeCloudRef,
    propagationConfig: propagation.config,
    sceneDirectionConfig,
    semanticBuffers,
    semanticRibbonColorRef,
    semanticRibbonFragmentationRef,
    semanticRibbonInstabilityRef,
    semanticRibbonInterruptionRef,
    semanticRibbonMaterialRef,
    semanticRibbonOpacityRef,
    semanticRibbonPulseFrequencyRef,
    semanticRibbonPulseIntensityRef,
    semanticRibbonThicknessRef,
    semanticVisualizationConfig,
  };
  const cameraFrameContext: NeuralCoreSceneCameraFrameContext = {
    cameraLocalPosition: cameraLocalPositionRef.current,
    cameraLocalVector: cameraLocalVectorRef.current,
    cameraTransition: cameraTransitionRef.current,
    cameraWorldPosition: cameraWorldPositionRef.current,
    cameraWorldTarget: cameraWorldTargetRef.current,
    clusterGrammar,
    clusterGrammarRuntime,
    inspectionConfig,
    inspectionFocus,
    inspectionState,
    inspectionViewDirection: inspectionViewDirectionRef.current,
    inspectionWorldCenter: inspectionWorldCenterRef.current,
    labelsAdvance: clusterLabels.advance,
    motion: motionRuntimeRef.current,
    networkRef,
    onCameraTransitioningChange,
    orbitControlsRef,
    pickingHit: pickingHitRef.current,
    propagationConfig: propagation.config,
    sceneMotionConfig,
    semanticVisualizationConfig,
  };
  const focusFrameContext: NeuralCoreSceneFocusFrameContext = {
    clusterGrammar,
    focusHaloMaterialRef,
    focusHaloRef,
    haloTargetColor,
    haloWorldPosition: haloWorldPositionRef.current,
    inspectionConfig,
    inspectionFocus,
    inspectionVisibility,
    narrativeConfig,
    networkRef,
    pickingCenter: pickingCenterRef.current,
    sceneDirectionConfig,
    selectedEnvelopeMaterialRef,
    selectedEnvelopeRef,
    semanticVisualRuntime,
    semanticVisualizationConfig,
    topologyVisualState,
  };
  const environmentFrameContext: NeuralCoreSceneEnvironmentFrameContext = {
    ambientPulseMaterialRef,
    baseRef,
    cameraProfile: cameraRenderingProfileRef.current,
    clusterGrammar,
    clusterGrammarBuffers,
    coreRef,
    focusLensRuntime,
    graph,
    hubRef,
    inspectionConfig,
    inspectionState,
    inspectionVisibility,
    motion: motionRuntimeRef.current,
    networkRef,
    particleMaterialRef,
    particlePositionRef,
    propagationBuffers,
    pulseColorRef,
    pulsePositionRef,
    ringRef,
    sceneDirectionConfig,
    semanticBuffers,
    semanticVisualizationConfig,
    visualComposition: SCENE_VISUAL_COMPOSITION,
  };

  useFrame(({ camera, clock, size, viewport }, deltaSeconds): void => {
    const safeDeltaSeconds = Number.isFinite(deltaSeconds)
      ? Math.max(0, Math.min(0.1, deltaSeconds))
      : 0;
    const simulationDeltaSeconds = resolveNeuralCoreSimulationDelta(
      safeDeltaSeconds,
      inspectionState.isPaused,
    );
    const runtimeDeltaSeconds = runtimePlaybackStatus === undefined
      || (!runtimePlaybackPaused && (
        runtimePlaybackStatus === "running"
        || runtimePlaybackStatus === "failed"
        || runtimePlaybackStatus === "recovering"
      ))
      ? simulationDeltaSeconds
      : 0;
    simulationElapsedSecondsRef.current += simulationDeltaSeconds;
    const elapsedTime = simulationElapsedSecondsRef.current;
    runtimeVisualElapsedSecondsRef.current += runtimeDeltaSeconds;
    const propagationElapsedTime = runtimePlaybackStatus === undefined
      ? elapsedTime
      : runtimeVisualElapsedSecondsRef.current;
    const propagationVisualState = propagation.advance(runtimeDeltaSeconds);
    const choreographyEvaluation = choreographyRuntime.advance(simulationDeltaSeconds);
    const directionState = directionRuntime.advance(
      inspectionState.mode === "presentation" ? runtimeDeltaSeconds : 0,
    );
    const effectiveDirectionState = inspectionState.mode === "inspection"
      && inspectionFocus.selectedClusterId !== undefined
      ? inspectionDirectionState
      : directionState;
    const narrativeState = narrativeRuntime.advance(
      runtimeDeltaSeconds,
      choreography ? choreographyEvaluation.timelineSeconds : undefined,
    );
    const narrativeVisualState = mapNeuralCoreNarrativeToVisualState(narrativeState);
    const relevantCameraDistance = updateNeuralCoreSceneInspectionDensityFrame(
      inspectionFrameContext,
      camera,
      safeDeltaSeconds,
    );
    const cameraProfile = cameraRenderingProfileRef.current;
    updateNeuralCoreSceneFocusLensFrame(
      inspectionFrameContext,
      camera,
      relevantCameraDistance,
      safeDeltaSeconds,
    );
    updateNeuralCoreSceneOperationalRouteFrame(
      operationalFrameContext,
      operationalTransmissionActive,
      operationalRouteVisualChannel,
      safeDeltaSeconds,
      size.width,
      size.height,
      viewport.dpr,
    );
    updateNeuralCoreSceneClusterGrammarFrame(
      operationalFrameContext,
      effectiveDirectionState,
      narrativeState,
      operationalTransmissionActive,
      operationalRouteVisualChannel,
      operationalVisualOverlay,
      propagationElapsedTime,
      propagationVisualState,
      safeDeltaSeconds,
    );
    updateNeuralCoreSceneInspectionCssFrame(
      inspectionFrameContext,
      effectiveDirectionState,
      narrativeState,
    );
    const semanticVisualState = advanceNeuralCoreSceneNarrativeFrame(
      narrativeFrameContext,
      choreographyEvaluation,
      narrativeState,
      propagationVisualState,
    );
    updateNeuralCoreScenePropagationFrame(
      propagationFrameContext,
      cameraProfile,
      effectiveDirectionState,
      operationalRouteVisualChannel,
      operationalTransmissionId,
      propagationElapsedTime,
      propagationVisualState,
    );
    updateNeuralCoreSceneSemanticBufferFrame(
      semanticBufferFrameContext,
      effectiveDirectionState,
      elapsedTime,
      narrativeVisualState,
      propagationElapsedTime,
      safeDeltaSeconds,
      size.height,
      size.width,
      viewport.dpr,
      semanticVisualState,
    );
    const propagationActivity = getPropagationActivity(propagationVisualState);
    updateNeuralCoreSceneMotionFrame(
      cameraFrameContext,
      effectiveDirectionState,
      elapsedTime,
      propagationActivity,
      safeDeltaSeconds,
      simulationDeltaSeconds,
    );
    const networkScale = updateNeuralCoreSceneCameraFrame(
      cameraFrameContext,
      camera,
      directionState,
      safeDeltaSeconds,
    );
    updateNeuralCoreSceneLabelsFrame(
      cameraFrameContext,
      camera,
      directionState,
      clock.getElapsedTime(),
      narrativeState,
      safeDeltaSeconds,
      size.width,
      size.height,
    );
    updateNeuralCoreSceneFocusHaloFrame(
      focusFrameContext,
      camera,
      effectiveDirectionState,
      networkScale,
      safeDeltaSeconds,
      semanticVisualState,
    );
    updateNeuralCoreSceneSelectedEnvelopeFrame(
      focusFrameContext,
      networkScale,
      propagationActivity,
      safeDeltaSeconds,
      semanticVisualState,
    );
    updateNeuralCoreSceneEnvironmentFrame(
      environmentFrameContext,
      effectiveDirectionState,
      narrativeState,
      operationalTransmissionActive,
      safeDeltaSeconds,
    );
    updateNeuralCoreSceneAmbientObjectsFrame(
      environmentFrameContext,
      elapsedTime,
    );
    updateNeuralCoreSceneFogFrame(
      environmentFrameContext,
      networkFogDepth,
      relevantCameraDistance,
      safeDeltaSeconds,
      scene.fog,
    );
  });

  return (
    <NeuralCoreSceneView
      ambientPulseMaterialRef={ambientPulseMaterialRef}
      baseRef={baseRef}
      clusterActivationColorRef={clusterActivationColorRef}
      clusterActivationField={propagationBuffers.clusterField}
      clusterActivationGeometryRef={clusterActivationGeometryRef}
      clusterActivationPositionRef={clusterActivationPositionRef}
      clusterActivationOpacityRef={clusterActivationOpacityRef}
      clusterActivationSizeRef={clusterActivationSizeRef}
      clusterLabelOverlay={clusterLabelConfig.enabled ? (
        <NeuralCoreClusterLabelOverlay
          models={clusterLabels.models}
          fadeInSeconds={clusterLabelConfig.visibility.fadeInSeconds}
          fadeOutSeconds={clusterLabelConfig.visibility.fadeOutSeconds}
          interactionMode={inspectionState.mode}
          selectedClusterId={inspectionState.selectedClusterId}
          onSelectCluster={onSelectCluster}
          registerLabelElement={clusterLabels.registerLabelElement}
          registerLeaderLineElement={clusterLabels.registerLeaderLineElement}
          registerOverlayElement={clusterLabels.registerOverlayElement}
        />
      ) : undefined}
      inspectionCameraControls={(
        <OrbitControls
          ref={orbitControlsRef}
          enabled={inspectionState.mode === "inspection"}
          enableDamping
          dampingFactor={inspectionConfig.camera.dampingFactor}
          enablePan={inspectionConfig.camera.allowPan}
          enableRotate={inspectionConfig.camera.allowRotate}
          enableZoom={inspectionConfig.camera.allowZoom}
          minDistance={inspectionConfig.camera.minimumDistance}
          maxDistance={inspectionConfig.camera.maximumDistance}
          minPolarAngle={inspectionConfig.camera.minimumPolarAngle}
          maxPolarAngle={inspectionConfig.camera.maximumPolarAngle}
          screenSpacePanning
          onStart={cancelCameraTransition}
        />
      )}
      connectionBuffers={graph.connectionBuffers}
      connectionFields={semanticBuffers.connectionFields}
      connectionRef={connectionRef}
      coreNodes={graph.coreNodes}
      coreRef={coreRef}
      focusHaloMaterialRef={focusHaloMaterialRef}
      focusHaloRef={focusHaloRef}
      selectedEnvelopeMaterialRef={selectedEnvelopeMaterialRef}
      selectedEnvelopeRef={selectedEnvelopeRef}
      hubRef={hubRef}
      hubs={graph.hubs}
      networkRef={networkRef}
      nodeClouds={graph.nodeClouds}
      nodeCloudRef={nodeCloudRef}
      particleField={graph.particleField}
      particleMaterialRef={particleMaterialRef}
      particlePositionRef={particlePositionRef}
      propagationPulseColorRef={propagationPulseColorRef}
      propagationPulseField={propagationBuffers.pulseField}
      propagationPulseGeometryRef={propagationPulseGeometryRef}
      propagationPulsePositionRef={propagationPulsePositionRef}
      propagationPulseOpacityRef={propagationPulseOpacityRef}
      propagationPulseSizeRef={propagationPulseSizeRef}
      operationalProtagonistMarkerColorRef={operationalProtagonistMarkerColorRef}
      operationalProtagonistMarkerField={
        propagationBuffers.operationalProtagonistMarkerField
      }
      operationalProtagonistMarkerGeometryRef={operationalProtagonistMarkerGeometryRef}
      operationalProtagonistMarkerMaterialRef={operationalProtagonistMarkerMaterialRef}
      operationalProtagonistMarkerOpacityRef={operationalProtagonistMarkerOpacityRef}
      operationalProtagonistMarkerPositionRef={operationalProtagonistMarkerPositionRef}
      operationalProtagonistMarkerSizeRef={operationalProtagonistMarkerSizeRef}
      operationalProtagonistMarkerTangentRef={operationalProtagonistMarkerTangentRef}
      propagationConfig={propagation.config}
      pulseColorRef={pulseColorRef}
      pulseField={graph.pulseField}
      pulsePositionRef={pulsePositionRef}
      ringRef={ringRef}
      rings={graph.rings}
      semanticPointCloudFields={semanticBuffers.pointCloudFields}
      semanticRibbonAttributeRefs={{
        color: semanticRibbonColorRef,
        fragmentation: semanticRibbonFragmentationRef,
        instability: semanticRibbonInstabilityRef,
        interruption: semanticRibbonInterruptionRef,
        opacity: semanticRibbonOpacityRef,
        pulseFrequency: semanticRibbonPulseFrequencyRef,
        pulseIntensity: semanticRibbonPulseIntensityRef,
        thickness: semanticRibbonThicknessRef,
      }}
      semanticRibbonField={semanticBuffers.ribbonField}
      semanticRibbonMaterialRef={semanticRibbonMaterialRef}
      semanticVisualizationConfig={semanticVisualizationConfig}
      clusterGrammarBufferState={clusterGrammarBuffers}
      clusterGrammarConnectionOpacityRefs={clusterGrammarConnectionOpacityRefs}
      clusterGrammarNodeOpacityRefs={clusterGrammarNodeOpacityRefs}
      clusterGrammarRibbonOpacityRef={clusterGrammarRibbonOpacityRef}
      clusterGrammarVisuals={clusterGrammar.enabled ? (
        <>
          <NeuralCoreClusterTerritoriesView
            focusLensConfig={semanticFocusLensConfig}
            grammar={clusterGrammar}
            territoryRefs={clusterTerritoryRefs}
          />
          <NeuralCoreAggregatedRoutesView
            pulseColorRef={aggregatedPulseColorRef}
            pulseField={aggregatedPulseField}
            pulseGeometryRef={aggregatedPulseGeometryRef}
            pulseOpacityRef={aggregatedPulseOpacityRef}
            pulsePositionRef={aggregatedPulsePositionRef}
            pulseSizeRef={aggregatedPulseSizeRef}
            routeField={aggregatedRouteField}
            routeColorRef={aggregatedRouteColorRef}
            routeOpacityRef={aggregatedRouteOpacityRef}
            routeThicknessRef={aggregatedRouteThicknessRef}
          />
        </>
      ) : undefined}
      stableFunctionalBlending={
        inspectionState.mode === "inspection"
          && inspectionConfig.cameraRendering.enabled
          && inspectionFocus.selectedClusterId !== undefined
      }
    />
  );
};
