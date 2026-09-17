import type { ReactElement } from "react";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  NormalBlending,
  Vector2,
} from "three";
import { Html } from "@react-three/drei";

import type { NeuralCoreSceneViewProps } from "./neural-core-scene-view.types";
import {
  NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG,
} from "../../../../visualization/propagation/neural-core-operational-protagonist-marker.constants";
import {
  OPERATIONAL_COMET_FRAGMENT_SHADER,
  OPERATIONAL_COMET_VERTEX_SHADER,
} from "../../shaders/neural-core-operational-protagonist-marker.shaders";
import {
  AMBIENT_POINT_FRAGMENT_SHADER,
  AMBIENT_POINT_VERTEX_SHADER,
  BASE_CONNECTION_FRAGMENT_SHADER,
  BASE_CONNECTION_VERTEX_SHADER,
  BASE_NODE_FRAGMENT_SHADER,
  BASE_NODE_VERTEX_SHADER,
  PROPAGATION_POINT_FRAGMENT_SHADER,
  PROPAGATION_POINT_VERTEX_SHADER,
  SELECTED_CLUSTER_ENVELOPE_FRAGMENT_SHADER,
  SELECTED_CLUSTER_ENVELOPE_VERTEX_SHADER,
  SEMANTIC_RIBBON_FRAGMENT_SHADER,
  SEMANTIC_RIBBON_VERTEX_SHADER,
} from "./neural-core-scene.shaders";

const NEURAL_CORE_FOG_COLOR = new Color("#050816");
const NEURAL_CORE_FOG_NEAR = 3.9;
const NEURAL_CORE_FOG_FAR = 6.8;

const convertSrgbChannelToLinear = (channel: number): number => {
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
};

const getLinearHexColor = (hex: string): [number, number, number] => {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  const packedColor = Number.isFinite(value) ? value : 0x8ff4ff;
  return [
    convertSrgbChannelToLinear(((packedColor >> 16) & 255) / 255),
    convertSrgbChannelToLinear(((packedColor >> 8) & 255) / 255),
    convertSrgbChannelToLinear((packedColor & 255) / 255),
  ];
};

