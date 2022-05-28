"use strict";

// Variable declaration
var canvas, gl, program, program2; //webgl

var theta = 0.0, phi = 0.0; //camera control
var I_theta = 0.0, I_y = 0.0; //lighting control
var t = 0.0, t_step = 1, move = true; //animation control

// Matrix calculation constants
var identityMatrix = mat4();
var reflectZ = mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, -1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
);  

var worldMatrix, viewMatrix, projectionMatrix; //transformation matrices
var worldMatrixLoc, viewMatrixLoc, projectionMatrixLoc; //matrix uniform locations
var normalLoc, lightPosLoc; //vertex lighting locations
var ambientLoc, diffuseLoc, specularLoc, shininessLoc; //fragment shading uniform locations
var texBoolLoc; //location of boolean to toggle texture rendering

//Lighting and material properties
var lightPosition = vec4(20.0, 20.0, 20.0, 0.0);
var lightAmbient = vec4(.5, 0.5, 0.5, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var envAmbient = vec4(0.5, 0.5, 0.5, 1.0);
var envDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var envSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var envShininess = 1.0;

var bodyAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var bodyDiffuse = vec4(0.3, 0.3, 0.3, 1.0);
var bodySpecular = vec4(1.0, 1.0, 1.0, 1.0);
var bodyShininess = 100.0;

var wingAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var wingDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var wingSpecular = vec4(0.5, 0.5, 0.5, 1.0);
var wingShininess = 10.0;

//Polygon definitions------------------------------------------

var normals = [];

// Mesh generation
var meshVertices = [];
function f(x, z) {return Math.exp(x * x / 300) + Math.exp(z * z / 300) - 50;}
var step = 1.0;
for (var x = -50; x < 50; x += step) {
    for (var z = -50; z < 50; z += step) {
        let center = vec4(x, f(x, z), z, 1.0);
        let corner1 = vec4(x - step/2, f(x - step/2, z - step/2), z - step/2, 1.0);
        let corner2 = vec4(x - step/2, f(x - step/2, z + step/2), z + step/2, 1.0);
        let corner3 = vec4(x + step/2, f(x + step/2, z + step/2), z + step/2, 1.0);
        let corner4 = vec4(x + step/2, f(x + step/2, z - step/2), z - step/2, 1.0);
        meshVertices.push(center);
        normals.push(...normalize(cross(subtract(corner1, center), subtract(corner2, center))), 0.0);
        meshVertices.push(corner1);
        normals.push(...normalize(cross(subtract(corner2, corner1), subtract(corner4, corner1))), 0.0);
        meshVertices.push(corner2);
        normals.push(...normalize(cross(subtract(corner3, corner2), subtract(corner1, corner2))), 0.0);
        meshVertices.push(center);
        normals.push(...normalize(cross(subtract(corner2, center), subtract(corner3, center))), 0.0);
        meshVertices.push(corner2);
        normals.push(...normalize(cross(subtract(corner3, corner2), subtract(corner1, corner2))), 0.0);
        meshVertices.push(corner3);
        normals.push(...normalize(cross(subtract(corner4, corner3), subtract(corner2, corner3))), 0.0);
        meshVertices.push(center);
        normals.push(...normalize(cross(subtract(corner3, center), subtract(corner4, center))), 0.0);
        meshVertices.push(corner3);
        normals.push(...normalize(cross(subtract(corner4, corner3), subtract(corner2, corner3))), 0.0);
        meshVertices.push(corner4);
        normals.push(...normalize(cross(subtract(corner1, corner4), subtract(corner3, corner4))), 0.0);
        meshVertices.push(center);
        normals.push(...normalize(cross(subtract(corner4, center), subtract(corner1, center))), 0.0);
        meshVertices.push(corner4);
        normals.push(...normalize(cross(subtract(corner1, corner4), subtract(corner3, corner4))), 0.0);
        meshVertices.push(corner1);
        normals.push(...normalize(cross(subtract(corner2, corner1), subtract(corner4, corner1))), 0.0);
    }
}

// Butterfly model generation and definition
var head_vertices = [];
for(var j = 0; j < 1; j += 0.1){
    for(var i = 0; i <= 2; i += 0.1){
        var x = Math.sin(j * Math.PI) * Math.cos(i * Math.PI);
        var y = Math.sin(j * Math.PI) * Math.sin(i * Math.PI);
        var z = Math.cos(j * Math.PI);
        var x_ = Math.sin((j + 0.1) * Math.PI) * Math.cos(i * Math.PI);
        var y_ = Math.sin((j + 0.1) * Math.PI) * Math.sin(i * Math.PI);
        var z_ = Math.cos((j + 0.1) * Math.PI);
        head_vertices.push(x, y, z, 1.0);
        normals.push(normalize(vec4(x, y, z, 1.0), true));
        head_vertices.push(x_, y_, z_, 1.0);
        normals.push(normalize(vec4(x_, y_, z_, 1.0), true));
    }
}

var body_vertices = [];
for(var j = 0; j < 1; j += 0.1){
    for(var i = 0; i <= 2; i += 0.1){
        var x = Math.sin(j * Math.PI) * Math.cos(i * Math.PI);
        var y = Math.sin(j * Math.PI) * Math.sin(i * Math.PI);
        var z = Math.cos(j * Math.PI);
        var x_ = Math.sin((j + 0.1) * Math.PI) * Math.cos(i * Math.PI);
        var y_ = Math.sin((j + 0.1) * Math.PI) * Math.sin(i * Math.PI);
        var z_ = Math.cos((j + 0.1) * Math.PI);
        head_vertices.push(4 * x, 2 * y, 2 * z, 1.0);
        normals.push(normalize(vec4(x / 4, y / 2, z / 2, 1.0), true));
        head_vertices.push(4 * x_, 2 * y_, 2 * z_, 1.0);
        normals.push(normalize(vec4(x_ / 4, y_ / 2, z_ / 2, 1.0), true));
    }
}

var tail_vertices = [];
for(var j = 0; j < 1; j += 0.1){
    for(var i = 0; i <= 2; i += 0.1){
        var x = Math.sin(j * Math.PI) * Math.cos(i * Math.PI);
        var y = Math.sin(j * Math.PI) * Math.sin(i * Math.PI);
        var z = Math.cos(j * Math.PI);
        var x_ = Math.sin((j + 0.1) * Math.PI) * Math.cos(i * Math.PI);
        var y_ = Math.sin((j + 0.1) * Math.PI) * Math.sin(i * Math.PI);
        var z_ = Math.cos((j + 0.1) * Math.PI);
        head_vertices.push(8 * x, y, z, 1.0);
        normals.push(normalize(vec4(x / 8, y, z, 1.0), true));
        head_vertices.push(8 * x_, y_, z_, 1.0);
        normals.push(normalize(vec4(x_ / 8, y_, z_, 1.0), true));
    }
}

var upperwing1_vertices = [
    0.0, 0.0, 0.0, 1.0,
    9.0, 0.0, 7.0, 1.0,
    0.0, 0.0, 7.0, 1.0,
];

var upperwing2_vertices = [
    9.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 0.0, 1.0,
    17.0, 0.0, 9.0, 1.0,
    0.0, 0.0, 9.0, 1.0,
];

var upperwing3_vertices = [
    17.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 0.0, 1.0,
    22.0, 0.0, 10.0, 1.0,
    0.0, 0.0, 3.0, 1.0,
];

var lowerwing1_vertices = [
    0.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 6.0, 1.0,
    -18.0, 0.0, 6.0, 1.0
];

var lowerwing2_vertices = [
    0.0, 0.0, 0.0, 1.0,
    -18.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 6.0, 1.0,
    -22.0, 0.0, 6.0, 1.0
];

var lowerwing3_vertices = [
    0.0, 0.0, 0.0, 1.0,
    -22.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 3.0, 1.0,
    -12.0, 0.0, 9.0, 1.0
];

var vertices = new Float32Array([].concat(
    meshVertices,
    head_vertices,
    body_vertices,
    tail_vertices,
).flat());

var vertices2 = new Float32Array([].concat(
    upperwing1_vertices,
    upperwing2_vertices,
    upperwing3_vertices,
    lowerwing1_vertices,
    lowerwing2_vertices,
    lowerwing3_vertices,
).flat());

var normals = new Float32Array(flatten(normals));

var texVertices = new Float32Array([].concat(
    0, 0,
    0, 1,
    1, 0,
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,
    0, 0,
    0, 1,
    1, 0,
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,
).flat());

// Initialization and rendering functions --------------------------------------
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
    program2 = initShaders(gl, "vertex-texture", "fragment-texture");

    // initialize buffers
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    var v2Buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, v2Buffer );
    gl.bufferData( gl.ARRAY_BUFFER, vertices2, gl.STATIC_DRAW );

    var position2Loc = gl.getAttribLocation( program2, "aPosition" );
    gl.vertexAttribPointer( position2Loc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( position2Loc );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    gl.useProgram(program2);

    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texVertices, gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              new Uint8Array([0, 0, 255, 255]));
    var image = new Image();
    image.src = "CG_S22_Program3_WangAnthony_texture.jpg";
    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    // link html controls to variables
    document.getElementById("theta").addEventListener("mousemove", update_theta);
    document.getElementById("phi").addEventListener("mousemove", update_phi);
    document.getElementById("I_theta").addEventListener("mousemove", update_theta);
    document.getElementById("I_y").addEventListener("mousemove", update_phi);
    document.getElementById("speed").addEventListener("mousemove", update_speed);
    document.getElementById("move").onclick = function() {move = !move;};

    // acquire uniform locations
    worldMatrixLoc = gl.getUniformLocation(program, "worldMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalLoc = gl.getUniformLocation(program, "uNormalMatrix");
    lightPosLoc = gl.getUniformLocation(program, "uLightPosition");
    ambientLoc = gl.getUniformLocation(program, "uAmbientProduct");
    diffuseLoc = gl.getUniformLocation(program, "uDiffuseProduct");
    specularLoc = gl.getUniformLocation(program, "uSpecularProduct");
    shininessLoc = gl.getUniformLocation(program, "uShininess");

    // set orthographic projection, initialize world and view matrices
    projectionMatrix = ortho(-50, 50, -50, 50, -50, 50);
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

function update_I_theta() {
    theta = document.getElementById("I_theta").value;
}

function update_I_y() {
    phi = document.getElementById("I_y").value;
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
    let normal = normalMatrix(mult(transform, viewMatrix));
    gl.uniformMatrix3fv(normalLoc, false, flatten(normal));
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 120440, 440);
    return transform;
}

