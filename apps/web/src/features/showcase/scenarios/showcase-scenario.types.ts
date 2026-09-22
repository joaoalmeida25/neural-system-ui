import type {
  NeuralCoreModelInput,
  NeuralCoreRuntimeInput,
} from "neural-system-ui";

import type { ShowcaseMessages } from "../../i18n/showcase-i18n.types";
import type { ShowcaseScenarioState } from "../model/showcase-ecosystem";

export type ShowcaseScenarioId =
  | "normal"
  | "warning"
  | "critical"
  | "recovery"
  | "mixed"
  | "realtime";

export interface ShowcaseScenarioDefinition {
  readonly id: ShowcaseScenarioId;
  readonly state: ShowcaseScenarioState;
  readonly createRuntime: (messages: ShowcaseMessages) => NeuralCoreRuntimeInput;
}

export interface ShowcaseScenario {
  readonly id: ShowcaseScenarioId;
  readonly title: string;
  readonly description: string;
  readonly focus: string;
  readonly model: NeuralCoreModelInput;
  readonly runtime?: NeuralCoreRuntimeInput;
}
