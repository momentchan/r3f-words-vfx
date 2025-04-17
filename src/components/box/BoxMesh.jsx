import { useRef } from 'react'
import * as THREE from 'three'
import Portal from './Portal'
import { getOutermostFaces } from '../../utils/boxUtils'

export default function BoxMesh({ 
    box, 
    index, 
    isClicked, 
    selectedFace, 
    isHovered,
    hoveredFace,
    geometry,
    onMeshRef 
}) {
    const outerFaces = getOutermostFaces(box)

    return (
        <group position={[box.x - 5 + box.width / 2, box.y - 5 + box.height / 2, box.z - 5 + box.depth / 2]}>
            <mesh ref={(el) => {
                if (el) {
                    el.userData.boxIndex = index;
                    onMeshRef(el, index);
                }
            }}>
                <boxGeometry args={[box.width, box.height, box.depth]} />
                {Object.keys(outerFaces).map((face, faceIndex) => (
                    selectedFace === face && isClicked ? (
                        <Portal
                            key={faceIndex}
                            index={faceIndex}
                            scale={[box.width * 0.5, box.height * 0.5, box.depth * 0.5]}
                            geometry={geometry}
                        />
                    ) : (
                        <meshBasicMaterial
                            key={faceIndex}
                            attach={`material-${faceIndex}`}
                            color="white"
                            transparent
                            depthWrite={false}
                            opacity={isHovered && hoveredFace === face ? 0.1 : 0}
                            side={THREE.DoubleSide}
                        />
                    )
                ))}
            </mesh>
        </group>
    )
}
