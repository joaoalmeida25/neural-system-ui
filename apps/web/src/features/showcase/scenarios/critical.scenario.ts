import type { NeuralCoreRuntimeInput } from "neural-system-ui";

import type { ShowcaseMessages } from "../../i18n/showcase-i18n.types";
import { createShowcaseRuntime } from "./showcase-runtime.factory";
import type { ShowcaseScenarioDefinition } from "./showcase-scenario.types";

const createCriticalRuntime = (messages: ShowcaseMessages): NeuralCoreRuntimeInput => createShowcaseRuntime(
  "critical",
  messages,
  2_400,
  [
    {
      id: "critical-request-received",
      kind: "request-received",
      status: "processing",
      atMs: 0,
      durationMs: 350,
      entityId: "api-gateway",
      clusterId: "experience",
      routeId: "web-app-to-api-gateway",
      pathwayId: "customer-request",
      title: messages.narrative.requestReceived,
    },
    {
      id: "critical-checkout-started",
      kind: "stage-entered",
      status: "processing",
      atMs: 350,
      durationMs: 500,
      entityId: "checkout-service",
      clusterId: "commerce",
      routeId: "api-gateway-to-checkout",
      pathwayId: "customer-request",
      title: messages.narrative.checkoutStarted,
    },
    {
      id: "critical-payment-processing",
      kind: "stage-processing",
      status: "processing",
      atMs: 850,
      durationMs: 500,
      entityId: "payment-service",
      clusterId: "transactions",
      routeId: "checkout-to-payment",
      pathwayId: "checkout-processing",
      title: messages.narrative.paymentAuthorized,
    },
    {
      id: "critical-provider-unavailable",
      kind: "failure-raised",
      status: "error",
      atMs: 1_350,
      durationMs: 400,
      entityId: "payment-provider",
      clusterId: "external",
      routeId: "payment-to-payment-provider",
      pathwayId: "checkout-processing",
      title: messages.narrative.providerUnavailable,
      metrics: [
        {
          id: "provider-latency",
          name: messages.metrics.latency,
          value: 30_000,
          unit: "ms",
          status: "error",
          trend: "up",
        },
      ],
      impact: {
        level: "critical",
        summary: messages.narrative.paymentImpact,
        affectedEntityIds: ["payment-provider", "payment-service", "checkout-service"],
        affectedClusterIds: ["external", "transactions", "commerce"],
        affectedRouteIds: ["payment-to-payment-provider", "checkout-to-payment"],
        affectedPathwayIds: ["checkout-processing"],
      },
    },
    {
      id: "critical-payment-failed",
      kind: "failure-raised",
      status: "error",
      atMs: 1_750,
      durationMs: 300,
      entityId: "payment-service",
      clusterId: "transactions",
      routeId: "checkout-to-payment",
      pathwayId: "checkout-processing",
      title: messages.narrative.paymentFailed,
    },
    {
      id: "critical-execution-completed",
      kind: "execution-completed",
      status: "error",
      atMs: 2_050,
      entityId: "checkout-service",
      title: messages.narrative.executionCompleted,
    },
  ],
  "failure",
);

export const criticalScenario = {
  id: "critical",
  state: {
      clusters: { commerce: "warning", transactions: "error", external: "error" },
      entities: {
        "checkout-service": "warning",
        "payment-service": "error",
        "payment-provider": "error",
      },
      routes: {
        "checkout-to-payment": "error",
        "payment-to-payment-provider": "error",
      },
      pathways: { "checkout-processing": "error" },
      activity: { "checkout-service": 1, "payment-service": 1, "payment-provider": 1 },
    },
  createRuntime: createCriticalRuntime,
} as const satisfies ShowcaseScenarioDefinition;
