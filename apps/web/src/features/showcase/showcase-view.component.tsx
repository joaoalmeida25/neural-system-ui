import type { ReactElement } from "react";

import {
  NeuralCore,
  type NeuralCoreConfigInput,
  type NeuralCoreEventHandler,
  type NeuralCoreInteractionState,
  type NeuralCoreInteractionStateChangeHandler,
  type NeuralCoreModelInput,
  type NeuralCoreRuntimeInput,
} from "neural-system-ui";

import type {
  ShowcaseLocale,
  ShowcaseMessages,
} from "../i18n/showcase-i18n";
import { ExecutionControls } from "./components/execution-controls.component";
import { ShowcaseToolbar } from "./components/showcase-toolbar.component";
import type {
  ShowcaseScenario,
  ShowcaseScenarioId,
} from "./scenarios/showcase-scenario.types";
import type { ShowcaseExecutionLifecycle } from "./showcase-execution.types";

interface ShowcaseViewProps {
  readonly config: NeuralCoreConfigInput;
  readonly executionLifecycle: ShowcaseExecutionLifecycle;
  readonly executionProgress: number;
  readonly inspectionEnabled: boolean;
  readonly interactionState: NeuralCoreInteractionState;
  readonly journeySteps: readonly string[];
  readonly locale: ShowcaseLocale;
  readonly messages: ShowcaseMessages;
  readonly model: NeuralCoreModelInput;
  readonly neuralCoreKey: string;
  readonly onInspectionEnabledChange: (enabled: boolean) => void;
  readonly onInteractionStateChange: NeuralCoreInteractionStateChangeHandler;
  readonly onLocaleChange: (locale: ShowcaseLocale) => void;
  readonly onNeuralCoreEvent: NeuralCoreEventHandler;
  readonly onPauseToggle: () => void;
  readonly onReplay: () => void;
  readonly onScenarioChange: (scenarioId: ShowcaseScenarioId) => void;
  readonly runtime?: NeuralCoreRuntimeInput;
  readonly scenario: ShowcaseScenario;
  readonly selectedScenario: ShowcaseScenarioId;
}

export const ShowcaseView = ({
  config,
  executionLifecycle,
  executionProgress,
  inspectionEnabled,
  interactionState,
  journeySteps,
  locale,
  messages,
  model,
  neuralCoreKey,
  onInspectionEnabledChange,
  onInteractionStateChange,
  onLocaleChange,
  onNeuralCoreEvent,
  onPauseToggle,
  onReplay,
  onScenarioChange,
  runtime,
  scenario,
  selectedScenario,
}: ShowcaseViewProps): ReactElement => (
  <main className="showcase">
    <section className="showcase__viewport" aria-label={scenario.title}>
      <NeuralCore
        key={neuralCoreKey}
        ariaLabel={scenario.title}
        config={config}
        interactionState={interactionState}
        model={model}
        runtime={runtime}
        onEvent={onNeuralCoreEvent}
        onInteractionStateChange={onInteractionStateChange}
      />
    </section>

    <div className="showcase__vignette" aria-hidden="true" />

    <header className="showcase-brand">
      <span className="showcase-brand__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <div>
        <h1>{messages.product.name}</h1>
        <p>{messages.product.tagline}</p>
      </div>
    </header>

    <ShowcaseToolbar
      inspectionEnabled={inspectionEnabled}
      locale={locale}
      messages={messages}
      onInspectionEnabledChange={onInspectionEnabledChange}
      onLocaleChange={onLocaleChange}
      onScenarioChange={onScenarioChange}
      selectedScenario={selectedScenario}
    />

    <section
      className="showcase-context"
      aria-label={`${messages.context.ecosystem} / ${messages.context.scenario}`}
    >
      <article className="showcase-panel showcase-ecosystem">
        <span className="showcase-panel__eyebrow">
          <span className="showcase-panel__signal" aria-hidden="true" />
          {messages.context.ecosystem}
        </span>
        <h2>{messages.ecosystem.name}</h2>
        <p className="showcase-ecosystem__description">
          {messages.ecosystem.description}
        </p>
        <ol
          className="showcase-journey"
          aria-label={journeySteps.join(" → ")}
        >
          {journeySteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </article>

      <article
        className="showcase-panel showcase-scenario"
        data-scenario={scenario.id}
      >
        <span className="showcase-panel__eyebrow">
          <span className="showcase-panel__signal" aria-hidden="true" />
          {messages.context.scenario}
        </span>
        <div
          className="showcase-scenario__copy"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2>{scenario.title}</h2>
          <p className="showcase-scenario__description">{scenario.description}</p>
          <div className="showcase-scenario__focus">
            <span>{messages.context.focus}</span>
            <p>{scenario.focus}</p>
          </div>
        </div>
        <ExecutionControls
          lifecycle={executionLifecycle}
          messages={messages}
          progress={executionProgress}
          onPauseToggle={onPauseToggle}
          onReplay={onReplay}
        />
      </article>
    </section>
  </main>
);
