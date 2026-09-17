import type {
  NeuralCoreMetric,
  NeuralCoreRuntime,
  NeuralCoreRuntimeEvent,
  NeuralCoreRuntimeImpact,
} from "../core/neural-core-runtime.types";
import type {
  NeuralCoreApplicationRuntime,
  NeuralCoreApplicationRuntimeEvent,
  NeuralCoreApplicationRuntimeImpact,
  NeuralCoreApplicationRuntimeMetric,
} from "../../application/runtime/neural-core-application-runtime.types";

export type {
  NeuralCoreApplicationRuntime as NeuralCoreInternalRuntime,
  NeuralCoreApplicationRuntimeEvent as NeuralCoreInternalRuntimeEvent,
  NeuralCoreApplicationRuntimeImpact as NeuralCoreInternalRuntimeImpact,
  NeuralCoreApplicationRuntimeMetric as NeuralCoreInternalRuntimeMetric,
} from "../../application/runtime/neural-core-application-runtime.types";

const adaptMetric = (
  metric: NeuralCoreMetric,
): NeuralCoreApplicationRuntimeMetric => Object.freeze({
  id: metric.id,
  name: metric.name,
  value: metric.value,
  unit: metric.unit,
  status: metric.status,
  trend: metric.trend,
});

const adaptImpact = (
  impact: NeuralCoreRuntimeImpact,
): NeuralCoreApplicationRuntimeImpact => Object.freeze({
  level: impact.level,
  summary: impact.summary,
  affectedEntityIds: Object.freeze(impact.affectedEntityIds.map(String)),
  affectedClusterIds: Object.freeze(impact.affectedClusterIds.map(String)),
  affectedRouteIds: Object.freeze(impact.affectedRouteIds.map(String)),
  affectedPathwayIds: Object.freeze(impact.affectedPathwayIds.map(String)),
});

const adaptRuntimeEvent = (
  event: NeuralCoreRuntimeEvent,
): NeuralCoreApplicationRuntimeEvent => Object.freeze({
  id: event.id,
  kind: event.kind,
  status: event.status,
  atMs: event.atMs,
  durationMs: event.durationMs,
  entityId: event.entityId,
  clusterId: event.clusterId,
  routeId: event.routeId,
  pathwayId: event.pathwayId,
  title: event.title,
  message: event.message,
  metrics: Object.freeze(event.metrics.map(adaptMetric)),
  impact: event.impact === undefined ? undefined : adaptImpact(event.impact),
  retry: event.retry,
  metadata: event.metadata,
});

export const adaptNeuralCoreRuntime = (
  runtime: NeuralCoreRuntime,
): NeuralCoreApplicationRuntime => Object.freeze({
  kind: "execution",
  executionId: runtime.execution.id,
  name: runtime.execution.name,
  description: runtime.execution.description,
  events: Object.freeze(runtime.execution.events.map(adaptRuntimeEvent)),
  outcome: runtime.execution.outcome,
  autoStart: runtime.autoStart,
  metadata: runtime.execution.metadata,
});
