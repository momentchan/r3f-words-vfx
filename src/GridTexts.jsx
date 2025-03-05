import { useEffect, useState, useMemo } from "react";
import Character from "./Character";
import { MathUtils } from "three";
import { useControls } from "leva";
import { BoxGridLines } from "./BoxGridLine";

// Example 3D Binary Space Partitioning for a 10x10x10 box
// Returns array of sub-boxes { x, y, z, width, height, depth }
function partitionBox(
    box = { x: 0, y: 0, z: 0, width: 10, height: 10, depth: 10 },
    minSize = 2, // minimum size of any dimension
    exponent = 2,
    minScale = 0.5,
    maxScale = 1.5
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
        let sizeVariation = Math.pow(Math.random(), exponent) * (maxScale - minScale) + minScale;
        if (dim === 0) {
            splitAt = Math.random() * (current.width - minSize * 2) * sizeVariation + minSize;
            box1 = { ...current, width: splitAt };
            box2 = { ...current, x: current.x + splitAt, width: current.width - splitAt };
        } else if (dim === 1) {
            splitAt = Math.random() * (current.height - minSize * 2) * sizeVariation + minSize;
            box1 = { ...current, height: splitAt };
            box2 = { ...current, y: current.y + splitAt, height: current.height - splitAt };
        } else {
            splitAt = Math.random() * (current.depth - minSize * 2) * sizeVariation + minSize;
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
    const rotY = Math.random() > 0.5 ? 0 : Math.PI * 0.5
    const minDimension = Math.min(box.width, box.height, box.depth);
    return {
        position: [x, y, z],
        rotation: [0, rotY, 0],
        scale: minDimension * 0.5,
        alpha: MathUtils.randFloat(0.2, 0.5),
        delay: MathUtils.randFloat(0, 5)
    };
};

export const GridTexts = ({ text }) => {
    const [characters, setCharacters] = useState([]);

    const controls = useControls({
        fontColor: { value: "#4A90E2" },
        exponent: { value: 2, min: 1, max: 5, step: 0.1 },
        minScale: { value: 0.5, min: 0.1, max: 1.0, step: 0.05 },
        maxScale: { value: 1.5, min: 1.0, max: 2.5, step: 0.05 },
        lineColor: { value: "#ffffff" },
        lineOpacity: { value: 0.3, min: 0, max: 1, step: 0.05 },

        fogColor: { value: "#000000" },
        fogDensity: { value: 0.001, min: 0.0, max: 0.01, step: 0.001 },
    });

    const subBoxes = useMemo(() => {
        let minSize = Math.max(2, 10 / Math.cbrt(text.length));
        let subBoxes = [];
        while (subBoxes.length < text.length) {
            subBoxes = partitionBox(
                { x: 0, y: 0, z: 0, width: 10, height: 10, depth: 10 },
                minSize,
                controls.exponent,
                controls.minScale,
                controls.maxScale
            );
            if (subBoxes.length < text.length) minSize *= 0.9; // Reduce minSize if not enough boxes
        }
        return subBoxes;
    }, [text, controls.exponent, controls.minScale, controls.maxScale]);

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
                <Character key={i} charData={charData} params={controls} />
            ))}
            <BoxGridLines subBoxes={subBoxes} params={controls}  />
        </>
    );
};