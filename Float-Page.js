let scene, camera, renderer;
let poolMesh, shapeMesh;

const WATER_DENSITY = 1000; 
const POOL_WIDTH = 30;
const POOL_LENGTH = 12;
const POOL_DEPTH = 15;


let shapeProps = {
    type: "cuboid",
    density: 1000, 
    volume: 1
};


function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef6ff);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("canvas-container").appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    const poolGeo = new THREE.BoxGeometry(POOL_WIDTH, POOL_DEPTH, POOL_LENGTH);
    const poolMat = new THREE.MeshPhongMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.7 });
    poolMesh = new THREE.Mesh(poolGeo, poolMat);
    poolMesh.position.y = -POOL_DEPTH / 2;
    scene.add(poolMesh);

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}


function loadShape() {
    const data = JSON.parse(localStorage.getItem("trampolineShape"));
    if (!data) return alert("No shape found!");

    shapeProps.type = data.type;
    shapeProps.density = (data.density ?? 1) * 1000; 

    
    const dims = data.dimensions;

    shapeMesh?.removeFromParent();

    let geo;
    switch (data.type) {
        case "sphere": geo = new THREE.SphereGeometry(dims.radius, 48, 48); break;
        case "cuboid": geo = new THREE.BoxGeometry(dims.width, dims.height, dims.depth); break;
        case "pyramid": geo = new THREE.ConeGeometry(dims.width, dims.height, 4); break;
        case "cylinder": geo = new THREE.CylinderGeometry(dims.radius, dims.radius, dims.height, 32); break;
        case "cone": geo = new THREE.ConeGeometry(dims.radius, dims.height, 32); break;
        case "torus": geo = new THREE.TorusGeometry(dims.radius, dims.depth, 16, 100); break;
        case "capsule": geo = new THREE.CapsuleGeometry(dims.radius, dims.height, 4, 8); break;
        case "ring": geo = new THREE.RingGeometry(dims.radius, dims.width, 32); break;
        case "octahedron": geo = new THREE.OctahedronGeometry(dims.radius); break;
        case "dodecahedron": geo = new THREE.DodecahedronGeometry(dims.radius); break;
        case "icosahedron": geo = new THREE.IcosahedronGeometry(dims.radius); break;
        default: geo = new THREE.BoxGeometry(1, 1, 1);
    }

    const mat = new THREE.MeshStandardMaterial({
        color: data.color || 0xff5500,
        roughness: 0.6,
        metalness: 0.1
    });

    shapeMesh = new THREE.Mesh(geo, mat);
    shapeMesh.position.y = 0; 
    shapeMesh.userData.height = (geo.boundingBox ? geo.boundingBox.max.y - geo.boundingBox.min.y : 1);
    scene.add(shapeMesh);

   
    shapeProps.volume = computeVolume(data.type, dims);

    console.log("Shape loaded:", data.type);
    console.log("Density kg/m³:", shapeProps.density);
    console.log("Volume m³:", shapeProps.volume);
}


function computeVolume(type, d) {
    switch(type) {
        case "sphere": return (4/3) * Math.PI * d.radius**3;
        case "cuboid": return d.width * d.height * d.depth;
        case "pyramid": return (1/3) * d.width * d.width * d.height;
        case "cylinder": return Math.PI * d.radius**2 * d.height;
        case "cone": return (1/3) * Math.PI * d.radius**2 * d.height;
        case "capsule": return Math.PI * d.radius**2 * (d.height + (4/3) * d.radius);
        case "torus": return 2 * Math.PI**2 * d.radius * d.depth**2;
        case "ring": return Math.PI * (d.width**2 - d.radius**2);
        case "octahedron": return (Math.sqrt(2)/3) * d.radius**3;
        case "dodecahedron": return ((15 + 7 * Math.sqrt(5))/4) * d.radius**3;
        case "icosahedron": return (5*(3 + Math.sqrt(5))/12) * d.radius**3;
        default: return 1;
    }
}


function animate() {
    requestAnimationFrame(animate);
    if (!shapeMesh) return;

    const waterSurface = 0;
    const bottom = -POOL_DEPTH + 0.5;

    if (shapeProps.density <= WATER_DENSITY) {
        
    } else {
        
        shapeMesh.position.y -= 0.02;
        if (shapeMesh.position.y < bottom) shapeMesh.position.y = bottom;
    }

    document.getElementById("depthDisplay").textContent =
        "Depth: " + Math.max(0, -shapeMesh.position.y).toFixed(2) + " m";

    renderer.render(scene, camera);
}


window.addEventListener("DOMContentLoaded", () => {
    initScene();
    loadShape();
    animate();
    const densitySlider = document.getElementById("densitySlider");
const densityValue = document.getElementById("densityValue");

densitySlider.addEventListener("input", () => {
    const val = Number(densitySlider.value);
    densityValue.textContent = val;        
    shapeProps.density = val * 1000;       
});

});













