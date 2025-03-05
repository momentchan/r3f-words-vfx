#include '../../common.glsl';

uniform vec3 color;
uniform float opacity;
varying float vProgress;
varying float vEdge;

void main() {
    float fog = getFog(fogDensity * 0.2);
    float alpha = step(vEdge, vProgress);

    gl_FragColor = vec4(color, opacity * alpha * fog);
    // gl_FragColor = vec4(color, 1.);
}