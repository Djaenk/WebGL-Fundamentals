"use strict";

// Variable declaration
var canvas, gl, program; //webgl

var theta = 0.0, phi = 0.0, move = true; //user controls

var worldMatrix, viewMatrix, projectionMatrix; //transformation matrices
var worldMatrixLoc, viewMatrixLoc, projectionMatrixLoc; //matrix uniform locations

var identityMatrix = mat4();
var reflectZ = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, -1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
);  

var t = 0.0; //time variable animation
var t_step = 1; //increment value for animation speed

var wing_colors = [
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
    [Math.random(), Math.random(), Math.random(), 1.0],
];

// Model vertex generation and definition
var head_vertices = [];
var head_colors = [];
for(var j = 0; j < 1; j += 0.1){
    for(var i = 0; i <= 2; i += 0.1){
        head_vertices.push(
            Math.sin(j * Math.PI) * Math.cos(i * Math.PI),
            Math.sin(j * Math.PI) * Math.sin(i * Math.PI),
            Math.cos(j * Math.PI),
            1.0
        );
        head_colors.push(0.4, 0.4, 0.4, 1.0);
        head_vertices.push(
            Math.sin((j + 0.1) * Math.PI) * Math.cos(i * Math.PI),
            Math.sin((j + 0.1) * Math.PI) * Math.sin(i * Math.PI),
            Math.cos((j + 0.1) * Math.PI),
            1.0
        );
        head_colors.push(0.4, 0.4, 0.4, 1.0);
    }
}

var body_vertices = [];
var body_colors = [];
for(var j = 0; j < 1; j += 0.1){
    for(var i = 0; i <= 2; i += 0.1){
        head_vertices.push(
            4 * Math.sin(j * Math.PI) * Math.cos(i * Math.PI),
            2 * Math.sin(j * Math.PI) * Math.sin(i * Math.PI),
            2 * Math.cos(j * Math.PI),
            1.0
        );
        head_colors.push(0.0, 0.0, 0.0, 1.0);
        head_vertices.push(
            4 * Math.sin((j + 0.1) * Math.PI) * Math.cos(i * Math.PI),
            2 * Math.sin((j + 0.1) * Math.PI) * Math.sin(i * Math.PI),
            2 * Math.cos((j + 0.1) * Math.PI),
            1.0
        );
        head_colors.push(0.0, 0.0, 0.0, 1.0);
    }
}

var tail_vertices = [];
var tail_colors = [];
for(var j = 0; j < 1; j += 0.1){
    for(var i = 0; i <= 2; i += 0.1){
        head_vertices.push(
            8 * Math.sin(j * Math.PI) * Math.cos(i * Math.PI),
            Math.sin(j * Math.PI) * Math.sin(i * Math.PI),
            Math.cos(j * Math.PI),
            1.0
        );
        head_colors.push(0.4, 0.4, 0.4, 1.0);
        head_vertices.push(
            8 * Math.sin((j + 0.1) * Math.PI) * Math.cos(i * Math.PI),
            Math.sin((j + 0.1) * Math.PI) * Math.sin(i * Math.PI),
            Math.cos((j + 0.1) * Math.PI),
            1.0
        );
        head_colors.push(0.4, 0.4, 0.4, 1.0);
    }
}

var upperwing1_vertices = [
    0.0, 0.0, 0.0, 1.0,
    9.0, 0.0, 7.0, 1.0,
    0.0, 0.0, 7.0, 1.0,
];
var upperwing1_colors = [wing_colors[0], wing_colors[1], wing_colors[2]].flat();

var upperwing2_vertices = [
    9.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 0.0, 1.0,
    17.0, 0.0, 9.0, 1.0,
    0.0, 0.0, 9.0, 1.0,
];
var upperwing2_colors = [wing_colors[1], wing_colors[2], wing_colors[3], wing_colors[4]].flat();

var upperwing3_vertices = [
    17.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 0.0, 1.0,
    22.0, 0.0, 10.0, 1.0,
    0.0, 0.0, 3.0, 1.0,
];
var upperwing3_colors = [wing_colors[3], wing_colors[4], wing_colors[5], wing_colors[6]].flat();

var lowerwing1_vertices = [
    0.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 6.0, 1.0,
    -18.0, 0.0, 6.0, 1.0
];
var lowerwing1_colors = [wing_colors[7], wing_colors[8], wing_colors[9]].flat();

var lowerwing2_vertices = [
    0.0, 0.0, 0.0, 1.0,
    -18.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 6.0, 1.0,
    -22.0, 0.0, 6.0, 1.0
];
var lowerwing2_colors = [wing_colors[8], wing_colors[9], wing_colors[10], wing_colors[11]].flat();

var lowerwing3_vertices = [
    0.0, 0.0, 0.0, 1.0,
    -22.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 3.0, 1.0,
    -12.0, 0.0, 9.0, 1.0
];
var lowerwing3_colors = [wing_colors[10], wing_colors[11], wing_colors[12], wing_colors[13]].flat();

