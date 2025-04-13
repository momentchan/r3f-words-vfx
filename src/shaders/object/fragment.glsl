varying vec2 vUv;
uniform vec3 color;
uniform float time;

void main() {

    float w = 0.1;
    float v = (1. - smoothstep(0., w, vUv.x) * smoothstep(1., 1.0 - w, vUv.x)) + (1. - smoothstep(0., w, vUv.y) * smoothstep(1., 1.0 - w, vUv.y));
    v = clamp(v, 0., 1.);
    vec3 col = vec3(1.);

    csm_DiffuseColor = vec4(col, .5);
}