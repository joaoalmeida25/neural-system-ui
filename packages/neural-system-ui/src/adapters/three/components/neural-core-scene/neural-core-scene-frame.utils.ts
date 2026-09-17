import type { RefObject } from "react";
import {
  Color,
  type BufferAttribute,
  Group,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Points,
  ShaderMaterial,
} from "three";

import { dampNeuralCoreSceneDirectionValue } from "../../../../visualization/direction/neural-core-scene-direction.utils";
import type {
  NeuralCoreParticle,
  NeuralCorePulse,
  NeuralCoreVector3,
} from "../../../../visualization/graph/neural-core-graph.types";
import type {
  NeuralCoreOperationalEndpointReactionState,
} from "../../../../visualization/propagation/neural-core-propagation-buffer.types";
import type { NeuralCorePropagationVisualState } from "../../../../visualization/propagation/neural-core-propagation-visual.types";
import type { NeuralCoreSemanticNodeField } from "../../../../visualization/semantic/neural-core-semantic-buffer.types";

const POINT_CLOUD_SEMANTIC_ATTRIBUTE_NAMES = [
  "aSemanticTint",
  "aSemanticAppearance",
  "aSemanticBehavior",
  "aSemanticDynamics",
] as const;

const smoothStep = (minimum: number, maximum: number, value: number): number => {
  if (maximum <= minimum) {
    return value >= maximum ? 1 : 0;
  }
  const amount = Math.min(1, Math.max(0, (value - minimum) / (maximum - minimum)));
  return amount * amount * (3 - 2 * amount);
};

export const writeRotatedSceneVector = (
  source: NeuralCoreVector3,
  rotationX: number,
  rotationY: number,
  rotationZ: number,
  scale: number,
  target: NeuralCoreVector3,
): void => {
  const sourceX = source[0] * scale;
  const sourceY = source[1] * scale;
  const sourceZ = source[2] * scale;
  const cosineX = Math.cos(rotationX);
  const sineX = Math.sin(rotationX);
  const afterXy = sourceY * cosineX - sourceZ * sineX;
  const afterXz = sourceY * sineX + sourceZ * cosineX;
  const cosineY = Math.cos(rotationY);
  const sineY = Math.sin(rotationY);
  const afterYx = sourceX * cosineY + afterXz * sineY;
  const afterYz = -sourceX * sineY + afterXz * cosineY;
  const cosineZ = Math.cos(rotationZ);
  const sineZ = Math.sin(rotationZ);
  target[0] = afterYx * cosineZ - afterXy * sineZ;
  target[1] = afterYx * sineZ + afterXy * cosineZ;
  target[2] = afterYz;
};

