import { Environment, MeshPortalMaterial, Sky, useFBX, useGLTF, useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import ThreeCustomShaderMaterial from 'three-custom-shader-material'
import fragmentShader from "../shaders/room/fragment.glsl";
import vertexShader from "../shaders/room/vertex.glsl";
import { patchShaders } from "gl-noise";
import { useControls } from "leva";
import ObjectMat from "./ObjectMat";

export default function PortalContent({ scale, geometry, rotation }) {

    const { nodes } = useGLTF('aobox-transformed-uv.glb')
    const mat = useRef()
    const controls = useControls("Side Material", {
        color: { value: "#363636" }, // Initial color in HEX format
    });
    
    const shape = useRef();

    const s = Math.min(scale[0], scale[1], scale[2]);

    useFrame((state, delta) => {
        shape.current.rotation.x = shape.current.rotation.y += delta
        mat.current.uniforms.time.value = state.clock.elapsedTime

    })
    useEffect(() => {
        const geometry = nodes.Cube.geometry
        geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(geometry.attributes.uv1.array, 2));
    }, [nodes])
    const uniforms = useMemo(
        () => ({
            time: { value: 0 },
            color: { value: new THREE.Color(controls.color) }, // Convert HEX to THREE.Color
        }),
        [controls.color]
    );
    const lightRef = useRef(null);

    return (
        <>  {/* The Shape */}
            <ambientLight intensity={0.5} />
            <Environment preset="city" />

            <group scale={scale} >
                <mesh
                    // castShadow
                    receiveShadow
                    rotation={rotation}
                    geometry={nodes.Cube.geometry} >

                    <ThreeCustomShaderMaterial
                        ref={mat}
                        silent
                        baseMaterial={THREE.MeshStandardMaterial}
                        vertexShader={patchShaders(vertexShader)}
                        fragmentShader={patchShaders(fragmentShader)}
                        aoMapIntensity={1}
                        aoMap={nodes.Cube.material.aoMap}
                        uniforms={uniforms}
                        transparent={true}
                        envMapIntensity={10}
                    />
                    <directionalLight ref={lightRef} castShadow position={[20, 5, 5]} intensity={2.} />
                </mesh>
            </group>

            <group ref={shape} scale={[s, s, s]} >
                <mesh castShadow receiveShadow geometry={geometry}>
                    <ObjectMat />
                </mesh>
                <lineSegments geometry={new THREE.EdgesGeometry(geometry)}>
                    <lineBasicMaterial attach="material" color="white" linewidth={1} />
                </lineSegments>
            </group>
        </>
    );
};