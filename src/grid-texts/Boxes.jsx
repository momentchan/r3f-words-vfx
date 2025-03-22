import * as THREE from "three";
import Side from "../Side";
import { useMemo } from "react";

export default function Boxes({ subBoxes, numBoxes = 2  }) {
    const parentBounds = {
        minX: -5, maxX: 5,
        minY: -5, maxY: 5,
        minZ: -5, maxZ: 5,
    };
    const opacity = 0.

    // Function to check if a box face is outermost
    function getOutermostFaces(box) {
        const { x, y, z, width, height, depth } = box;

        const center = new THREE.Vector3(x - 5, y - 5, z - 5)

        const x_min = center.x;
        const x_max = center.x + width;
        const y_min = center.y;
        const y_max = center.y + height;
        const z_min = center.z;
        const z_max = center.z + depth;

        const result = {
            right: x_max >= parentBounds.maxX,
            // right: false,
            left: x_min <= parentBounds.minX,
            // left: false,
            top: y_max >= parentBounds.maxY,
            // top: false,
            bottom: y_min <= parentBounds.minY,
            // bottom: false,
            front: z_max >= parentBounds.maxZ,
            // front: false,
            back: z_min <= parentBounds.minZ,
            // back: false,
        }
        return result;
    }

    // Pick `numBoxes` random boxes that have at least one outer face
    const randomBoxIndices = useMemo(() => {
        const outerBoxes = subBoxes
            .map((box, index) => ({ box, index }))
            .filter(({ box }) => Object.values(getOutermostFaces(box)).some(face => face));

        if (outerBoxes.length === 0) return [];

        const shuffled = [...outerBoxes].sort(() => Math.random() - 0.5); // Shuffle for randomness
        return shuffled.slice(0, numBoxes).map(({ index }) => index);
    }, [subBoxes, numBoxes]);

    // Store exactly one random outer face for each selected box
    const randomOuterFaces = useMemo(() => {
        return randomBoxIndices.map(boxIndex => {
            const outerFaces = getOutermostFaces(subBoxes[boxIndex]);
            const faceIndices = Object.keys(outerFaces).filter(face => outerFaces[face]); // Only valid outer faces
            return faceIndices.length > 0
                ? faceIndices[Math.floor(Math.random() * faceIndices.length)] // Pick one random face
                : null;
        });
    }, [randomBoxIndices, subBoxes]);

    return (
        <>
            {subBoxes.map((box, i) => {
                const outerFaces = getOutermostFaces(box);
                const selectedFace = randomBoxIndices.includes(i)
                    ? randomOuterFaces[randomBoxIndices.indexOf(i)]
                    : null;

                return (
                    <group key={i} position={[box.x - 5 + box.width / 2, box.y - 5 + box.height / 2, box.z - 5 + box.depth / 2]}>
                        <mesh>
                            <boxGeometry args={[box.width, box.height, box.depth]} />
                            {
                                Object.keys(outerFaces).map((face, faceIndex) => {
                                    if (selectedFace === face) {
                                        return (
                                            <Side
                                                key={faceIndex}
                                                index={faceIndex}
                                                scale={[box.width * 0.5, box.height * 0.5, box.depth * 0.5]}
                                            />
                                        );
                                    }

                                    return  (
                                        <meshBasicMaterial
                                            key={faceIndex}
                                            attach={`material-${faceIndex}`}
                                            color={"white"}
                                            transparent
                                            depthWrite={false}
                                            opacity={0}
                                            side={THREE.DoubleSide}
                                        />
                                    );
                                })
                            }
                        </mesh>
                    </group>
                );
            })}
        </>
    );
}