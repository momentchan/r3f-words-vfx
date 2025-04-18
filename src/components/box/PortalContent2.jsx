import { Cloud, Clouds, Environment } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useControls } from "leva";

const SkyEnvironment = ({ skyColor }) => (
    <Environment background resolution={16}>
        <mesh scale={20}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={skyColor} side={THREE.BackSide} />
        </mesh>
    </Environment>
);

export default function PortalContent2({ scale }) {
    const envControls = useControls('Environment', {
        skyColor: { value: "#87CEEB" }
    });

    const cloudControls = useControls('Cloud', {
        color: { value: "white" },
        segments: { value: 20, min: 1, max: 80, step: 1 },
        volume: { value: 2, min: 0, max: 10, step: 0.1 },
        opacity: { value: 1, min: 0, max: 1, step: 0.01 },
        fade: { value: 10, min: 0, max: 400, step: 1 },
        growth: { value: 2, min: 0, max: 10, step: 1 },
        speed: { value: 0.3, min: 0, max: 1, step: 0.01 }
    });

    const cloudRef = useRef();
    const randomSeed = useMemo(() => Math.floor(Math.random() * 100), []);

    return (
        <>
            <SkyEnvironment skyColor={envControls.skyColor} />
            <group ref={cloudRef}>
                <Clouds material={THREE.MeshBasicMaterial} frustumCulled={false}>
                    <Cloud 
                        bounds={scale} 
                        seed={randomSeed}
                        {...cloudControls}
                    />
                </Clouds>
            </group>
        </>
    );
}