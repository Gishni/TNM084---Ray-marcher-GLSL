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
float DE(vec4 pos, inout int gen){
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
        if(0.5*log(r)*r/dr < 0.00001){
            gen = i;
        }

    }
    return 0.5*log(r)*r/dr;
}

float sphereDE(vec4 pos){ //infinite amount of balls :)
    float radius = 0.2;
    pos.xyz = mod(pos.xyz, 1.0) - vec3(0.5);
    return length(pos.xyz) - radius;

}
/*
//TAKEN FROM http://celarek.at/wp/wp-content/uploads/2014/05/realTimeFractalsReport.pdf
vec4 calculateNormal (vec4 position){
    float e = 0.0000001;
    float n = sphereDE(position);
    float dx = DE(position + vec4(e, 0,0,0.0)) - n;
    float dy = DE(position + vec4(0, e,0,0.0)) - n;
    float dz = DE(position + vec4(0, 0,e,0.0)) - n;
    vec4 grad = vec4(dx, dy, dz, 0);
    return normalize(grad);
}
*/
//https://www.iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
vec3 calcNormal(vec4 p) {
    float h = 0.0001;
	const vec3 k = vec3(1,-1,0);
	return normalize(k.xyy*sphereDE(p + k.xyyz*h) +
					 k.yyx*sphereDE(p + k.yyxz*h) +
					 k.yxy*sphereDE(p + k.yxyz*h) +
					 k.xxx*sphereDE(p + k.xxxz*h));
}



vec4 rayMarch (inout vec4 position, vec4 direction){

    float minimumDistance = 0.00001; //temp values
    int maxMarches = 4000;

    float totalDistance = 0;
    float dist = 0.0;
    int gen = 0;
    for(int i = 0; i < maxMarches; i++){

        //dist = DE(position, gen);
        dist = sphereDE(position);
        if(dist < minimumDistance){
            //return vec4(1.0,0.0,0.0,0.0);
            break;
        }

        totalDistance += dist;

        position += normalize(direction) * dist;

    }
    return vec4(calcNormal(position),0);
    //return vec4(vec2(gen/15.0),0.0,0.0); //MANDELBULB

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
        vec4 camera = vec4(0.0,0.0, -3.0, 0.0);
        camera =  viewMatrix * camera;
		vec4 position = vec4(texCoord - vec2(0.5), -2.0, 0.0);
		position = viewMatrix * position;
		vec4 col = rayMarch(camera, position - camera);
		out_Color = col;



}
