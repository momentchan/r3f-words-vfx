import { Text } from "@react-three/drei";
import { useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CharacterMaterial } from "./CharacterMaterial.js";
import { useControls } from "leva";

export default function Character({ charData, lifetime = 3 }) {
    const [startTime, setStartTime] = useState(0);

    const controls = useControls({
        color: { value: "#4A90E2" },
    });


    const material = useMemo(() => {
        const mat = new CharacterMaterial({
            color: new THREE.Color(0.2, 0.0, 0.1),
            alpha: 1.0,
            side: THREE.DoubleSide,
            tiling: 1.0,
            speed: 1.0,
            noiseRange: [0, 1],
            screenResolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
            ratio: 0.0
        });
        mat.transparent = true;
        mat.depthWrite = false;
        mat.blending = THREE.NormalBlending;
        return mat;
    }, []);

    useEffect(() => {
        setStartTime(performance.now() / 1000 + charData.delay);
    }, []);

    useFrame((state) => {
        const elapsedTime = (performance.now() / 1000) - startTime;
        const ratio = Math.min(elapsedTime / lifetime, 1);
        material.uniforms.ratio.value = ratio;
        material.uniforms.color.value.set(controls.color);
        material.uniforms.alpha.value = charData.alpha
    });

    return (
        <Text
            fontSize={charData.scale} // Randomized size
            position={charData.position}
            rotation={charData.rotation}
            anchorX="center"
            material={material}
        >
            {charData.char}
        </Text>
    );
}
