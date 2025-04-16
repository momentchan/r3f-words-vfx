#include './../../r3f-gist/shader/cginc/noise/simplexNoise.glsl';
#include './../../r3f-gist/shader/cginc/photoshopMath.glsl';

varying vec2 vUv;
varying vec2 vUv2;
uniform vec3 color;
uniform float time;

void main() {
    // Define strip movement speed
    float speed = 0.5;  
    float frequency = 2.0; // Number of strips
    float sharpness = .5; // Sharpness of strip edges

    // Moving strip pattern using UV coordinates
    float strip = smoothstep(sharpness, 0.0, abs(fract(vUv2.y * frequency - time * speed) - 0.5));
    strip *= step(1e-5, vUv2.y);


    // Base color modulated by UV + strip pattern
    vec3 col = vec3(vUv2.y) * color;
    // col = vec3(1.0);

    // Output colors
    csm_DiffuseColor = vec4(col.rgb, 1.);
    csm_Emissive = BlendScreen(col, vec3(strip)) * 1.0;
}