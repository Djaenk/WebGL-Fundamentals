"use strict";          // Enforce typing in javascript

var canvas;            // Drawing surface 
var gl;                // Graphics context

var axis = 1;          // Currently active axis of rotation
var xAxis = 0;         // Will be assigned on of these codes for rotation
var yAxis = 1;
var zAxis = 2;

var theta = [0, 0, 0]; // Rotation angles for x, y and z axes
var thetaLoc;          // Holds shader uniform variable location

var xOffset = 0.0;     // Magnitudes for translation
var yOffset = 0.0;
var uOffsetLoc;        // Holds shader uniform variable location

var flag = true;       // Toggle Rotation Control
var confetti = false;  // Toggle Confetti

const red = [1.0, 0.0, 0.0, 1.0]
const green = [0.0, 1.0, 0.0, 1.0]
const blue = [0.0, 0.0, 1.0, 1.0]
const black = [0.1, 0.1, 0.1, 1.0]

// Vertices for top of pedestal
var circleVertexCoords = [0.0, -0.3, 0.0]
var circleVertexColors = [...black]
for (let i = 0.0; i < 1; i += 1/32) {
    circleVertexCoords.push(0.7 * Math.cos(i * 2 * Math.PI), -0.3, 0.7 * Math.sin(i * 2 * Math.PI));
    circleVertexColors.push(...black)
}
circleVertexCoords.push(0.7, -0.3, 0.0);
circleVertexColors.push(...black)

// Vertices for edge of pedestal
var cylinderVertexCoords = [];
var cylinderVertexColors = [];
for(let i = 0.0; i < 1; i += 1/32){
    cylinderVertexCoords.push(0.7 * Math.cos(i * 2 * Math.PI), -0.3, 0.7 * Math.sin(i * 2 * Math.PI));
    cylinderVertexCoords.push(0.7 * Math.cos(i * 2 * Math.PI), -0.6, 0.7 * Math.sin(i * 2 * Math.PI));
    cylinderVertexColors.push(...black);
    cylinderVertexColors.push(...black);
}
cylinderVertexCoords.push(0.7, -0.3, 0.0);
cylinderVertexCoords.push(0.7, -0.6, 0.0);
cylinderVertexColors.push(...black);
cylinderVertexColors.push(...black);

// Vertices defining the green surfaces of the W
var wFacePositive = [
     0.1,  0.6, -0.7,
     0.1,  0.6, -0.5,
     0.2,  0.3, -0.6,
     0.2,  0.3, -0.4,
     0.3,  0.0, -0.5,
     0.3,  0.0, -0.3,
     0.4, -0.3, -0.4,
     0.4, -0.3, -0.2,
     0.3,  0.0, -0.3,
     0.2,  0.3,  0.0,
     0.2,  0.3, -0.2,
     0.1,  0.6, -0.1,
     0.1,  0.6,  0.1,
     0.2,  0.3,  0.0,
     0.2,  0.3,  0.2,
     0.3,  0.0,  0.1,
     0.3,  0.0,  0.3,
     0.4, -0.3,  0.2,
     0.4, -0.3,  0.4,
     0.3,  0.0,  0.3,
     0.3,  0.0,  0.5,
     0.2,  0.3,  0.4,
     0.2,  0.3,  0.6,
     0.1,  0.6,  0.5,
     0.1,  0.6,  0.7,
]
var wFaceNegative = [];
var wInwardPositive = [];
var wInwardNegative = [];
var wColor = [];
for (let i = 0; i < wFacePositive.length; i++) {
    if (i % 3) {
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
     0.2, -0.3,  0.4,
     0.4, -0.3,  0.4,
    -0.1,  0.6,  0.7,
     0.1,  0.6,  0.7,
    -0.4, -0.3,  0.4,
    -0.2, -0.3,  0.4,
   -0.15,-0.15, 0.45,
    -0.1,  0.0,  0.5,
    0.15,-0.15, 0.45,
     0.1,  0.0,  0.5,
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
    if (i % 3 - 2) {
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
    -0.1,  0.6, -0.7,
     0.1,  0.6, -0.7,
    -0.1,  0.6, -0.5,
     0.1,  0.6, -0.5,
    -0.1,  0.6, -0.1,
     0.1,  0.6, -0.1,
    -0.1,  0.6,  0.1,
     0.1,  0.6,  0.1,
    -0.1,  0.6,  0.5,
     0.1,  0.6,  0.5,
    -0.1,  0.6,  0.7,
     0.1,  0.6,  0.7,
    -0.1,  0.0, -0.5,
     0.1,  0.0, -0.5,
    -0.1,  0.0, -0.3,
     0.1,  0.0, -0.3,
    -0.1,  0.0, -0.1,
     0.1,  0.0, -0.1,
    -0.1,  0.0,  0.1,
     0.1,  0.0,  0.1,
    -0.1,  0.0,  0.3,
     0.1,  0.0,  0.3,
    -0.1,  0.0,  0.5,
     0.1,  0.0,  0.5,
    -.15, -.15, -.45,
     .15, -.15, -.45,
    -.15, -.15, -.15,
     .15, -.15, -.15,
    -.15, -.15,  .45,
     .15, -.15,  .45,
    -.15, -.15,  .15,
     .15, -.15,  .15,
]
var horizontalColor = []
for (let i = 0; i < horizontalFaces.length; i++) {
    if (i % 3 == 0) {
        horizontalColor.push(...red)
    }
}

// Vertices for randomly generated confetti
var confettiVertices = []
var confettiPositions = []
var confettiVelocities = []
var confettiColor = []
for (let i = 0; i < 50; i++) {
    confettiVertices.push(0.0, 0.0, 0.0)
    confettiPositions.push([Math.random() * 2, Math.random() * 2, Math.random() * 2])
    confettiVelocities.push([0.0, 0.0])
    confettiColor.push(Math.random(), Math.random(), Math.random(), 1.0)
}

var vertices = new Float32Array([].concat(
    circleVertexCoords,
    cylinderVertexCoords,
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
    horizontalFaces,
    confettiVertices
));

var vertexColors = new Float32Array([].concat(
    circleVertexColors,
    cylinderVertexColors,
    wColor,
    aColor,
    horizontalColor,
    confettiColor
));

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.height, canvas.width);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

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
    uOffsetLoc = gl.getUniformLocation(program, "uOffset");

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
    document.getElementById("ButtonC").onclick = function(){confetti = !confetti;};
    document.getElementById("XSlider").addEventListener("mousemove", updateXOffset);
    document.getElementById("YSlider").addEventListener("mousemove", updateZOffset);

    render();
}

