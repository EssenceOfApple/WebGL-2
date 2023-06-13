'use strict';

let context;                     
let shaderProgram;
let surface;
let spaceball;                  
let lightPositionEl;
let height = 5;
let lightPos = [0, 0, 0];
let N = 20;
let plane;
let video;
let track;
let texture;
let length;
let surfaceType;
let inputData;

function initGL() {
    let program = createProgram(context, vertexShaderSource, fragmentShaderSource);

    shaderProgram = new ShaderProgram('Basic', program);
    shaderProgram.Use();

    shaderProgram.iAttribVertex = context.getAttribLocation(program, "vertex");
    shaderProgram.iAttribTexture = context.getAttribLocation(program, 'texture');
    shaderProgram.iModelViewProjectionMatrix = context.getUniformLocation(program, "ModelViewProjectionMatrix");
    shaderProgram.iModelViewMatrix = context.getUniformLocation(program, "ModelViewMatrix");
    shaderProgram.iProjectionMatrix = context.getUniformLocation(program, "ProjectionMatrix");
    shaderProgram.iColor = context.getUniformLocation(program, "color");

    shaderProgram.iNormal = context.getAttribLocation(program, 'normal');
    shaderProgram.iNormalMatrix = context.getUniformLocation(program, 'normalMat');

    shaderProgram.iAmbientColor = context.getUniformLocation(program, 'ambientColor');
    shaderProgram.iDiffuseColor = context.getUniformLocation(program, 'diffuseColor');
    shaderProgram.iSpecularColor = context.getUniformLocation(program, 'specularColor');

    shaderProgram.iShininess = context.getUniformLocation(program, 'shininess');

    shaderProgram.iLightPos = context.getUniformLocation(program, 'lightPosition');
    shaderProgram.iSpecularCoefficient = context.getUniformLocation(program, 'specularCoefficient');
    shaderProgram.iAmbientCoefficient = context.getUniformLocation(program, 'ambientCoefficient');
    shaderProgram.iDiffuseCoefficient = context.getUniformLocation(program, 'diffuseCoefficient');
    shaderProgram.iTMU = context.getUniformLocation(program, 'tmu');


    inputData = new UpdateInputData();
    inputData.UpdateData();
    surface = new Model('Surface');
    surface.BufferData(CreateSurfaceData());
    plane = new Model("Plane");
    plane.BufferData([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0])
    plane.TextureBufferData([1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1]);
    context.enable(context.DEPTH_TEST);
}

function Model(name) {
    this.name = name;
    this.iVertexBuffer = context.createBuffer();
    this.iTextureCoordBuffer = context.createBuffer();
    this.count = 0;

    this.BufferData = function(vertices) {

        context.bindBuffer(context.ARRAY_BUFFER, this.iVertexBuffer);
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(vertices), context.STREAM_DRAW);

        this.count = vertices.length/3;
    }

    this.TextureBufferData = function (textureCoords) {
        context.bindBuffer(context.ARRAY_BUFFER, this.iTextureCoordBuffer);
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(textureCoords), context.STREAM_DRAW);


    }

    this.Draw = function () {
        context.bindBuffer(context.ARRAY_BUFFER, this.iVertexBuffer);
        context.vertexAttribPointer(shaderProgram.iAttribVertex, 3, context.FLOAT, false, 0, 0);
        context.enableVertexAttribArray(shaderProgram.iAttribVertex);


        context.vertexAttribPointer(shaderProgram.iNormal, 3, context.FLOAT, false, 0, 0);
        context.enableVertexAttribArray(shaderProgram.iNormal);

        for (let i = 0; i <= (N + 1) * 2; i++) {
            context.drawArrays(context.TRIANGLE_STRIP, i * N, N);
        }
    };

    this.DrawTriangles = function () {

        context.bindBuffer(context.ARRAY_BUFFER, this.iVertexBuffer);
        context.vertexAttribPointer(shaderProgram.iAttribVertex, 3, context.FLOAT, false, 0, 0);
        context.enableVertexAttribArray(shaderProgram.iAttribVertex);

        context.bindBuffer(context.ARRAY_BUFFER, this.iTextureCoordBuffer);
        context.vertexAttribPointer(shaderProgram.iAttribTexture, 2, context.FLOAT, false, 0, 0);
        context.enableVertexAttribArray(shaderProgram.iAttribTexture);

        context.drawArrays(context.TRIANGLE_STRIP, 0, this.count);
    }
}


