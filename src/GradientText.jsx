import { shaderMaterial, Text } from "@react-three/drei";
import { useFrame } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useState, useEffect } from "react";
import { useControls } from "leva";
import fragmentShader from './shaders/text/fragment.glsl'
import vertexShader from './shaders/text/vertex.glsl'
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
        screenResolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        ratio: 0.0, // Initialize typing ratio in shader
        seed: 0.5,
        hshift: 0,
    },
    // vertex shader
    vertexShader
    ,
    fragmentShader
);

// Extend Three.js with the custom shader material
extend({ ColorShiftMaterial });
const randomPositionAndRotation = (minRadius, maxRadius, minAngle, maxAngle) => {
    const radius = Math.random() * (maxRadius - minRadius) + minRadius;
    const theta = Math.random() * (maxAngle - minAngle) + minAngle; // Angle in X-Z plane
    const phi = ((Math.random() - 0.5) * 0.5 + 0.5) * Math.PI; // Vertical angle

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Create an Object3D to compute proper lookAt rotation
    const dummy = new THREE.Object3D();
    dummy.position.set(x, y, z);
    // Make this object look at the origin (0,0,0)
    dummy.lookAt(0, 0, 0);
    dummy.rotateY(Math.PI / 2);
    // Now extract Euler rotation
    const euler = new THREE.Euler().copy(dummy.rotation);

    return {
        position: [x, y, z],
        rotation: [euler.x, euler.y, euler.z] // Face outward from center
    };
};

export const GradientText = ({ minRadius = 0, maxRadius = 5, angle = Math.PI * 0.25, color }) => {
    const selectedPoem = poems[0];
    const getRandomText = (prevText) => {
        let newText;
        do {
            newText = selectedPoem[Math.floor(Math.random() * selectedPoem.length)];
        } while (newText === prevText);
        return newText;
    };
    const { position: initialPosition, rotation: initialRotation } = randomPositionAndRotation(minRadius, maxRadius, -angle, angle);
    const [rotation, setRotation] = useState(initialRotation);
    const [position, setPosition] = useState(initialPosition);
    const [duration, setDuration] = useState(3);
    const [text, setText] = useState(getRandomText(null))

    const controls = useControls({
        tiling: { value: 1.0, min: 0.1, max: 5.0, step: 0.1 },
        noiseSpeed: { value: 0.1, min: 0, max: 1.0, step: 0.01 },
        alpha: { value: 0.2, min: 0, max: 1.0, step: 0.01 },
        hueShift: { value: 0, min: 0, max: 1.0, step: 0.01 },
        noiseRange: [0.5, 1],
    });

    const material = useMemo(() => {
        const mat = new ColorShiftMaterial({
            color: new THREE.Color(color),
            alpha: 1.0,
            side: THREE.DoubleSide,
            tiling: controls.tiling,
            speed: controls.noiseSpeed,
            screenResolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
            ratio: 0.0, // Initialize typing ratio in shader
            seed: Math.random()
        });
        mat.transparent = true;
        mat.depthWrite = false;
        mat.blending = THREE.NormalBlending; // Ensuring transparency with normal blending
        return mat;
    }, []);
    const [startTime, setStartTime] = useState(0);

    useFrame((state) => {
        material.uniforms.tiling.value = controls.tiling;
        material.uniforms.speed.value = controls.noiseSpeed;
        material.uniforms.noiseRange.value = controls.noiseRange;
        material.uniforms.time.value = state.clock.elapsedTime;
        material.uniforms.alpha.value = controls.alpha;
        material.uniforms.hshift.value = controls.hueShift;

        if (startTime === 0) setStartTime(state.clock.elapsedTime + THREE.MathUtils.randFloat(0, 3));
        const elapsedTime = state.clock.elapsedTime - startTime;

        const ratio = Math.min(elapsedTime / duration, 1); // Compute typing ratio
        material.uniforms.ratio.value = ratio;

        if (ratio >= 1) {
            setText((prevText) => getRandomText(prevText));
            const { position: newPosition, rotation: newRotation } = randomPositionAndRotation(minRadius, maxRadius, -angle, angle);
            setPosition(newPosition);
            setRotation(newRotation);
            setDuration(THREE.MathUtils.randFloat(3, 5));
            setStartTime(state.clock.elapsedTime);
        }
    });
    return (
        <Text
            fontSize={0.5}
            font="NotoSansJP-Regular.ttf"
            position={position}
            rotation={rotation}
            material={material}
            anchorX="left"
        >
            {text}
        </Text>
    );
};