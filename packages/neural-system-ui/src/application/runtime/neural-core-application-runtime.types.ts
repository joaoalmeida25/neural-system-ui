export type NeuralCoreApplicationMetadataPrimitive = string | number | boolean | null;

export type NeuralCoreApplicationMetadataValue =
  | NeuralCoreApplicationMetadataPrimitive
  | readonly NeuralCoreApplicationMetadataValue[]
  | { readonly [key: string]: NeuralCoreApplicationMetadataValue };

export type NeuralCoreApplicationMetadata = Readonly<
Record<string, NeuralCoreApplicationMetadataValue>
>;

export type NeuralCoreApplicationOperationalStatus =
  | "idle"
  | "active"
  | "processing"
  | "success"
  | "warning"
  | "error"
  | "recovering"
  | "disabled";

export interface NeuralCoreApplicationRuntimeMetric {
  readonly id: string;
  readonly name: string;
  readonly value: string | number | boolean;
  readonly unit?: string;
  readonly status: NeuralCoreApplicationOperationalStatus;
  readonly trend: "up" | "down" | "stable" | "unknown";
}

export interface NeuralCoreApplicationRuntimeImpact {
  readonly level: "none" | "low" | "medium" | "high" | "critical";
  readonly summary?: string;
  readonly affectedEntityIds: readonly string[];
  readonly affectedClusterIds: readonly string[];
  readonly affectedRouteIds: readonly string[];
  readonly affectedPathwayIds: readonly string[];
}

export interface NeuralCoreApplicationRuntimeRetry {
  readonly attempt: number;
  readonly maximumAttempts: number;
  readonly delayMs: number;
  readonly reason?: string;
}

export interface NeuralCoreApplicationRuntimeEvent {
  readonly id: string;
  readonly kind: string;
  readonly status: NeuralCoreApplicationOperationalStatus;
  readonly atMs: number;
  readonly durationMs: number;
  readonly entityId?: string;
  readonly clusterId?: string;
  readonly routeId?: string;
  readonly pathwayId?: string;
  readonly title: string;
  readonly message?: string;
  readonly metrics: readonly NeuralCoreApplicationRuntimeMetric[];
  readonly impact?: NeuralCoreApplicationRuntimeImpact;
  readonly retry?: NeuralCoreApplicationRuntimeRetry;
  readonly metadata: NeuralCoreApplicationMetadata;
}

export interface NeuralCoreApplicationExecutionOutcome {
  readonly status: "success" | "degraded-success" | "recovered-success" | "failure";
  readonly summary: string;
  readonly totalDurationMs: number;
  readonly metrics: readonly NeuralCoreApplicationRuntimeMetric[];
  readonly metadata: NeuralCoreApplicationMetadata;
}

export interface NeuralCoreApplicationRuntime {
  readonly kind: "execution";
  readonly executionId: string;
  readonly name: string;
  readonly description?: string;
  readonly events: readonly NeuralCoreApplicationRuntimeEvent[];
  readonly outcome: NeuralCoreApplicationExecutionOutcome;
  readonly autoStart: boolean;
  readonly metadata: NeuralCoreApplicationMetadata;
}
