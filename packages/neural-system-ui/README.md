# Neural System UI

Show your system thinking, processing, and communicating in real time.

Neural System UI is a React library for interactive 3D visualization of system architecture, flows, components, and operational execution. Describe a system through the public model, then render it with `NeuralCore` using Three.js and React Three Fiber.

The package is ESM-only, includes TypeScript declarations, and ships its styles as a separate public export. Rendering requires a browser with WebGL support.

## Installation

Install the library and its rendering peers:

```bash
npm install neural-system-ui react react-dom three @react-three/fiber @react-three/drei
```

With pnpm:

```bash
pnpm add neural-system-ui react react-dom three @react-three/fiber @react-three/drei
```

The package declares these peer ranges:

| Package | Supported range |
| --- | --- |
| `react` | `^19.1.0` |
| `three` | `^0.184.0` |
| `@react-three/fiber` | `^9.6.1` |
| `@react-three/drei` | `^10.7.7` |

`react-dom` is used by the host React application and is not a direct peer of Neural System UI.

## Styles

Import the distributed stylesheet once in your application entrypoint:

```ts
import "neural-system-ui/style.css";
```

## Quick Start

```tsx
import {
  NeuralCore,
  type NeuralCoreModelInput,
} from "neural-system-ui";
import "neural-system-ui/style.css";

const model: NeuralCoreModelInput = {
  id: "checkout-system",
  entities: [
    {
      id: "checkout-api",
      label: "Checkout API",
      kind: "service",
    },
  ],
  routes: [],
};

export function App() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
      }}
    >
      <NeuralCore model={model} />
    </div>
  );
}
```

## Structural and Operational Views

Pass a model without `runtime` to present the structure of a system. Add a valid `NeuralCoreRuntimeInput` through the `runtime` prop to present an operational execution, including its events, metrics, impacts, retries, and outcome.

## Core Concepts

- **Entity:** a component, service, process, resource, or other unit in the system.
- **Cluster:** a semantic grouping of related entities.
- **Route:** a directed or bidirectional relationship between entity or cluster endpoints.
- **Pathway:** an ordered operational grouping of routes and clusters.
- **Model:** the complete public description containing entities, clusters, routes, pathways, and metadata.
- **Config:** presentation, inspection, labels, visualization density, presets, and motion preferences.
- **Interaction:** controlled or uncontrolled selection, mode, and pause state exposed through React props.
- **Runtime:** an optional operational execution with timed events and outcome data.

## Public API

Most consumers start with:

- `NeuralCore` and `NeuralCoreProps` for rendering;
- `NeuralCoreModelInput` for system data;
- `NeuralCoreConfigInput` and `createNeuralCoreConfig` for configuration;
- `NeuralCoreRuntimeInput` and `createNeuralCoreRuntime` for operational execution;
- `NeuralCoreInteractionBinding` for controlled or uncontrolled interaction;
- `NeuralCoreEventHandler` and `NeuralCoreErrorHandler` for public callbacks;
- `validateNeuralCoreModel` and `validateNeuralCoreRuntime` for validation.

All supported runtime values and TypeScript contracts are exported from `neural-system-ui`. Internal domain, application, visualization, and adapter modules are not public entrypoints.

## TypeScript and Modules

TypeScript declarations and declaration maps are included with the package. Do not install a separate `@types/neural-system-ui` package.

Neural System UI is currently distributed as ESM-only. CommonJS `require()` is not supported.

## Browser and SSR

Rendering uses browser APIs, WebGL, React Three Fiber, and Three.js. SSR compatibility has not been validated; mount `NeuralCore` in a browser/client rendering context.

## License

A license has not been selected yet. The license decision must be completed before public release.
