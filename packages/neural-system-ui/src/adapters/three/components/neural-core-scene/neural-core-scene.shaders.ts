export const PROPAGATION_POINT_VERTEX_SHADER = `
  attribute vec3 color;
  attribute float aSize;
  attribute float aOpacity;
  varying vec3 vColor;
  varying float vOpacity;
  uniform float uPointScale;
  uniform float uMinimumScreenSize;
  uniform float uMaximumScreenSize;
  uniform float uDistanceScaleInfluence;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vColor = color;
    vOpacity = aOpacity;
    float constantSize = aSize * uPointScale;
    float attenuatedSize = constantSize / max(0.1, -viewPosition.z);
    gl_PointSize = clamp(
      mix(constantSize, attenuatedSize, uDistanceScaleInfluence),
      uMinimumScreenSize,
      uMaximumScreenSize
    );
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const PROPAGATION_POINT_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float distanceToCenter = length(centered);
    float edge = max(fwidth(distanceToCenter), 0.004);
    float circleAlpha = 1.0 - smoothstep(0.5 - edge, 0.5 + edge, distanceToCenter);
    float core = 1.0 - smoothstep(0.06, 0.3, distanceToCenter);
    float halo = 1.0 - smoothstep(0.24, 0.5, distanceToCenter);
    float alpha = circleAlpha * (core * 0.68 + halo * 0.3) * vOpacity;
    if (alpha <= 0.001) discard;
    vec3 luminousColor = min(vColor * (0.76 + core * 0.38), vec3(1.18));
    gl_FragColor = vec4(luminousColor, alpha);
  }
`;

export const AMBIENT_POINT_VERTEX_SHADER = `
  attribute vec3 color;
  varying vec3 vColor;
  varying float vOpacity;
  uniform float uSize;
  uniform float uOpacity;
  uniform float uPointScale;
  uniform float uMinimumScreenSize;
  uniform float uMaximumScreenSize;
  uniform float uDistanceScaleInfluence;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float constantSize = uSize * uPointScale;
    float attenuatedSize = constantSize / max(0.1, -viewPosition.z);
    gl_PointSize = clamp(
      mix(constantSize, attenuatedSize, uDistanceScaleInfluence),
      uMinimumScreenSize,
      uMaximumScreenSize
    );
    vColor = color;
    vOpacity = uOpacity;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const AMBIENT_POINT_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    float edge = max(fwidth(distanceToCenter), 0.005);
    float circleAlpha = 1.0 - smoothstep(0.5 - edge, 0.5 + edge, distanceToCenter);
    float core = 1.0 - smoothstep(0.04, 0.28, distanceToCenter);
    float halo = 1.0 - smoothstep(0.2, 0.5, distanceToCenter);
    float alpha = circleAlpha * (core * 0.58 + halo * 0.28) * vOpacity;
    if (alpha <= 0.001) discard;
    gl_FragColor = vec4(min(vColor * (0.72 + core * 0.3), vec3(1.12)), alpha);
  }
`;