function draw_head(parent_transform) {
    let local_transform = translate(4.2, 0.0, 0.0);
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 120000, 440);
    return transform;
}

function draw_tail(parent_transform) {
    let local_transform = translate(-3.5, 0.0, 0.0);
    local_transform = mult(local_transform, rotateZ(5 * Math.sin(t + 1)));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 120880, 440);
    return transform;
}

function draw_upperwing1(parent_transform) {
    let local_transform = rotateX(85 * Math.sin(t));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121320, 3);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121320, 3);
    return transform;
}

function draw_upperwing2(parent_transform) {
    let local_transform = translate(0.0, 0.0, 7.0);
    local_transform = mult(local_transform, rotateX(30 * Math.sin(t - 2)));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121323, 4);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121323, 4);
    return transform;
}

function draw_upperwing3(parent_transform) {
    let local_transform = translate(0.0, 0.0, 9.0);
    local_transform = mult(local_transform, rotateX(20 * Math.sin(t - 1.5)));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121327, 4);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121327, 4);
    return transform;
}

function draw_lowerwing1(parent_transform) {
    let local_transform = rotateX(85 * Math.sin(t + 0.12));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121331, 3);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121331, 3);
    return transform;
}

function draw_lowerwing2(parent_transform) {
    let local_transform = translate(0.0, 0.0, 6.0);
    local_transform = mult(local_transform, rotateX(30 * Math.sin(t - 2)));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121334, 4);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121334, 4);
    return transform;
}

