import { Text } from "@react-three/drei";
import { useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CharacterMaterial } from "../CharacterMaterial.js";
import { useControls } from "leva";

export default function Character({ index, charData, lifetime = 3, params }) {
    const [startTime, setStartTime] = useState(0);

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
        material.uniforms.ratio.value = ratio;
        material.uniforms.fontColor.value.set(params.fontColor);
        material.uniforms.fogColor.value.set(params.fogColor);
        material.uniforms.alpha.value = charData.alpha
        material.uniforms.fogDensity.value = params.fogDensity
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
