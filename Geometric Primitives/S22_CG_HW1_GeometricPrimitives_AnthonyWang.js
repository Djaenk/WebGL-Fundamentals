"use strict";			// Enforce typing in javascript

var canvas;			// Drawing surface 
var gl;				// Graphics context

var axis = 0;			// Currently active axis of rotation
var xAxis = 0;			//  Will be assigned on of these codes for
var yAxis = 1;			//  
var zAxis = 2;

var theta = [0, 0, 0];		// Rotation angles for x, y and z axes
var thetaLoc;			// Holds shader uniform variable location
var flag = true;		// Toggle Rotation Control

var cubeVertexCoords = [
    -0.3, -0.3,  0.3,
    -0.3, -0.3, -0.3,
    -0.3,  0.3, -0.3,
    -0.3,  0.3,  0.3,
     0.3, -0.3,  0.3,
     0.3, -0.3, -0.3,
     0.3,  0.3, -0.3,
     0.3,  0.3,  0.3,
    -0.3, -0.3,  0.3,
     0.3, -0.3,  0.3,
    -0.3, -0.3, -0.3,
     0.3, -0.3, -0.3,
    -0.3,  0.3, -0.3,
     0.3,  0.3, -0.3,
    -0.3,  0.3,  0.3,
     0.3,  0.3,  0.3
]
var cubeVertexColors = [
    0.0, 0.0, 0.0, 1.0,  // black
    1.0, 0.0, 0.0, 1.0,  // red
    1.0, 1.0, 0.0, 1.0,  // yellow
    0.0, 1.0, 0.0, 1.0,  // green
    0.0, 0.0, 1.0, 1.0,  // blue
    1.0, 0.0, 1.0, 1.0,  // magenta
    1.0, 1.0, 1.0, 1.0,  // white
    0.0, 1.0, 1.0, 1.0,  // cyan
    0.0, 0.0, 0.0, 1.0,  // black
    0.0, 0.0, 1.0, 1.0,  // blue
    1.0, 0.0, 0.0, 1.0,  // red
    1.0, 0.0, 1.0, 1.0,  // magenta
    1.0, 1.0, 0.0, 1.0,  // yellow
    1.0, 1.0, 1.0, 1.0,  // white
    0.0, 1.0, 0.0, 1.0,  // green
    0.0, 1.0, 1.0, 1.0   // cyan
]

var coneVertexCoords = [
    -0.65, -0.3, 0,
    -0.65,  0.3, 0
]
var coneVertexColors = [
    1.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0
]
for(let i = 0.0; i < 1; i += 1/32){
    coneVertexCoords.push(0.3 * Math.cos(i * 2 * Math.PI) - 0.65, -0.3, 0.3 * Math.sin(i * 2 * Math.PI));
    coneVertexColors.push(1.0, 0.0, 0.0, 1.0);
}
coneVertexCoords.push(-0.35, -0.3, 0.0);
coneVertexColors.push(1.0, 0.0, 0.0, 1.0);

var cylinderVertexCoords = [];
var cylinderVertexColors = [];
for(let i = 0.0; i < 1; i += 1/32){
    cylinderVertexCoords.push(0.3 * Math.cos(i * 2 * Math.PI) + 0.65, -0.3, 0.3 * Math.sin(i * 2 * Math.PI));
    cylinderVertexCoords.push(0.3 * Math.cos(i * 2 * Math.PI) + 0.65, 0.3, 0.3 * Math.sin(i * 2 * Math.PI));
    cylinderVertexColors.push(0.0, 1.0, 0.0, 1.0);
    cylinderVertexColors.push(1.0, 0.0, 1.0, 1.0);
}
cylinderVertexCoords.push(0.95, -0.3, 0.0);
cylinderVertexCoords.push(0.95, 0.3, 0.0);
cylinderVertexColors.push(0.0, 1.0, 0.0, 1.0);
cylinderVertexColors.push(1.0, 0.0, 1.0, 1.0);

var vertices = new Float32Array(cubeVertexCoords.concat(coneVertexCoords, cylinderVertexCoords));

var vertexColors = new Float32Array(cubeVertexColors.concat(coneVertexColors, cylinderVertexColors));

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.height, canvas.width);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    //gl.enable(gl.DEPTH_TEST);;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // color array atrribute buffer

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // vertex array attribute buffer

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 0.017;	// Increment rotation of currently active axis of rotation in radians

    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle

    // Draw Cube
    gl.drawArrays(gl.LINE_LOOP, 0, 4);
    gl.drawArrays(gl.LINE_LOOP, 4, 4);
    gl.drawArrays(gl.LINES, 8, 8);
    
    // Draw Cone
    gl.drawArrays(gl.TRIANGLE_FAN, 16, 35);
    gl.drawArrays(gl.TRIANGLE_FAN, 17, 34);

    // Draw Cylinder
    gl.drawArrays(gl.TRIANGLE_STRIP, 51, 66);

    // Cone

    requestAnimationFrame(render);	// Call to browser to refresh display
}
