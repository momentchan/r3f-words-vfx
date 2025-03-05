#include './../../r3f-gist/shader/cginc/noise/simplexNoise.glsl';
#include './../../r3f-gist/shader/cginc/utility.glsl';
#include './../../r3f-gist/shader/cginc/photoshopMath.glsl';
#include './../../r3f-gist/shader/cginc/noise/gradientNoise.glsl';
#include '../common.glsl';

uniform float time;
uniform vec3 fontColor;

uniform float alpha;
uniform float tiling;
uniform vec2 noiseRange;
uniform float speed;
uniform vec2 screenResolution;
varying vec2 vUv;
uniform float seed;
uniform float ratio;
uniform float hshift;


void main() {
    vec2 screenUv = gl_FragCoord.xy / screenResolution;
    float nc = simplexNoise2d(screenUv * tiling + time * speed);
    float na = remap(simplexNoise2d(vUv * vec2(1.0, 1.0)), vec2(-1., 1.), vec2(.2, 1.));
    float fade = smoothstep(0.0, 0.1, ratio);
    float a = alpha * fade * na;
    vec3 c = remap(nc, vec2(-1.0, 1.0), noiseRange) * fontColor;
    c = HSVShift(c, vec3(seed * hshift, .0, .0));

    float fog = getFog();
    c = mix(fogColor, c, fog);
    gl_FragColor = vec4(c, a * fog);
}