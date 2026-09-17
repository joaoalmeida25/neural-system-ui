import { useState, type ComponentType, type ReactElement } from "react";

import {
  DemoSelector,
  type DemoId,
} from "./components/demo-selector/demo-selector.component";
import { InspectionNeuralCoreExample } from "./examples/inspection.example";
import { MinimalNeuralCoreExample } from "./examples/minimal.example";
import { OperationalNeuralCoreExample } from "./examples/operational.example";

const DEMOS: Readonly<Record<DemoId, ComponentType>> = {
  minimal: MinimalNeuralCoreExample,
  inspection: InspectionNeuralCoreExample,
  operational: OperationalNeuralCoreExample,
};

export const App = (): ReactElement => {
  const [selectedDemo, setSelectedDemo] = useState<DemoId>("inspection");
  const SelectedDemo = DEMOS[selectedDemo];

  return (
    <main className="app">
      <DemoSelector selectedDemo={selectedDemo} onSelectDemo={setSelectedDemo} />
      <section className="demo-viewport" aria-label={`${selectedDemo} demo`}>
        <SelectedDemo />
      </section>
    </main>
  );
};
