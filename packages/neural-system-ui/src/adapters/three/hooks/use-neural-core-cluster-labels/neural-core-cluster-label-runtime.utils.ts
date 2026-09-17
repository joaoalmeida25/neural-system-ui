import { Vector3 } from "three";

import type { NeuralCoreClusterLodState } from "../../../../visualization/lod/neural-core-lod.types";
import type {
  NeuralCoreClusterLabelModel,
  NeuralCoreClusterLabelVisualRuntime,
} from "../../../../visualization/labels/neural-core-cluster-label.types";
import type { NeuralCoreClusterLabelPlacement } from "../../../../visualization/labels/neural-core-label-layout.types";
import type { AdvanceNeuralCoreClusterLabelsParams } from "./use-neural-core-cluster-labels.types";

export interface NeuralCoreClusterLabelRuntime {
  model: NeuralCoreClusterLabelModel;
  localPosition: readonly [number, number, number];
  projectedPosition: Vector3;
  placement?: NeuralCoreClusterLabelPlacement;
  retainedPlacement?: NeuralCoreClusterLabelPlacement;
  lastVisibleSeconds: number;
  lastSeenSeconds: number;
  visual: NeuralCoreClusterLabelVisualRuntime & {
    currentLeaderOpacity: number;
    targetLeaderOpacity: number;
  };
  active: boolean;
}

export interface NeuralCoreClusterLabelLevelRuntime {
  state: NeuralCoreClusterLodState;
  referenceDistance: number;
}

export const createHiddenPlacement = (
  runtime: NeuralCoreClusterLabelRuntime,
): NeuralCoreClusterLabelPlacement => ({
  clusterId: runtime.model.clusterId,
  x: runtime.projectedPosition.x,
  y: runtime.projectedPosition.y,
  anchorX: runtime.projectedPosition.x,
  anchorY: runtime.projectedPosition.y,
  width: 0,
  height: 0,
  visible: false,
  displaced: false,
  opacity: 0,
});

export const getModelsSignature = (
  models: readonly NeuralCoreClusterLabelModel[],
): string => JSON.stringify(models.map((model) => ({
  clusterId: model.clusterId,
  level: model.level,
  title: model.title,
  typeLabel: model.typeLabel,
  status: model.status,
  statusLabel: model.statusLabel,
  activity: model.activity,
  formattedActivity: model.formattedActivity,
  metrics: model.metrics.map((metric) => ({
    id: metric.id,
    label: metric.label,
    formattedValue: metric.formattedValue,
  })),
  impactLevel: model.impactLevel,
  impactLabel: model.impactLabel,
  isFocused: model.isFocused,
  isCompact: model.isCompact,
})));

const getLabelContextKey = (
  directionState: AdvanceNeuralCoreClusterLabelsParams["directionState"],
  narrativeState: AdvanceNeuralCoreClusterLabelsParams["narrativeState"],
): string => `${directionState.focusTargetType}:${directionState.focusTargetId ?? "none"}`
  + `:${directionState.targetClusterIds.join(",")}`
  + `:${narrativeState.isActive ? narrativeState.clusterIds.join(",") : "inactive"}`;

export const getInspectionKey = (
  params: AdvanceNeuralCoreClusterLabelsParams,
): string => `${params.clusterGrammarEnabled
  ? params.clusterGrammarVisibleTerritoryIds?.join(",") ?? "none"
  : "legacy"}:` + (params.interactionMode === "inspection"
  ? `inspection:${params.inspectionFocus.selectedClusterId ?? "overview"}`
    + `:${params.inspectionFocus.relatedClusterIds.join(",")}`
    + `:${getLabelContextKey(params.directionState, params.narrativeState)}`
  : getLabelContextKey(params.directionState, params.narrativeState));

export const dampVisualValue = (
  current: number,
  target: number,
  damping: number,
  deltaSeconds: number,
): number => {
  return target + (current - target) * Math.exp(-damping * Math.max(0, deltaSeconds));
};

export const createVisualRuntime = (
  model: NeuralCoreClusterLabelModel,
): NeuralCoreClusterLabelRuntime["visual"] => ({
  currentX: Number.NaN,
  currentY: Number.NaN,
  targetX: 0,
  targetY: 0,
  currentAnchorX: Number.NaN,
  currentAnchorY: Number.NaN,
  targetAnchorX: 0,
  targetAnchorY: 0,
  currentOpacity: 0,
  targetOpacity: 0,
  currentScale: 0.96,
  targetScale: 0.96,
  currentWidth: 0,
  currentHeight: 0,
  targetWidth: 0,
  targetHeight: 0,
  currentLeaderEndX: Number.NaN,
  currentLeaderEndY: Number.NaN,
  targetLeaderEndX: 0,
  targetLeaderEndY: 0,
  currentLeaderOpacity: 0,
  targetLeaderOpacity: 0,
  currentLevel: model.level,
  targetLevel: model.level,
});
