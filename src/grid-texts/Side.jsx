import { Environment, MeshPortalMaterial, Sky, useFBX, useGLTF, useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { DirectionalLightHelper, SpotLightHelper } from "three";
import * as THREE from "three";
import ThreeCustomShaderMaterial from 'three-custom-shader-material'
import fragmentShader from "../shaders/room/fragment.glsl";
import vertexShader from "../shaders/room/vertex.glsl";
import { patchShaders } from "gl-noise";
import { useControls } from "leva";
import ObjectMat from "./ObjectMat";

export default function Side({ bg = '#f0f0f0', index, scale, geometry }) {
    const shape = useRef()
    const { nodes } = useGLTF('aobox-transformed-uv.glb')

    useEffect(() => {
        const geometry = nodes.Cube.geometry
        geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(geometry.attributes.uv1.array, 2));
    }, [nodes])

    const controls = useControls("Side Material", {
        color: { value: "#363636" }, // Initial color in HEX format
    });


    const lightRef = useRef(null);
    const mat = useRef()

    const uniforms = useMemo(
        () => ({
            time: { value: 0 },
            color: { value: new THREE.Color(controls.color) }, // Convert HEX to THREE.Color
        }),
        [controls.color]
    );
    // useHelper(lightRef, DirectionalLightHelper, 1, "red");
    useFrame((state, delta) => {
        shape.current.rotation.x = shape.current.rotation.y += delta
        mat.current.uniforms.time.value = state.clock.elapsedTime
    })
    const s = Math.min(scale[0], scale[1], scale[2]);
    const rotation = useMemo(() => {
        switch (index) {
            case 0:
                return [0, 0, 0]
            case 1:
                return [0, Math.PI, 0]
            case 2:
                return [0, Math.PI / 2, Math.PI / 2]
            case 3:
                return [0, Math.PI / 2, -Math.PI / 2]
            case 4:
                return [0, -Math.PI / 2, 0]
            case 5:
                return [0, Math.PI / 2, 0]
        }
    }, [index])

    return (
        <MeshPortalMaterial worldUnits={false} attach={`material-${index}`}>

            {/* Everything here is inside the portal and isolated from the canvas */}
            <ambientLight intensity={0.5} />
            <Environment preset="city" />
            <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />

            {/** A box with baked AO */}
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

            {/* The Shape */}
            <group ref={shape} scale={[s, s, s]} >
                <mesh castShadow receiveShadow  geometry={geometry}>
                    <ObjectMat />
                </mesh>
                <lineSegments  geometry={new THREE.EdgesGeometry(geometry)}>
                    <lineBasicMaterial attach="material" color="white" linewidth={1} />
                </lineSegments>
            </group>
        </MeshPortalMaterial>

    )
}