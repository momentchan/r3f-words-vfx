uniform vec3 fogColor;
uniform float fogDensity;

float getFog() {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    return exp(-fogDensity * depth * depth);
}