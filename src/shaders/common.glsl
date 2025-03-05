uniform vec3 fogColor;
uniform float fogDensity;

float getFog(float density) {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    return exp(-density * depth * depth);
}