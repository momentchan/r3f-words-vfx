import { CameraControls, OrbitControls, shaderMaterial, Text } from "@react-three/drei";
import { Bloom, EffectComposer, HueSaturation, ToneMapping } from "@react-three/postprocessing";
import { Canvas, useFrame } from '@react-three/fiber';
import Utilities from "./r3f-gist/utility/Utilities";
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useState, useEffect } from "react";
import { useControls } from "leva";
import fragmentShader from './fragment.glsl'

const ColorShiftMaterial = shaderMaterial(
    {
        time: 0,
        color: new THREE.Color(0.2, 0.0, 0.1),
        alpha: 1.0,
        side: THREE.DoubleSide,
        tiling: 1.0,
        speed: 1.0,
        noiseRange: [0, 1],
        screenResolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    },
    // vertex shader
    /*glsl*/`
      varying vec2 vUv;
      
      void main() {
        vUv = uv; // Object UV
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader
);

// Extend Three.js with the custom shader material
extend({ ColorShiftMaterial });

const poem = [
    "The sky stretches vast and blue",
    "A gentle breeze whispers through",
    "Golden light spills on the ground",
    "A world reborn in colors new",
    "The stars will shine when night is near",
    "Their whispers echo, calm and clear",
    "Endless waves crash upon the shore, carrying whispers of ancient tides and lost memories in an eternal dance"
];
const chinesePoem = [
    "天空遼闊，雲朵輕飄",
    "微風吹過，呢喃輕響",
    "金色陽光灑落大地",
    "世界在晨曦中緩緩甦醒",
    "夜幕降臨，星辰閃耀",
    "它們低語著古老的傳說",
    "海浪翻湧，拍打著海岸，每一滴浪花都蘊藏著千年的記憶，訴說著消逝的時光與未曾抵達的夢境"
];
const japanesePoem = [
    "空は広がり、雲は静かに流れる",
    "そよ風が吹き、囁くように語る",
    "黄金の光が大地を照らす",
    "世界は朝の輝きの中で目を覚ます",
    "夜が訪れ、星が瞬く",
    "彼らは遠い昔の物語を紡ぐ",
    "波は果てしなく寄せては返し、千年の記憶を運びながら、消えた時と辿り着かなかった夢をささやき続ける"
];
const colors = [
    "#4A90E2"
];

const randomPosition = (index, total) => {
    return [
        0,
        0,
        0
    ];
};
const randomRotation = () => [
    0,
    (Math.random() * 2 - 1) * Math.PI * 0.1,
    (Math.random() * 2 - 1) * Math.PI * 0.5 // Random rotation within [-PI, PI]
];

const GradientText = ({ text, position, color, alpha, speed, rotation }) => {

    const controls = useControls({
        tiling: { value: 1.0, min: 0.1, max: 5.0, step: 0.1 },
        noiseSpeed: { value: 0.1, min: 0, max: 1.0, step: 0.01 },
        noiseRange: [0, 1]
    });

    const material = useMemo(() => new ColorShiftMaterial({
        color: new THREE.Color(color),
        alpha, side: THREE.DoubleSide,
        tiling: controls.tiling,
        speed: controls.noiseSpeed,
        screenResolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    })
        , []);
    const [displayText, setDisplayText] = useState();

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);
    useFrame((state, delta) => {
        material.uniforms.tiling.value = controls.tiling;
        material.uniforms.speed.value = controls.noiseSpeed;
        material.uniforms.noiseRange.value = controls.noiseRange;
        material.uniforms.time.value = state.clock.elapsedTime;
    });
    return (
        <Text
            fontSize={0.5}
            position={position}
            rotation={rotation}
            material={material}
            anchorX="left"
        >
            {displayText}
        </Text>
    );
};

export default function App() {
    return (
        <Canvas
            shadows
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [4, 2, 6]
            }}
            gl={{ preserveDrawingBuffer: true }}
        >
            <CameraControls makeDefault />
            {Array.from({ length: 200 }, (_, index) => (
                <GradientText
                    key={index}
                    text={japanesePoem[Math.floor(Math.random() * poem.length)]}
                    position={[0, 0, 0]}
                    rotation={randomRotation()}
                    color={colors[index % colors.length]}
                    alpha={0.1 + Math.random() * 0.2}
                    speed={50 + Math.random() * 100}
                />
            ))}
            <EffectComposer>
                {/* <ToneMapping /> */}
                {/* <Bloom intensity={0.5} luminanceThreshold={0.3} luminanceSmoothing={0.2} /> */}
            </EffectComposer>
            <Utilities />
        </Canvas>
    );
}
