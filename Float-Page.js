let scene, camera, renderer;
let shapeMesh, poolPlane;

const WATER_DENSITY = 1000; // kg/m³

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef6ff);

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 10, 25);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("canvas-container").appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(10, 20, 10);
    scene.add(sun);

    // Water plane
    const waterGeo = new THREE.PlaneGeometry(30, 12);
    const waterMat = new THREE.MeshPhongMaterial({
        color: 0x1e90ff,
        transparent: true,
        opacity: 0.7,
    });
    poolPlane = new THREE.Mesh(waterGeo, waterMat);
    poolPlane.rotation.x = -Math.PI/2;
    poolPlane.position.y = 0;
    scene.add(poolPlane);

    window.addEventListener("resize", onResize);
    onResize();
}

function loadShape() {
    const data = JSON.parse(localStorage.getItem("trampolineShape"));
    if (!data) return alert("No shape found!");

    if (shapeMesh) scene.remove(shapeMesh);

    let geometry;

    switch(data.type) {
        case "sphere":
            geometry = new THREE.SphereGeometry(data.dimensions.radius, 48, 48);
            break;
        case "cuboid":
            geometry = new THREE.BoxGeometry(
                data.dimensions.width,
                data.dimensions.height,
                data.dimensions.depth
            );
            break;
        case "pyramid":
            geometry = new THREE.ConeGeometry(
                data.dimensions.width,
                data.dimensions.height,
                4
            );
            break;
        default:
            geometry = new THREE.BoxGeometry(1,1,1);
    }

    const material = new THREE.MeshStandardMaterial({
        color: data.color || 0xff5500,
        roughness: 0.6,
        metalness: 0.1
    });

    shapeMesh = new THREE.Mesh(geometry, material);
    shapeMesh.position.y = 5;
    scene.add(shapeMesh);

    // physics for floating
    shapeMesh.volume = computeVolume(data);
    shapeMesh.mass = shapeMesh.volume * (data.density / 1000); // g->kg
    shapeMesh.density = data.density / 1000; 
}

function computeVolume(data) {
    switch(data.type) {
        case "sphere":
            const r = data.dimensions.radius;
            return (4/3) * Math.PI * r**3;
        case "cuboid":
            const { width, height, depth } = data.dimensions;
            return width * height * depth;
        case "pyramid":
            const { width: w, height: h } = data.dimensions;
            return (1/3) * w * w * h;
        default:
            return 1;
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (shapeMesh) {
        const submergedFraction = Math.min(shapeMesh.density / WATER_DENSITY, 1);
        const targetY = (0.5 - submergedFraction) * (shapeMesh.scale.y || 1) * 2;
        shapeMesh.position.y += (targetY - shapeMesh.position.y) * 0.03;
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
