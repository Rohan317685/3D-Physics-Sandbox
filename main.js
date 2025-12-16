let scene, camera, renderer;

// Base scene setup for all editors
function initBaseScene() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);

    const container = document.getElementById("canvas-container") || document.body;
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* ---------------- CUBOID ---------------- */
let cuboid;

function createCuboid(w, h, d) {
    if (cuboid) scene.remove(cuboid);
    const colorHex = document.getElementById("colorPicker")?.value || "#ff5500";
    const geometry = new THREE.BoxGeometry(w, h, d);
    const material = new THREE.MeshStandardMaterial({
        color: parseInt(colorHex.slice(1), 16),
        metalness: 0.8,
        roughness: 0.2
    });
    cuboid = new THREE.Mesh(geometry, material);
    scene.add(cuboid);
}

function updateCuboid() {
    const w = Number(document.getElementById("widthSlider").value);
    const h = Number(document.getElementById("heightSlider").value);
    const d = Number(document.getElementById("depthSlider").value);

    document.getElementById("widthValue").textContent = w + " cm";
    document.getElementById("heightValue").textContent = h + " cm";
    document.getElementById("depthValue").textContent = d + " cm";

    createCuboid(w, h, d);

    const volume = w * h * d;
    const density = 0.6;
    document.getElementById("volumeOutput").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massOutput").textContent = (volume * density).toFixed(2) + " g";
}

function setupCuboidSliders() {
    ["widthSlider", "heightSlider", "depthSlider", "colorPicker"].forEach(id => {
        document.getElementById(id).oninput = updateCuboid;
    });
}

function animateCuboid() {
    requestAnimationFrame(animateCuboid);
    if (cuboid) cuboid.rotation.y += 0.01;
    renderer.render(scene, camera);
}

function initCuboidEditor() {
    initBaseScene();
    camera.position.set(0, 2, 10);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 8);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-5, -2, -8);
    scene.add(fill);

    setupCuboidSliders();
    updateCuboid();
    animateCuboid();
}

/* ---------------- SPHERE ---------------- */
let sphere;

function createSphere(r) {
    if (sphere) scene.remove(sphere);
    const colorHex = document.getElementById("colorPicker")?.value || "#ff5500";
    const geometry = new THREE.SphereGeometry(r, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: parseInt(colorHex.slice(1), 16),
        metalness: 0.8,
        roughness: 0.2
    });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
}

function updateSphere() {
    const r = Number(document.getElementById("widthSlider").value);
    document.getElementById("widthValue").textContent = r + " cm";
    createSphere(r);
    const volume = (4 / 3) * Math.PI * r ** 3;
    const density = 0.6;
    document.getElementById("volumeOutput").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massOutput").textContent = (volume * density).toFixed(2) + " g";
}

function setupSphereSlider() {
    ["widthSlider", "colorPicker"].forEach(id => {
        document.getElementById(id).oninput = updateSphere;
    });
}

function animateSphere() {
    requestAnimationFrame(animateSphere);
    if (sphere) sphere.rotation.y += 0.01;
    renderer.render(scene, camera);
}

function initSphereEditor() {
    initBaseScene();
    camera.position.set(0, 2, 15);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(5, 8, 10);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-6, -2, -8);
    scene.add(fill);
    setupSphereSlider();
    updateSphere();
    animateSphere();
}

/* ---------------- PYRAMID ---------------- */
let pyramid;

function createPyramid(w, h) {
    if (pyramid) scene.remove(pyramid);
    const colorHex = document.getElementById("colorPicker")?.value || "#ff5500";
    const geometry = new THREE.ConeGeometry(w, h, 4);
    const material = new THREE.MeshStandardMaterial({
        color: parseInt(colorHex.slice(1), 16),
        metalness: 0.8,
        roughness: 0.2
    });
    pyramid = new THREE.Mesh(geometry, material);
    pyramid.rotation.y = Math.PI / 4;
    pyramid.position.y = h / 2;
    scene.add(pyramid);
}

function updatePyramid() {
    const w = Number(document.getElementById("widthSlider").value);
    const h = Number(document.getElementById("heightSlider").value);
    document.getElementById("widthValue").textContent = w + " cm";
    document.getElementById("heightValue").textContent = h + " cm";
    createPyramid(w, h);
    const volume = (1 / 3) * w * w * h;
    const density = 0.6;
    document.getElementById("volumeOutput").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massOutput").textContent = (volume * density).toFixed(2) + " g";
}

function setupPyramidSliders() {
    ["widthSlider", "heightSlider", "colorPicker"].forEach(id => {
        document.getElementById(id).oninput = updatePyramid;
    });
}

function animatePyramid() {
    requestAnimationFrame(animatePyramid);
    if (pyramid) pyramid.rotation.y += 0.01;
    renderer.render(scene, camera);
}

function initPyramidEditor() {
    initBaseScene();
    camera.position.set(0, 3, 15);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 8);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-5, -2, -8);
    scene.add(fill);
    setupPyramidSliders();
    updatePyramid();
    animatePyramid();
}

/* ---------------- INITIALIZATION ---------------- */
window.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname.split("/").pop();

    if (path === "Cuboid-Page.html") initCuboidEditor();
    if (path === "Sphere-Page.html") initSphereEditor();
    if (path === "Pyramid-Page.html") initPyramidEditor();

    const btn = document.getElementById("sendToTrampolineBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        let shapeType, width = 2, height = 2, depth = 2, radius = 1;

        if (path === "Cuboid-Page.html") {
            shapeType = "cuboid";
            width = Number(document.getElementById("widthSlider").value);
            height = Number(document.getElementById("heightSlider").value);
            depth = Number(document.getElementById("depthSlider").value);
        } else if (path === "Sphere-Page.html") {
            shapeType = "sphere";
            radius = Number(document.getElementById("widthSlider").value);
        } else if (path === "Pyramid-Page.html") {
            shapeType = "pyramid";
            width = Number(document.getElementById("widthSlider").value);
            height = Number(document.getElementById("heightSlider").value);
        }

        const colorHex = document.getElementById("colorPicker")?.value || "#ff5500";

        const shapeData = {
            type: shapeType,
            dimensions: { width, height, depth, radius },
            color: colorHex
        };

        localStorage.setItem("trampolineShape", JSON.stringify(shapeData));
        window.location.href = "Trampoline-Page.html";
    });
});