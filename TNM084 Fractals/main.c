#ifdef __APPLE__
	#include <OpenGL/gl3.h>
	//uses framework Cocoa
#endif
#include "MicroGlut.h"
#include "GL_utilities.h"
#include <Math.h>
#include <stdio.h>
#include "VectorUtils3.h"



#define kTextureSize 512
GLubyte ptex[kTextureSize][kTextureSize][3];
const float ringDensity = 20.0;
int iterations = 15;

// Example: Radial pattern.
void maketexture()
{
	int x, y;
	float fx, fy, fxo, fyo;
	char val;

	for (x = 0; x < kTextureSize; x++)
	for (y = 0; y < kTextureSize; y++)
	{
		ptex[x][y][0] = x*2;
		ptex[x][y][1] = y*2;
		ptex[x][y][2] = 128;

		fx = (float)(x-kTextureSize/2.)/kTextureSize*2.;
		fy = (float)(y-kTextureSize/2.)/kTextureSize*2.;
		fxo = sqrt(fx*fx+fy*fy);
		fyo = sqrt(fx*fx+fy*fy);
		fxo = cos(fxo * ringDensity);
		fyo = sin(fyo * ringDensity);
		if (fxo > 1.0) fxo = 1;
		if (fxo < -1.0) fxo = -1.0;
		if (fyo > 1.0) fyo = 1.0;
		if (fyo < -1.0) fyo = -1.0;
		ptex[x][y][0] = fxo * 127 + 127;
		ptex[x][y][1] = fyo * 127 + 127;
		ptex[x][y][2] = 128;
	}
}

// Globals
// Data would normally be read from files
GLfloat vertices[] = { -1.0f,-1.0f,0.0f,1.0f,
						-1.0f,1.0f,0.0f,1.0f,
						1.0f,1.0f,0.0f,1.0f,
						-1.0f,-1.0f,0.0f,1.0f,
						1.0f,1.0f,0.0f,1.0f,
						1.0f,-1.0f,0.0f,1.0f };
GLfloat texCoords[] = { 0.0f,0.0f,
						0.0f,1.0f,
						1.0f,1.0f,
						0.0f,0.0f,
						1.0f,1.0f,
						1.0f,0.0f };

mat4 matID = {            -1.0f,-1.0f,0.0f,1.0f,
						-1.0f,1.0f,0.0f,1.0f,
						1.0f,1.0f,0.0f,1.0f,
						1.0f,-1.0f,0.0f,1.0f };
mat4 projectionMatrix;
// vertex array object
unsigned int vertexArrayObjID;
// Texture reference
GLuint texid;
// Switch between CPU and shader generation
int displayGPUversion = 1;
	// Reference to shader program
	GLuint program;


//TAKEN FROM LAB 3
void reshape(int w, int h)
{
    glViewport(0, 0, w, h);

	// Set the clipping volume
	projectionMatrix = perspective(45,1.0f*w/h,1,1000);
	glUniformMatrix4fv(glGetUniformLocation(program, "projectionMatrix"), 1, GL_TRUE, projectionMatrix.m);
}


