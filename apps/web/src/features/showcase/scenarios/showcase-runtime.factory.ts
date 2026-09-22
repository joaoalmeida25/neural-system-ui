import type {
  NeuralCoreExecutionOutcomeStatus,
  NeuralCoreRuntimeEventInput,
  NeuralCoreRuntimeInput,
} from "neural-system-ui";

import type { ShowcaseMessages } from "../../i18n/showcase-i18n.types";
import type { ShowcaseScenarioId } from "./showcase-scenario.types";

export const createShowcaseRuntime = (
  scenarioId: ShowcaseScenarioId,
  messages: ShowcaseMessages,
  totalDurationMs: number,
  events: readonly NeuralCoreRuntimeEventInput[],
  outcomeStatus: NeuralCoreExecutionOutcomeStatus,
): NeuralCoreRuntimeInput => {
  const scenario = messages.scenarios[scenarioId];

  return {
    kind: "execution",
    autoStart: true,
    execution: {
      id: `${scenarioId}-execution`,
      name: scenario.executionName,
      description: scenario.executionDescription,
      events,
      outcome: {
        status: outcomeStatus,
        summary: scenario.outcome,
        totalDurationMs,
        metrics: [
          {
            id: "total-duration",
            name: messages.metrics.totalDuration,
            value: totalDurationMs,
            unit: "ms",
            status: outcomeStatus === "failure" ? "error" : "success",
            trend: "stable",
          },
          {
            id: "processed-events",
            name: messages.metrics.processedEvents,
            value: events.length,
            status: "success",
            trend: "stable",
          },
        ],
      },
    },
  };
};
