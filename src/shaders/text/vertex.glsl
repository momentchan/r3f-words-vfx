#include './../../r3f-gist/shader/cginc/noise/simplexNoise.glsl';


varying vec2 vUv;

void main() {
    vUv = uv;

    vec3 newPosition = position;
    float curveFactor = 0.5 * position.x; // Apply bending effect
    // newPosition.y += sin(curveFactor) * 0.5; // Adjust to curve text



    vec3 n = curlNoise(position.xxx);
    // newPosition.xyz += n * 0.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}