#include './r3f-gist/shader/cginc/noise/simplexNoise.glsl';
#include './r3f-gist/shader/cginc/utility.glsl';

uniform float time;
uniform vec3 color;
uniform float alpha;
uniform float tiling;
uniform vec2 noiseRange;
uniform float speed;
uniform vec2 screenResolution;
varying vec2 vUv; 

void main() {
    vec2 screenUv = gl_FragCoord.xy / screenResolution;
    float nc = simplexNoise2d(screenUv * tiling + time * speed);
    float na = simplexNoise2d(vUv * vec2(5.0, 1.0));

    gl_FragColor = vec4(remap(nc, vec2(-1.0,1.0), noiseRange) * color, alpha * remap(na, vec2(-1.0,1.0), vec2(0.5, 1.0)));
    // gl_FragColor = vec4(screenUv, 0.0, alpha);
}