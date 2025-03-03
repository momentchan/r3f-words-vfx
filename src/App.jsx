import { CameraControls, OrbitControls, shaderMaterial, Text } from "@react-three/drei";
import { EffectComposer, HueSaturation, ToneMapping } from "@react-three/postprocessing";
import { Canvas } from '@react-three/fiber';
import Utilities from "./r3f-gist/utility/Utilities";
import { poems } from "./poems";
import { GradientText } from "./GradientText";

const colors = [
    "#4A90E2"
];

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
                    text={poems[1][Math.floor(Math.random() * poems[1].length)]}
                    position={[0, 0, 0]}
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
