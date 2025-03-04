import { BoxGeometry } from "three";

export const BoxGridLines = ({ subBoxes, lineColor, lineOpacity }) => {
    return (
        <>
            {subBoxes.map((box, i) => (
                <lineSegments key={i} position={[box.x - 5 + box.width / 2, box.y - 5 + box.height / 2, box.z - 5 + box.depth / 2]}>
                    <edgesGeometry attach="geometry" args={[new BoxGeometry(box.width, box.height, box.depth)]} />
                    <lineBasicMaterial attach="material" color={lineColor} transparent opacity={lineOpacity} linewidth={1} />
                </lineSegments>
            ))}
        </>
    );
};