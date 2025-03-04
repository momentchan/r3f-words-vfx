import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { LineSegments, EdgesGeometry, LineBasicMaterial, BoxGeometry } from "three";
import Character from "./Character";
import { MathUtils } from "three";

// Example 3D Binary Space Partitioning for a 10x10x10 box
// Returns array of sub-boxes { x, y, z, width, height, depth }
function partitionBox(
    box = { x: 0, y: 0, z: 0, width: 10, height: 10, depth: 10 },
    minSize = 2 // minimum size of any dimension
) {
    let results = [];
    const stack = [box];
    while (stack.length) {
        const current = stack.pop();
        if (
            current.width <= minSize ||
            current.height <= minSize ||
            current.depth <= minSize
        ) {
            results.push(current);
            continue;
        }
        const dim = Math.floor(Math.random() * 3);
        let splitAt, box1, box2;
        if (dim === 0) {
            splitAt = Math.random() * (current.width - minSize * 2) + minSize;
            box1 = { ...current, width: splitAt };
            box2 = { ...current, x: current.x + splitAt, width: current.width - splitAt };
        } else if (dim === 1) {
            splitAt = Math.random() * (current.height - minSize * 2) + minSize;
            box1 = { ...current, height: splitAt };
            box2 = { ...current, y: current.y + splitAt, height: current.height - splitAt };
        } else {
            splitAt = Math.random() * (current.depth - minSize * 2) + minSize;
            box1 = { ...current, depth: splitAt };
            box2 = { ...current, z: current.z + splitAt, depth: current.depth - splitAt };
        }
        stack.push(box1, box2);
    }
    return results;
}


const getCharacterData = (subBoxes, availableBoxes) => {
    // Place character at the center of its sub-box
    if (availableBoxes.length === 0) return null;
    const boxIndex = Math.floor(Math.random() * availableBoxes.length);
    const box = availableBoxes.splice(boxIndex, 1)[0];
    const x = box.x + box.width / 2 - 5;
    const y = box.y + box.height / 2 - 5;
    const z = box.z + box.depth / 2 - 5;
    const minDimension = Math.min(box.width, box.height, box.depth);
    return {
        position: [x, y, z],
        rotation: [0, 0, 0],
        scale: minDimension * 0.5,
        alpha: MathUtils.randFloat(0.2, 0.5),
        delay: MathUtils.randFloat(0, 5)
    };
};

export const GridTexts = ({ text }) => {
    const [characters, setCharacters] = useState([]);
    const subBoxes = useMemo(() => partitionBox({ x: 0, y: 0, z: 0, width: 10, height: 10, depth: 10 }, 3), []);

    useEffect(() => {
        const availableBoxes = [...subBoxes];
        const newCharacters = text.split("").map((char) => {
            const charData = getCharacterData(subBoxes, availableBoxes);
            return charData ? { char, ...charData } : null;
        });
        setCharacters(newCharacters);
    }, [text, subBoxes]);

    return (
        <>
            {characters.map((charData, i) => (
                <Character key={i} charData={charData} />
            ))}
            {subBoxes.map((box, i) => {
                return (
                    <lineSegments key={i} position={[box.x - 5 + box.width / 2, box.y - 5 + box.height / 2, box.z - 5 + box.depth / 2]}>
                        <edgesGeometry attach="geometry" args={[new BoxGeometry(box.width, box.height, box.depth)]} />
                        <lineBasicMaterial attach="material" color="white" linewidth={1} />
                    </lineSegments>
                );
            })}
        </>
    );
};