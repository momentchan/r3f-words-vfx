import { CameraControls, Effects, Grid, OrbitControls, shaderMaterial, Sky, Sphere, Text } from "@react-three/drei";
import { Bloom, ChromaticAberration, ColorAverage, DepthOfField, DotScreen, EffectComposer, Glitch, HueSaturation, Noise, Pixelation, Sepia, ToneMapping } from "@react-three/postprocessing";
import CustomOverlay from "./CustomOverlay";
import { useRef } from "react";


export default function Effect() {
    const composer = useRef()

    return <>
        <EffectComposer ref={composer}>
            <CustomOverlay />
            {/* <ChromaticAberration
                    blendFunction={BlendFunction.NORMAL} // blend mode
                    offset={[0.01, 0.01]} // color offset
                /> */}
            {/* <Noise opaciy={0.02}/> */}
            {/* <Bloom intensity={1} luminanceThreshold={0.5} luminanceSmoothing={0.2} /> */}
        </EffectComposer>
    </>
}