export const animatePulseGroup = (
  group: Group,
  elapsedTime: number,
  baseIntensity: number,
  nodeActivationById: Float32Array,
  nodeBufferIndexById: Int32Array,
  nodeField: NeuralCoreSemanticNodeField,
  maximumFragmentationDistance: number,
  decayThresholdSpread: number,
  grammarOpacityByGraphIndex?: Float32Array,
): void => {
  for (const child of group.children) {
    const phase = child.userData.phase;
    const baseScale = child.userData.baseScale;
    const nodeId = child.userData.nodeId;
    const basePosition = child.userData.basePosition;

    if (
      typeof phase !== "number"
      || typeof baseScale !== "number"
      || typeof nodeId !== "number"
      || !Array.isArray(basePosition)
    ) {
      continue;
    }

    const localActivation = nodeId < nodeActivationById.length
      ? nodeActivationById[nodeId]
      : 0;
    const nodeIndex = nodeId < nodeBufferIndexById.length
      ? nodeBufferIndexById[nodeId]
      : -1;
    const semanticScale = nodeIndex >= 0 ? nodeField.scales[nodeIndex] : 1;
    const semanticOpacity = nodeIndex >= 0 ? nodeField.opacities[nodeIndex] : 1;
    const semanticBrightness = nodeIndex >= 0 ? nodeField.brightnesses[nodeIndex] : 1;
    const semanticDecay = nodeIndex >= 0 ? nodeField.decays[nodeIndex] : 0;
    const fragmentation = nodeIndex >= 0 ? nodeField.fragmentations[nodeIndex] : 0;
    const colorInfluence = nodeIndex >= 0 ? nodeField.colorInfluences[nodeIndex] : 0;
    const seed = nodeIndex >= 0 ? nodeField.seeds[nodeIndex] : 0.5;
    const spread = Math.max(0.02, decayThresholdSpread);
    const brightnessDecay = smoothStep(seed - spread, seed, semanticDecay);
    const sizeDecay = smoothStep(
      seed - spread * 0.35,
      seed + spread * 0.35,
      semanticDecay,
    );
    const opacityDecay = smoothStep(seed, seed + spread, semanticDecay);
    const directionX = Math.sin(seed * 91.7 + 0.4);
    const directionY = Math.sin(seed * 157.3 + 1.7);
    const directionZ = Math.sin(seed * 233.9 + 3.1);
    const directionLength = Math.max(0.0001, Math.hypot(directionX, directionY, directionZ));
    const fragmentationDistance = fragmentation * maximumFragmentationDistance
      * (0.35 + seed * 0.65);
    child.position.set(
      Number(basePosition[0]) + directionX / directionLength * fragmentationDistance,
      Number(basePosition[1]) + directionY / directionLength * fragmentationDistance,
      Number(basePosition[2]) + directionZ / directionLength * fragmentationDistance,
    );
    const pulse = Math.sin(elapsedTime * (0.92 + localActivation * 0.42) + phase);
    child.scale.setScalar(
      baseScale * semanticScale * (1 - sizeDecay * 0.68)
        * (1 + pulse * baseIntensity + localActivation * (0.08 + pulse * 0.025)),
    );

    for (const meshChild of child.children) {
      const mesh = meshChild as Mesh;
      const material = mesh.material as MeshBasicMaterial;
      const baseColor = material.userData.baseColor;
      const baseOpacity = material.userData.baseOpacity;
      if (
        !Array.isArray(baseColor)
        || baseColor.length < 3
        || typeof baseOpacity !== "number"
      ) {
        continue;
      }
      const colorOffset = nodeIndex * 3;
      const semanticRed = nodeIndex >= 0 ? nodeField.colors[colorOffset] : 0.5;
      const semanticGreen = nodeIndex >= 0 ? nodeField.colors[colorOffset + 1] : 0.92;
      const semanticBlue = nodeIndex >= 0 ? nodeField.colors[colorOffset + 2] : 1;
      const brightness = semanticBrightness * (1 - brightnessDecay * 0.55);
      const baseRed = Number(baseColor[0]);
      const baseGreen = Number(baseColor[1]);
      const baseBlue = Number(baseColor[2]);
      material.color.setRGB(
        (baseRed + (semanticRed - baseRed) * colorInfluence) * brightness,
        (baseGreen + (semanticGreen - baseGreen) * colorInfluence) * brightness,
        (baseBlue + (semanticBlue - baseBlue) * colorInfluence) * brightness,
      );
      const grammarOpacity = grammarOpacityByGraphIndex && nodeIndex >= 0
        ? grammarOpacityByGraphIndex[nodeIndex]
        : 1;
      material.opacity = baseOpacity * semanticOpacity
        * (1 - opacityDecay * 0.96) * grammarOpacity;
    }
  }
};

export const animateRingGroup = (group: Group, elapsedTime: number): void => {
  group.rotation.y = elapsedTime * 0.018;
  group.rotation.x = Math.sin(elapsedTime * 0.12) * 0.035;

  group.children.forEach((child): void => {
    const speed = child.userData.speed;
    const phase = child.userData.phase;

    if (typeof speed !== "number" || typeof phase !== "number") {
      return;
    }

    child.rotation.z = elapsedTime * speed + phase;
  });
};

export const updateParticlePositions = (
  attribute: BufferAttribute,
  particles: NeuralCoreParticle[],
  animationTime: number,
): void => {
  const positions = attribute.array;

  if (!(positions instanceof Float32Array)) {
    return;
  }

  particles.forEach((particle, index): void => {
    const offset = index * 3;
    const phase = particle.phase + animationTime * particle.speed;

    positions[offset] = particle.basePosition[0] + Math.sin(phase) * particle.drift[0];
    positions[offset + 1] = particle.basePosition[1] + Math.cos(phase * 0.77) * particle.drift[1];
    positions[offset + 2] = particle.basePosition[2] + Math.sin(phase * 0.63) * particle.drift[2];
  });

  attribute.needsUpdate = true;
};

