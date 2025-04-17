import * as THREE from 'three';

export const parentBounds = {
    minX: -5, maxX: 5,
    minY: -5, maxY: 5,
    minZ: -5, maxZ: 5,
};

export function getOutermostFaces(box) {
    const { x, y, z, width, height, depth } = box;
    const center = new THREE.Vector3(x - 5, y - 5, z - 5);

    const x_min = center.x;
    const x_max = center.x + width;
    const y_min = center.y;
    const y_max = center.y + height;
    const z_min = center.z;
    const z_max = center.z + depth;

    return {
        right: { isOuter: x_max >= parentBounds.maxX, area: height * depth },
        left: { isOuter: x_min <= parentBounds.minX, area: height * depth },
        top: { isOuter: y_max >= parentBounds.maxY, area: width * depth },
        bottom: { isOuter: y_min <= parentBounds.minY, area: width * depth },
        front: { isOuter: z_max >= parentBounds.maxZ, area: width * height },
        back: { isOuter: z_min <= parentBounds.minZ, area: width * height },
    };
}

export function isValidFace(outerFaces, face) {
    return outerFaces[face].isOuter;
}