function updateXOffset(e) {
    xOffset = document.getElementById("XSlider").value;
}

function updateZOffset(e) {
    yOffset = document.getElementById("YSlider").value;
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw Confetti
    if (confetti) {
        gl.uniform3fv(thetaLoc, [0, 0, 0])
        for (let i = 0; i < confettiPositions.length; i++) {
            var rand = -confettiVelocities[i][0] + Math.random() / 2
            confettiVelocities[i][0] += (rand - .25) / 10000
            var rand = -confettiVelocities[i][1] + Math.random() / 2
            confettiVelocities[i][1] += (rand - .25) / 10000
            confettiPositions[i][0] += confettiVelocities[i][0]
            confettiPositions[i][0] = ((confettiPositions[i][0] % 2) + 2) % 2
            confettiPositions[i][2] += confettiVelocities[i][1]
            confettiPositions[i][2] = ((confettiPositions[i][2] % 2) + 2) % 2
            confettiPositions[i][1] -= 0.005
            confettiPositions[i][1] = ((confettiPositions[i][1] % 2) + 2) % 2
            gl.uniform4fv(uOffsetLoc, [confettiPositions[i][0] - 1, confettiPositions[i][1] - 1, confettiPositions[i][2] - 1, 0.0])
            gl.drawArrays(gl.POINTS, 312 + i, 1)
        }
    }

    if(flag) theta[axis] += 0.01;    // Increment rotation of currently active axis of rotation in radians

    gl.uniform3fv(thetaLoc, theta);    // Update uniform in vertex shader with new rotation angle
    gl.uniform4fv(uOffsetLoc, [xOffset, yOffset, 0.0, 0.0]); // Update translation uniform

    // Draw Pedestal
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 34);
    gl.drawArrays(gl.TRIANGLE_STRIP, 34, 66)

    // W
    gl.drawArrays(gl.TRIANGLE_STRIP, 100, 25)
    gl.drawArrays(gl.TRIANGLE_STRIP, 125, 25)
    gl.drawArrays(gl.TRIANGLE_STRIP, 150, 25)
    gl.drawArrays(gl.TRIANGLE_STRIP, 175, 25)

    // A
    gl.drawArrays(gl.TRIANGLE_STRIP, 200, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 210, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 220, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 230, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 240, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 250, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 260, 10)
    gl.drawArrays(gl.TRIANGLE_STRIP, 270, 10)

    // tops
    gl.drawArrays(gl.TRIANGLE_STRIP, 280, 4)
    gl.drawArrays(gl.TRIANGLE_STRIP, 284, 4)
    gl.drawArrays(gl.TRIANGLE_STRIP, 288, 4)
    gl.drawArrays(gl.TRIANGLE_STRIP, 292, 6)
    gl.drawArrays(gl.TRIANGLE_STRIP, 298, 6)
    gl.drawArrays(gl.TRIANGLE_STRIP, 304, 4)
    gl.drawArrays(gl.TRIANGLE_STRIP, 308, 4)

    requestAnimationFrame(render);    // Call to browser to refresh display
}