void init(void)
{
	// two vertex buffer objects, used for uploading the
	unsigned int vertexBufferObjID;
	unsigned int texBufferObjID;

    projectionMatrix = frustum(-0.1, 0.1, -0.1, 0.1, 0.2, 300.0);


	// GL inits
	glClearColor(0.2,0.2,0.5,0);
	glEnable(GL_DEPTH_TEST);
	printError("GL inits");
	glDisable(GL_CULL_FACE);

	// Load and compile shader
	program = loadShaders("lab1.vert", "lab1.frag");
	glUseProgram(program);
	printError("init shader");

	// Upload gemoetry to the GPU:

	// Allocate and activate Vertex Array Object
	glGenVertexArrays(1, &vertexArrayObjID);
	glBindVertexArray(vertexArrayObjID);
	// Allocate Vertex Buffer Objects
	glGenBuffers(1, &vertexBufferObjID);
	glGenBuffers(1, &texBufferObjID);

	// VBO for vertex data
	glBindBuffer(GL_ARRAY_BUFFER, vertexBufferObjID);
	glBufferData(GL_ARRAY_BUFFER, 24*sizeof(GLfloat), vertices, GL_STATIC_DRAW);
	glVertexAttribPointer(glGetAttribLocation(program, "in_Position"), 4, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(glGetAttribLocation(program, "in_Position"));

	// VBO for texture
	glBindBuffer(GL_ARRAY_BUFFER, texBufferObjID);
	glBufferData(GL_ARRAY_BUFFER, 12*sizeof(GLfloat), texCoords, GL_STATIC_DRAW);
	glVertexAttribPointer(glGetAttribLocation(program, "in_TexCoord"), 2, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(glGetAttribLocation(program, "in_TexCoord"));

    //TEST
    glUniformMatrix4fv(glGetUniformLocation(program, "mat"), 1, GL_TRUE, matID.m);
    glUniformMatrix4fv(glGetUniformLocation(program, "projectionMatrix"), 1, GL_TRUE, projectionMatrix.m);
	// Texture unit
	glUniform1i(glGetUniformLocation(program, "tex"), 0); // Texture unit 0

// Constants common to CPU and GPU
	glUniform1i(glGetUniformLocation(program, "displayGPUversion"), 1); // shader generation off
	glUniform1i(glGetUniformLocation(program, "iterations"), iterations);


	maketexture();

// Upload texture
	glGenTextures(1, &texid); // texture id
	glBindTexture(GL_TEXTURE_2D, texid);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR); //
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR); //
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, kTextureSize, kTextureSize, 0, GL_RGB, GL_UNSIGNED_BYTE, ptex);

	// End of upload of geometry
	printError("init arrays");
}


GLfloat a = 0.0;
vec3 campos = {0, 1.5, 10};
vec3 forward = {0, 0, -4};
vec3 up = {0, 1, 0};

void display(void)
{
	printError("pre display");
	// clear the screen
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	mat4 worldToView, m;

    worldToView = lookAtv(campos, VectorAdd(campos, forward), up);
    a+= 0.1;
    m = worldToView;
    glUniformMatrix4fv(glGetUniformLocation(program, "viewMatrix"), 1, GL_TRUE, m.m);



    iterations++;
    glUniform1i(glGetUniformLocation(program, "iterations"), iterations);
	glBindVertexArray(vertexArrayObjID);	// Select VAO
	glDrawArrays(GL_TRIANGLES, 0, 6);	// draw object
	printError("display");

	glutSwapBuffers();
}

// Switch on any key
void keys(unsigned char key, int x, int y)
{
	switch (key)
	{
		case ' ':
			forward.y = 0;
			forward = ScalarMult(normalize(forward), 4.0);
			break;

        case'w':
            campos = VectorAdd(campos, ScalarMult(forward, 0.1));
            break;

        case'a':
            forward = MultMat3Vec3(mat4tomat3(Ry(0.05)), forward);
            break;

        case's':
            campos = VectorSub(campos, ScalarMult(forward, 0.1));
            break;

        case'd':
            forward = MultMat3Vec3(mat4tomat3(Ry(-0.05)), forward);
            break;

        case'q':
            campos = VectorSub(campos, ScalarMult(CrossProduct(forward, SetVector(0,1,0)), 0.05));
            break;

        case'e':
            campos = VectorAdd(campos, ScalarMult(CrossProduct(forward, SetVector(0,1,0)), 0.05));
            break;

        case'z':
            campos = VectorAdd(campos, ScalarMult(SetVector(0,1,0), 0.01));
            break;

        case'c':
            campos = VectorSub(campos, ScalarMult(SetVector(0,1,0), 0.01));
            break;

	}
	glutPostRedisplay();
}

int main(int argc, char *argv[])
{
	glutInit(&argc, argv);
	glutInitContextVersion(3, 2);
	glutInitWindowSize(kTextureSize, kTextureSize);
	glutCreateWindow ("Lab 1");
	glutDisplayFunc(display);
	glutKeyboardFunc(keys);
	//glutRepeatingTimer(1000);
	init ();
	glutMainLoop();
}


