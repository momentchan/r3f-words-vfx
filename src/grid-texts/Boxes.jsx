import * as THREE from "three";
import Side from "./Side";
import { useMemo, useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";

export default function Boxes({ subBoxes, numBoxes = 6, minFaceArea = 0.5 }) {
    const parentBounds = {
        minX: -5, maxX: 5,
        minY: -5, maxY: 5,
        minZ: -5, maxZ: 5,
    };

    const [clickedBoxes, setClickedBoxes] = useState(new Set());
    const [clickedFaces, setClickedFaces] = useState(new Map());
    const [canToggle, setCanToggle] = useState(false);
    const [hoveredBox, setHoveredBox] = useState(null);
    const [hoveredFace, setHoveredFace] = useState(null);
    
    const meshRefs = useRef([]);
    const { camera } = useThree();
    const raycaster = new THREE.Raycaster();
    const clickTimeoutRef = useRef(null);

    // Function to check if a box face is outermost and calculate its area
    function getOutermostFaces(box) {
        const { x, y, z, width, height, depth } = box;
        const center = new THREE.Vector3(x - 5, y - 5, z - 5);

        const x_min = center.x;
        const x_max = center.x + width;
        const y_min = center.y;
        const y_max = center.y + height;
        const z_min = center.z;
        const z_max = center.z + depth;

        return {
            right: { isOuter: x_max >= parentBounds.maxX, area: height * depth },
            left: { isOuter: x_min <= parentBounds.minX, area: height * depth },
            top: { isOuter: y_max >= parentBounds.maxY, area: width * depth },
            bottom: { isOuter: y_min <= parentBounds.minY, area: width * depth },
            front: { isOuter: z_max >= parentBounds.maxZ, area: width * height },
            back: { isOuter: z_min <= parentBounds.minZ, area: width * height },
        };
    }
    const bg = new THREE.SphereGeometry(1);

    // Add helper function to check if face is valid
    const isValidFace = (outerFaces, face) => {
        return outerFaces[face].isOuter;
    };

    // Handle click for toggling
    const onPointerDown = (event) => {
        event.stopPropagation();  // Stop event bubbling
        
        // Prevent multiple rapid clicks
        if (clickTimeoutRef.current) return;
        
        clickTimeoutRef.current = setTimeout(() => {
            clickTimeoutRef.current = null;
        }, 200); // 200ms debounce

        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
            meshRefs.current.filter(Boolean)
        );

        if (!intersects.length) return;

        const hit = intersects[0];
        const boxIndex = hit.object.userData.boxIndex;
        const faceIndex = Math.floor(hit.faceIndex / 2);
        const face = Object.keys(getOutermostFaces(subBoxes[boxIndex]))[faceIndex];
        const outerFaces = getOutermostFaces(subBoxes[boxIndex]);

        if (isValidFace(outerFaces, face)) {
            // Handle both states together to maintain consistency
            if (clickedFaces.get(boxIndex) === face) {
                // If clicking the same face, remove both box and face
                setClickedBoxes(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(boxIndex);
                    return newSet;
                });
                setClickedFaces(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(boxIndex);
                    return newMap;
                });
            } else {
                // If clicking a different face or new box, update both
                setClickedBoxes(prev => {
                    const newSet = new Set(prev);
                    newSet.add(boxIndex);
                    return newSet;
                });
                setClickedFaces(prev => {
                    const newMap = new Map(prev);
                    newMap.set(boxIndex, face);
                    return newMap;
                });
            }
        }
    };

    // Add pointer move handler to check if face can be toggled
    const onPointerMove = (event) => {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
            meshRefs.current.filter(Boolean)
        );

        if (!intersects.length) {
            setHoveredBox(null);
            setHoveredFace(null);
            setCanToggle(false);
            return;
        }

        const hit = intersects[0];
        const boxIndex = hit.object.userData.boxIndex;
        const faceIndex = Math.floor(hit.faceIndex / 2);
        const face = Object.keys(getOutermostFaces(subBoxes[boxIndex]))[faceIndex];
        const outerFaces = getOutermostFaces(subBoxes[boxIndex]);

        if (isValidFace(outerFaces, face)) {
            setHoveredBox(boxIndex);
            setHoveredFace(face);
            setCanToggle(true);
        } else {
            setHoveredBox(null);
            setHoveredFace(null);
            setCanToggle(false);
        }
    };

    // Add pointer leave handler to reset cursor
    const onPointerLeave = () => {
        setHoveredBox(null);
        setHoveredFace(null);
        setCanToggle(false);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
        };
    }, []);

    return (
        <group 
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
        >
            {subBoxes.map((box, i) => {
                const outerFaces = getOutermostFaces(box);
                const isClicked = clickedBoxes.has(i);
                const selectedFace = clickedFaces.get(i);
                const isHovered = hoveredBox === i;

                return (
                    <group key={i} position={[box.x - 5 + box.width / 2, box.y - 5 + box.height / 2, box.z - 5 + box.depth / 2]}>
                        <mesh
                            ref={(el) => {
                                meshRefs.current[i] = el;
                                if (el) el.userData.boxIndex = i;
                            }}
                        >
                            <boxGeometry args={[box.width, box.height, box.depth]} />
                            {Object.keys(outerFaces).map((face, faceIndex) => {
                                if (selectedFace === face && isClicked) {
                                    return (
                                        <Side
                                            key={faceIndex}
                                            index={faceIndex}
                                            scale={[box.width * 0.5, box.height * 0.5, box.depth * 0.5]}
                                            geometry={bg}
                                        />
                                    );
                                }

                                return (
                                    <meshBasicMaterial
                                        key={faceIndex}
                                        attach={`material-${faceIndex}`}
                                        color={"white"}
                                        transparent
                                        depthWrite={false}
                                        opacity={isHovered && hoveredFace === face ? 0.1 : 0}
                                        side={THREE.DoubleSide}
                                    />
                                );
                            })}
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
}