export const updateAmbientPulseAttributes = (
  positionAttribute: BufferAttribute,
  colorAttribute: BufferAttribute,
  pulses: NeuralCorePulse[],
  elapsedTime: number,
): void => {
  const positions = positionAttribute.array;
  const colors = colorAttribute.array;

  if (!(positions instanceof Float32Array) || !(colors instanceof Float32Array)) {
    return;
  }

  pulses.forEach((pulse, index): void => {
    const offset = index * 3;
    const routeProgress = pulse.phase + elapsedTime * pulse.speed;
    const routeIndex = Math.floor(routeProgress) % pulse.routes.length;
    const progress = routeProgress - Math.floor(routeProgress);
    const route = pulse.routes[routeIndex];
    const ease = progress * progress * (3 - 2 * progress);
    const fade = Math.sin(progress * Math.PI);
    const routeCenterBoost = 1 - Math.abs(progress - 0.5) * 2;
    const shimmer = Math.sin((elapsedTime * 2.2 + pulse.phase) * Math.PI) * 0.011;
    const packedColor = Number.parseInt(pulse.color.replace("#", ""), 16);
    const red = ((packedColor >> 16) & 255) / 255;
    const green = ((packedColor >> 8) & 255) / 255;
    const blue = (packedColor & 255) / 255;
    const intensity = 0.18 + Math.pow(fade, 0.72) * 1.82 + routeCenterBoost * 0.12;

    positions[offset] = route.from[0] + (route.to[0] - route.from[0]) * ease + shimmer;
    positions[offset + 1] = route.from[1] + (route.to[1] - route.from[1]) * ease;
    positions[offset + 2] = route.from[2] + (route.to[2] - route.from[2]) * ease - shimmer;

    colors[offset] = red * intensity;
    colors[offset + 1] = green * intensity;
    colors[offset + 2] = blue * intensity;
  });

  positionAttribute.needsUpdate = true;
  colorAttribute.needsUpdate = true;
};

export const markAttributeForUpdate = (
  attribute: { needsUpdate: boolean } | null | undefined,
): void => {
  if (attribute) {
    attribute.needsUpdate = true;
  }
};

export const updatePointCloudMaterials = (
  group: Group | null,
  elapsedTime: number,
  pointScale: number,
  markAttributes: boolean,
): void => {
  if (!group) {
    return;
  }

  for (const child of group.children) {
    const points = child as Points;
    const material = points.material as ShaderMaterial;
    if (material.uniforms.uTime) {
      material.uniforms.uTime.value = elapsedTime;
    }
    if (material.uniforms.uPointScale) {
      material.uniforms.uPointScale.value = pointScale;
    }
    if (!markAttributes) {
      continue;
    }
    for (const attributeName of POINT_CLOUD_SEMANTIC_ATTRIBUTE_NAMES) {
      markAttributeForUpdate(points.geometry.getAttribute(attributeName));
    }
  }
};

export const markConnectionAttributesForUpdate = (group: Group | null): void => {
  if (!group) {
    return;
  }
  for (const child of group.children) {
    const line = child as LineSegments;
    markAttributeForUpdate(line.geometry.getAttribute("aSemanticColor"));
    markAttributeForUpdate(line.geometry.getAttribute("aSemanticOpacity"));
  }
};

export const updateDecorativeGroupOpacity = (
  group: Group | null,
  weight: number,
  response: number,
  deltaSeconds: number,
): void => {
  if (!group) {
    return;
  }
  for (const child of group.children) {
    const mesh = child as Mesh;
    const material = mesh.material as MeshBasicMaterial;
    const baseOpacity = material.userData.baseOpacity;
    if (typeof baseOpacity !== "number") {
      continue;
    }
    material.opacity = dampNeuralCoreSceneDirectionValue(
      material.opacity,
      baseOpacity * weight,
      response,
      deltaSeconds,
    );
  }
};

