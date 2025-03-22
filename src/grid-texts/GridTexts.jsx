import { useEffect, useState, useMemo } from "react";
import Character from "./Character";
import { MathUtils } from "three";
import { folder, useControls } from "leva";
import BoxGridLines from "./BoxGridLines";
import PartitionGridLines from "./PartitionGridLines";
import Boxes from "./Boxes";

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
  let partitionLines = [];
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
    let sizeVariation = Math.pow(Math.random(), exponent) * (maxScale - minScale) + minScale;
    let splitAt;
    let box1, box2;

    // Helper function to add 4 lines forming a rectangle in a plane
    function addPlaneLines(x, y, z, width, height, depth, planeDim) {
      // planeDim indicates which axis is 'fixed':
      //   0 = x-plane, 1 = y-plane, 2 = z-plane

      // We'll define corners of the rectangle in that plane:
      // e.g. for a plane in x => we fix x, vary y, z
      let lines = [];
      if (planeDim === 0) {
        // plane at x => corners are ( x, y, z ), ( x, y+height, z ), etc.
        lines = [
          { start: [x, y, z], end: [x, y, z + depth] }, // bottom
          { start: [x, y + height, z], end: [x, y + height, z + depth] }, // top
          { start: [x, y, z], end: [x, y + height, z] }, // left
          { start: [x, y, z + depth], end: [x, y + height, z + depth] }, // right
        ];
      } else if (planeDim === 1) {
        // plane at y => corners are ( x, y, z ), ( x+width, y, z ), etc.
        lines = [
          { start: [x, y, z], end: [x + width, y, z] }, // front
          { start: [x, y, z + depth], end: [x + width, y, z + depth] }, // back
          { start: [x, y, z], end: [x, y, z + depth] }, // left
          { start: [x + width, y, z], end: [x + width, y, z + depth] }, // right
        ];
      } else {
        // plane at z => corners are ( x, y, z ), ( x+width, y, z ), etc., vary x,y
        lines = [
          { start: [x, y, z], end: [x + width, y, z] }, // bottom
          { start: [x, y + height, z], end: [x + width, y + height, z] }, // top
          { start: [x, y, z], end: [x, y + height, z] }, // left
          { start: [x + width, y, z], end: [x + width, y + height, z] }, // right
        ];
      }
      partitionLines.push(...lines);
    }

    if (dim === 0) {
      // Split along x axis
      splitAt = Math.random() * (current.width - minSize * 2) * sizeVariation + minSize;

      box1 = { ...current, width: splitAt };
      box2 = {
        ...current,
        x: current.x + splitAt,
        width: current.width - splitAt
      };

      // Add a full rectangle (plane) at x = current.x + splitAt
      addPlaneLines(
        current.x + splitAt,
        current.y,
        current.z,
        0,             // width=0 in x-plane
        current.height,
        current.depth,
        0              // 0 => plane in x-dimension
      );

    } else if (dim === 1) {
      // Split along y axis
      splitAt = Math.random() * (current.height - minSize * 2) * sizeVariation + minSize;

      box1 = { ...current, height: splitAt };
      box2 = {
        ...current,
        y: current.y + splitAt,
        height: current.height - splitAt
      };

      // Add a full rectangle (plane) at y = current.y + splitAt
      addPlaneLines(
        current.x,
        current.y + splitAt,
        current.z,
        current.width,
        0,             // height=0 in y-plane
        current.depth,
        1              // 1 => plane in y-dimension
      );

    } else {
      // Split along z axis
      splitAt = Math.random() * (current.depth - minSize * 2) * sizeVariation + minSize;

      box1 = { ...current, depth: splitAt };
      box2 = {
        ...current,
        z: current.z + splitAt,
        depth: current.depth - splitAt
      };

      // Add a full rectangle (plane) at z = current.z + splitAt
      addPlaneLines(
        current.x,
        current.y,
        current.z + splitAt,
        current.width,
        current.height,
        0,             // depth=0 in z-plane
        2              // 2 => plane in z-dimension
      );
    }

    stack.push(box1, box2);
  }

  return { results, partitionLines };
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
    delay: MathUtils.randFloat(0, 1)
  };
};

export const GridTexts = ({ text }) => {
  const [characters, setCharacters] = useState([]);

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
        <Character key={i} charData={charData} index={i} params={controls} />
      ))}
      {/* <BoxGridLines subBoxes={subBoxes} params={controls} /> */}
      <PartitionGridLines partitionLines={partitionLines} params={controls} />
      <Boxes subBoxes={subBoxes}/>
    </>
  );
};