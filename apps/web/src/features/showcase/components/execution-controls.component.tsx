import type { ReactElement } from "react";

import type { ShowcaseMessages } from "../../i18n/showcase-i18n";
import type { ShowcaseExecutionLifecycle } from "../showcase-execution.types";

interface ExecutionControlsProps {
  readonly lifecycle: ShowcaseExecutionLifecycle;
  readonly messages: ShowcaseMessages;
  readonly onPauseToggle: () => void;
  readonly onReplay: () => void;
  readonly progress: number;
}

export const ExecutionControls = ({
  lifecycle,
  messages,
  onPauseToggle,
  onReplay,
  progress,
}: ExecutionControlsProps): ReactElement => {
  const progressPercentage = Math.round(progress * 100);
  const isPaused = lifecycle === "paused";
  const isCompleted = lifecycle === "completed";

  return (
    <section
      className="showcase-execution"
      data-lifecycle={lifecycle}
      aria-label={messages.execution.label}
    >
      <div className="showcase-execution__summary">
        <span className="showcase-execution__label">
          {messages.execution.label}
        </span>
        <span
          className="showcase-execution__status"
          data-status={lifecycle}
          role="status"
        >
          <span aria-hidden="true" />
          {messages.execution.status[lifecycle]}
        </span>
      </div>

      <div className="showcase-execution__progress-header">
        <span>{messages.execution.progress}</span>
        <output>{progressPercentage}%</output>
      </div>
      <progress
        className="showcase-execution__progress"
        aria-label={messages.execution.progress}
        max={100}
        value={progressPercentage}
      />

      <div className="showcase-execution__actions">
        <button
          className="showcase-execution__primary-action"
          type="button"
          disabled={isCompleted}
          onClick={onPauseToggle}
        >
          <span className="showcase-execution__icon" aria-hidden="true">
            {isPaused ? "▶" : "Ⅱ"}
          </span>
          {isPaused ? messages.execution.resume : messages.execution.pause}
        </button>
        <button
          className="showcase-execution__secondary-action"
          type="button"
          onClick={onReplay}
        >
          <span className="showcase-execution__icon" aria-hidden="true">↻</span>
          {messages.execution.replay}
        </button>
      </div>
    </section>
  );
};
