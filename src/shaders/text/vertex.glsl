#include './../../r3f-gist/shader/cginc/noise/simplexNoise.glsl';

varying vec2 vUv;
uniform float time;

void main() {
    vUv = uv;

    // Start with the original position
    vec3 newPosition = position;

    // Use world space as the seed for noise
    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    // Generate noise based on world position and time
     vec3 noise = curlNoise(worldPosition * 2.0 + time * 0.2 + vec3(0.1)); // Adjust frequency and add offset

    // Apply noise to the position
    // newPosition += noise * 0.1; // Adjust the multiplier to control the intensity of the noise

    // Final transformation
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}