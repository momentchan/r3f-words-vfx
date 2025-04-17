import { MeshPortalMaterial } from "@react-three/drei";
import { useMemo } from "react";
import PortalContent from "./PortalContent";

export default function Portal({ index, scale, geometry }) {
    const rotation = useMemo(() => {
        switch (index) {
            case 0: return [0, 0, 0]
            case 1: return [0, Math.PI, 0]
            case 2: return [0, Math.PI / 2, Math.PI / 2]
            case 3: return [0, Math.PI / 2, -Math.PI / 2]
            case 4: return [0, -Math.PI / 2, 0]
            case 5: return [0, Math.PI / 2, 0]
        }
    }, [index])

    return (
        <MeshPortalMaterial worldUnits={false} attach={`material-${index}`} blend={0}>
            <PortalContent scale={scale} geometry={geometry} rotation={rotation} />
        </MeshPortalMaterial>
    )
}