export const BASE_NODE_VERTEX_SHADER = `
  attribute vec3 color;
  attribute vec3 aSemanticTint;
  attribute vec4 aSemanticAppearance;
  attribute vec4 aSemanticBehavior;
  attribute vec4 aSemanticDynamics;
  attribute float aClusterGrammarOpacity;
  uniform float uTime;
  uniform float uBasePointSize;
  uniform float uPointScale;
  uniform float uBaseOpacity;
  uniform float uMinimumScreenSize;
  uniform float uMaximumScreenSize;
  uniform float uMaximumJitterDistance;
  uniform float uMaximumFragmentationDistance;
  uniform float uNodeDecayThresholdSpread;
  varying vec3 vColor;
  varying float vOpacity;
  varying float vFill;
  varying float vBrightness;
  varying float vSemanticPresence;
  #include <fog_pars_vertex>

  vec3 semanticNoise(float seed) {
    return normalize(vec3(
      sin(seed * 91.7 + 0.4),
      sin(seed * 157.3 + 1.7),
      sin(seed * 233.9 + 3.1)
    ));
  }

  void main() {
    float aSemanticBrightness = aSemanticAppearance.x;
    float aSemanticColorInfluence = aSemanticAppearance.y;
    float aSemanticScale = aSemanticAppearance.z;
    float aSemanticOpacity = aSemanticAppearance.w;

    float aSemanticJitter = aSemanticBehavior.x;
    float aSemanticFragmentation = aSemanticBehavior.y;
    float aSemanticDecay = aSemanticBehavior.z;
    float aSemanticFill = aSemanticBehavior.w;

    float aSemanticSynchronization = aSemanticDynamics.x;
    float aSemanticPulseFrequency = aSemanticDynamics.y;
    float aSemanticPulseAmplitude = aSemanticDynamics.z;
    float aSemanticSeed = aSemanticDynamics.w;

    vec3 direction = semanticNoise(aSemanticSeed);
    float jitterWave = sin(uTime * 0.55 + aSemanticSeed * 31.0);
    vec3 semanticPosition = position
      + direction * aSemanticJitter * uMaximumJitterDistance * jitterWave * 0.18
      + direction * aSemanticFragmentation * uMaximumFragmentationDistance
        * (0.35 + aSemanticSeed * 0.65);
    vec4 mvPosition = modelViewMatrix * vec4(semanticPosition, 1.0);
    float synchronizedPhase = aSemanticSeed * 6.28318 * (1.0 - aSemanticSynchronization);
    float pulse = 1.0 + sin(
      uTime * max(0.35, aSemanticPulseFrequency) + synchronizedPhase
    ) * aSemanticPulseAmplitude * 0.2;
    float spread = max(0.02, uNodeDecayThresholdSpread);
    float brightnessDecay = smoothstep(
      aSemanticSeed - spread,
      aSemanticSeed,
      aSemanticDecay
    );
    float sizeDecay = smoothstep(
      aSemanticSeed - spread * 0.35,
      aSemanticSeed + spread * 0.35,
      aSemanticDecay
    );
    float opacityDecay = smoothstep(
      aSemanticSeed,
      aSemanticSeed + spread,
      aSemanticDecay
    );
    float pointSize = uBasePointSize * aSemanticScale * (1.0 - sizeDecay * 0.68)
      * (1.0 + aSemanticFill * 0.26) * pulse;
    vColor = mix(color, aSemanticTint, aSemanticColorInfluence);
    vOpacity = uBaseOpacity * aSemanticOpacity * aClusterGrammarOpacity
      * (1.0 - opacityDecay * 0.96);
    vFill = aSemanticFill;
    vBrightness = aSemanticBrightness * (1.0 - brightnessDecay * 0.55);
    vSemanticPresence = clamp(
      max(
        max(aSemanticColorInfluence, aSemanticFill),
        max(
          max(aSemanticDecay, aSemanticFragmentation),
          max(aSemanticPulseAmplitude, abs(aSemanticBrightness - 1.0))
        )
      ),
      0.0,
      1.0
    );
    gl_PointSize = clamp(
      pointSize * (uPointScale / max(0.1, -mvPosition.z)),
      uMinimumScreenSize,
      uMaximumScreenSize
    );
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

export const BASE_NODE_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vFill;
  varying float vBrightness;
  varying float vSemanticPresence;
  #include <fog_pars_fragment>

  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float edge = max(fwidth(distanceToCenter), 0.004);
    float circleAlpha = 1.0 - smoothstep(0.5 - edge, 0.5 + edge, distanceToCenter);
    float core = 1.0 - smoothstep(0.06, 0.34, distanceToCenter);
    float glow = 1.0 - smoothstep(0.18, 0.5, distanceToCenter);
    float fill = 1.0 - smoothstep(0.05, 0.46, distanceToCenter);
    float semanticAlpha = (core * 0.62 + glow * 0.38 + fill * vFill * 0.24)
      * vOpacity * circleAlpha;
    float baseAlpha = circleAlpha * vOpacity * (0.48 + glow * 0.52);
    float alpha = mix(baseAlpha, semanticAlpha, vSemanticPresence);
    vec3 semanticColor = vColor
      * (0.76 + core * 0.52 + vFill * 0.2)
      * vBrightness;
    vec3 outputColor = mix(vColor, semanticColor, vSemanticPresence);
    if (alpha <= 0.002) discard;
    gl_FragColor = vec4(outputColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
  }
`;

export const BASE_CONNECTION_VERTEX_SHADER = `
  attribute vec3 aSemanticColor;
  attribute float aSemanticOpacity;
  attribute float aClusterGrammarOpacity;
  varying vec3 vColor;
  varying float vOpacity;
  #include <fog_pars_vertex>

  void main() {
    vColor = aSemanticColor;
    vOpacity = aSemanticOpacity * aClusterGrammarOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

export const BASE_CONNECTION_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vOpacity;
  #include <fog_pars_fragment>

  void main() {
    if (vOpacity <= 0.001) discard;
    gl_FragColor = vec4(vColor, vOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
  }
`;