var vertices = new Float32Array([].concat(
    head_vertices,
    body_vertices,
    tail_vertices,
    upperwing1_vertices,
    upperwing2_vertices,
    upperwing3_vertices,
    lowerwing1_vertices,
    lowerwing2_vertices,
    lowerwing3_vertices
).flat());

var colors = new Float32Array([].concat(
    head_colors,
    body_colors,
    tail_colors,
    upperwing1_colors,
    upperwing2_colors,
    upperwing3_colors,
    lowerwing1_colors,
    lowerwing2_colors,
    lowerwing3_colors
).flat());

// Initialization and rendering functions
window.onload = function init() {
    // acquire webgl context
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    // set initial gl attributes
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    // load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // initialize buffers
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    // link html controls to variables
    document.getElementById("theta").addEventListener("mousemove", update_theta);
    document.getElementById("phi").addEventListener("mousemove", update_phi);
    document.getElementById("speed").addEventListener("mousemove", update_speed);
    document.getElementById("move").onclick = function() {move = !move;};

    // acquire uniform locations
    worldMatrixLoc = gl.getUniformLocation(program, "worldMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    // set orthographic projection, initialize world and view matrices
    projectionMatrix = ortho(-30, 30, -30, 30, -30, 30);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(worldMatrixLoc, false, flatten(identityMatrix));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(identityMatrix));

    // begin rendering
    requestAnimationFrame(render);
}

function update_theta() {
    theta = document.getElementById("theta").value;
}

function update_phi() {
    phi = document.getElementById("phi").value;
}

function update_speed() {
    t_step = document.getElementById("speed").value;
}

function update_camera_position() {
    viewMatrix = mult(rotateZ(phi), rotateY(theta));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
}

function draw_body(parent_transform) {
    let local_transform = translate(0.0, Math.sin(t), 0.0);
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 440, 440);
    return transform;
}

function draw_head(parent_transform) {
    let local_transform = translate(4.2, 0.0, 0.0);
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 440);
    return transform;
}

function draw_tail(parent_transform) {
    let local_transform = translate(-3.5, 0.0, 0.0);
    local_transform = mult(local_transform, rotateZ(5 * Math.sin(t + 1)));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 880, 440);
    return transform;
}

function draw_upperwing1(parent_transform) {
    let local_transform = rotateX(85 * Math.sin(t));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1320, 3);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1320, 3);
    return transform;
}

function draw_upperwing2(parent_transform) {
    let local_transform = translate(0.0, 0.0, 7.0);
    local_transform = mult(local_transform, rotateX(30 * Math.sin(t - 2)));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1323, 4);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1323, 4);
    return transform;
}

function draw_upperwing3(parent_transform) {
    let local_transform = translate(0.0, 0.0, 9.0);
    local_transform = mult(local_transform, rotateX(20 * Math.sin(t - 1.5)));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1327, 4);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1327, 4);
    return transform;
}

function draw_lowerwing1(parent_transform) {
    let local_transform = rotateX(85 * Math.sin(t + 0.12));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1331, 3);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1331, 3);
    return transform;
}

function draw_lowerwing2(parent_transform) {
    let local_transform = translate(0.0, 0.0, 6.0);
    local_transform = mult(local_transform, rotateX(30 * Math.sin(t - 2)));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1334, 4);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1334, 4);
    return transform;
}

function draw_lowerwing3(parent_transform) {
    let local_transform = translate(0.0, 0.0, 6.0);
    local_transform = mult(local_transform, rotateX(20 * Math.sin(t - 1.5)));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1338, 4);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 1338, 4);
    return transform;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    update_camera_position();

    let root_transform = draw_body(identityMatrix);
    draw_head(root_transform);
    draw_tail(root_transform);

    let upper1_transform = draw_upperwing1(root_transform);
    let upper2_transform = draw_upperwing2(upper1_transform);
    draw_upperwing3(upper2_transform);

    let lower1_transform = draw_lowerwing1(root_transform);
    let lower2_transform = draw_lowerwing2(lower1_transform);
    draw_lowerwing3(lower2_transform);

    gl.viewport( 3 * canvas.width/4, 0, canvas.width/4, canvas.height/4 );
    viewMatrix = mult(rotateZ(45), rotateY(45));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    root_transform = draw_body(identityMatrix);
    draw_head(root_transform);
    draw_tail(root_transform);

    upper1_transform = draw_upperwing1(root_transform);
    upper2_transform = draw_upperwing2(upper1_transform);
    draw_upperwing3(upper2_transform);

    lower1_transform = draw_lowerwing1(root_transform);
    lower2_transform = draw_lowerwing2(lower1_transform);
    draw_lowerwing3(lower2_transform);

    if (move) t = t + t_step / 300;
    
    requestAnimationFrame(render);
}