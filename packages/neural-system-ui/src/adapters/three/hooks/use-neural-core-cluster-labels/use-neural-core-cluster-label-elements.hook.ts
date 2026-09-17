import { useCallback, useEffect, useRef, type RefObject } from "react";

import type { NeuralCoreLabelRect } from "../../../../visualization/labels/neural-core-label-layout.types";

interface NeuralCoreClusterLabelObserverRuntime {
  mutation?: MutationObserver;
  resize?: ResizeObserver;
}

interface UseNeuralCoreClusterLabelElementsResult {
  exclusionMeasurementDirtyRef: RefObject<boolean>;
  exclusionsRef: RefObject<readonly NeuralCoreLabelRect[]>;
  labelElementByIdRef: RefObject<Map<string, HTMLElement>>;
  leaderLineElementByIdRef: RefObject<Map<string, SVGLineElement>>;
  measureExclusions: () => void;
  registerLabelElement: (clusterId: string, element: HTMLElement | null) => void;
  registerLeaderLineElement: (clusterId: string, element: SVGLineElement | null) => void;
  registerOverlayElement: (element: HTMLDivElement | null) => void;
}

export const useNeuralCoreClusterLabelElements = (
  layoutDirtyRef: RefObject<boolean>,
): UseNeuralCoreClusterLabelElementsResult => {
  const labelElementByIdRef = useRef(new Map<string, HTMLElement>());
  const leaderLineElementByIdRef = useRef(new Map<string, SVGLineElement>());
  const overlayElementRef = useRef<HTMLDivElement | null>(null);
  const observerRuntimeRef = useRef<NeuralCoreClusterLabelObserverRuntime>({});
  const exclusionsRef = useRef<readonly NeuralCoreLabelRect[]>([]);
  const exclusionMeasurementDirtyRef = useRef(true);

  const disconnectObservers = useCallback((): void => {
    observerRuntimeRef.current.mutation?.disconnect();
    observerRuntimeRef.current.resize?.disconnect();
    observerRuntimeRef.current = {};
  }, []);

  const registerOverlayElement = useCallback((element: HTMLDivElement | null): void => {
    disconnectObservers();
    overlayElementRef.current = element;
    exclusionMeasurementDirtyRef.current = true;
    layoutDirtyRef.current = true;
    if (!element) {
      return;
    }
    const boundary = element.closest<HTMLElement>("[data-neural-core-label-boundary]")
      ?? element.parentElement;
    if (!boundary) {
      return;
    }
    if (typeof MutationObserver !== "undefined") {
      const mutation = new MutationObserver(() => {
        exclusionMeasurementDirtyRef.current = true;
        layoutDirtyRef.current = true;
      });
      mutation.observe(boundary, { childList: true, subtree: true });
      observerRuntimeRef.current.mutation = mutation;
    }
    if (typeof ResizeObserver !== "undefined") {
      const resize = new ResizeObserver(() => {
        exclusionMeasurementDirtyRef.current = true;
        layoutDirtyRef.current = true;
      });
      resize.observe(boundary);
      resize.observe(element);
      observerRuntimeRef.current.resize = resize;
    }
  }, [disconnectObservers, layoutDirtyRef]);

  const registerLabelElement = useCallback((
    clusterId: string,
    element: HTMLElement | null,
  ): void => {
    if (element) {
      labelElementByIdRef.current.set(clusterId, element);
    } else {
      labelElementByIdRef.current.delete(clusterId);
    }
  }, []);

  const registerLeaderLineElement = useCallback((
    clusterId: string,
    element: SVGLineElement | null,
  ): void => {
    if (element) {
      leaderLineElementByIdRef.current.set(clusterId, element);
    } else {
      leaderLineElementByIdRef.current.delete(clusterId);
    }
  }, []);

  const measureExclusions = useCallback((): void => {
    const overlay = overlayElementRef.current;
    if (!overlay || !exclusionMeasurementDirtyRef.current) {
      return;
    }
    exclusionMeasurementDirtyRef.current = false;
    const overlayRect = overlay.getBoundingClientRect();
    const boundary = overlay.closest<HTMLElement>("[data-neural-core-label-boundary]")
      ?? overlay.parentElement;
    if (!boundary) {
      exclusionsRef.current = [];
      return;
    }
    const exclusions: NeuralCoreLabelRect[] = [];
    for (const element of boundary.querySelectorAll<HTMLElement>(
      "[data-neural-core-label-exclusion]",
    )) {
      if (element === overlay || element.offsetParent === null) {
        continue;
      }
      const rect = element.getBoundingClientRect();
      const numericRect = {
        x: rect.left - overlayRect.left,
        y: rect.top - overlayRect.top,
        width: rect.width,
        height: rect.height,
      };
      if (
        numericRect.x < overlayRect.width
        && numericRect.y < overlayRect.height
        && numericRect.x + numericRect.width > 0
        && numericRect.y + numericRect.height > 0
      ) {
        exclusions.push(numericRect);
        observerRuntimeRef.current.resize?.observe(element);
      }
    }
    exclusionsRef.current = exclusions;
  }, []);

  useEffect(() => disconnectObservers, [disconnectObservers]);

  return {
    exclusionMeasurementDirtyRef,
    exclusionsRef,
    labelElementByIdRef,
    leaderLineElementByIdRef,
    measureExclusions,
    registerLabelElement,
    registerLeaderLineElement,
    registerOverlayElement,
  };
};
