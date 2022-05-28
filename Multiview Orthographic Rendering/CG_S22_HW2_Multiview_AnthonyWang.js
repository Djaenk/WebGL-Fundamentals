"use strict";

var canvas;
var gl;

var modelViewMatrixLoc;

const red = [1.0, 0.0, 0.0, 1.0]
const green = [0.0, 1.0, 0.0, 1.0]
const blue = [0.0, 0.0, 1.0, 1.0]
const black = [0.1, 0.1, 0.1, 1.0]

// Vertices defining the green surfaces of the W
var wFacePositive = [
     0.1,  0.6, -0.7, 1.0,
     0.1,  0.6, -0.5, 1.0,
     0.2,  0.3, -0.6, 1.0,
     0.2,  0.3, -0.4, 1.0,
     0.3,  0.0, -0.5, 1.0,
     0.3,  0.0, -0.3, 1.0,
     0.4, -0.3, -0.4, 1.0,
     0.4, -0.3, -0.2, 1.0,
     0.3,  0.0, -0.3, 1.0,
     0.2,  0.3,  0.0, 1.0,
     0.2,  0.3, -0.2, 1.0,
     0.1,  0.6, -0.1, 1.0,
     0.1,  0.6,  0.1, 1.0,
     0.2,  0.3,  0.0, 1.0,
     0.2,  0.3,  0.2, 1.0,
     0.3,  0.0,  0.1, 1.0,
     0.3,  0.0,  0.3, 1.0,
     0.4, -0.3,  0.2, 1.0,
     0.4, -0.3,  0.4, 1.0,
     0.3,  0.0,  0.3, 1.0,
     0.3,  0.0,  0.5, 1.0,
     0.2,  0.3,  0.4, 1.0,
     0.2,  0.3,  0.6, 1.0,
     0.1,  0.6,  0.5, 1.0,
     0.1,  0.6,  0.7, 1.0,
]
var wFaceNegative = [];
var wInwardPositive = [];
var wInwardNegative = [];
var wColor = [];
for (let i = 0; i < wFacePositive.length; i++) {
    if (i % 4) {
        var sign = 1
        var offset = 0
    }
    else {
        var sign = -1
        var offset = 0.2
        wColor.push(...green)
        wColor.push(...green)
        wColor.push(...green)
        wColor.push(...green)
    }
    wFaceNegative.push(wFacePositive[i] * sign)
    wInwardPositive.push(wFacePositive[i] - offset)
    wInwardNegative.push(wFacePositive[i] * sign + offset)
}

// Vertices for defining the blue surfaces of the A
var aFacePositive = [
     0.2, -0.3,  0.4, 1.0,
     0.4, -0.3,  0.4, 1.0,
    -0.1,  0.6,  0.7, 1.0,
     0.1,  0.6,  0.7, 1.0,
    -0.4, -0.3,  0.4, 1.0,
    -0.2, -0.3,  0.4, 1.0,
   -0.15,-0.15, 0.45, 1.0,
    -0.1,  0.0,  0.5, 1.0,
    0.15,-0.15, 0.45, 1.0,
     0.1,  0.0,  0.5, 1.0,
]
var aFaceNegative = []
var aInwardPositive = []
var aInwardNegative = []
var aOutwardPositive = []
var aOutwardNegative = []
var aInnerPositive = []
var aInnerNegative = []
var aColor = [];
for (let i = 0; i < aFacePositive.length; i++) {
    if (i % 4 - 2) {
        var sign = 1
        var offset = 0
    }
    else {
        var sign = -1
        var offset = 0.2
        aColor.push(...blue)
        aColor.push(...blue)
        aColor.push(...blue)
        aColor.push(...blue)
        aColor.push(...blue)
        aColor.push(...blue)
        aColor.push(...blue)
        aColor.push(...blue)
    }
    aFaceNegative.push(aFacePositive[i] * sign)
    aInwardPositive.push(aFacePositive[i] - offset)
    aInwardNegative.push(aFacePositive[i] * sign + offset)
    aOutwardPositive.push(aFacePositive[i] * sign + 4 * offset)
    aOutwardNegative.push(aFacePositive[i] - 4 * offset)
    aInnerPositive.push(aFacePositive[i] * sign + 3 * offset)
    aInnerNegative.push(aFacePositive[i] - 3 * offset)
}

