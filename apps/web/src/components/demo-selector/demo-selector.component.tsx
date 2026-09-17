import type { ReactElement } from "react";

export type DemoId = "minimal" | "inspection" | "operational";

interface DemoSelectorProps {
  onSelectDemo: (demo: DemoId) => void;
  selectedDemo: DemoId;
}

const DEMO_OPTIONS: readonly { id: DemoId; label: string }[] = [
  { id: "minimal", label: "Minimal" },
  { id: "inspection", label: "Inspection" },
  { id: "operational", label: "Operational" },
];

export const DemoSelector = ({
  onSelectDemo,
  selectedDemo,
}: DemoSelectorProps): ReactElement => (
  <nav className="demo-selector" aria-label="Neural System UI demos">
    {DEMO_OPTIONS.map((option) => (
      <button
        key={option.id}
        className="demo-selector__button"
        type="button"
        aria-pressed={selectedDemo === option.id}
        onClick={() => onSelectDemo(option.id)}
      >
        {option.label}
      </button>
    ))}
  </nav>
);
