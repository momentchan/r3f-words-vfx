import * as THREE from 'three';
import { useState, useEffect } from "react";
import Character from "./Character";
import { MathUtils } from 'three';


const getCharacterData = (boxSize = [5, 5, 5], scaleRange = [0.5, 5]) => {
    const x = (Math.random() - 0.5) * boxSize[0];
    const y = (Math.random() - 0.5) * boxSize[1];
    const z = (Math.random() - 0.5) * boxSize[2];

    const scale = MathUtils.randFloat(scaleRange[0], scaleRange[1])
    const alpha = MathUtils.randFloat(0.2, 0.5)
    const delay = MathUtils.randFloat(0, 5)

    return {
        position: [x, y, z],
        rotation: [0, 0, 0],
        scale: scale,
        alpha: alpha,
        delay: delay
    };
};


export const GridTexts = ({ text, speed = 1000, minRadius = 2, maxRadius = 5, angle = Math.PI * 0.5 }) => {
    const [characters, setCharacters] = useState([]);

    useEffect(() => {
        const newCharacters = text.split("").map((char) => {
            return { char, ...getCharacterData() };
        });
        setCharacters(newCharacters);
    }, [text]);

    return (
        <>
            {characters.map((charData, i) => (
                <Character
                    key={i}
                    charData={charData} />
            ))}
        </>
    );
};