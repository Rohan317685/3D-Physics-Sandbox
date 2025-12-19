let scene, camera, renderer;
let pool, shapeMesh;

const WATER_DENSITY = 1000; // kg/m³
const POOL_DEPTH = 15;
const POOL_WIDTH = 30;
const POOL_LENGTH = 20;
const SINK_SPEED = 0.02;

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef6ff);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, POOL_DEPTH / 2, 40);
    camera.lookAt(0, POOL_DEPTH / 2, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("canvas-container").appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 3D Pool
    const poolGeom = new THREE.BoxGeometry(POOL_WIDTH, POOL_DEPTH, POOL_LENGTH);
    const poolMat = new THREE.MeshStandardMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.7 });
    pool = new THREE.Mesh(poolGeom, poolMat);
    pool.position.y = POOL_DEPTH / 2;
    scene.add(pool);

    window.addEventListener("resize", onResize);
}

function computeVolume(shape) {
    const d = shape.dimensions;
    switch(shape.type){
        case "sphere": return (4/3)*Math.PI*d.radius**3;
        case "cuboid": return d.width*d.height*d.depth;
        case "pyramid": return (1/3)*d.width*d.width*d.height;
        case "cylinder": return Math.PI*d.radius**2*d.height;
        case "cone": return (1/3)*Math.PI*d.radius**2*d.height;
        case "capsule": return Math.PI*d.radius**2*(d.height + (4/3)*d.radius);
        case "torus": return 2*Math.PI**2*d.radius*d.depth**2;
        case "ring": return Math.PI*(d.outerRadius**2 - d.innerRadius**2)*d.height || 1;
        case "octahedron": return (Math.sqrt(2)/3)*(d.radius**3);
        case "dodecahedron": return (15+7*Math.sqrt(5))/4*d.radius**3;
        case "icosahedron": return (5*(3+Math.sqrt(5))/12)*d.radius**3;
        default: return 1;
    }
}

function createGeometry(shape) {
    const d = shape.dimensions;
    switch(shape.type){
        case "sphere": return new THREE.SphereGeometry(d.radius, 48, 48);
        case "cuboid": return new THREE.BoxGeometry(d.width, d.height, d.depth);
        case "pyramid": return new THREE.ConeGeometry(d.width, d.height, 4);
        case "cylinder": return new THREE.CylinderGeometry(d.radius, d.radius, d.height, 32);
        case "cone": return new THREE.ConeGeometry(d.radius, d.height, 32);
        case "capsule": return new THREE.CapsuleGeometry(d.radius, d.height, 8, 16);
        case "torus": return new THREE.TorusGeometry(d.radius, d.depth, 16, 100);
        case "ring": return new THREE.RingGeometry(d.innerRadius, d.outerRadius, 32);
        case "octahedron": return new THREE.OctahedronGeometry(d.radius);
        case "dodecahedron": return new THREE.DodecahedronGeometry(d.radius);
        case "icosahedron": return new THREE.IcosahedronGeometry(d.radius);
        default: return new THREE.BoxGeometry(1,1,1);
    }
}

function loadShape() {
    const data = JSON.parse(localStorage.getItem("trampolineShape"));
    if(!data) return alert("No shape found!");

    if(shapeMesh) scene.remove(shapeMesh);

    const geometry = createGeometry(data);
    const material = new THREE.MeshStandardMaterial({
        color: data.color || 0xff5500,
        roughness: 0.6,
        metalness: 0.1
    });

    shapeMesh = new THREE.Mesh(geometry, material);
    shapeMesh.position.y = POOL_DEPTH + 2;
    scene.add(shapeMesh);

    shapeMesh.volume = computeVolume(data);
    shapeMesh.density = (data.density || 600)/1000;
    shapeMesh.mass = shapeMesh.volume * shapeMesh.density;
}

function animate() {
    requestAnimationFrame(animate);

    if(shapeMesh){
        const fraction = shapeMesh.density / WATER_DENSITY;
        const targetY = fraction * POOL_DEPTH;
        shapeMesh.position.y += (targetY - shapeMesh.position.y) * SINK_SPEED;

        // Depth display
        const display = document.getElementById("depthDisplay");
        if(display) display.textContent = "Depth: " + (POOL_DEPTH - shapeMesh.position.y).toFixed(2) + " m";
    }

    renderer.render(scene, camera);
}

function onResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("DOMContentLoaded", () => {
    initScene();
    loadShape();
    animate();
});

