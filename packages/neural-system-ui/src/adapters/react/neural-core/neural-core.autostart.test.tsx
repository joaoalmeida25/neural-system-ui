// @vitest-environment jsdom

import {
  StrictMode,
  act,
  type ReactElement,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createNeuralCoreInteractionState,
  type NeuralCoreEvent,
  type NeuralCoreModelInput,
  type NeuralCoreRuntimeInput,
} from "../../../api";
import { NeuralCore } from "./neural-core.component";

vi.mock("../../three/components/neural-core-canvas/neural-core-canvas.component", () => ({
  NeuralCoreCanvas: (): ReactElement => <div data-testid="neural-core-canvas" />,
}));

const MODEL: NeuralCoreModelInput = {
  id: "autostart-model",
  clusters: [
    {
      id: "system",
      label: "System",
      kind: "service",
    },
  ],
  entities: [
    {
      id: "worker",
      label: "Worker",
      clusterId: "system",
      kind: "service",
    },
  ],
  routes: [],
};

const RUNTIME: NeuralCoreRuntimeInput = {
  kind: "execution",
  autoStart: true,
  execution: {
    id: "autostart-execution",
    name: "Auto-start execution",
    events: [
      {
        id: "work-started",
        kind: "stage-entered",
        status: "processing",
        atMs: 0,
        durationMs: 50,
        entityId: "worker",
        clusterId: "system",
        title: "Work started",
      },
      {
        id: "work-completed",
        kind: "execution-completed",
        status: "success",
        atMs: 50,
        entityId: "worker",
        clusterId: "system",
        title: "Work completed",
      },
    ],
    outcome: {
      status: "success",
      summary: "Execution completed",
      totalDurationMs: 100,
    },
  },
};

describe("NeuralCore runtime autoStart", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    let frameTimestamp = 1;
    vi.spyOn(performance, "now").mockImplementation(() => frameTimestamp);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback): number => (
      window.setTimeout(() => {
        frameTimestamp += 16;
        callback(frameTimestamp);
      }, 16)
    ));
    vi.stubGlobal("cancelAnimationFrame", (handle: number): void => {
      window.clearTimeout(handle);
    });
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each([
    { label: "normal rendering", strict: false },
    { label: "React StrictMode", strict: true },
  ])("starts and completes with autoStart during $label", async ({ strict }) => {
    const events: NeuralCoreEvent[] = [];
    const core = (
      <NeuralCore
        model={MODEL}
        runtime={RUNTIME}
        onEvent={(event) => events.push(event)}
      />
    );

    await act(async () => {
      root.render(strict ? <StrictMode>{core}</StrictMode> : core);
    });
    for (let elapsedMs = 0; elapsedMs < 13_000; elapsedMs += 250) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(250);
      });
    }

    expect(events.filter((event) => event.type === "execution-started")).toHaveLength(1);
    expect(events.filter((event) => event.type === "execution-completed")).toHaveLength(1);
  });

  it("reports controlled pause and resume transitions through public events", async () => {
    const events: NeuralCoreEvent[] = [];
    const renderCore = (paused: boolean): ReactElement => (
      <NeuralCore
        interactionState={createNeuralCoreInteractionState({
          mode: "presentation",
          paused,
        })}
        model={MODEL}
        runtime={RUNTIME}
        onEvent={(event) => events.push(event)}
        onInteractionStateChange={() => undefined}
      />
    );

    await act(async () => root.render(renderCore(false)));
    await act(async () => root.render(renderCore(true)));
    await act(async () => root.render(renderCore(false)));

    expect(events.filter((event) => event.type === "execution-paused")).toHaveLength(1);
    expect(events.filter((event) => event.type === "execution-resumed")).toHaveLength(1);
  });

  it("does not restart on rerender and starts a replacement execution", async () => {
    const events: NeuralCoreEvent[] = [];
    const onEvent = (event: NeuralCoreEvent): void => {
      events.push(event);
    };
    const renderCore = (runtime: NeuralCoreRuntimeInput): ReactElement => (
      <NeuralCore model={MODEL} runtime={runtime} onEvent={onEvent} />
    );
    const equivalentRuntime: NeuralCoreRuntimeInput = {
      ...RUNTIME,
      execution: {
        ...RUNTIME.execution,
        events: [...RUNTIME.execution.events],
      },
    };
    const replacementRuntime: NeuralCoreRuntimeInput = {
      ...equivalentRuntime,
      execution: {
        ...equivalentRuntime.execution,
        id: "replacement-execution",
      },
    };

    await act(async () => root.render(renderCore(RUNTIME)));
    await act(async () => vi.advanceTimersByTimeAsync(250));
    await act(async () => root.render(renderCore(RUNTIME)));
    await act(async () => vi.advanceTimersByTimeAsync(250));
    await act(async () => root.render(renderCore(equivalentRuntime)));
    await act(async () => vi.advanceTimersByTimeAsync(250));

    expect(events.filter((event) => event.type === "execution-started")).toHaveLength(1);

    await act(async () => root.render(renderCore(replacementRuntime)));
    await act(async () => vi.advanceTimersByTimeAsync(250));

    expect(events.filter((event) => event.type === "execution-started")).toHaveLength(2);
    expect(events.filter((event) => (
      event.type === "execution-started"
      && String(event.executionId) === "replacement-execution"
    ))).toHaveLength(1);
  });
});
