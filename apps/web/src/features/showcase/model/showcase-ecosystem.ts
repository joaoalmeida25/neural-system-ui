import type {
  NeuralCoreModelInput,
  NeuralCoreOperationalStatus,
  NeuralCoreRelationKind,
  NeuralCoreSemanticKind,
} from "neural-system-ui";

import type { ShowcaseMessages } from "../../i18n/showcase-i18n";

export const SHOWCASE_CLUSTER_IDS = [
  "experience",
  "commerce",
  "transactions",
  "fulfillment",
  "platform",
  "external",
] as const;

export const SHOWCASE_ENTITY_IDS = [
  "web-app",
  "api-gateway",
  "authentication-service",
  "catalog-service",
  "cart-service",
  "checkout-service",
  "orders-service",
  "inventory-service",
  "fraud-detection-service",
  "payment-service",
  "shipping-service",
  "notification-service",
  "event-bus",
  "cache",
  "primary-database",
  "payment-provider",
] as const;

export const SHOWCASE_ROUTE_IDS = [
  "web-app-to-api-gateway",
  "api-gateway-to-authentication",
  "api-gateway-to-catalog",
  "api-gateway-to-checkout",
  "catalog-to-cache",
  "catalog-to-primary-database",
  "checkout-to-cart",
  "checkout-to-inventory",
  "checkout-to-fraud-detection",
  "checkout-to-payment",
  "checkout-to-orders",
  "payment-to-payment-provider",
  "orders-to-primary-database",
  "orders-to-event-bus",
  "event-bus-to-shipping",
  "event-bus-to-notification",
] as const;

export const SHOWCASE_PATHWAY_IDS = [
  "customer-request",
  "checkout-processing",
  "order-persistence",
  "async-fulfillment",
] as const;

export type ShowcaseClusterId = (typeof SHOWCASE_CLUSTER_IDS)[number];
export type ShowcaseEntityId = (typeof SHOWCASE_ENTITY_IDS)[number];
export type ShowcaseRouteId = (typeof SHOWCASE_ROUTE_IDS)[number];
export type ShowcasePathwayId = (typeof SHOWCASE_PATHWAY_IDS)[number];

export interface ShowcaseScenarioState {
  readonly clusters?: Partial<Readonly<Record<ShowcaseClusterId, NeuralCoreOperationalStatus>>>;
  readonly entities?: Partial<Readonly<Record<ShowcaseEntityId, NeuralCoreOperationalStatus>>>;
  readonly routes?: Partial<Readonly<Record<ShowcaseRouteId, NeuralCoreOperationalStatus>>>;
  readonly pathways?: Partial<Readonly<Record<ShowcasePathwayId, NeuralCoreOperationalStatus>>>;
  readonly activity?: Partial<Readonly<Record<ShowcaseEntityId, number>>>;
}

interface ClusterDefinition {
  readonly id: ShowcaseClusterId;
  readonly kind: NeuralCoreSemanticKind;
  readonly importance: number;
}

interface EntityDefinition {
  readonly id: ShowcaseEntityId;
  readonly clusterId: ShowcaseClusterId;
  readonly kind: NeuralCoreSemanticKind;
  readonly activity: number;
}

interface RouteDefinition {
  readonly id: ShowcaseRouteId;
  readonly source: ShowcaseEntityId;
  readonly target: ShowcaseEntityId;
  readonly relation: NeuralCoreRelationKind;
}

interface PathwayDefinition {
  readonly id: ShowcasePathwayId;
  readonly clusterIds: readonly ShowcaseClusterId[];
  readonly routeIds: readonly ShowcaseRouteId[];
}

const CLUSTERS: readonly ClusterDefinition[] = [
  { id: "experience", kind: "input", importance: 0.9 },
  { id: "commerce", kind: "service", importance: 1 },
  { id: "transactions", kind: "process", importance: 1 },
  { id: "fulfillment", kind: "output", importance: 0.9 },
  { id: "platform", kind: "storage", importance: 0.8 },
  { id: "external", kind: "external-service", importance: 0.7 },
];

