import { CameraControls, Effects, Grid, OrbitControls, shaderMaterial, Sky, Sphere, Text } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import Utilities from "./r3f-gist/utility/Utilities";
import * as THREE from 'three';
import { GridTexts } from "./grid-texts/GridTexts";
import { folder, useControls } from "leva";
import Effect from "./Effect";

export default function App() {
    const { bgColor } = useControls({
        'Global': folder({
            bgColor: '#cccccc'
        })
    })

    return (
        <Canvas
            // dpr={1}  
            shadows
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [4, 2, 6]
            }}
            gl={{
                preserveDrawingBuffer: true,
            }}

            linear  // remember to use it to fix color
        >
            
            <fogExp2 attach="fog" args={['#ffffff', 0.2]} />
            <color args={[bgColor]} attach="background" />

            <CameraControls makeDefault />

            <GridTexts
                text={"青春是一個夢人生如一陣春風"}
            />

            <Effect />

            <Utilities />
        </Canvas>
    );
}
