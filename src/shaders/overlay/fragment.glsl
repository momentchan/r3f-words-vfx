#include './../../r3f-gist/shader/cginc/noise/gradientNoise.glsl';
#include './../../r3f-gist/shader/cginc/utility.glsl';


void mainImage(const in vec4 inputColor, in vec2 uv, out vec4 outputColor) {
    // outputColor = vec4(uv, .0, 1.0);
    float noise = remap(noise(uv), vec2(0.0, 1.0), vec2(0.8, 1.0));
    outputColor = inputColor;//  * noise;
    outputColor = inputColor  * noise;
    // outputColor = vec4(inputColor.a);
}