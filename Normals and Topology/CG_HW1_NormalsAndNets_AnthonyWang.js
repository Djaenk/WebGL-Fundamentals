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

var scalar = [1.0, 1.0, 1.0, 1.0];
var scalarLoc;

const red = [1.0, 0.0, 0.0, 1.0]
const green = [0.0, 1.0, 0.0, 1.0]
const blue = [0.0, 0.0, 1.0, 1.0]
const yellow = [1.0, 1.0, 0.0, 1.0]

const points = [
    [ 0.5,  0.0, -0.5/Math.sqrt(2), 1.0],
    [-0.5,  0.0, -0.5/Math.sqrt(2), 1.0],
    [ 0.0,  0.5,  0.5/Math.sqrt(2), 1.0],
    [ 0.0, -0.5,  0.5/Math.sqrt(2), 1.0],
    [ 0.0,  0.0,  0.0,  1.0],
    [-0.5,  0.0,  0.5/Math.sqrt(2), 1.0],
    [ 0.5,  0.0,  0.5/Math.sqrt(2), 1.0],
    [ 0.0, -0.5, -0.5/Math.sqrt(2), 1.0],
    [ 0.0,  0.5, -0.5/Math.sqrt(2), 1.0],
]

const pointIndices = [
    0, 2, 1,
    0, 3, 1,
    0, 3, 2,
    1, 2, 3,
    4, 5,
    4, 6,
    4, 7,
    4, 8,
]

var colors = [
    red,
    green,
    blue,
    yellow,
    [1.0, 1.0, 1.0, 1.0],
    red,
    green,
    blue,
    yellow
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
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.cullFace(gl.BACK);

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

    document.getElementById( "xButton" ).onclick = function() {axis = xAxis;};
    document.getElementById( "yButton" ).onclick = function() {axis = yAxis;};
    document.getElementById( "zButton" ).onclick = function() {axis = zAxis;};
    document.getElementById("ButtonT").onclick = function() {flag = !flag;};
    document.getElementById("cull0").onclick = function() {gl.disable(gl.CULL_FACE)};
    document.getElementById("cull1").onclick = function() {gl.enable(gl.CULL_FACE), gl.cullFace(gl.FRONT)};
    document.getElementById("cull2").onclick = function() {gl.enable(gl.CULL_FACE), gl.cullFace(gl.BACK)};
    document.getElementById("cull3").onclick = function() {gl.enable(gl.CULL_FACE), gl.cullFace(gl.FRONT_AND_BACK)};
    document.getElementById("ScaleX").onpointermove = function(event) {scalar[0] = event.target.value;}
    document.getElementById("ScaleY").onpointermove = function(event) {scalar[1] = event.target.value;}
    document.getElementById("ScaleZ").onpointermove = function(event) {scalar[2] = event.target.value;}

    render();
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 0.017;	// Increment rotation of currently active axis of rotation in radians
    gl.uniform3fv(thetaLoc, theta);	// Update uniform in vertex shader with new rotation angle

    gl.uniform4fv(scalarLoc, scalar);
    gl.drawElements(gl.TRIANGLES, 12, gl.UNSIGNED_SHORT, 0);
    scalar[0] = 1 / scalar[0];
    scalar[1] = 1 / scalar[1];
    scalar[2] = 1 / scalar[2];
    gl.uniform4fv(scalarLoc, scalar);
    gl.drawElements(gl.LINES, 8, gl.UNSIGNED_SHORT, 24);
    scalar[0] = 1 / scalar[0];
    scalar[1] = 1 / scalar[1];
    scalar[2] = 1 / scalar[2];

    requestAnimationFrame(render);
}