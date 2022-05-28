"use strict";

var canvas;
var gl;

var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var theta = [0, 0, 0];
var thetaLoc;
var flag = true;
var axes = true;

var scalarLoc;
var offsetLoc;

const red = [1.0, 0.0, 0.0, 1.0]
const green = [0.0, 1.0, 0.0, 1.0]
const blue = [0.0, 0.0, 1.0, 1.0]
const yellow = [1.0, 1.0, 0.0, 1.0]
const gray = [0.5, 0.5, 0.5, 1.0]

const dimensions = [
    [Math.random()/3, Math.random()/4, Math.random()/3, 1.0],
    [Math.random()/3, Math.random()/4, Math.random()/3, 1.0],
    [Math.random()/3, Math.random()/4, Math.random()/3, 1.0],
    [Math.random()/3, Math.random()/2, Math.random()/3, 1.0],
    [Math.random()/3, Math.random()/2, Math.random()/3, 1.0],
    [Math.random()/3, Math.random()/2, Math.random()/3, 1.0],
    [Math.random()/3, Math.random()/4, Math.random()/3, 1.0],
    [Math.random()/3, Math.random()/4, Math.random()/3, 1.0],
    [Math.random()/3, Math.random()/4, Math.random()/3, 1.0],
]

const points = [
    //Cube Vertices
    [ 1.0,  1.0,  1.0, 1.0],
    [ 1.0,  1.0, -1.0, 1.0],
    [ 1.0, -1.0,  1.0, 1.0],
    [ 1.0, -1.0, -1.0, 1.0],
    [-1.0,  1.0,  1.0, 1.0],
    [-1.0,  1.0, -1.0, 1.0],
    [-1.0, -1.0,  1.0, 1.0],
    [-1.0, -1.0, -1.0, 1.0],
    //Axes Vertices
    [-10.0, -1.0,  0.0, 1.0],
    [ 10.0, -1.0,  0.0, 1.0],
    [ 0.0, -10.0,  0.0, 1.0],
    [ 0.0,  10.0,  0.0, 1.0],
    [ 0.0, -1.0, -10.0, 1.0],
    [ 0.0, -1.0,  10.0, 1.0],
]

const pointIndices = [
    0, 1, 2, 3, 
    4, 5, 6, 7, 
    0, 1, 4, 5,
    2, 3, 6, 7,
    0, 2, 4, 6,
    1, 3, 5, 7,
    8, 9,
    10, 11,
    12, 13,
]

var colors = [
    red,
    green,
    gray,
    gray,
    blue,
    yellow,
    gray,
    gray,
    red,
    red,
    green,
    green,
    blue,
    blue,
]

var vertices = new Float32Array(points.flat())
var vertexColors = new Float32Array(colors.flat())
var indices = new Uint16Array(pointIndices.flat());

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

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    thetaLoc = gl.getUniformLocation(program, "uTheta");
    scalarLoc = gl.getUniformLocation(program, "uScalar");
    offsetLoc = gl.getUniformLocation(program, "uOffset");

    document.getElementById( "xButton" ).onclick = function() {axis = xAxis;};
    document.getElementById( "yButton" ).onclick = function() {axis = yAxis;};
    document.getElementById( "zButton" ).onclick = function() {axis = zAxis;};
    document.getElementById("ButtonT").onclick = function() {flag = !flag;};
    document.getElementById("ButtonAxes").onclick = function() {axes = !axes;};

    render();
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 0.017;	// Increment rotation of currently active axis of rotation in radians
    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle

    // Draw Axes
    if (axes) {
        gl.uniform4fv(offsetLoc, [0.0, 0.0, 0.0, 0.0]);
        gl.uniform4fv(scalarLoc, [1.0, 1.0, 1.0, 1.0]); 
        gl.drawElements(gl.LINES, 6, gl.UNSIGNED_SHORT, 48);
    }

    for (var i = 0; i < 9; i++){
        gl.uniform4fv(offsetLoc, [(i % 3 - 1) * 0.65, 0.0, (Math.floor(i / 3) - 1) * 0.65, 0.0]);
        gl.uniform4fv(scalarLoc, dimensions[i]); 
        gl.drawElements(gl.TRIANGLE_STRIP, 24, gl.UNSIGNED_SHORT, 0);
    }

    requestAnimationFrame(render);
}