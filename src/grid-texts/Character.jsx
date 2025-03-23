import { Text } from "@react-three/drei";
import { useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CharacterMaterial } from "../CharacterMaterial.js";
import { folder, useControls } from "leva";

export default function Character({ index, charData, lifetime = 3, params }) {
    const [startTime, setStartTime] = useState(0);

    const controls = useControls({
        'Character': folder({
            fontColor: { value: "#4A90E2" },
            tiling: { value: 1, min: 0, max: 10, step: 0.05 },
            speed: { value: 0.1, min: 0, max: 1, step: 0.05 },
            noiseRange: [0.5, 1],
        })
    });

    const material = useMemo(() => {
        const mat = new CharacterMaterial();
        mat.transparent = true;
        mat.depthWrite = false;
        mat.blending = THREE.NormalBlending;
        return mat;
    }, []);
    

    useEffect(() => {
        setStartTime(performance.now() / 1000 + charData.delay * index);
    }, []);

    useFrame((state) => {
        const elapsedTime = (performance.now() / 1000) - startTime;
        const ratio = Math.min(elapsedTime / lifetime, 1);
        material.uniforms.time.value = state.clock.elapsedTime;
        material.uniforms.ratio.value = ratio;
        material.uniforms.fontColor.value.set(controls.fontColor);
        material.uniforms.fogColor.value.set(params.fogColor);
        material.uniforms.alpha.value = charData.alpha
        material.uniforms.fogDensity.value = params.fogDensity
        material.uniforms.tiling.value = controls.tiling
        material.uniforms.speed.value = controls.speed
        material.uniforms.noiseRange.value = controls.noiseRange
    });

    return (
        <Text
            font="./NotoSansJP-Regular.ttf"
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