function ShaderProgram(name, program) {

    this.name = name;
    this.prog = program;

    this.iAttribVertex = -1;
    this.iAttribTexture = -1;
    this.iColor = -1;
    this.iModelViewProjectionMatrix = -1;

    this.iNormal = -1;
    this.iNormalMatrix = -1;

    this.iAmbientColor = -1;
    this.iDiffuseColor = -1;
    this.iSpecularColor = -1;
    this.iAmbientCoefficient = -1;
    this.iDiffuseCoefficient = -1;
    this.iSpecularCoefficient = -1;
    this.iShininess = -1;

    this.iLightPos = -1;

    this.Use = function() {
        context.useProgram(this.prog);
    }
}

function UpdateInputData()
{
    this.convergence = 2000.0;
    this.fov = 1.0;
    this.eyeSeparation = 80.0;
    this.near = 10;
    this.surfaceType = true;
    this.lightPosition = -1;
    this.ratio = 1;
    this.far = 2000.0;
    this.a;
    this.b;
    this.c;
    this.top;
    this.bottom;
    this.left;
    this.right;

    this.UpdateData = function()
    {
        this.convergence = document.getElementById("convergence").value;
        this.eyeSeparation = document.getElementById("eyeSeparation").value;
        this.fov = document.getElementById("FOV").value;
        this.near = document.getElementById("nearDistance").value - 0.0;
        this.surfaceType = document.getElementById('SurfaceType');
        this.lightPosition = document.getElementById('light');
        this.UpdateDataForSides();
    }

    this.UpdateDataForSides = function()
    {
        this.a = this.ratio * Math.tan(this.fov / 2.0) * this.convergence;

        this.b = this.a - this.eyeSeparation / 2;
        this.c = this.a + this.eyeSeparation / 2;

        this.top = this.near * Math.tan(this.fov / 2.0);
        this.bottom = -this.top;
    }

    this.UpdateSidesForLeftProjection = function()
    {
        this.left = -this.b * this.near / this.convergence;
        this.right = this.c * this.near / this.convergence;
    }

    this.UpdateSidesForRightProjection = function()
    {
        this.left = -this.c * this.near / this.convergence;
        this.right = this.b * this.near / this.convergence;
    }
}

function draw() {
    context.clearColor(0,0,0,1);
    context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    let orthographic = m4.orthographic(0, 1, 0,1, -1, 1);

    inputData.UpdateData();
    inputData.UpdateSidesForLeftProjection();
    let leftProjection = m4.orthographic(inputData.left, inputData.right,  inputData.bottom, inputData.top, inputData.near, inputData.far);
    inputData.UpdateSidesForRightProjection();
    let rightProjection = m4.orthographic(inputData.left, inputData.right,  inputData.bottom, inputData.top, inputData.near, inputData.far);

    let modelView = spaceball.getViewMatrix();
    let rotateToPointZero = m4.axisRotation([0.707,0.707,0], 0);
    let translateToPointZero = m4.translation(0,0,0);
    let leftTranslate = m4.translation(-0.03, 0, -20);
    let rightTranslate = m4.translation(0.03, 0, -20);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView );
    let matStill = m4.multiply(rotateToPointZero, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    let matAccum1 = m4.multiply(translateToPointZero, matStill);
    let matAccumLeft = m4.multiply(leftTranslate, matAccum0);
    let matAccumRight = m4.multiply(rightTranslate, matAccum0);
    let modelViewProjection = m4.multiply(orthographic, matAccum1 );

    context.uniformMatrix4fv(shaderProgram.iModelViewProjectionMatrix, false, modelViewProjection);
    const light =  Array.from(inputData.lightPosition.getElementsByTagName('input')).map((el) => +el.value);
    const modelviewInv = m4.inverse(matAccum1, new Float32Array(16));
    const normalMatrix = m4.transpose(modelviewInv, new Float32Array(16));

    context.uniformMatrix4fv(shaderProgram.iModelViewProjectionMatrix, false, modelViewProjection );
    context.uniformMatrix4fv(shaderProgram.iNormalMatrix, false, normalMatrix);

    context.uniform3fv(shaderProgram.iLightPos, light);
    context.uniform1i(shaderProgram.iTMU, 0);
    context.uniform1f(shaderProgram.iShininess, 80.0);
    context.uniform1f(shaderProgram.iAmbientCoefficient, 1);
    context.uniform1f(shaderProgram.iDiffuseCoefficient, 1);
    context.uniform1f(shaderProgram.iSpecularCoefficient, 1);

    context.uniform3fv(shaderProgram.iAmbientColor, [0.2, 0.1, 0.4]);
    context.uniform3fv(shaderProgram.iDiffuseColor, [0.0, 0.8, 0.8]);
    context.uniform3fv(shaderProgram.iSpecularColor, [1.0, 1.0, 1.0]);
    context.uniform4fv(shaderProgram.iColor, [0,0,0.8,1] );
    context.bindTexture(context.TEXTURE_2D, texture);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, video);
    plane.DrawTriangles();
    context.uniform4fv(shaderProgram.iColor, [1,1,0,1] );
    context.uniformMatrix4fv(shaderProgram.iModelViewMatrix, false, matAccumLeft);
    context.uniformMatrix4fv(shaderProgram.iProjectionMatrix, false, leftProjection);
    context.colorMask(true, false, false, false);
    surface.Draw();

    context.clear(context.DEPTH_BUFFER_BIT);

    context.uniformMatrix4fv(shaderProgram.iModelViewMatrix, false, matAccumRight);
    context.uniformMatrix4fv(shaderProgram.iProjectionMatrix, false, rightProjection);
    context.colorMask(false, true, true, false);
    surface.Draw();

    context.colorMask(true, true, true, true);
}

