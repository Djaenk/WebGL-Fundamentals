"use strict";

var canvas;
var gl;

var axes = true;
var modelViewMatrixLoc;
var cameraX = 1; 
var cameraZ = -1;
var cameraY = 1;

const green = [0.0, 1.0, 0.0, 1.0]
const blue = [0.0, 0.0, 1.0, 1.0]

var axisVertices = [
    -10.0,  0.0,  0.0,
     10.0,  0.0,  0.0,
     0.0, -10.0,  0.0,
     0.0,  10.0,  0.0,
     0.0,  0.0, -10.0,
     0.0,  0.0,  10.0,
]

var axisColors = [
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
]

var meshVertices = [];
var meshColors = [];
function pointAtF(x, z) {return [x, Math.sin(10 * x)/5 + Math.sin(10 * z)/5, z]}
var step = 0.05;
for (var x = -1; x < 1; x += step) {
    for (var z = -1; z < 1; z += step) {
        meshVertices.push(pointAtF(x, z));
        meshColors.push(blue);
        meshVertices.push(pointAtF(x - step/2, z - step/2));
        meshColors.push(green);
        meshVertices.push(pointAtF(x - step/2, z + step/2));
        meshColors.push(green);
        meshVertices.push(pointAtF(x, z));
        meshColors.push(blue);
        meshVertices.push(pointAtF(x - step/2, z + step/2));
        meshColors.push(green);
        meshVertices.push(pointAtF(x + step/2, z + step/2));
        meshColors.push(green);
        meshVertices.push(pointAtF(x, z));
        meshColors.push(blue);
        meshVertices.push(pointAtF(x + step/2, z + step/2));
        meshColors.push(green);
        meshVertices.push(pointAtF(x + step/2, z - step/2));
        meshColors.push(green);
        meshVertices.push(pointAtF(x, z));
        meshColors.push(blue);
        meshVertices.push(pointAtF(x + step/2, z - step/2));
        meshColors.push(green);
        meshVertices.push(pointAtF(x - step/2, z - step/2));
        meshColors.push(green);
    }
}

var vertices = new Float32Array(axisVertices.concat(meshVertices).flat());
var vertexColors = new Float32Array(axisColors.concat(meshColors).flat());

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.height, canvas.width);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
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
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");

    document.getElementById("ButtonAxes").onclick = function(){axes = !axes;};
    document.getElementById("XSlider").addEventListener("mousemove", updateX);
    document.getElementById("ZSlider").addEventListener("mousemove", updateZ);
    document.getElementById("YSlider").addEventListener("mousemove", updateY);

    render();
}

function updateX(e) {
    cameraX = document.getElementById("XSlider").value;
}

function updateZ(e) {
    cameraZ = document.getElementById("ZSlider").value;
}

function updateY(e) {
    cameraY = document.getElementById("YSlider").value;
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, lookAt(vec3(cameraX,cameraY,cameraZ), vec3(0,0,0), vec3(0,1,0)).flat());

    // Draw Axes
    if (axes) {
        gl.drawArrays(gl.LINES, 0, 6);
    }
    
    // Draw Mesh
    gl.drawArrays(gl.TRIANGLES, 6, (2/step) * (2/step) * 12);

    requestAnimationFrame(render);	// Call to browser to refresh display
}