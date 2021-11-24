// Lab 1 fragment shader
// Output either the generated texture from CPU or generate a similar pattern.
// Functions for gradient and cellular noise included. Not necessarily the best ones
// and not the same as the CPU code but they should be OK for the lab.

#version 150

out vec4 out_Color;
in vec2 texCoord;
uniform sampler2D tex;

uniform int displayGPUversion;
uniform int iterations;
uniform mat4 mat;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

vec2 random2(vec2 st)
{
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

//code from http://blog.hvidtfeldts.net/index.php/2011/09/distance-estimated-3d-fractals-v-the-mandelbulb-different-de-approximations/
float DE(vec4 pos){
    int iter = 15; //temp values
    float power = 8.0;

    vec4 z = pos;
    float dr = 1.0;
    float r = 0.0;

    for (int i = 0; i < iter; i++){
        r = length(z);
        if(r > 2.0){
            break;
        }
        //polar coordinates
        float theta = acos(z.z/r);
        float phi = atan(z.y,z.x);
        dr = pow(r, power-1.0) * power * dr + 1.0;

        //scaling and rotation
        float zr = pow(r, power);
        theta = theta * power;
        phi = phi * power;

        //cartesian coords
        z = zr * vec4(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta), 0.0);
        z+=pos;

    }
    return 0.5*log(r)*r/dr;
}

//TAKEN FROM http://celarek.at/wp/wp-content/uploads/2014/05/realTimeFractalsReport.pdf
vec4 calculateNormal (vec4 position){
    float e = 0.0000001;
    float n = DE(position);
    float dx = DE(position + vec4(e, 0,0,0)) - n;
    float dy = DE(position + vec4(0, e,0,0)) - n;
    float dz = DE(position + vec4(0, 0,e,0)) - n;
    vec4 grad = vec4(dx, dy, dz, 0);
    return normalize(grad);
}

vec4 rayMarch (inout vec4 position, vec4 direction){

    float minimumDistance = 0.0001; //temp values
    float maxMarches = 4000;

    float totalDistance = 0;
    float dist = 0.0;

    for(float i = 0; i < maxMarches; i += 1.0){

        dist = DE(position);

        if(dist < minimumDistance){

            break;
        }

        totalDistance += dist;

        position += direction * dist;

    }

    return totalDistance*20*calculateNormal(position);
}


void main(void)
{

	    mat4 inMat = projectionMatrix*viewMatrix*mat;
        /*
	    vec4 ray = normalize(vec4(0.0, 0.0, -10.0, 0.0));
	    ray = inMat * ray;

	    vec4 position = inMat[3];

	    float col = rayMarch(position, ray);
	    */
        vec4 camera = vec4(texCoord.x + 3.0, texCoord.y +1.0, 2.0, 1.0);
        camera =  viewMatrix * camera;
		vec4 position = vec4(texCoord, 0.0, 0.0);
		vec4 col = rayMarch(position, position - camera);
		out_Color = col;



}
