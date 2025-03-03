import { shaderMaterial, Text } from "@react-three/drei";
import { useFrame } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useState, useEffect } from "react";
import { useControls } from "leva";
import fragmentShader from './fragment.glsl'
import { poems } from "./poems";

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
const randomRotation = () => [
    0,
    (Math.random() * 2 - 1) * Math.PI * 0.1,
    (Math.random() * 2 - 1) * Math.PI * 0.5 // Random rotation within [-PI, PI]
];
export const GradientText = ({ position, color, alpha, speed }) => {
    const selectedPoem = poems[1];
    const getRandomText = (prevText) => {
        let newText;
        do {
            newText = selectedPoem[Math.floor(Math.random() * selectedPoem.length)];
        } while (newText === prevText);
        return newText;
    };
    const [rotation, setRotation] = useState(randomRotation())


    const [text, setText] = useState(getRandomText(null))

    const controls = useControls({
        tiling: { value: 1.0, min: 0.1, max: 5.0, step: 0.1 },
        noiseSpeed: { value: 0.1, min: 0, max: 1.0, step: 0.01 },
        noiseRange: [0, 1]
    });

    const material = useMemo(() => {
        const mat = new ColorShiftMaterial({
            color: new THREE.Color(color),
            alpha,
            side: THREE.DoubleSide,
            tiling: controls.tiling,
            speed: controls.noiseSpeed,
            screenResolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });
        mat.transparent = true;
        mat.depthWrite = false;
        mat.blending = THREE.NormalBlending; // Ensuring transparency with normal blending
        return mat;
    }, []);
    const [displayText, setDisplayText] = useState();
    const [charIndex, setCharIndex] = useState(0);
    const [startTime, setStartTime] = useState(0);

    const [resetScheduled, setResetScheduled] = useState(false);
    // useEffect(() => {
    //     let startTime = performance.now();
    //     let lastIndex = 0;
    
    //     const updateText = (elapsedTime) => {
    //         let index = Math.floor(elapsedTime / speed);
    //         if (index !== lastIndex && index < text.length) {
    //             setDisplayText(text.slice(0, index + 1));
    //             lastIndex = index;
    //         } else if (index >= text.length) {
    //             setTimeout(() => {
    //                 setDisplayText("");
    //                 setText((prevText) => getRandomText(prevText));
    //                 setRotation(randomRotation());
    //                 startTime = performance.now(); // Restart timing
    //             }, 1000);
    //         }
    //     };
    
    //     const frameCallback = () => {
    //         const elapsedTime = performance.now() - startTime;
    //         updateText(elapsedTime);
    //     };
    
    //     useFrame(frameCallback);
    
    //     return () => {
    //         useFrame(null);
    //     };
    // }, [text]);

     useFrame((state) => {
        material.uniforms.tiling.value = controls.tiling;
        material.uniforms.speed.value = controls.noiseSpeed;
        material.uniforms.noiseRange.value = controls.noiseRange;
        material.uniforms.time.value = state.clock.elapsedTime;

        if (startTime === 0) setStartTime(state.clock.elapsedTime);
        const elapsedTime = state.clock.elapsedTime - startTime;

        const currentIndex = Math.floor(elapsedTime * 1000 / speed);
        if (currentIndex !== charIndex && currentIndex < text.length) {
            setDisplayText(text.slice(0, currentIndex + 1));
            setCharIndex(currentIndex);
        } else if (currentIndex >= text.length && !resetScheduled) {
            setResetScheduled(true); // Prevent multiple resets
            setTimeout(() => {
                setDisplayText("");
                setText((prevText) => getRandomText(prevText));
                setRotation(randomRotation());
                setCharIndex(0);
                setStartTime(state.clock.elapsedTime);
                setResetScheduled(false); // Allow next reset
            }, 1000);
        }
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