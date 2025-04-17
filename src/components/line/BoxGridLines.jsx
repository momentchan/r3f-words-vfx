import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { BufferGeometry, ShaderMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import fragmentShader from "../shaders/edge/box/fragment.glsl";
import { CustomShaderMaterial } from "../../r3f-gist/shader/CustomShaderMaterial";

function createBoxEdges(box) {
    const vertices = [];
    const edgeProgress = [];
    const indices = [
        [0, 1], [1, 3], [3, 2], [2, 0], // Bottom square
        [4, 5], [5, 7], [7, 6], [6, 4], // Top square
        [0, 4], [1, 5], [2, 6], [3, 7]  // Vertical edges
    ];
    const positions = [
        [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5],
        [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5],
        [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5],
        [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]
    ];

    indices.forEach(([start, end]) => {
        const startPos = positions[start].map((v, i) => v * box[i]);
        const endPos = positions[end].map((v, i) => v * box[i]);

        vertices.push(...startPos, ...endPos);
        edgeProgress.push(0.0, 1.0); // Start at 0, end at 1
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("edgeProgress", new THREE.Float32BufferAttribute(edgeProgress, 1));
    return geometry;
}

export default function BoxGridLines({ subBoxes, params, animationDuration = 0.5 }) {
    const [progress, setProgress] = useState(0);

    const mat = useRef()

    const CustomMat = useMemo(() => (
        <CustomShaderMaterial
            ref={mat}
            attach="material"
            vertexShader={`
            attribute float edgeProgress;
            varying float vEdgeProgress;
            void main() {
                vEdgeProgress = edgeProgress;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `}
            fragmentShader={fragmentShader}
            uniforms={{
                time: { value: 0 },
                progress: { value: 0 },
                color: { value: new THREE.Color("white") },
                opacity: { value: 1.0 },
                fogDensity: { value: 0.0 }
            }}
            transparent
        />
    ), []) // memoize to avoid re-rendering


    useEffect(() => {
        const startTime = performance.now();
        const animate = () => {
            const elapsed = (performance.now() - startTime) / 1000;
            setProgress(Math.min(elapsed / animationDuration, 1));
            if (elapsed < animationDuration) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [subBoxes, animationDuration]);

    useFrame(() => {
        mat.current.uniforms.progress.value = progress;
        mat.current.uniforms.color.value.set(params.lineColor);
        mat.current.uniforms.opacity.value = params.lineOpacity;
        mat.current.uniforms.fogDensity.value = params.fogDensity
    });

    return (
        <>
            {subBoxes.map((box, i) => (
                <lineSegments key={i} position={[box.x - 5 + box.width / 2, box.y - 5 + box.height / 2, box.z - 5 + box.depth / 2]}>
                    <primitive attach="geometry" object={createBoxEdges([box.width, box.height, box.depth])} />
                    {CustomMat}
                </lineSegments>
            ))}
        </>
    );
};
