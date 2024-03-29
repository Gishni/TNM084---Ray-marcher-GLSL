// Lab 1 fragment shader
// Output either the generated texture from CPU or generate a similar pattern.
// Functions for gradient and cellular noise included. Not necessarily the best ones
// and not the same as the CPU code but they should be OK for the lab.

#version 150


//CODE BASE FROM LABORATION 1 IN THE COURSE TNM084 AT LINK�PING UNIVERSITY WRITTEN BY INGEMAR RAGNEMALM

//Author Max Benecke maxbe682

out vec4 out_Color;
in vec2 texCoord;
uniform sampler2D tex;

uniform int displayGPUversion;
uniform int iterations;
uniform float zmove;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

vec2 random2(vec2 st)
{
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}
//inspired by http://blog.hvidtfeldts.net/index.php/2011/08/distance-estimated-3d-fractals-iii-folding-space/
float foldDE(vec3 z){
     int n = 0;
    int iter = 1;
    while (n < iter){
       //TETRAHED FOLD
       if(z.x + z.y < 0){
            z.xy = -z.yx;
        }
        if(z.x + z.z < 0){
            z.xz = -z.zx;
        }
        if(z.z + z.y < 0){
            z.zy = -z.yz;
        }
        //cube FOLD
        if(z.z < 0){
            z.z = -z.z;
        }
         if(z.y < 0){
            z.y = -z.y;
        }
         if(z.x < 0){
            z.x = -z.x;
        }
        z = z*2.0+ - 0.8*(2.0 - 1.0);
        n++;
    }
    return (length(z)) *  pow(2.0, - float(n));
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

float sphereDE(vec4 pos){
    float radius = 0.2;
    //pos.xyz = mod(pos.xyz, 1.0) - vec3(0.5); //infinite amount of spheres
    //return length(pos.xyz) - radius;
    return (foldDE(pos.xyz) - radius);

}

//https://www.iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
vec3 calcNormal(vec4 p) {
    float h = 0.0001;
	const vec3 k = vec3(1,-1,0);
	return normalize(k.xyy*sphereDE(p + k.xyyz*h) +
					 k.yyx*sphereDE(p + k.yyxz*h) +
					 k.yxy*sphereDE(p + k.yxyz*h) +
					 k.xxx*sphereDE(p + k.xxxz*h));
}

//normals for the mandelbulb, same code as above just using the mandel DE.
vec3 calcNormalMandel(vec4 p) {
    float h = 0.0001;
    int g = 0;
	const vec3 k = vec3(1,-1,0);
	return normalize(k.xyy*DE(p + k.xyyz*h, g) +
					 k.yyx*DE(p + k.yyxz*h ,g ) +
					 k.yxy*DE(p + k.yxyz*h, g) +
					 k.xxx*DE(p + k.xxxz*h, g));
}



vec4 rayMarch (inout vec4 position, vec4 direction){

    float minimumDistance = 0.00001;
    int maxMarches = 4000;

    float totalDistance = 0;
    float dist = 0.0;
    int gen = 0;
    for(int i = 0; i < maxMarches; i++){

        dist = DE(position, gen); //the two diffrent DE settings one for sphere and one for the bulb
        //dist = sphereDE(position);
        if(dist < minimumDistance){
            break;
        }

        totalDistance += dist;

        position += normalize(direction) * dist; // update position

    }
    //return vec4(0.5 * (length(position) + 0.001), 0.0, 0.0, 0.0); //color by distance to origin
    //return vec4(calcNormal(position),0); // normal sphere
    //return vec4(calcNormalMandel(position),0); //normal mandel
    return vec4((gen/15.0), 0.0,0.0,0.0);//Escape time algorithm
    //return vec4(random2(vec2(gen)), 0.0 , 0.0); //escape time algorithm with random color
}


void main(void)
{
        vec4 camera = vec4(0.0,0.0, -3.0 + zmove, 0.0);
        camera =  viewMatrix * camera;
		vec4 position = vec4(texCoord - vec2(0.5), -2.0 + zmove, 0.0);
		position = viewMatrix * position; // roation of camera around object
		vec4 col = rayMarch(camera, position - camera); // send the ray from the camera through the specified position on the view plane
		out_Color = col;



}
