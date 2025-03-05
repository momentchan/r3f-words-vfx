#include '../../common.glsl';

uniform float progress;
uniform vec3 color;
uniform float opacity;
varying float vEdgeProgress;

void main() {
    float fog = getFog(fogDensity * 0.2);
    float alpha = step(vEdgeProgress, progress);
    gl_FragColor = vec4(color, alpha * opacity * fog);
}