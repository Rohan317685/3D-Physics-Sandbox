let scene, camera, renderer;
let shapeMesh, trampolineMesh;
let dropHeight = 10; // cm
let airResistance = 0;
let velocity = 0;
let positionY = 0;
let peakHeight = 0;
let hasBounced = false;
let shapeData;

// Initialize scene
function initTrampoline() {
    shapeData = JSON.parse(localStorage.getItem("trampolineShape"));
    if (!shapeData) return alert("No shape found! Please select a shape first.");

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("canvas-container").appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    createTrampoline();
    createShape();
    resetSimulation();
    animate();
}

function createTrampoline() {
    const geometry = new THREE.CylinderGeometry(5, 5, 1, 64);
    const material = new THREE.MeshStandardMaterial({ color: 0x3333ff });
    trampolineMesh = new THREE.Mesh(geometry, material);
    trampolineMesh.position.y = 0;
    scene.add(trampolineMesh);
}

function createShape() {
    const color = parseInt(shapeData.color.slice(1), 16);
    let geom;

    switch (shapeData.type) {
        case "cuboid":
            geom = new THREE.BoxGeometry(shapeData.dimensions.width, shapeData.dimensions.height, shapeData.dimensions.depth);
            break;
        case "sphere":
            geom = new THREE.SphereGeometry(shapeData.dimensions.radius, 64, 64);
            break;
        case "pyramid":
            geom = new THREE.ConeGeometry(shapeData.dimensions.width, shapeData.dimensions.height, 4);
            break;
        case "custom":
            if (shapeData.dimensions.width && shapeData.dimensions.height && shapeData.dimensions.depth) {
                geom = new THREE.BoxGeometry(shapeData.dimensions.width, shapeData.dimensions.height, shapeData.dimensions.depth);
            } else {
                geom = new THREE.SphereGeometry(shapeData.dimensions.radius, 64, 64);
            }
            break;
        default:
            geom = new THREE.BoxGeometry(2, 2, 2);
    }

    const mat = new THREE.MeshStandardMaterial({ color });
    shapeMesh = new THREE.Mesh(geom, mat);
    scene.add(shapeMesh);
}

function resetSimulation() {
    dropHeight = Number(document.getElementById("dropheightSlider")?.value || 10);
    airResistance = Number(document.getElementById("airSlider")?.value || 0);

    velocity = 0;
    positionY = dropHeight;
    shapeMesh.position.y = positionY;
    peakHeight = 0;
    hasBounced = false;

    document.getElementById("currentHeight").textContent = positionY.toFixed(2);
    document.getElementById("peakHeight").textContent = peakHeight.toFixed(2);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Simple gravity simulation
    const g = 9.81;
    velocity -= g * 0.02; // adjust timestep
    velocity -= velocity * airResistance * 0.01; // air resistance
    positionY += velocity * 0.02;

    if (positionY <= trampolineMesh.position.y + 0.5) { // bounce
        positionY = trampolineMesh.position.y + 0.5;
        velocity = -velocity * 0.7; // lose some energy
        hasBounced = true;
    }

    shapeMesh.position.y = positionY;

    if (hasBounced && positionY > peakHeight) {
        peakHeight = positionY;
        document.getElementById("peakHeight").textContent = peakHeight.toFixed(2);
    }

    document.getElementById("currentHeight").textContent = positionY.toFixed(2);

    renderer.render(scene, camera);
}

// Controls
document.getElementById("dropBtn").addEventListener("click", resetSimulation);
document.getElementById("resetPeakBtn").addEventListener("click", () => {
    peakHeight = 0;
    document.getElementById("peakHeight").textContent = "0";
});
document.getElementById("dropheightSlider").addEventListener("input", (e) => {
    document.getElementById("dropHeightValue").textContent = e.target.value;
});
document.getElementById("airSlider").addEventListener("input", (e) => {
    document.getElementById("airValue").textContent = e.target.value + " kg/s";
});

window.addEventListener("DOMContentLoaded", initTrampoline);


