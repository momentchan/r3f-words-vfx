import { Cloud, Clouds, Environment, MeshPortalMaterial, Sky, StatsGl, useFBX, useGLTF, useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useControls } from "leva";

export default function PortalContent2({ scale, geometry, rotation }) {

    const { nodes } = useGLTF('aobox-transformed-uv.glb')

    const { color, x, y, z, range, ...config } = useControls(
        'Cloud', {
        seed: { value: 1, min: 1, max: 100, step: 1 },
        segments: { value: 20, min: 1, max: 80, step: 1 },
        volume: { value: 2, min: 0, max: 10, step: 0.1 },
        opacity: { value: 1, min: 0, max: 1, step: 0.01 },
        fade: { value: 10, min: 0, max: 400, step: 1 },
        growth: { value: 2, min: 0, max: 10, step: 1 },
        speed: { value: 0.3, min: 0, max: 1, step: 0.01 },
        color: "white",
    }
    )

    const shape = useRef();
    const s = Math.min(scale[0], scale[1], scale[2]);
    
    const randomSeed = useMemo(() => Math.floor(Math.random() * 100), []);

    useFrame((state, delta) => {
        // shape.current.rotation.y = Math.cos(state.clock.elapsedTime / 2) / 2
        // shape.current.rotation.x = Math.sin(state.clock.elapsedTime / 2) / 2
    })
    useEffect(() => {
        const geometry = nodes.Cube.geometry
        geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(geometry.attributes.uv1.array, 2));
    }, [nodes])

    return (
        <>
            <Environment background resolution={16}>
                <mesh scale={20}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
                </mesh>
            </Environment>

            <group ref={shape}>
                <Clouds material={THREE.MeshBasicMaterial} frustumCulled={false}>
                    <Cloud {...config} bounds={scale} color={color} seed={randomSeed} />
                </Clouds>
            </group>
        </>
    );
};