import { useEffect, useState } from "react";
import * as THREE from "three";
import { LineSegments, LineBasicMaterial, BufferGeometry, ShaderMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import fragmentShader from "./shaders/edge/fragment.glsl";

const EdgeShaderMaterial = new ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        progress: { value: 0 },
        color: { value: new THREE.Color("white") },
        opacity: { value: 1.0 },
        fogDensity:  { value: 0.0 }
    },
    vertexShader: `
        attribute float edgeProgress;
        varying float vEdgeProgress;
        void main() {
            vEdgeProgress = edgeProgress;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader,
    transparent: true
});

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

export const BoxGridLines = ({ subBoxes, params, animationDuration = 0.5 }) => {
    const [progress, setProgress] = useState(0);
    // const controls = useControls({
    //     p: { value: 0, min: 0, max: 1, step: 0.1 },
    // });

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
        EdgeShaderMaterial.uniforms.progress.value = progress;
        EdgeShaderMaterial.uniforms.color.value.set(params.lineColor);
        EdgeShaderMaterial.uniforms.opacity.value = params.lineOpacity;
        EdgeShaderMaterial.uniforms.fogDensity.value = params.fogDensity
    });

    return (
        <>
            {subBoxes.map((box, i) => (
                <lineSegments key={i} position={[box.x - 5 + box.width / 2, box.y - 5 + box.height / 2, box.z - 5 + box.depth / 2]}>
                    <primitive attach="geometry" object={createBoxEdges([box.width, box.height, box.depth])} />
                    <primitive attach="material" object={EdgeShaderMaterial} />
                </lineSegments>
            ))}
        </>
    );
};
