import CustomEffectBase from "../r3f-gist/effect/CustomEffectBase";
import fragmentShader from '../shaders/overlay/fragment.glsl'


class OverlayEffect extends CustomEffectBase {
    constructor() {
        super(
            'Overlay',
            {
                fragmentShader
            }
        )
    }
}


export default function CustomOverlay() {
    const effect = new OverlayEffect();

    return <primitive object={effect} />
}