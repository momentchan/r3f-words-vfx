import { CameraControls, Effects, OrbitControls, shaderMaterial, Sphere, Text } from "@react-three/drei";
import { Bloom, EffectComposer, Glitch, HueSaturation, ToneMapping } from "@react-three/postprocessing";
import { Canvas } from '@react-three/fiber';
import Utilities from "./r3f-gist/utility/Utilities";
import { poems } from "./poems";
import { GradientText } from "./GradientText";
import CustomOverlay from "./CustomOverlay";
import { useRef } from "react";
import * as THREE from 'three';
import { GridTexts } from "./GridTexts";

const colors = [
    "#4A90E2"
];

export default function App() {
    const composer = useRef()
    
    return (
        <Canvas
            shadows
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [4, 2, 6]
            }}
            gl={{ preserveDrawingBuffer: true,
             }}

            // linear  // remember to use it to fix color
        >
            <color args={ [ '#cccccc' ] } attach="background" />
            <CameraControls makeDefault />
            {/* {Array.from({ length: 500 }, (_, index) => (
                <GradientText
                    key={index}
                    text={poems[1][Math.floor(Math.random() * poems[1].length)]}
                    color={colors[index % colors.length]}
                    speed={50 + Math.random() * 100}
                />
            ))} */}


            <GridTexts
                color={colors[0]}
                text={"空は広がり、雲は静かに流れる"}
            />
            {/* <mesh>
                <sphereGeometry/>
                <meshBasicMaterial/>
            </mesh> */}
            <EffectComposer ref={composer}>
                {/* <ToneMapping/> */}
                <CustomOverlay/>
                {/* <Bloom intensity={20} luminanceThreshold={0.0} luminanceSmoothing={0.2} /> */}
            </EffectComposer>
            <Utilities />
        </Canvas>
    );
}