export const updateClusterTerritoryVisuals = (
  territoryRefs: readonly RefObject<Group | null>[],
  clusterStates: readonly {
    territoryOpacity: number;
    territoryScale: number;
    boundaryOpacity: number;
    hubOpacity: number;
    hubScale: number;
    activityIntensity: number;
  }[],
  endpointReaction: NeuralCoreOperationalEndpointReactionState,
  elapsedSeconds: number,
): void => {
  territoryRefs.forEach((territoryRef, index): void => {
    const group = territoryRef.current;
    const state = clusterStates[index];
    if (!group || !state) {
      return;
    }
    const clusterId = typeof group.userData.clusterId === "string"
      ? group.userData.clusterId
      : undefined;
    const sourceReactionWeight = clusterId === endpointReaction.sourceClusterId
      ? endpointReaction.sourceWeight
      : 0;
    const targetReactionWeight = clusterId === endpointReaction.targetClusterId
      ? endpointReaction.targetWeight
      : 0;
    const endpointReactionWeight = Math.max(
      sourceReactionWeight,
      targetReactionWeight,
    );
    const activityIntensity = Math.max(
      state.activityIntensity,
      endpointReactionWeight,
    );
    group.scale.setScalar(state.territoryScale);
    const boundary = group.children[0] as Mesh | undefined;
    const boundaryMaterial = boundary?.material as ShaderMaterial | undefined;
    if (boundaryMaterial?.uniforms.uOpacity) {
      boundaryMaterial.uniforms.uOpacity.value = Math.min(
        1,
        state.boundaryOpacity * state.territoryOpacity
          + endpointReactionWeight * 0.035,
      );
    }
    const boundaryColor = boundaryMaterial?.uniforms.uColor?.value;
    const boundarySemanticColor = boundaryMaterial?.userData.semanticColor;
    if (boundaryColor instanceof Color && boundarySemanticColor instanceof Color) {
      const reactionColorWeight = endpointReactionWeight * 0.14;
      boundaryColor.setRGB(
        boundarySemanticColor.r
          + (endpointReaction.red - boundarySemanticColor.r) * reactionColorWeight,
        boundarySemanticColor.g
          + (endpointReaction.green - boundarySemanticColor.g) * reactionColorWeight,
        boundarySemanticColor.b
          + (endpointReaction.blue - boundarySemanticColor.b) * reactionColorWeight,
      );
    }
    const hub = group.children[1] as Group | undefined;
    if (!hub) {
      return;
    }
    const pulse = 1 + Math.sin(elapsedSeconds * (0.72 + activityIntensity * 0.5) + index)
      * 0.025 * activityIntensity;
    hub.scale.setScalar(
      state.hubScale * pulse * (1 + endpointReactionWeight * 0.1),
    );
    hub.rotation.z = elapsedSeconds * 0.08 * (0.4 + activityIntensity);
    for (const child of hub.children) {
      const mesh = child as Mesh;
      const material = mesh.material as MeshBasicMaterial;
      const role = material.userData.role;
      const roleOpacity = role === "hub-ring"
        ? 0.34
        : role === "hub-filaments" ? 0.2 : 0.82;
      const reactionOpacity = role === "hub-core"
        ? 0.42
        : role === "hub-filaments" ? 0.18 : 0.24;
      material.opacity = Math.min(
        1,
        state.hubOpacity * state.territoryOpacity * roleOpacity
          + endpointReactionWeight * reactionOpacity,
      );
      const semanticColor = material.userData.semanticColor;
      if (semanticColor instanceof Color) {
        const reactionColorWeight = endpointReactionWeight * 0.72;
        material.color.setRGB(
          semanticColor.r
            + (endpointReaction.red - semanticColor.r) * reactionColorWeight,
          semanticColor.g
            + (endpointReaction.green - semanticColor.g) * reactionColorWeight,
          semanticColor.b
            + (endpointReaction.blue - semanticColor.b) * reactionColorWeight,
        );
      }
    }
  });
};

export const getPropagationActivity = (visualState: NeuralCorePropagationVisualState): number => {
  let maximumActivity = 0;
  for (const activation of visualState.clusterActivations) {
    maximumActivity = Math.max(maximumActivity, activation.intensity);
  }
  for (const pulse of visualState.pulses) {
    maximumActivity = Math.max(maximumActivity, pulse.intensity);
  }

  return Math.min(1, maximumActivity);
};
