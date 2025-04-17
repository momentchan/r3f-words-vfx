import { useEffect, useState } from "react";
import { getCharacterData } from "../../utils/partitioning";
import Character from "./Character";

export default function Characters({ text, subBoxes, params }) {
    const [characters, setCharacters] = useState([]);

    useEffect(() => {
        const availableBoxes = [...subBoxes];
        const newCharacters = text.split("").map((char) => {
            const charData = getCharacterData(subBoxes, availableBoxes);
            return charData ? { char, ...charData } : null;
        });
        setCharacters(newCharacters);
    }, [text, subBoxes]);

    return characters.map((charData, i) => (
        <Character key={i} charData={charData} index={i} params={params} />
    ));
}
