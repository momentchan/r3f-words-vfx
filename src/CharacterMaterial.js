import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import fragmentShader from "./shaders/character/fragment.glsl";
import vertexShader from "./shaders/text/vertex.glsl";

const CharacterMaterial = shaderMaterial(
    {
        time: 0,
        fontColor: new THREE.Color(0.2, 0.0, 0.1),
        fogColor: new THREE.Color(0.2, 0.0, 0.1),
        alpha: 1.0,
        side: THREE.DoubleSide,
        tiling: 1.0,
        speed: 1.0,
        noiseRange: [0, 1],
        screenResolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        ratio: 0.0, // Ratio for text fade-in effect
        seed: Math.random(),
        hshift: 0,
        fogDensity: 0.0,
    },
    vertexShader,
    fragmentShader
);

export { CharacterMaterial };
