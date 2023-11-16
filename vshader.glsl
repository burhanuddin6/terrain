#version 300 es
precision mediump float;

in vec4 v_Norm;
in vec4 v_Pos;
in vec2 v_TexCoord;

uniform vec4 v_Light0;
uniform vec4 v_Light1;
uniform vec4 v_Camera;

uniform mat4 m_Model;
uniform mat4 m_View;
uniform mat4 m_Proj;

uniform float MAX_HEIGHT;
uniform float v_Time;

out vec3 o_Norm;
out vec3 o_Camera;
out vec3 o_Light0;
out vec3 o_Light1;
out vec2 f_TexCoord;
out float f_vertexHeight;

void main() 
{
    float scaledHeight = v_Pos.y / MAX_HEIGHT;
    vec4 newPos = v_Pos;

    mat4 m_ModelView = m_View * m_Model;
    vec4 tmp_Pos = m_ModelView * newPos;

    o_Norm = normalize(m_ModelView * v_Norm).xyz;
    o_Light0 = (m_View * v_Light0).xyz;
    o_Light1 = (m_View * v_Light1).xyz;
    o_Camera = normalize(-tmp_Pos).xyz;
    
    if (v_Light0.w != 0.0 )
        o_Light0 = o_Light0 - tmp_Pos.xyz;
          
    if (v_Light1.w != 0.0 )
        o_Light1 = o_Light1 - tmp_Pos.xyz;

    f_TexCoord = v_TexCoord;
    f_vertexHeight = v_Pos.y;
    gl_Position = m_Proj * tmp_Pos;
}
