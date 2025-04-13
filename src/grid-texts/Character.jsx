import { Text } from "@react-three/drei";
import { useEffect, useState, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { folder, useControls } from "leva";
import fragmentShader from "../shaders/character/fragment.glsl";
import vertexShader from "../shaders/text/vertex.glsl";
import { CustomShaderMaterial } from "../r3f-gist/shader/CustomShaderMaterial";

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

    const mat = useRef()

    useEffect(() => {
        setStartTime(performance.now() / 1000 + charData.delay * index);
    }, []);

    useFrame((state) => {
        const elapsedTime = (performance.now() / 1000) - startTime;
        const ratio = Math.min(elapsedTime / lifetime, 1);
        mat.current.uniforms.time.value = state.clock.elapsedTime;
        mat.current.uniforms.ratio.value = ratio;
        mat.current.uniforms.fontColor.value.set(controls.fontColor);
        mat.current.uniforms.fogColor.value.set(params.fogColor);
        mat.current.uniforms.alpha.value = charData.alpha
        mat.current.uniforms.fogDensity.value = params.fogDensity
        mat.current.uniforms.tiling.value = controls.tiling
        mat.current.uniforms.speed.value = controls.speed
        mat.current.uniforms.noiseRange.value = controls.noiseRange
    });

    return (
        <Text
            font="./NotoSansJP-Regular.ttf"
            fontSize={charData.scale} // Randomized size
            position={charData.position}
            rotation={charData.rotation}
            anchorX="center"
        >
            {charData.char}
            <CustomShaderMaterial
                ref={mat}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent={true}
                depthWrite={false}
                side={THREE.DoubleSide}
                uniforms={{
                    time: { value: 0 },
                    fontColor: { value: new THREE.Color(0.2, 0.0, 0.1) },
                    fogColor: { value: new THREE.Color(0.2, 0.0, 0.1) },
                    alpha: { value: 1.0 },
                    side: { value: THREE.DoubleSide },
                    tiling: { value: 1.0 },
                    speed: { value: 1.0 },
                    noiseRange: { value: new THREE.Vector2(0, 1) },
                    screenResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                    ratio: { value: 0.0 },
                    seed: { value: Math.random() },
                    hshift: { value: 0 },
                    fogDensity: { value: 0.0 },
                  }}
            />
        </Text>
    );
}
