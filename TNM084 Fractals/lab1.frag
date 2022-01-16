
#version 150

out vec4 out_Color;
in vec2 texCoord;
uniform sampler2D tex;

uniform int displayGPUversion;
<<<<<<< Updated upstream
uniform float ringDensity;

=======
uniform int iterations;
uniform float zmove;
uniform mat4 mat;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
>>>>>>> Stashed changes

vec2 random2(vec2 st)
{
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}
<<<<<<< Updated upstream

//code from http://blog.hvidtfeldts.net/index.php/2011/09/distance-estimated-3d-fractals-v-the-mandelbulb-different-de-approximations/
float DE(vec4 pos){
    int iter = 15; //temp values
=======

//inspired by http://blog.hvidtfeldts.net/index.php/2011/08/distance-estimated-3d-fractals-iii-folding-space/
float foldDE(vec3 z){
     int n = 0;
    int iter = 10;
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
        /*
        //SQUARE FOLD
         if(z.z < 0){
            z.z = -z.z; //z axis fold
        }
         if(z.y < 0){
            z.y = -z.y; //y axis fold
        }
         if(z.x < 0){
            z.x = -z.x; //x axis fold
        } */
        z = z*2.0+ - 0.5*(2.0 - 0.5);  //scaling and offset to move the newly created shapes to correct possitions
        n++;
    }

    return (length(z)) *  pow(2.0, - float(n)); //scaling the shape so it gets higher res but not be
}

//code inspired from http://blog.hvidtfeldts.net/index.php/2011/09/distance-estimated-3d-fractals-v-the-mandelbulb-different-de-approximations/
float DE(vec4 pos, inout int gen){
    int iter = 10; //Iterations
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
        if(0.5*log(r)*r/dr < 0.00001){
            gen = i; // What iteration is did the distance reach the bailout
        }
>>>>>>> Stashed changes

    }
    return 0.5*log(r)*r/dr;
}

float rayMarch (inout vec4 position, vec4 direction){

<<<<<<< Updated upstream
    float minimumDistance = 0.0001; //temp values
    float maxMarches = 1000;

    float totalDistance = 0;
    float dist = 0.0;
=======
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
>>>>>>> Stashed changes

    for(float i = 0; i < maxMarches; i += 1.0){

        dist = DE(position);

<<<<<<< Updated upstream
        //dist = random2(texCoord).x;

        if(dist < minimumDistance){

=======
    float totalDistance = 0;
    float dist = 0.0;
    int gen = 0;
    for(int i = 0; i < maxMarches; i++){ //marching

        dist = DE(position, gen); //the two diffrent DE settings one for sphere and one for the bulb
        //dist = sphereDE(position);
        if(dist < minimumDistance){ //break once we hit an object
>>>>>>> Stashed changes
            break;
        }

        totalDistance += dist;

<<<<<<< Updated upstream
        position += direction * dist;

    }
    return totalDistance;
=======
        position += normalize(direction) * dist; // update position

    }
    //return vec4(0.5 * (length(position) + 0.001), 0.0, 0.0, 0.0); //color by distance to origin
    //return vec4(calcNormal(position),0); // normal sphere
    //return vec4(calcNormalMandel(position),0); //normal mandel
    //return vec4(hsl2rgb(vec3(gen * 0.1)), 0.0); //escape time with random color algoritm
    return vec4((gen/15.0), 0.0,0.0,0.0);//Escape time algorithm
    //return vec4(random2(vec2(gen)), 0.0 , 0.0); //escape time algorithm with random color

>>>>>>> Stashed changes
}

void main(void)
{
<<<<<<< Updated upstream
	if (displayGPUversion == 1)
	{
        vec4 camera = vec4(0.0, 0.0, -1.0, 0.0);
		vec4 position = vec4(texCoord, 0.0, 0.0);
		float b = rayMarch(position, position - camera);
		out_Color = position * b * 20;
=======


        /*
	    vec4 ray = normalize(vec4(0.0, 0.0, -10.0, 0.0));
	    ray = inMat * ray;

	    vec4 position = inMat[3];

	    float col = rayMarch(position, ray);
	    */
        vec4 camera = vec4(0.0,0.0, -3.0 + zmove, 0.0);
        camera =  viewMatrix * camera; // roation of camera around object
		vec4 position = vec4(texCoord - vec2(0.5), -2.0 + zmove, 0.0);
		position = viewMatrix * position; // roation of camera around object
		vec4 col = rayMarch(camera, position - camera); // send the ray from the camera through the specified position on the view plane
		out_Color = col;

>>>>>>> Stashed changes


	}
	else
		out_Color = texture(tex, texCoord);
}
