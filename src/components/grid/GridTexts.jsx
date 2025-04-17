import { useMemo } from "react";
import { folder, useControls } from "leva";
import Characters from "../character/Characters";
import PartitionGridLines from "../line/PartitionGridLines";
import Boxes from "../box/Boxes";
import { partitionBox } from "../../utils/partitioning";

export const GridTexts = ({ text }) => {
    const controls = useControls({
        'Line': folder({
            exponent: { value: 2, min: 1, max: 5, step: 0.1 },
            minScale: { value: 0.5, min: 0.1, max: 1.0, step: 0.05 },
            maxScale: { value: 1.5, min: 1.0, max: 2.5, step: 0.05 },
            lineColor: { value: "#ffffff" },
            lineOpacity: { value: 0.3, min: 0, max: 1, step: 0.05 },
            fogColor: { value: "#000000" },
            fogDensity: { value: 0.001, min: 0.0, max: 0.01, step: 0.001 },
        })
    });

    const { results: subBoxes, partitionLines } = useMemo(() => {
        let minSize = Math.max(2, 10 / Math.cbrt(text.length));
        let partitionData;
        while (true) {
            partitionData = partitionBox(
                { x: 0, y: 0, z: 0, width: 10, height: 10, depth: 10 },
                minSize,
                controls.exponent,
                controls.minScale,
                controls.maxScale
            );
            if (partitionData.results.length >= text.length) break;
            minSize *= 0.9;
        }
        return partitionData;
    }, [text, controls.exponent, controls.minScale, controls.maxScale]);

    return (
        <>
            <Characters text={text} subBoxes={subBoxes} params={controls} />
            <PartitionGridLines partitionLines={partitionLines} params={controls} />
            <Boxes subBoxes={subBoxes}/>
        </>
    );
};