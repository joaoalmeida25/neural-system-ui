export type ShowcaseExecutionLifecycle = "running" | "paused" | "completed";

export interface ShowcaseExecutionState {
  readonly lifecycle: ShowcaseExecutionLifecycle;
  readonly observedEventCount: number;
  readonly replayKey: number;
}