function GetCurrentZPosition(h){
    return Math.pow(Math.abs(h) - height, 2) / (2*p);
}

function CreateSurfaceData() {
    let vertexList = [];

    let u = 0;
    let v = 0;
    let uMax = Math.PI * 2
    let vMax = Math.PI * 2
    let uStep = uMax / 50;
    let vStep = vMax / 50;

    for (let u = 0; u <= uMax; u += uStep) {
        for (let v = 0; v <= vMax; v += vStep) {
            let vert = KleinBottle(u, v)
            let avert = KleinBottle(u + uStep, v)
            let bvert = KleinBottle(u, v + vStep)
            let cvert = KleinBottle(u + uStep, v + vStep)

            vertexList.push(vert.x, vert.y, vert.z)
            vertexList.push(avert.x, avert.y, avert.z)
            vertexList.push(bvert.x, bvert.y, bvert.z)

            vertexList.push(avert.x, avert.y, avert.z)
            vertexList.push(cvert.x, cvert.y, cvert.z)
            vertexList.push(bvert.x, bvert.y, bvert.z)
        }
    }

    return vertexList
}

function KleinBottle(u, v) {
    const multiplier = 1.33;
    let a = 2.5
    let uKoef = 2
    let vKoef = 0.5
    let x = (a + Math.cos(u * uKoef) * Math.sin(v) - Math.sin(u * uKoef) * Math.sin(vKoef * v)) * Math.cos(u)
    let y = (a + Math.cos(u * uKoef) * Math.sin(v) - Math.sin(u * uKoef) * Math.sin(vKoef * v)) * Math.sin(u)
    let z = (Math.sin(u * uKoef) * Math.sin(v) + Math.cos(u * uKoef) * Math.sin(vKoef * v));
    return { x: x * multiplier, y: y * multiplier, z: z * multiplier }
}


function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource(vsh,vShader);
    gl.compileShader(vsh);
    if ( ! gl.getShaderParameter(vsh, gl.COMPILE_STATUS) ) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    let fsh = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if ( ! gl.getShaderParameter(fsh, gl.COMPILE_STATUS) ) {
        throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog,vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if ( ! gl.getProgramParameter( prog, gl.LINK_STATUS) ) {
        throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}

function init() {

    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        context = canvas.getContext("webgl");
        video = document.createElement('video');
        video.setAttribute('autoplay', true);
        window.vid = video;
        getCamera();
        texture = CreateCameraTexture();
        if ( ! context ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);

    Update();
}

function getCamera()
{
    navigator.getUserMedia({ video: true, audio: false }, function (stream) {
        video.srcObject = stream;
        track = stream.getTracks()[0];
    }, function (e) {
        console.error('Rejected!', e);
    });
}

function CreateCameraTexture()
{
    let textureID = context.createTexture();
    context.bindTexture(context.TEXTURE_2D, textureID);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.bindTexture(context.TEXTURE_2D, textureID);
    context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        context.RGBA,
        context.UNSIGNED_BYTE,
        video
    );
    return textureID;
}

function GetParabolicPoint(X) {
    let x = X;
    let y = X * X - 2;
    let z = 1;

    return [x, y, z];
}

function Update()
{
    draw()
    window.requestAnimationFrame(Update);
}

function Redraw() {
    surface.BufferData(CreateSurfaceData());
    draw();
}