export const SEMANTIC_RIBBON_VERTEX_SHADER = `
  attribute vec3 aOtherPosition;
  attribute vec3 color;
  attribute float aSide;
  attribute float aThickness;
  attribute float aSemanticOpacity;
  attribute float aClusterGrammarOpacity;
  attribute float aSemanticInstability;
  attribute float aSemanticFragmentation;
  attribute float aSemanticInterruption;
  attribute float aSemanticPulseFrequency;
  attribute float aSemanticPulseIntensity;
  attribute float aRouteSeed;
  attribute float aRouteProgress;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uFocusLensThickness;
  varying vec3 vColor;
  varying float vOpacity;
  varying float vInstability;
  varying float vFragmentation;
  varying float vInterruption;
  varying float vPulseFrequency;
  varying float vPulseIntensity;
  varying float vRouteSeed;
  varying float vRouteProgress;

  void main() {
    vec4 currentClip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec4 otherClip = projectionMatrix * modelViewMatrix * vec4(aOtherPosition, 1.0);
    vec2 currentNdc = currentClip.xy / max(0.0001, currentClip.w);
    vec2 otherNdc = otherClip.xy / max(0.0001, otherClip.w);
    vec2 lineDirection = normalize(otherNdc - currentNdc + vec2(0.00001));
    vec2 normal = vec2(-lineDirection.y, lineDirection.x);
    float thicknessWave = sin(
      aRouteProgress * 18.0 + aRouteSeed * 31.0 + uTime * 0.85
    );
    float stableThickness = aThickness * uFocusLensThickness
      * (1.0 + thicknessWave * aSemanticInstability * 0.08);
    vec2 pixelOffset = normal * aSide * stableThickness * 2.0
      / max(uResolution, vec2(1.0));
    currentClip.xy += pixelOffset * currentClip.w;
    vColor = color;
    vOpacity = aSemanticOpacity * aClusterGrammarOpacity;
    vInstability = aSemanticInstability;
    vFragmentation = aSemanticFragmentation;
    vInterruption = aSemanticInterruption;
    vPulseFrequency = aSemanticPulseFrequency;
    vPulseIntensity = aSemanticPulseIntensity;
    vRouteSeed = aRouteSeed;
    vRouteProgress = aRouteProgress;
    gl_Position = currentClip;
  }
`;

export const SEMANTIC_RIBBON_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uMaximumOpacityVariation;
  varying vec3 vColor;
  varying float vOpacity;
  varying float vInstability;
  varying float vFragmentation;
  varying float vInterruption;
  varying float vPulseFrequency;
  varying float vPulseIntensity;
  varying float vRouteSeed;
  varying float vRouteProgress;

  void main() {
    float opacityWave = 0.5 + 0.5 * sin(
      vRouteProgress * 16.0 + vRouteSeed * 37.0 + uTime * 0.7
    );
    float irregular = 1.0
      - opacityWave * vInstability * uMaximumOpacityVariation;
    float interruptionSignal = 0.5 + 0.5 * sin(
      vRouteProgress * 33.0 + vRouteSeed * 53.0 - uTime * 0.48
    );
    float fragmentationSignal = 0.5 + 0.5 * sin(
      vRouteProgress * 57.0 + vRouteSeed * 71.0
    );
    float interruptionGap = smoothstep(0.48, 0.72, interruptionSignal)
      * vInterruption;
    float fragmentationGap = smoothstep(0.55, 0.78, fragmentationSignal)
      * vFragmentation;
    float visibility = 1.0 - max(interruptionGap * 0.9, fragmentationGap * 0.96);
    float pulseCarrier = 0.5 + 0.5 * sin(
      vRouteProgress * 21.0 + vRouteSeed * 29.0
        - uTime * (1.1 + vPulseFrequency * 3.4)
    );
    float pulse = smoothstep(0.42, 0.92, pulseCarrier) * vPulseIntensity;
    float alpha = vOpacity * irregular * visibility * (1.0 + pulse * 0.22);
    if (alpha <= 0.002) discard;
    gl_FragColor = vec4(vColor * (0.9 + alpha * 0.45 + pulse * 0.24), alpha);
  }
`;

export const SELECTED_CLUSTER_ENVELOPE_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const SELECTED_CLUSTER_ENVELOPE_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uEdgeSoftness;
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vViewDirection)));
    float edgePower = mix(1.25, 4.2, clamp(uEdgeSoftness, 0.0, 1.0));
    float edge = pow(1.0 - facing, edgePower);
    float alpha = uOpacity * edge;
    if (alpha <= 0.001) discard;
    gl_FragColor = vec4(uColor * (0.72 + edge * 0.18), alpha);
  }
`;
