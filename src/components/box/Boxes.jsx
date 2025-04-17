import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import BoxMesh from "./BoxMesh";
import { isValidFace, getOutermostFaces } from "../../utils/boxUtils";

export default function Boxes({ subBoxes }) {
    const [clickedBoxes, setClickedBoxes] = useState(new Set());
    const [clickedFaces, setClickedFaces] = useState(new Map());
    const [hoveredBox, setHoveredBox] = useState(null);
    const [hoveredFace, setHoveredFace] = useState(null);
        
    const meshRefs = useRef([]);
    const { camera } = useThree();
    const raycaster = new THREE.Raycaster();
    const clickTimeoutRef = useRef(null);
    const bg = new THREE.SphereGeometry(1);

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
                    } else {
            setHoveredBox(null);
            setHoveredFace(null);
                    }
    };

    // Add pointer leave handler to reset cursor
    const onPointerLeave = () => {
        setHoveredBox(null);
        setHoveredFace(null);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
        };
    }, []);

    const handleMeshRef = (el, index) => {
        meshRefs.current[index] = el;
    };

    return (
        <group 
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
        >
            {subBoxes.map((box, i) => (
                <BoxMesh
                    key={i}
                    box={box}
                    index={i}
                    isClicked={clickedBoxes.has(i)}
                    selectedFace={clickedFaces.get(i)}
                    isHovered={hoveredBox === i}
                    hoveredFace={hoveredFace}
                    geometry={bg}
                    onMeshRef={handleMeshRef}
                />
            ))}
        </group>
    );
}
