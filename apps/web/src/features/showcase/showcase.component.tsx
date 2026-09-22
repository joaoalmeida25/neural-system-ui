import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";

import {
  createNeuralCoreInteractionState,
  type NeuralCoreConfigInput,
  type NeuralCoreEventHandler,
  type NeuralCoreInteractionState,
  type NeuralCoreInteractionStateChangeHandler,
} from "neural-system-ui";

import {
  getShowcaseMessages,
  resolveDefaultLocale,
  type ShowcaseLocale,
} from "../i18n/showcase-i18n";
import {
  createShowcaseScenario,
  type ShowcaseScenarioId,
} from "./scenarios/showcase-scenarios";
import {
  DEFAULT_INSPECTION_ENABLED,
  DEFAULT_SHOWCASE_SCENARIO,
  SHOWCASE_LOCALE_STORAGE_KEY,
} from "./showcase.constants";
import type { ShowcaseExecutionState } from "./showcase-execution.types";
import { ShowcaseView } from "./showcase-view.component";
import "./showcase.styles.css";

const readStoredLocale = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(SHOWCASE_LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const Showcase = (): ReactElement => {
  const [selectedScenario, setSelectedScenario] = useState<ShowcaseScenarioId>(
    DEFAULT_SHOWCASE_SCENARIO,
  );
  const [inspectionEnabled, setInspectionEnabled] = useState(
    DEFAULT_INSPECTION_ENABLED,
  );
  const [locale, setLocale] = useState<ShowcaseLocale>(() => (
    resolveDefaultLocale(readStoredLocale())
  ));
  const [interactionState, setInteractionState] = useState<NeuralCoreInteractionState>(() => (
    createNeuralCoreInteractionState({ mode: "presentation" })
  ));
  const [executionState, setExecutionState] = useState<ShowcaseExecutionState>({
    lifecycle: "running",
    observedEventCount: 0,
    replayKey: 0,
  });
  const interactionStateRef = useRef(interactionState);
  const observedEventIdsRef = useRef(new Set<string>());

  const messages = useMemo(() => getShowcaseMessages(locale), [locale]);
  const scenario = useMemo(
    () => createShowcaseScenario(selectedScenario, locale),
    [locale, selectedScenario],
  );
  const totalEventCount = scenario.runtime?.execution.events.length ?? 0;
  const config = useMemo<NeuralCoreConfigInput>(() => ({
    preset: "operational",
    inspection: {
      enabled: inspectionEnabled,
      focusSelectedCluster: inspectionEnabled,
      pauseOnEnter: false,
      clearSelectionOnExit: true,
      contextPanel: inspectionEnabled,
    },
    labels: {
      enabled: true,
      showStatus: true,
      showDescriptions: inspectionEnabled,
    },
    visualization: {
      density: "detailed",
      showActivity: true,
      showRoutes: true,
    },
  }), [inspectionEnabled]);

  const commitInteractionState = useCallback((nextState: NeuralCoreInteractionState): void => {
    interactionStateRef.current = nextState;
    setInteractionState(nextState);
  }, []);

  const resetExecution = useCallback((incrementReplayKey: boolean): void => {
    observedEventIdsRef.current.clear();
    setExecutionState((current) => ({
      lifecycle: "running",
      observedEventCount: 0,
      replayKey: current.replayKey + (incrementReplayKey ? 1 : 0),
    }));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(SHOWCASE_LOCALE_STORAGE_KEY, locale);
    } catch {
      // The locale remains active for the current session when storage is unavailable.
    }
  }, [locale]);

  const handleScenarioChange = useCallback((scenarioId: ShowcaseScenarioId): void => {
    if (scenarioId === selectedScenario) {
      return;
    }

    setSelectedScenario(scenarioId);
    resetExecution(false);
    commitInteractionState(createNeuralCoreInteractionState({
      mode: interactionStateRef.current.mode,
      paused: false,
    }));
  }, [commitInteractionState, resetExecution, selectedScenario]);

  const handleInspectionEnabledChange = useCallback((enabled: boolean): void => {
    setInspectionEnabled(enabled);
    commitInteractionState(createNeuralCoreInteractionState({
      mode: enabled ? "inspection" : "presentation",
      paused: interactionStateRef.current.paused,
    }));
  }, [commitInteractionState]);

  const handleLocaleChange = useCallback((nextLocale: ShowcaseLocale): void => {
    if (nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);
    resetExecution(false);
    commitInteractionState(createNeuralCoreInteractionState({
      ...interactionStateRef.current,
      paused: false,
    }));
  }, [commitInteractionState, locale, resetExecution]);

  const handlePauseToggle = useCallback((): void => {
    if (executionState.lifecycle === "completed") {
      return;
    }

    commitInteractionState(createNeuralCoreInteractionState({
      ...interactionStateRef.current,
      paused: !interactionStateRef.current.paused,
    }));
  }, [commitInteractionState, executionState.lifecycle]);

  const handleReplay = useCallback((): void => {
    resetExecution(true);
    commitInteractionState(createNeuralCoreInteractionState({
      ...interactionStateRef.current,
      paused: false,
    }));
  }, [commitInteractionState, resetExecution]);

  const handleInteractionStateChange = useCallback<NeuralCoreInteractionStateChangeHandler>(
    (nextState) => commitInteractionState(nextState),
    [commitInteractionState],
  );

  const handleNeuralCoreEvent = useCallback<NeuralCoreEventHandler>((event) => {
    const executionId = scenario.runtime?.execution.id;
    if (!("executionId" in event) || event.executionId !== executionId) {
      return;
    }

    switch (event.type) {
      case "execution-started":
        observedEventIdsRef.current.clear();
        setExecutionState((current) => ({
          ...current,
          lifecycle: "running",
          observedEventCount: 0,
        }));
        break;
      case "runtime-event-observed": {
        const eventId = String(event.event.id);
        if (observedEventIdsRef.current.has(eventId)) {
          return;
        }
        observedEventIdsRef.current.add(eventId);
        setExecutionState((current) => ({
          ...current,
          observedEventCount: observedEventIdsRef.current.size,
        }));
        break;
      }
      case "execution-paused":
        setExecutionState((current) => ({
          ...current,
          lifecycle: "paused",
        }));
        break;
      case "execution-resumed":
        setExecutionState((current) => ({
          ...current,
          lifecycle: "running",
        }));
        break;
      case "execution-completed":
        setExecutionState((current) => ({
          ...current,
          lifecycle: "completed",
        }));
        break;
      default:
        break;
    }
  }, [scenario.runtime?.execution.id]);

  const executionProgress = executionState.lifecycle === "completed"
    ? 1
    : totalEventCount === 0
      ? 0
      : Math.min(1, executionState.observedEventCount / totalEventCount);

  return (
    <ShowcaseView
      config={config}
      executionLifecycle={executionState.lifecycle}
      executionProgress={executionProgress}
      inspectionEnabled={inspectionEnabled}
      interactionState={interactionState}
      journeySteps={messages.ecosystem.journeySteps}
      locale={locale}
      messages={messages}
      model={scenario.model}
      neuralCoreKey={`${locale}-${selectedScenario}-${executionState.replayKey}`}
      runtime={scenario.runtime}
      scenario={scenario}
      selectedScenario={selectedScenario}
      onInspectionEnabledChange={handleInspectionEnabledChange}
      onInteractionStateChange={handleInteractionStateChange}
      onLocaleChange={handleLocaleChange}
      onNeuralCoreEvent={handleNeuralCoreEvent}
      onPauseToggle={handlePauseToggle}
      onReplay={handleReplay}
      onScenarioChange={handleScenarioChange}
    />
  );
};