const ENTITIES: readonly EntityDefinition[] = [
  { id: "web-app", clusterId: "experience", kind: "input", activity: 0.75 },
  { id: "api-gateway", clusterId: "experience", kind: "gateway", activity: 0.85 },
  { id: "authentication-service", clusterId: "experience", kind: "service", activity: 0.55 },
  { id: "catalog-service", clusterId: "commerce", kind: "service", activity: 0.6 },
  { id: "cart-service", clusterId: "commerce", kind: "service", activity: 0.65 },
  { id: "checkout-service", clusterId: "commerce", kind: "process", activity: 0.95 },
  { id: "orders-service", clusterId: "commerce", kind: "service", activity: 0.8 },
  { id: "inventory-service", clusterId: "transactions", kind: "service", activity: 0.75 },
  { id: "fraud-detection-service", clusterId: "transactions", kind: "decision", activity: 0.7 },
  { id: "payment-service", clusterId: "transactions", kind: "service", activity: 0.85 },
  { id: "shipping-service", clusterId: "fulfillment", kind: "service", activity: 0.7 },
  { id: "notification-service", clusterId: "fulfillment", kind: "service", activity: 0.65 },
  { id: "event-bus", clusterId: "platform", kind: "queue", activity: 0.8 },
  { id: "cache", clusterId: "platform", kind: "cache", activity: 0.55 },
  { id: "primary-database", clusterId: "platform", kind: "database", activity: 0.7 },
  { id: "payment-provider", clusterId: "external", kind: "external-service", activity: 0.65 },
];

const ROUTES: readonly RouteDefinition[] = [
  { id: "web-app-to-api-gateway", source: "web-app", target: "api-gateway", relation: "request" },
  { id: "api-gateway-to-authentication", source: "api-gateway", target: "authentication-service", relation: "request" },
  { id: "api-gateway-to-catalog", source: "api-gateway", target: "catalog-service", relation: "request" },
  { id: "api-gateway-to-checkout", source: "api-gateway", target: "checkout-service", relation: "request" },
  { id: "catalog-to-cache", source: "catalog-service", target: "cache", relation: "data-flow" },
  { id: "catalog-to-primary-database", source: "catalog-service", target: "primary-database", relation: "data-flow" },
  { id: "checkout-to-cart", source: "checkout-service", target: "cart-service", relation: "request" },
  { id: "checkout-to-inventory", source: "checkout-service", target: "inventory-service", relation: "request" },
  { id: "checkout-to-fraud-detection", source: "checkout-service", target: "fraud-detection-service", relation: "request" },
  { id: "checkout-to-payment", source: "checkout-service", target: "payment-service", relation: "request" },
  { id: "checkout-to-orders", source: "checkout-service", target: "orders-service", relation: "request" },
  { id: "payment-to-payment-provider", source: "payment-service", target: "payment-provider", relation: "request" },
  { id: "orders-to-primary-database", source: "orders-service", target: "primary-database", relation: "data-flow" },
  { id: "orders-to-event-bus", source: "orders-service", target: "event-bus", relation: "event" },
  { id: "event-bus-to-shipping", source: "event-bus", target: "shipping-service", relation: "event" },
  { id: "event-bus-to-notification", source: "event-bus", target: "notification-service", relation: "event" },
];

const PATHWAYS: readonly PathwayDefinition[] = [
  {
    id: "customer-request",
    clusterIds: ["experience", "commerce"],
    routeIds: ["web-app-to-api-gateway", "api-gateway-to-checkout"],
  },
  {
    id: "checkout-processing",
    clusterIds: ["commerce", "transactions"],
    routeIds: [
      "checkout-to-cart",
      "checkout-to-inventory",
      "checkout-to-fraud-detection",
      "checkout-to-payment",
      "payment-to-payment-provider",
    ],
  },
  {
    id: "order-persistence",
    clusterIds: ["commerce", "platform"],
    routeIds: ["checkout-to-orders", "orders-to-primary-database"],
  },
  {
    id: "async-fulfillment",
    clusterIds: ["commerce", "platform", "fulfillment"],
    routeIds: [
      "orders-to-event-bus",
      "event-bus-to-shipping",
      "event-bus-to-notification",
    ],
  },
];

export const createShowcaseEcosystem = (
  messages: ShowcaseMessages,
  state: ShowcaseScenarioState,
): NeuralCoreModelInput => ({
  id: "digital-commerce-fulfillment",
  name: messages.ecosystem.name,
  clusters: CLUSTERS.map((cluster) => ({
    ...cluster,
    label: messages.clusters[cluster.id],
    status: state.clusters?.[cluster.id] ?? "success",
    activity: 0.65,
  })),
  entities: ENTITIES.map((entity) => ({
    ...entity,
    label: messages.entities[entity.id],
    status: state.entities?.[entity.id] ?? "success",
    activity: state.activity?.[entity.id] ?? entity.activity,
  })),
  routes: ROUTES.map((route) => ({
    id: route.id,
    source: { kind: "entity", entityId: route.source },
    target: { kind: "entity", entityId: route.target },
    relation: route.relation,
    label: messages.routes[route.id],
    status: state.routes?.[route.id] ?? "active",
  })),
  pathways: PATHWAYS.map((pathway) => ({
    ...pathway,
    label: messages.pathways[pathway.id],
    status: state.pathways?.[pathway.id] ?? "active",
  })),
});