// Vertices for defining the red surfaces parallel to the pedestal
var horizontalFaces = [
    -0.1,  0.6, -0.7, 1.0,
     0.1,  0.6, -0.7, 1.0,
    -0.1,  0.6, -0.5, 1.0,
     0.1,  0.6, -0.5, 1.0,
    -0.1,  0.6, -0.1, 1.0,
     0.1,  0.6, -0.1, 1.0,
    -0.1,  0.6,  0.1, 1.0,
     0.1,  0.6,  0.1, 1.0,
    -0.1,  0.6,  0.5, 1.0,
     0.1,  0.6,  0.5, 1.0,
    -0.1,  0.6,  0.7, 1.0,
     0.1,  0.6,  0.7, 1.0,
    -0.1,  0.0, -0.5, 1.0,
     0.1,  0.0, -0.5, 1.0,
    -0.1,  0.0, -0.3, 1.0,
     0.1,  0.0, -0.3, 1.0,
    -0.1,  0.0, -0.1, 1.0,
     0.1,  0.0, -0.1, 1.0,
    -0.1,  0.0,  0.1, 1.0,
     0.1,  0.0,  0.1, 1.0,
    -0.1,  0.0,  0.3, 1.0,
     0.1,  0.0,  0.3, 1.0,
    -0.1,  0.0,  0.5, 1.0,
     0.1,  0.0,  0.5, 1.0,
    -.15, -.15, -.45, 1.0,
     .15, -.15, -.45, 1.0,
    -.15, -.15, -.15, 1.0,
     .15, -.15, -.15, 1.0,
    -.15, -.15,  .45, 1.0,
     .15, -.15,  .45, 1.0,
    -.15, -.15,  .15, 1.0,
     .15, -.15,  .15, 1.0,
]
var horizontalColor = []
for (let i = 0; i < horizontalFaces.length; i++) {
    if (i % 4 == 0) {
        horizontalColor.push(...red)
    }
}

var vertices = new Float32Array([].concat(
    wFacePositive,
    wFaceNegative,
    wInwardPositive,
    wInwardNegative,
    aFacePositive,
    aFaceNegative,
    aInwardPositive,
    aInwardNegative,
    aOutwardPositive,
    aOutwardNegative,
    aInnerPositive,
    aInnerNegative,
    horizontalFaces
));

var vertexColors = new Float32Array([].concat(
    wColor,
    aColor,
    horizontalColor
));

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.height, canvas.width);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");

    render();
}

function drawInitials()
{
    // W
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 25)
    gl.drawArrays(gl.TRIANGLE_STRIP, 25, 25)
    gl.drawArrays(gl.TRIANGLE_STRIP, 50, 25)
    gl.drawArrays(gl.TRIANGLE_STRIP, 75, 25)

    // A
    gl.drawArrays(gl.TRIANGLE_STRIP, 100, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 110, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 120, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 130, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 140, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 150, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 160, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 170, 10)

    // tops
    gl.drawArrays(gl.TRIANGLE_STRIP, 180, 4)
    gl.drawArrays(gl.TRIANGLE_STRIP, 184, 4)
    gl.drawArrays(gl.TRIANGLE_STRIP, 188, 4)
    gl.drawArrays(gl.TRIANGLE_STRIP, 192, 6)
    gl.drawArrays(gl.TRIANGLE_STRIP, 198, 6)
    gl.drawArrays(gl.TRIANGLE_STRIP, 204, 4)
    gl.drawArrays(gl.TRIANGLE_STRIP, 208, 4)
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Top-left corner, front view
    gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, lookAt(vec3(0,0,0), vec3(0,0,-1), vec3(0,1,0)).flat());
    drawInitials();

    // Top-right corner, side view
    gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, lookAt(vec3(0,0,0), vec3(1,0,0), vec3(0,1,0)).flat());
    drawInitials();

    // Bottom-left corner, top view
    gl.viewport(0, 0, canvas.width/2, canvas.height/2);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, lookAt(vec3(0,0,0), vec3(0,1,0.000000001), vec3(0,1,0)).flat());
    drawInitials();

    // Bottom-right corner, isometric view
    gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, lookAt(vec3(0,0,0), vec3(1,1,1), vec3(0,1,0)).flat());
    drawInitials();
}