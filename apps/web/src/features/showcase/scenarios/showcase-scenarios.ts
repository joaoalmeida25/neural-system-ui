import {
  createNeuralCoreModel,
  createNeuralCoreRuntime,
} from "neural-system-ui";

import {
  getShowcaseMessages,
  SHOWCASE_LOCALES,
  type ShowcaseLocale,
} from "../../i18n/showcase-i18n";
import { createShowcaseEcosystem } from "../model/showcase-ecosystem";
import { criticalScenario } from "./critical.scenario";
import { mixedScenario } from "./mixed.scenario";
import { normalScenario } from "./normal.scenario";
import { realtimeScenario } from "./realtime.scenario";
import { recoveryScenario } from "./recovery.scenario";
import type {
  ShowcaseScenario,
  ShowcaseScenarioDefinition,
  ShowcaseScenarioId,
} from "./showcase-scenario.types";
import { warningScenario } from "./warning.scenario";

export const SHOWCASE_SCENARIO_IDS = [
  "normal",
  "warning",
  "critical",
  "recovery",
  "mixed",
  "realtime",
] as const satisfies readonly ShowcaseScenarioId[];

const SCENARIO_DEFINITIONS: Readonly<
  Record<ShowcaseScenarioId, ShowcaseScenarioDefinition>
> = {
  normal: normalScenario,
  warning: warningScenario,
  critical: criticalScenario,
  recovery: recoveryScenario,
  mixed: mixedScenario,
  realtime: realtimeScenario,
};

const formatDiagnostics = (
  diagnostics: readonly { readonly code: string; readonly message: string }[],
): string => diagnostics.map(({ code, message }) => `${code}: ${message}`).join("; ");

export const createShowcaseScenario = (
  scenarioId: ShowcaseScenarioId,
  locale: ShowcaseLocale,
): ShowcaseScenario => {
  const messages = getShowcaseMessages(locale);
  const definition = SCENARIO_DEFINITIONS[scenarioId];
  const model = createShowcaseEcosystem(messages, definition.state);
  const modelResult = createNeuralCoreModel(model);

  if (!modelResult.ok) {
    throw new Error(
      `Invalid showcase model for ${scenarioId}: ${formatDiagnostics(modelResult.diagnostics)}`,
    );
  }

  const runtime = definition.createRuntime(messages);
  const runtimeResult = createNeuralCoreRuntime(runtime, modelResult.value);

  if (!runtimeResult.ok) {
    throw new Error(
      `Invalid showcase runtime for ${scenarioId}: ${formatDiagnostics(runtimeResult.diagnostics)}`,
    );
  }

  return {
    id: definition.id,
    title: messages.scenarios[scenarioId].title,
    description: messages.scenarios[scenarioId].description,
    focus: messages.scenarios[scenarioId].focus,
    model,
    runtime,
  };
};

export const validateShowcaseScenarios = (): void => {
  SHOWCASE_LOCALES.forEach((locale) => {
    SHOWCASE_SCENARIO_IDS.forEach((scenarioId) => {
      createShowcaseScenario(scenarioId, locale);
    });
  });
};

export type {
  ShowcaseScenario,
  ShowcaseScenarioId,
} from "./showcase-scenario.types";
