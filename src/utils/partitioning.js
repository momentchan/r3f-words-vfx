import { MathUtils } from "three";

function createPlaneLines(x, y, z, width, height, depth, planeDim) {
    if (planeDim === 0) {
        return [
            { start: [x, y, z], end: [x, y, z + depth] },
            { start: [x, y + height, z], end: [x, y + height, z + depth] },
            { start: [x, y, z], end: [x, y + height, z] },
            { start: [x, y, z + depth], end: [x, y + height, z + depth] },
        ];
    }
    if (planeDim === 1) {
        return [
            { start: [x, y, z], end: [x + width, y, z] },
            { start: [x, y, z + depth], end: [x + width, y, z + depth] },
            { start: [x, y, z], end: [x, y, z + depth] },
            { start: [x + width, y, z], end: [x + width, y, z + depth] },
        ];
    }
    return [
        { start: [x, y, z], end: [x + width, y, z] },
        { start: [x, y + height, z], end: [x + width, y + height, z] },
        { start: [x, y, z], end: [x, y + height, z] },
        { start: [x + width, y, z], end: [x + width, y + height, z] },
    ];
}

function splitBox(current, minSize, exponent, minScale, maxScale) {
    const dim = Math.floor(Math.random() * 3);
    let sizeVariation = Math.pow(Math.random(), exponent) * (maxScale - minScale) + minScale;
    let splitAt, box1, box2, lines;

    if (dim === 0) {
        splitAt = Math.random() * (current.width - minSize * 2) * sizeVariation + minSize;
        box1 = { ...current, width: splitAt };
        box2 = { ...current, x: current.x + splitAt, width: current.width - splitAt };
        lines = createPlaneLines(
            current.x + splitAt, current.y, current.z,
            0, current.height, current.depth, 0
        );
    } else if (dim === 1) {
        splitAt = Math.random() * (current.height - minSize * 2) * sizeVariation + minSize;
        box1 = { ...current, height: splitAt };
        box2 = { ...current, y: current.y + splitAt, height: current.height - splitAt };
        lines = createPlaneLines(
            current.x, current.y + splitAt, current.z,
            current.width, 0, current.depth, 1
        );
    } else {
        splitAt = Math.random() * (current.depth - minSize * 2) * sizeVariation + minSize;
        box1 = { ...current, depth: splitAt };
        box2 = { ...current, z: current.z + splitAt, depth: current.depth - splitAt };
        lines = createPlaneLines(
            current.x, current.y, current.z + splitAt,
            current.width, current.height, 0, 2
        );
    }

    return { box1, box2, lines };
}

export function partitionBox(box, minSize = 2, exponent = 2, minScale = 0.5, maxScale = 1.5) {
    let results = [];
    let partitionLines = [];
    const stack = [box];

    while (stack.length) {
        const current = stack.pop();
        if (current.width <= minSize || current.height <= minSize || current.depth <= minSize) {
            results.push(current);
            continue;
        }

        const { box1, box2, lines } = splitBox(current, minSize, exponent, minScale, maxScale);
        partitionLines.push(...lines);
        stack.push(box1, box2);
    }

    return { results, partitionLines };
}

export function getCharacterData(subBoxes, availableBoxes) {
    if (availableBoxes.length === 0) return null;
    const boxIndex = Math.floor(Math.random() * availableBoxes.length);
    const box = availableBoxes.splice(boxIndex, 1)[0];
    return {
        position: [
            box.x + box.width / 2 - 5,
            box.y + box.height / 2 - 5,
            box.z + box.depth / 2 - 5
        ],
        rotation: [0, Math.random() > 0.5 ? 0 : Math.PI * 0.5, 0],
        scale: Math.min(box.width, box.height, box.depth) * 0.5,
        alpha: MathUtils.randFloat(0.2, 0.5),
        delay: MathUtils.randFloat(0, 1)
    };
}