function draw_lowerwing3(parent_transform) {
    let local_transform = translate(0.0, 0.0, 6.0);
    local_transform = mult(local_transform, rotateX(20 * Math.sin(t - 1.5)));
    let transform = mult(parent_transform, local_transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121338, 4);
    let reflect_transform = mult(reflectZ, transform);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(reflect_transform));
    gl.drawArrays(gl.TRIANGLE_STRIP, 121338, 4);
    return transform;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program2);
    gl.disable(gl.CULL_FACE);
    update_camera_position();

    gl.uniform4fv(lightPosLoc, flatten(lightPosition));

    gl.uniform4fv(ambientLoc, flatten(mult(lightAmbient, bodyAmbient)));
    gl.uniform4fv(diffuseLoc, flatten(mult(lightDiffuse, bodyDiffuse)));
    gl.uniform4fv(specularLoc, flatten(mult(lightSpecular, bodySpecular)));
    gl.uniform1f(shininessLoc, bodyShininess);
    let root_transform = draw_body(identityMatrix);
    draw_head(root_transform);
    draw_tail(root_transform);

    let upper1_transform = draw_upperwing1(root_transform);
    let upper2_transform = draw_upperwing2(upper1_transform);
    draw_upperwing3(upper2_transform);

    let lower1_transform = draw_lowerwing1(root_transform);
    let lower2_transform = draw_lowerwing2(lower1_transform);
    draw_lowerwing3(lower2_transform);

    // Draw Mesh
    gl.enable(gl.CULL_FACE);
    gl.uniformMatrix4fv(worldMatrixLoc, true, flatten(identityMatrix));
    gl.uniformMatrix3fv(normalLoc, true, flatten(normalMatrix(viewMatrix, true)));
    gl.uniform4fv(ambientLoc, flatten(mult(lightAmbient, envAmbient)));
    gl.uniform4fv(diffuseLoc, flatten(mult(lightDiffuse, envDiffuse)));
    gl.uniform4fv(specularLoc, flatten(mult(lightSpecular, envSpecular)));
    gl.uniform1f(shininessLoc, envShininess);
    gl.drawArrays(gl.TRIANGLES, 0, 120000);

    if (move) t = t + t_step / 300;
    
    requestAnimationFrame(render);
}