export const NeuralCoreSceneView = ({
  ambientPulseMaterialRef,
  baseRef,
  clusterActivationColorRef,
  clusterActivationField,
  clusterActivationGeometryRef,
  clusterActivationPositionRef,
  clusterActivationOpacityRef,
  clusterActivationSizeRef,
  clusterLabelOverlay,
  inspectionCameraControls,
  connectionBuffers,
  connectionFields,
  connectionRef,
  coreNodes,
  coreRef,
  focusHaloMaterialRef,
  focusHaloRef,
  selectedEnvelopeMaterialRef,
  selectedEnvelopeRef,
  hubRef,
  hubs,
  networkRef,
  nodeClouds,
  nodeCloudRef,
  particleField,
  particleMaterialRef,
  particlePositionRef,
  propagationPulseColorRef,
  propagationPulseField,
  propagationPulseGeometryRef,
  propagationPulsePositionRef,
  propagationPulseOpacityRef,
  propagationPulseSizeRef,
  operationalProtagonistMarkerColorRef,
  operationalProtagonistMarkerField,
  operationalProtagonistMarkerGeometryRef,
  operationalProtagonistMarkerMaterialRef,
  operationalProtagonistMarkerOpacityRef,
  operationalProtagonistMarkerPositionRef,
  operationalProtagonistMarkerSizeRef,
  operationalProtagonistMarkerTangentRef,
  propagationConfig,
  pulseField,
  pulseColorRef,
  pulsePositionRef,
  ringRef,
  rings,
  semanticPointCloudFields,
  semanticRibbonAttributeRefs,
  semanticRibbonField,
  semanticRibbonMaterialRef,
  semanticVisualizationConfig,
  stableFunctionalBlending,
  clusterGrammarBufferState,
  clusterGrammarConnectionOpacityRefs,
  clusterGrammarNodeOpacityRefs,
  clusterGrammarRibbonOpacityRef,
  clusterGrammarVisuals,
}: NeuralCoreSceneViewProps): ReactElement => {
  const functionalBlending = stableFunctionalBlending
    ? NormalBlending
    : AdditiveBlending;
  return (
    <>
      {inspectionCameraControls}
      <group ref={networkRef}>
      {clusterGrammarVisuals}
      <group ref={baseRef} position={[0, -1.74, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.48, 0.0065, 8, 192]} />
          <meshBasicMaterial color="#26d9ff" transparent opacity={0.34} blending={AdditiveBlending} depthWrite={false} userData={{ baseOpacity: 0.34 }} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.88, 0.0048, 8, 160]} />
          <meshBasicMaterial color="#8a6dff" transparent opacity={0.16} blending={AdditiveBlending} depthWrite={false} userData={{ baseOpacity: 0.16 }} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.12, 96]} />
          <meshBasicMaterial color="#26d9ff" transparent opacity={0.052} blending={AdditiveBlending} depthWrite={false} userData={{ baseOpacity: 0.052 }} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <coneGeometry args={[0.78, 1.72, 72, 1, true]} />
          <meshBasicMaterial color="#26d9ff" transparent opacity={0.035} blending={AdditiveBlending} depthWrite={false} userData={{ baseOpacity: 0.035 }} />
        </mesh>
      </group>

      <group ref={ringRef}>
        {rings.map((ring) => (
          <mesh key={ring.id} rotation={ring.rotation} userData={{ speed: ring.speed, phase: ring.phase }}>
            <torusGeometry args={[ring.radius, ring.tubeRadius, 8, 224]} />
            <meshBasicMaterial color={ring.color} transparent opacity={ring.opacity} blending={AdditiveBlending} depthWrite={false} userData={{ baseOpacity: ring.opacity }} />
          </mesh>
        ))}
      </group>

      <points>
        <bufferGeometry>
          <bufferAttribute ref={particlePositionRef} attach="attributes-position" args={[particleField.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleField.colors, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={particleMaterialRef}
          vertexShader={AMBIENT_POINT_VERTEX_SHADER}
          fragmentShader={AMBIENT_POINT_FRAGMENT_SHADER}
          uniforms={{
            uSize: { value: particleField.size },
            uOpacity: { value: particleField.opacity },
            uPointScale: { value: 300 },
            uMinimumScreenSize: { value: 1 },
            uMaximumScreenSize: { value: 4.5 },
            uDistanceScaleInfluence: { value: 0.82 },
          }}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <group ref={connectionRef}>
        {connectionBuffers.map((buffer, bufferIndex) => {
          const semanticField = connectionFields[bufferIndex];

          return (
          <lineSegments key={buffer.bucket}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[buffer.positions, 3]} />
              <bufferAttribute
                attach="attributes-aSemanticColor"
                args={[semanticField.colors, 3]}
              />
              <bufferAttribute
                attach="attributes-aSemanticOpacity"
                args={[semanticField.opacities, 1]}
              />
              <bufferAttribute
                ref={clusterGrammarConnectionOpacityRefs[bufferIndex]}
                attach="attributes-aClusterGrammarOpacity"
                args={[clusterGrammarBufferState.connectionOpacities[bufferIndex], 1]}
              />
            </bufferGeometry>
            <shaderMaterial
              vertexShader={BASE_CONNECTION_VERTEX_SHADER}
              fragmentShader={BASE_CONNECTION_FRAGMENT_SHADER}
              uniforms={{
                fogColor: { value: NEURAL_CORE_FOG_COLOR },
                fogNear: { value: NEURAL_CORE_FOG_NEAR },
                fogFar: { value: NEURAL_CORE_FOG_FAR },
              }}
              fog
              transparent
              blending={functionalBlending}
              depthWrite={false}
            />
          </lineSegments>
          );
        })}
      </group>

      <mesh frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[semanticRibbonField.positions, 3]} />
          <bufferAttribute attach="attributes-aOtherPosition" args={[semanticRibbonField.otherPositions, 3]} />
          <bufferAttribute attach="attributes-aSide" args={[semanticRibbonField.sides, 1]} />
          <bufferAttribute
            ref={semanticRibbonAttributeRefs.thickness}
            attach="attributes-aThickness"
            args={[semanticRibbonField.thicknesses, 1]}
          />
          <bufferAttribute
            ref={semanticRibbonAttributeRefs.color}
            attach="attributes-color"
            args={[semanticRibbonField.colors, 3]}
          />
          <bufferAttribute
            ref={semanticRibbonAttributeRefs.opacity}
            attach="attributes-aSemanticOpacity"
            args={[semanticRibbonField.opacities, 1]}
          />
          <bufferAttribute
            ref={clusterGrammarRibbonOpacityRef}
            attach="attributes-aClusterGrammarOpacity"
            args={[clusterGrammarBufferState.ribbonOpacities, 1]}
          />
          <bufferAttribute
            ref={semanticRibbonAttributeRefs.instability}
            attach="attributes-aSemanticInstability"
            args={[semanticRibbonField.instabilities, 1]}
          />
          <bufferAttribute
            ref={semanticRibbonAttributeRefs.fragmentation}
            attach="attributes-aSemanticFragmentation"
            args={[semanticRibbonField.fragmentations, 1]}
          />
          <bufferAttribute
            ref={semanticRibbonAttributeRefs.interruption}
            attach="attributes-aSemanticInterruption"
            args={[semanticRibbonField.interruptions, 1]}
          />
          <bufferAttribute
            ref={semanticRibbonAttributeRefs.pulseFrequency}
            attach="attributes-aSemanticPulseFrequency"
            args={[semanticRibbonField.pulseFrequencies, 1]}
          />
          <bufferAttribute
            ref={semanticRibbonAttributeRefs.pulseIntensity}
            attach="attributes-aSemanticPulseIntensity"
            args={[semanticRibbonField.pulseIntensities, 1]}
          />
          <bufferAttribute attach="attributes-aRouteSeed" args={[semanticRibbonField.routeSeeds, 1]} />
          <bufferAttribute
            attach="attributes-aRouteProgress"
            args={[semanticRibbonField.routeProgresses, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={semanticRibbonMaterialRef}
          vertexShader={SEMANTIC_RIBBON_VERTEX_SHADER}
          fragmentShader={SEMANTIC_RIBBON_FRAGMENT_SHADER}
          uniforms={{
            uTime: { value: 0 },
            uFocusLensThickness: { value: 1 },
            uResolution: { value: { x: 1560, y: 840 } },
            uMaximumOpacityVariation: {
              value: semanticVisualizationConfig.failure.maximumRouteOpacityVariation,
            },
          }}
          transparent
          side={DoubleSide}
          blending={functionalBlending}
          depthWrite={false}
        />
      </mesh>

      <group ref={nodeCloudRef}>
        {nodeClouds.map((cloud, cloudIndex) => {
          const semanticField = semanticPointCloudFields[cloudIndex];

          return (
          <points key={cloud.kind}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
              <bufferAttribute attach="attributes-color" args={[cloud.colors, 3]} />
              <bufferAttribute attach="attributes-aSemanticTint" args={[semanticField.colors, 3]} />
              <bufferAttribute
                attach="attributes-aSemanticAppearance"
                args={[semanticField.appearance, 4]}
              />
              <bufferAttribute
                attach="attributes-aSemanticBehavior"
                args={[semanticField.behavior, 4]}
              />
              <bufferAttribute
                attach="attributes-aSemanticDynamics"
                args={[semanticField.dynamics, 4]}
              />
              <bufferAttribute
                ref={clusterGrammarNodeOpacityRefs[cloudIndex]}
                attach="attributes-aClusterGrammarOpacity"
                args={[clusterGrammarBufferState.pointCloudOpacities[cloudIndex], 1]}
              />
            </bufferGeometry>
            <shaderMaterial
              vertexShader={BASE_NODE_VERTEX_SHADER}
              fragmentShader={BASE_NODE_FRAGMENT_SHADER}
              uniforms={{
                uTime: { value: 0 },
                uBasePointSize: { value: cloud.size },
                uPointScale: { value: 300 },
                uBaseOpacity: { value: cloud.opacity },
                uMinimumScreenSize: { value: 1 },
                uMaximumScreenSize: { value: 12 },
                uMaximumJitterDistance: {
                  value: semanticVisualizationConfig.cluster.maximumJitterDistance,
                },
                uMaximumFragmentationDistance: {
                  value: semanticVisualizationConfig.failure.maximumNodeFragmentationDistance,
                },
                uNodeDecayThresholdSpread: {
                  value: semanticVisualizationConfig.failure.nodeDecayThresholdSpread,
                },
                fogColor: { value: NEURAL_CORE_FOG_COLOR },
                fogNear: { value: NEURAL_CORE_FOG_NEAR },
                fogFar: { value: NEURAL_CORE_FOG_FAR },
              }}
              fog
              transparent
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </points>
          );
        })}
      </group>

      <points>
        <bufferGeometry>
          <bufferAttribute ref={pulsePositionRef} attach="attributes-position" args={[pulseField.positions, 3]} />
          <bufferAttribute ref={pulseColorRef} attach="attributes-color" args={[pulseField.colors, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={ambientPulseMaterialRef}
          vertexShader={AMBIENT_POINT_VERTEX_SHADER}
          fragmentShader={AMBIENT_POINT_FRAGMENT_SHADER}
          uniforms={{
            uSize: { value: pulseField.size },
            uOpacity: { value: pulseField.opacity },
            uPointScale: { value: 300 },
            uMinimumScreenSize: { value: 1.5 },
            uMaximumScreenSize: { value: 7 },
            uDistanceScaleInfluence: { value: 0.76 },
          }}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <points frustumCulled={false}>
        <bufferGeometry ref={clusterActivationGeometryRef} drawRange={{ start: 0, count: 0 }}>
          <bufferAttribute
            ref={clusterActivationPositionRef}
            attach="attributes-position"
            args={[clusterActivationField.positions, 3]}
          />
          <bufferAttribute
            ref={clusterActivationColorRef}
            attach="attributes-color"
            args={[clusterActivationField.colors, 3]}
          />
          <bufferAttribute
            ref={clusterActivationSizeRef}
            attach="attributes-aSize"
            args={[clusterActivationField.sizes, 1]}
          />
          <bufferAttribute
            ref={clusterActivationOpacityRef}
            attach="attributes-aOpacity"
            args={[clusterActivationField.opacities, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={PROPAGATION_POINT_VERTEX_SHADER}
          fragmentShader={PROPAGATION_POINT_FRAGMENT_SHADER}
          uniforms={{
            uPointScale: { value: 300 },
            uMinimumScreenSize: { value: propagationConfig.pulse.minimumScreenSize },
            uMaximumScreenSize: {
              value: Math.max(
                propagationConfig.pulse.minimumScreenSize,
                propagationConfig.pulse.maximumScreenSize * 0.82,
              ),
            },
            uDistanceScaleInfluence: { value: propagationConfig.pulse.distanceScaleInfluence },
          }}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <points frustumCulled={false}>
        <bufferGeometry ref={propagationPulseGeometryRef} drawRange={{ start: 0, count: 0 }}>
          <bufferAttribute
            ref={propagationPulsePositionRef}
            attach="attributes-position"
            args={[propagationPulseField.positions, 3]}
          />
          <bufferAttribute
            ref={propagationPulseColorRef}
            attach="attributes-color"
            args={[propagationPulseField.colors, 3]}
          />
          <bufferAttribute
            ref={propagationPulseSizeRef}
            attach="attributes-aSize"
            args={[propagationPulseField.sizes, 1]}
          />
          <bufferAttribute
            ref={propagationPulseOpacityRef}
            attach="attributes-aOpacity"
            args={[propagationPulseField.opacities, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={PROPAGATION_POINT_VERTEX_SHADER}
          fragmentShader={PROPAGATION_POINT_FRAGMENT_SHADER}
          uniforms={{
            uPointScale: { value: 300 },
            uMinimumScreenSize: { value: propagationConfig.pulse.minimumScreenSize },
            uMaximumScreenSize: { value: propagationConfig.pulse.maximumScreenSize },
            uDistanceScaleInfluence: { value: propagationConfig.pulse.distanceScaleInfluence },
          }}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <points frustumCulled={false} renderOrder={6}>
        <bufferGeometry
          ref={operationalProtagonistMarkerGeometryRef}
          drawRange={{ start: 0, count: 0 }}
        >
          <bufferAttribute
            ref={operationalProtagonistMarkerPositionRef}
            attach="attributes-position"
            args={[operationalProtagonistMarkerField.positions, 3]}
          />
          <bufferAttribute
            ref={operationalProtagonistMarkerColorRef}
            attach="attributes-color"
            args={[operationalProtagonistMarkerField.colors, 3]}
          />
          <bufferAttribute
            ref={operationalProtagonistMarkerTangentRef}
            attach="attributes-aTangent"
            args={[operationalProtagonistMarkerField.tangents, 3]}
          />
          <bufferAttribute
            ref={operationalProtagonistMarkerSizeRef}
            attach="attributes-aSize"
            args={[operationalProtagonistMarkerField.sizes, 1]}
          />
          <bufferAttribute
            ref={operationalProtagonistMarkerOpacityRef}
            attach="attributes-aOpacity"
            args={[operationalProtagonistMarkerField.opacities, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={operationalProtagonistMarkerMaterialRef}
          vertexShader={OPERATIONAL_COMET_VERTEX_SHADER}
          fragmentShader={OPERATIONAL_COMET_FRAGMENT_SHADER}
          uniforms={{
            uViewport: { value: new Vector2(1, 1) },
            uPointScale: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG.pointScale,
            },
            uMinimumScreenLength: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG
                .minimumScreenLength,
            },
            uMaximumScreenLength: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG
                .maximumScreenLength,
            },
            uDistanceScaleInfluence: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG
                .distanceScaleInfluence,
            },
            uTangentProbeLength: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG
                .tangentProbeLength,
            },
            uAspectRatio: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG.aspectRatio,
            },
            uHeadPosition: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG.headPosition,
            },
            uHeadRadius: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG.headRadius,
            },
            uTailLength: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG.tailLength,
            },
            uTailMaximumWidth: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG
                .tailMaximumWidth,
            },
            uTailFalloff: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG.tailFalloff,
            },
            uSemanticColorInfluence: {
              value: NEURAL_CORE_OPERATIONAL_PROTAGONIST_MARKER_CONFIG
                .semanticColorInfluence,
            },
          }}
          transparent
          blending={NormalBlending}
          depthTest
          depthWrite={false}
        />
      </points>

      <group ref={hubRef}>
        {hubs.map((hub) => (
          <group
            key={hub.id}
            position={hub.position}
            scale={hub.baseScale}
            userData={{
              basePosition: hub.position,
              baseScale: hub.baseScale,
              phase: hub.phase,
              nodeId: hub.id,
            }}
          >
            <mesh>
              <sphereGeometry args={[hub.radius, 12, 12]} />
              <meshBasicMaterial
                color={hub.color}
                transparent
                opacity={0.9}
                fog
                blending={AdditiveBlending}
                depthWrite={false}
                userData={{ baseColor: getLinearHexColor(hub.color), baseOpacity: 0.9 }}
              />
            </mesh>
            <mesh scale={1.62}>
              <sphereGeometry args={[hub.radius, 12, 12]} />
              <meshBasicMaterial
                color={hub.color}
                transparent
                opacity={0.12}
                fog
                blending={AdditiveBlending}
                depthWrite={false}
                userData={{ baseColor: getLinearHexColor(hub.color), baseOpacity: 0.12 }}
              />
            </mesh>
          </group>
        ))}
      </group>

      <group ref={coreRef}>
        {coreNodes.map((node) => (
          <group
            key={node.id}
            position={node.position}
            scale={node.baseScale}
            userData={{
              basePosition: node.position,
              baseScale: node.baseScale,
              phase: node.phase,
              nodeId: node.id,
            }}
          >
            <mesh>
              <sphereGeometry args={[node.radius, 16, 16]} />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={0.98}
                fog
                blending={AdditiveBlending}
                depthWrite={false}
                userData={{ baseColor: getLinearHexColor(node.color), baseOpacity: 0.98 }}
              />
            </mesh>
            <mesh scale={1.9}>
              <sphereGeometry args={[node.radius, 16, 16]} />
              <meshBasicMaterial
                color="#26d9ff"
                transparent
                opacity={0.24}
                fog
                blending={AdditiveBlending}
                depthWrite={false}
                userData={{ baseColor: getLinearHexColor("#26d9ff"), baseOpacity: 0.24 }}
              />
            </mesh>
            <mesh scale={2.65}>
              <sphereGeometry args={[node.radius, 16, 16]} />
              <meshBasicMaterial
                color="#8a6dff"
                transparent
                opacity={0.085}
                fog
                blending={AdditiveBlending}
                depthWrite={false}
                userData={{ baseColor: getLinearHexColor("#8a6dff"), baseOpacity: 0.085 }}
              />
            </mesh>
          </group>
        ))}
      </group>
      </group>

      <mesh ref={focusHaloRef} visible={false} renderOrder={4}>
        <torusGeometry args={[1, 0.012, 10, 112]} />
        <meshBasicMaterial
          ref={focusHaloMaterialRef}
          color="#82efff"
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthTest
          depthWrite={false}
        />
      </mesh>

      <mesh ref={selectedEnvelopeRef} visible={false} renderOrder={-2}>
        <sphereGeometry args={[1, 36, 24]} />
        <shaderMaterial
          ref={selectedEnvelopeMaterialRef}
          vertexShader={SELECTED_CLUSTER_ENVELOPE_VERTEX_SHADER}
          fragmentShader={SELECTED_CLUSTER_ENVELOPE_FRAGMENT_SHADER}
          uniforms={{
            uColor: { value: new Color("#82efff") },
            uOpacity: { value: 0 },
            uEdgeSoftness: { value: 0.58 },
          }}
          transparent
          side={DoubleSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {clusterLabelOverlay ? (
        <Html fullscreen style={{ pointerEvents: "none" }}>
          {clusterLabelOverlay}
        </Html>
      ) : null}
    </>
  );
};
