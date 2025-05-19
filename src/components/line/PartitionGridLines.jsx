import { useState, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import fragmentShader from "../../shaders/edge/partition/fragment.glsl";
import { CustomShaderMaterial } from "../../r3f-gist/shader/CustomShaderMaterial";

/**
 * Combine bounding box lines + partition lines into a single array of {start, end}.
 */
function addBoundingBoxLines(partitionLines) {
  // 12 edges for the bounding box {x=0..10, y=0..10, z=0..10}
  const lines = [
    // bottom square
    { start: [0, 0, 0], end: [10, 0, 0] },
    { start: [0, 0, 0], end: [0, 0, 10] },
    { start: [10, 0, 0], end: [10, 0, 10] },
    { start: [0, 0, 10], end: [10, 0, 10] },
    // top square
    { start: [0, 10, 0], end: [10, 10, 0] },
    { start: [0, 10, 0], end: [0, 10, 10] },
    { start: [10, 10, 0], end: [10, 10, 10] },
    { start: [0, 10, 10], end: [10, 10, 10] },
    // vertical edges
    { start: [0, 0, 0], end: [0, 10, 0] },
    { start: [10, 0, 0], end: [10, 10, 0] },
    { start: [0, 0, 10], end: [0, 10, 10] },
    { start: [10, 0, 10], end: [10, 10, 10] },
  ];
  return [...lines, ...partitionLines];
}

/**
 * Create the large geometry for ALL lines, each with 2 vertices => 6 floats, plus 2 "animatedProgress" floats.
 * We'll store "linesMeta" so we know the offset in the array for each line, to update it in place.
 */
function buildLinesGeometry(lines) {
  // offset lines so bounding box is centered
  const offset = [-5, -5, -5];
  const offsetPoint = ([x, y, z]) => [x + offset[0], y + offset[1], z + offset[2]];

  // each line => 6 floats for position, 2 floats for animatedProgress
  const positionArray = new Float32Array(lines.length * 2 * 3); // (2 vertices) * 3 coords
  const animArray = new Float32Array(lines.length * 2);     // (2 vertices) * 1 float
  const edgeArray = new Float32Array(lines.length * 2);     // (2 vertices) * 1 float

  // linesMeta will store the offset for each line
  const linesMeta = [];

  let posIdx = 0;
  let animIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const start = offsetPoint(line.start);
    const end = offsetPoint(line.end);

    // store start
    positionArray[posIdx + 0] = start[0];
    positionArray[posIdx + 1] = start[1];
    positionArray[posIdx + 2] = start[2];
    // store end
    positionArray[posIdx + 3] = end[0];
    positionArray[posIdx + 4] = end[1];
    positionArray[posIdx + 5] = end[2];

    // init animatedProgress => fully 0 (invisible)
    animArray[animIdx + 0] = 0.0;
    animArray[animIdx + 1] = 0.0;

    edgeArray[animIdx + 0] = 0.0;
    edgeArray[animIdx + 1] = 1.0;

    linesMeta.push({
      lineIndex: i,
      posOffset: posIdx,
      animOffset: animIdx,
      // we can store spawnTime or other line-specific data here
    });

    posIdx += 6;
    animIdx += 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positionArray, 3)
  );
  geometry.setAttribute(
    "animatedProgress",
    new THREE.Float32BufferAttribute(animArray, 1)
  );

  geometry.setAttribute(
    "edge",
    new THREE.Float32BufferAttribute(edgeArray, 1)
  );

  return { geometry, linesMeta };
}

/**
 * BoxGridLines - a single geometry containing all lines. We set each line's "animatedProgress" from 0->1 in place.
 */
export default function PartitionGridLines({
  partitionLines = [],
  params,
  lineSpawnInterval = 0.05,  // seconds between lines becoming active
  fadeDuration = 0.05,       // how long each line takes to fade from 0..1
}) {
  const combinedLines = useMemo(() => addBoundingBoxLines(partitionLines), [partitionLines]);

  // build once
  const { geometry, linesMeta } = useMemo(() => buildLinesGeometry(combinedLines), [combinedLines]);

  // track line states => array of {spawnTime, isActive}
  const [lineStates, setLineStates] = useState([]);

  const mat = useRef()

  // We'll spawn lines in an interval
  useEffect(() => {
    let i = 0;
    let tempStates = [];
    const startTime = performance.now() / 1000;
    const interval = setInterval(() => {
      if (i < linesMeta.length) {
        // push a new line state => spawnTime= now
        tempStates.push({
          ...linesMeta[i],
          spawnTime: performance.now() / 1000,
        });
        setLineStates([...tempStates]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, lineSpawnInterval * 1000);

    return () => clearInterval(interval);
  }, [linesMeta, lineSpawnInterval]);

  // We'll update the "animatedProgress" attribute each frame
  useFrame(() => {
    // update uniform
    // mat.uniforms.color.value.set(params.lineColor);
    mat.current.uniforms.opacity.value = params.lineOpacity;
    mat.current.uniforms.fogDensity.value = params.fogDensity;

    // get the typed arrays from geometry
    const animAttr = geometry.getAttribute("animatedProgress");
    const animArray = animAttr.array; // Float32Array

    const now = performance.now() / 1000;

    // for each line that's "spawned", fade from 0->1 over fadeDuration
    lineStates.forEach((ls) => {
      const elapsed = now - ls.spawnTime;
      const localProgress = Math.min(elapsed / fadeDuration, 1.0);

      // line has 2 vertices => animOffset, animOffset+1
      animArray[ls.animOffset + 0] = localProgress;
      animArray[ls.animOffset + 1] = localProgress;
    });

    // mark attribute as needsUpdate
    animAttr.needsUpdate = true;
  });

  return (
    <lineSegments>
      <primitive attach="geometry" object={geometry} />
      {/* <primitive attach="material" object={SharedLineMaterial} /> */}
      <CustomShaderMaterial
        ref={mat}
        transparent={true}
        vertexShader={`
            attribute float animatedProgress; // 0..1 for fade
            attribute float edge;
            varying float vProgress;
            varying float vEdge;

            void main() {
              vEdge = edge;
              vProgress = animatedProgress;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
        fragmentShader={fragmentShader}
        uniforms={{
          color: new THREE.Color("white"),
          opacity: 1.0,
          fogDensity: 0.0,
        }}

      />
    </lineSegments>
  );
}
