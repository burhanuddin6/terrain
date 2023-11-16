#version 300 es
precision mediump float;

in vec3 o_Norm;
in vec3 o_Camera;
in vec3 o_Light0;
in vec3 o_Light1;
in vec2 f_TexCoord;
in float f_vertexHeight;

uniform vec3 light_Ambient0, light_Diffuse0, light_Specular0;
uniform vec3 light_Ambient1, light_Diffuse1, light_Specular1;

uniform float MAX_HEIGHT;

out vec4 FragColor;

vec4 biomeDiff(float height) {
    float scaledHeight = height / MAX_HEIGHT;
    vec4 grassColor = vec4(0.2, 0.8, 0.2, 1.0);
    vec4 snowColor = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 rockColor = vec4(0.541, 0.4, 0.22, 1.0);
    vec4 sandColor = vec4(0.9, 0.8, 0.6, 1.0);
    vec4 beachColor = vec4(0.8, 0.6, 0.4, 1.0);
    vec4 forestColor = vec4(0.0, 0.5, 0.0, 1.0);
    vec4 waterColor = vec4(0.0, 0.0, 1.0, 1.0);

    if (scaledHeight < 0.04) {
        return waterColor;
    }

    if (scaledHeight < 0.15) {
        return grassColor;
    }

    if (scaledHeight < 0.2) {
        return mix(grassColor, rockColor, 0.7);
    }

    if (scaledHeight < 0.3) {
        return rockColor;
    }

    if (scaledHeight < 0.4) {
        return mix(rockColor, snowColor, 0.7);
    }

    return snowColor;
}

vec4 biomeSpec(float height) {
    float scaledHeight = height / MAX_HEIGHT;
    vec4 grassColor = vec4(0.2, 0.8, 0.2, 1.0);
    vec4 snowColor = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 rockColor = vec4(0.541, 0.4, 0.22, 1.0);
    vec4 sandColor = vec4(0.9, 0.8, 0.6, 1.0);
    vec4 beachColor = vec4(0.8, 0.6, 0.4, 1.0);
    vec4 forestColor = vec4(0.0, 0.5, 0.0, 1.0);
    vec4 waterColor = vec4(0.4, 0.6, 0.1, 1.0);

    if (scaledHeight < 0.04) {
        return waterColor;
    }

    if (scaledHeight < 0.15) {
        return grassColor;
    }

    if (scaledHeight < 0.2) {
        return mix(grassColor, rockColor, 0.7);
    }

    if (scaledHeight < 0.3) {
        return rockColor;
    }

    if (scaledHeight < 0.4) {
        return mix(rockColor, snowColor, 0.7);
    }

    return snowColor;
}

void main()
{   
    vec3 N = normalize(o_Norm);
    vec3 E = normalize(o_Camera);
    vec3 L0 = normalize(o_Light0);
    vec3 H0 = normalize(L0 + E);
    
    vec3 specular = vec3(0.0);

    vec3 L1 = normalize(o_Light1);
    vec3 H1 = normalize(L1 + E);

    vec4 texelColorDiff = biomeDiff(f_vertexHeight);
    vec3 kd = texelColorDiff.rgb;

    vec3 ambient0 = kd * light_Ambient0;
    vec3 ambient1 = kd * light_Ambient1;

    float nl_0 = max(dot(L0, N), 0.0);
    float nl_1 = max(dot(L1, N), 0.0);

    vec3 diffuse0 = kd * nl_0 * light_Diffuse0;
    vec3 diffuse1 = kd * nl_1 * light_Diffuse1;

    vec4 texelColorSpec = biomeSpec(f_vertexHeight);

    float ks0 = pow(max(dot(N, H0), 0.0), texelColorSpec.a);
    float ks1 = pow(max(dot(N, H1), 0.0), texelColorSpec.a);

    vec3 specular0 = ks0 * texelColorSpec.rgb * light_Specular0;
    vec3 specular1 = ks1 * texelColorSpec.rgb * light_Specular1;

    if (dot(L0, N) < 0.0) 
        specular0 = vec3(0.0, 0.0, 0.0);
        
    if (dot(L1, N) < 0.0) 
        specular1 = vec3(0.0, 0.0, 0.0);

    FragColor.xyz = ambient0 + diffuse0 + specular0 + ambient1 + diffuse1 + specular1;
    float temp = gl_FragCoord.z + 0.1 * f_vertexHeight / MAX_HEIGHT +0.25;
    // FragColor.xyz = mix(vec3(1.0, 1.0, 1.0), vec3(0.1, 0.1, 0.1), temp);
    FragColor.a = texelColorDiff.a;
}
