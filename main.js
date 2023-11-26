const t = THREE,
    today = new Date().setHours(0, 0, 0, 0);
let cubes = [],
    sceneOffsetTarget = {
        x: 0,
        y: 0
    },
    sceneOffset = {
        x: 0,
        y: 0
    },
    windowManager, initialized = false;

window.onload = () => new URLSearchParams(window.location.search).get("clear") && localStorage.clear();

document.addEventListener("visibilitychange", checkAndInitialize);
window.onload = checkAndInitialize;
if (new URLSearchParams(window.location.search).get("clear")) localStorage.clear();

function checkAndInitialize() {
    if (document.visibilityState !== 'hidden' && !initialized) initialize();
}

function initialize() {
    initialized = true;
    setTimeout(() => {
        setupScene();
        setupWindowManager();
        resize();
        updateWindowShape(false);
        render();
        window.addEventListener('resize', resize);
    }, 300);
}

function setupScene() {
    camera = new t.OrthographicCamera(0, 0, window.innerWidth, window.innerHeight, -10000, 10000);
    camera.position.z = 2.5;
    scene = new t.Scene();
    scene.add(camera, new THREE.AmbientLight("white"));
    renderer = new t.WebGLRenderer({
        antialias: true
    });
    world = new t.Object3D();
    scene.add(world);
    renderer.domElement.id = "scene";
    document.body.appendChild(renderer.domElement);
}

function setupWindowManager() {
    windowManager = new WindowManager();
    windowManager.init({
        foo: "bar"
    });
    windowManager.setWinShapeChangeCallback(() => updateWindowShape(false));
    windowManager.setWinChangeCallback(updateNumberOfCubes);
    updateNumberOfCubes();
}

function windowsUpdated() {
    updateNumberOfCubes();
    updateWindowShape(false);
}

function updateNumberOfCubes() {
    world.children = world.children.filter(c => !cubes.includes(c));
    cubes = windowManager.getWindows().map((win, i) => {
        let color = i === 0 ? 'yellow' : i === 1 ? 'white' : `hsl(${getHue(win.id)}, 50%, 70%)`;
        let sphere = createComplexSphere(100 + i * 50, new t.Color(color));
        sphere.position.set(win.shape.x + win.shape.w / 2, win.shape.y + win.shape.h / 2, 0);
        world.add(sphere);
        return sphere;
    });
}

function getHue(id) {
    let hueValue = (id % 10) / 10;
    return hueValue < 0.5 ? 240 - hueValue * 120 : 360 - (hueValue - 0.5) * 120;
}

function createComplexSphere(radius, color) {
    let complexSphere = new THREE.Group();
    complexSphere.add(new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 1), new THREE.MeshLambertMaterial({
        color,
        wireframe: true
    })));
    return complexSphere;
}

function updateWindowShape(easing = true) {
    sceneOffsetTarget = {
        x: -window.screenX,
        y: -window.screenY
    };
    if (!easing) sceneOffset = sceneOffsetTarget;

    let wins = windowManager.getWindows();
    for (let i = 0; i < cubes.length; i++) {
        let win = wins[i];
        let complexSphere = cubes[i];
        let posTarget = {
            x: win.shape.x + (win.shape.w * 0.5),
            y: win.shape.y + (win.shape.h * 0.5)
        };
        complexSphere.position.x = posTarget.x;
        complexSphere.position.y = posTarget.y;
    }
}

function render() {
    let t = (new Date().getTime() - today) / 1000.0;
    windowManager.update();
    let falloff = 0.6;
    sceneOffset.x = sceneOffset.x + ((sceneOffsetTarget.x - sceneOffset.x) * falloff);
    sceneOffset.y = sceneOffset.y + ((sceneOffsetTarget.y - sceneOffset.y) * falloff);
    world.position.x = sceneOffset.x;
    world.position.y = sceneOffset.y;
    let wins = windowManager.getWindows();
    for (let i = 0; i < cubes.length; i++) {
        let complexSphere = cubes[i];
        let win = wins[i];
        let _t = t;
        let posTarget = {
            x: win.shape.x + (win.shape.w * .5),
            y: win.shape.y + (win.shape.h * .5)
        }
        complexSphere.position.x = complexSphere.position.x + (posTarget.x - complexSphere.position.x) * falloff;
        complexSphere.position.y = complexSphere.position.y + (posTarget.y - complexSphere.position.y) * falloff;
        complexSphere.rotation.x = _t * .3;
        complexSphere.rotation.y = _t * .3;
        complexSphere.rotation.z = _t * .3;
    };
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function resize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    camera.left = 0;
    camera.right = width;
    camera.top = 0;
    camera.bottom = height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
initializeOnVisibilityChange();