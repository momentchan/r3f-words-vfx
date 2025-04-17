
import ThreeCustomShaderMaterial from 'three-custom-shader-material'
import fragmentShader from "../../shaders/object/fragment.glsl";
import vertexShader from "../../shaders/object/vertex.glsl";
import { patchShaders } from "gl-noise";
import { useRef } from 'react';
import * as THREE from "three";


export default function ObjectMat({ }) {

    const mat = useRef()

    return <ThreeCustomShaderMaterial
        ref={mat}
        silent
        baseMaterial={THREE.MeshLambertMaterial}
        depthWrite={false}
        fragmentShader={patchShaders(fragmentShader)}
        vertexShader={patchShaders(vertexShader)}
        transparent={true}
        side={THREE.DoubleSide}
    />
}