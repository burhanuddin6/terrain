const URL = `${window.location.protocol}//${window.location.host}`
const fShaderSrcFile = `${URL}/fshader.glsl`
const vShaderSrcFile = `${URL}/vshader.glsl`

const  vertexShaderSource = await (await fetch(vShaderSrcFile)).text()
const  fragmentShaderSource = await (await fetch(fShaderSrcFile)).text()


function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
    gl.deleteShader(shader);
    return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return undefined;
}

let camera;
let light1, light2;
let terrains = [];
let program;

let angle = 0.0;
let trackingMouse = false;

let lastX = screen.width / 2, lastY = screen.height / 2
let firstMouse = true

let yaw = -320.0;
let pitch = -63.0;

let terrainHorMin = -1, terrainHorMax = 1;
let terrainVertMin = -1, terrainVertMax = 1;

function trackballView(x, y) {
    let d, a;
    let v = [];

    v[0] = x;
    v[1] = y;

    d = v[0] * v[0] + v[1] * v[1];

    if (d < 1.0) {
        v[2] = Math.sqrt(1.0 - d);
    }
    else {
        v[2] = 0.0;
        a = 1.0 / Math.sqrt(d);
        v[0] *= a;
        v[1] *= a;
    }

    return v;
}

function startMotion() {
    trackingMouse = true;
}

function stopMotion() {
    trackingMouse = false;
    camera.reset();
}

function init() {
    canvas = document.getElementById("gl-canvas");

    const vshader_tag = document.getElementById("vertex-shader")
    const fshader_tag = document.getElementById("fragment-shader")

    console.log("vertex shader source: ", vshader_tag)
    console.log("fragment shader source: ", fshader_tag)
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    console.log("vertex shader source: ", vertexShaderSource);
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    camera = new Camera(program, vec3(-1800, 3650, -1200), vec3(0, 0, 0), vec3(0, 1, 0));

    light1 = new Light(program, vec4(1, 4.5, 1, 1));
    light1.intensity.ambient = vec3(0.2, 0.2, 0.2);
    light1.intensity.diffuse = vec3(0.2, 0.2, 0.2);
    light1.intensity.specular = vec3(1.0, 1.0, 1.0);

    light2 = new Light(program, vec4(0, 0, 0, 1));
    light2.intensity.ambient = vec3(0.3, 0.6, 0.9);
    light2.intensity.diffuse = vec3(0.9, 0.6, 0.3);
    light2.intensity.specular = vec3(0.5, 0.75, 1.0);

    let terrain1 = new Terrain(program, -1, -1, 256, 800.0);
    terrain1.init();

    let terrain2 = new Terrain(program, 1, -1, 256, 800.0);
    terrain2.init();

    let terrain3 = new Terrain(program, 0, -1, 256, 800.0);
    terrain3.init();

    let terrain4 = new Terrain(program, -1, 0, 256, 800.0);
    terrain4.init();

    let terrain5 = new Terrain(program, 0, 0, 256, 800.0);
    terrain5.init();

    let terrain6 = new Terrain(program, 1, 0, 256, 800.0);
    terrain6.init();

    let terrain7 = new Terrain(program, 0, 1, 256, 800.0);
    terrain7.init();

    let terrain8 = new Terrain(program, -1, 1, 256, 800.0);
    terrain8.init();

    let terrain9 = new Terrain(program, 1, 1, 256, 800.0);
    terrain9.init();

    terrains.push(
        terrain1,
        terrain2,
        terrain3,
        terrain4,
        terrain5,
        terrain6,
        terrain7,
        terrain8,
        terrain9
    );

    window.onkeydown = function (event) {
        if (!trackingMouse) {
            let key = String.fromCharCode(event.keyCode)

            switch (key) {
                case 'W':
                    camera.position = add(camera.position, scale(camera.SPEED, camera.front));
                    break;
                case 'A':
                    camera.position = subtract(camera.position, scale(camera.SPEED, normalize(cross(camera.front, camera.up))));
                    break;
                case 'S':
                    camera.position = subtract(camera.position, scale(camera.SPEED, camera.front));
                    break;
                case 'D':
                    camera.position = add(camera.position, scale(camera.SPEED, normalize(cross(camera.front, camera.up))));
                    break;
                case 'E':
                    camera.position = add(camera.position, scale(camera.SPEED, camera.up));
                    break;
                case 'Q':
                    camera.position = subtract(camera.position, scale(camera.SPEED, camera.up));
                    break;
            }
        }
    }

    window.onmousemove = function (event) {
        let xPos = event.screenX;
        let yPos = event.screenY;
        if (firstMouse) {
            lastX = xPos;
            lastY = yPos;
            firstMouse = false
        }

        let xOffset = xPos - lastX;
        let yOffset = lastY - yPos;
        lastX = xPos;
        lastY = yPos;

        let sensivity = 1.0
        xOffset *= sensivity
        yOffset *= sensivity

        if (!trackingMouse) {
            yaw += xOffset
            pitch += yOffset

            if (pitch > 89.0)
                pitch = 89.0;
            if (pitch < -89.0)
                pitch = -89.0;

            let front = vec3(
                Math.cos(radians(yaw)) * Math.cos(radians(pitch)),
                Math.sin(radians(pitch)),
                Math.sin(radians(yaw)) * Math.cos(radians(pitch))
            )
            console.log(front)
            console.log()
            camera.front = normalize(front)
        } else {
            camera.moveTrackball(xOffset, yOffset);
        }
    }

    canvas.addEventListener("mousedown", function (event) {
        startMotion();
    });

    canvas.addEventListener("mouseup", function (event) {
        stopMotion();
    });

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    light1.render();
    light2.render();
    terrains.forEach(terrain => terrain.render());
    camera.render(trackingMouse);
    requestAnimFrame(render);
}

init();