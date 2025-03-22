#include './../../r3f-gist/shader/cginc/noise/gradientNoise.glsl';
#include './../../r3f-gist/shader/cginc/utility.glsl';


void mainImage(const in vec4 inputColor, in vec2 uv, out vec4 outputColor) {
    // outputColor = vec4(uv, .0, 1.0);
    float n = remap(noise(uv), vec2(0.0, 1.0), vec2(0.8, 1.0));



    vec3 col = inputColor.rgb * n;
    // col = mix(col, 1.0-col, step(0.5, uv.x));
    // outputColor = 1.0 - inputColor;//  * noise;
    // outputColor = vec4(1.0) - inputColor  * noise;
    
    outputColor = vec4(col, 1.0);
    // outputColor = vec4(inputColor.a);
}