import { Environment, MeshPortalMaterial, useGLTF, useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DirectionalLightHelper } from "three";

export default function Side({ bg = '#f0f0f0', children, index, scale }) {
    const shape = useRef()
    const { nodes } = useGLTF('aobox-transformed.glb')
    const lightRef = useRef(null);

    useHelper(lightRef, DirectionalLightHelper, 1, "red");
    useFrame((state, delta) => {
        shape.current.rotation.x = shape.current.rotation.y += delta
    })

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

            {/** A box with baked AO */}
            <group scale={scale} >
                <mesh castShadow receiveShadow rotation={rotation} geometry={nodes.Cube.geometry} >
                    <meshStandardMaterial
                        aoMapIntensity={1}
                        aoMap={nodes.Cube.material.aoMap}
                        color={bg} />
                    <spotLight castShadow color={bg} intensity={2000} position={[10, 20, 10]} angle={0.15} shadow-normalBias={0.05} shadow-bias={0.0001} />
                </mesh>
            </group>

            {/* <directionalLight ref={lightRef} castShadow position={[5, 30, 5]} intensity={1} /> */}

            {/* The Shape */}
            <mesh castShadow receiveShadow ref={shape}>
                {children}
                <meshLambertMaterial color={bg} />
            </mesh>
        </MeshPortalMaterial>

    )
}