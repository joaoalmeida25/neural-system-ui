import type { ReactElement } from "react";

import {
  SHOWCASE_LOCALES,
  type ShowcaseLocale,
  type ShowcaseMessages,
} from "../../i18n/showcase-i18n";
import {
  SHOWCASE_SCENARIO_IDS,
  type ShowcaseScenarioId,
} from "../scenarios/showcase-scenarios";

interface ShowcaseToolbarProps {
  readonly inspectionEnabled: boolean;
  readonly locale: ShowcaseLocale;
  readonly messages: ShowcaseMessages;
  readonly onInspectionEnabledChange: (enabled: boolean) => void;
  readonly onLocaleChange: (locale: ShowcaseLocale) => void;
  readonly onScenarioChange: (scenarioId: ShowcaseScenarioId) => void;
  readonly selectedScenario: ShowcaseScenarioId;
}

export const ShowcaseToolbar = ({
  inspectionEnabled,
  locale,
  messages,
  onInspectionEnabledChange,
  onLocaleChange,
  onScenarioChange,
  selectedScenario,
}: ShowcaseToolbarProps): ReactElement => (
  <section className="showcase-toolbar" aria-label={messages.controls.ariaLabel}>
    <fieldset className="showcase-toolbar__scenarios">
      <legend className="showcase-toolbar__legend">{messages.controls.scenario}</legend>
      <div className="showcase-toolbar__scenario-options">
        {SHOWCASE_SCENARIO_IDS.map((scenarioId) => (
          <button
            key={scenarioId}
            className="showcase-toolbar__scenario"
            type="button"
            aria-pressed={selectedScenario === scenarioId}
            onClick={() => onScenarioChange(scenarioId)}
          >
            {messages.scenarios[scenarioId].title}
          </button>
        ))}
      </div>
    </fieldset>

    <div className="showcase-toolbar__utilities">
      <label className="showcase-toolbar__inspection">
        <span className="showcase-toolbar__utility-label">
          {messages.controls.inspection}
        </span>
        <input
          className="showcase-toolbar__switch-input"
          type="checkbox"
          role="switch"
          checked={inspectionEnabled}
          onChange={(event) => onInspectionEnabledChange(event.currentTarget.checked)}
        />
        <span className="showcase-toolbar__switch" aria-hidden="true">
          <span className="showcase-toolbar__switch-thumb" />
        </span>
        <span
          className="showcase-toolbar__switch-state"
          data-active={inspectionEnabled}
        >
          {inspectionEnabled
            ? messages.controls.inspectionOn
            : messages.controls.inspectionOff}
        </span>
      </label>

      <fieldset className="showcase-toolbar__locale">
        <legend className="showcase-toolbar__sr-only">{messages.controls.locale}</legend>
        {SHOWCASE_LOCALES.map((option) => {
          const isPortuguese = option === "pt-BR";
          const label = isPortuguese
            ? messages.controls.portuguese
            : messages.controls.english;

          return (
            <button
              key={option}
              className="showcase-toolbar__locale-option"
              type="button"
              aria-label={label}
              aria-pressed={locale === option}
              title={label}
              onClick={() => onLocaleChange(option)}
            >
              {isPortuguese ? "PT" : "EN"}
            </button>
          );
        })}
      </fieldset>
    </div>
  </section>
);
