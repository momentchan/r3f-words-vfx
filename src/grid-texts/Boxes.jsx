export default function Boxes({ subBoxes }) {

    return <>
        {subBoxes.map((box, i) => (
            <group key={i} position={[box.x - 5 + box.width / 2, box.y - 5 + box.height / 2, box.z - 5 + box.depth / 2]}>
                <mesh>
                    <boxGeometry args={[box.width, box.height, box.depth]} />
                    <meshStandardMaterial color="white" transparent opacity={0.05} depthWrite={false} />
                </mesh>
            </group>
        ))}
    </>
}