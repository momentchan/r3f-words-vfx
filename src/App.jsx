import { Canvas } from '@react-three/fiber';
import { CameraControls } from "@react-three/drei";
import { folder, useControls } from "leva";
import Utilities from "./r3f-gist/utility/Utilities";
import { GridTexts } from "./grid-texts/GridTexts";
import Effect from "./Effect";

export default function App() {
    // Leva controls for global settings
    const { bgColor } = useControls({
        Global: folder({
            bgColor: '#cccccc',
        }),
    });

    return (
        <Canvas
            shadows
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [4, 2, 6],
            }}
            gl={{
                preserveDrawingBuffer: true,
            }}
            linear // Ensures proper color rendering
        >
            {/* Scene settings */}
            <fogExp2 attach="fog" args={['#ffffff', 0.2]} />
            <color args={[bgColor]} attach="background" />

            {/* Camera controls */}
            <CameraControls makeDefault />

            {/* Custom components */}
            <GridTexts text={"青春是一個夢人生如一陣春風"} />
            <Effect />
            <Utilities />
        </Canvas>
    );
}
