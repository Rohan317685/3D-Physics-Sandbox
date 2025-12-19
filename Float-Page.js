let scene, camera, renderer;
let poolMesh, shapeMesh;
let velocityY = 0;

const WATER_DENSITY = 1000; // kg/m³
const GRAVITY = 9.81;       // m/s²
const POOL_WIDTH = 30;
const POOL_LENGTH = 12;
const POOL_DEPTH = 15;      // 15 meters deep

// Shape properties
let shapeProps = {
    type: "cuboid",
    volume: 1, // cm³
    mass: 600, // g
    density: 0.6 // g/cm³
};

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef6ff);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 40);

    // Renderer
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("canvas-container").appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff,0.6));
    const dir = new THREE.DirectionalLight(0xffffff,0.8);
    dir.position.set(10,20,10);
    scene.add(dir);

    // Pool
    const poolGeo = new THREE.BoxGeometry(POOL_WIDTH, POOL_DEPTH, POOL_LENGTH);
    const poolMat = new THREE.MeshPhongMaterial({color:0x1e90ff, transparent:true, opacity:0.7});
    poolMesh = new THREE.Mesh(poolGeo, poolMat);
    poolMesh.position.y = -POOL_DEPTH/2; // top at y=0
    scene.add(poolMesh);

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function loadShape() {
    const data = JSON.parse(localStorage.getItem("trampolineShape"));
    if(!data) return alert("No shape found!");

    shapeProps.type = data.type;
    shapeProps.volume = computeVolume(data); // cm³
    shapeProps.mass = data.mass || shapeProps.volume * (data.density || 1); // fallback
    shapeProps.density = shapeProps.mass / shapeProps.volume;

    if(shapeMesh) scene.remove(shapeMesh);

    let geo;
    const d = data.dimensions;
    switch(data.type){
        case "sphere": geo = new THREE.SphereGeometry(d.radius,48,48); break;
        case "cuboid": geo = new THREE.BoxGeometry(d.width,d.height,d.depth); break;
        case "pyramid": geo = new THREE.ConeGeometry(d.width,d.height,4); break;
        case "cylinder": geo = new THREE.CylinderGeometry(d.radius,d.radius,d.height,32); break;
        case "cone": geo = new THREE.ConeGeometry(d.radius,d.height,32); break;
        case "torus": geo = new THREE.TorusGeometry(d.radius,d.depth,16,100); break;
        case "capsule": geo = new THREE.CapsuleGeometry(d.radius,d.height,4,8); break;
        case "ring": geo = new THREE.RingGeometry(d.radius,d.width,32); break;
        case "octahedron": geo = new THREE.OctahedronGeometry(d.radius); break;
        case "dodecahedron": geo = new THREE.DodecahedronGeometry(d.radius); break;
        case "icosahedron": geo = new THREE.IcosahedronGeometry(d.radius); break;
        default: geo = new THREE.BoxGeometry(1,1,1);
    }

    const mat = new THREE.MeshStandardMaterial({color:data.color || 0xff5500, roughness:0.6, metalness:0.1});
    shapeMesh = new THREE.Mesh(geo, mat);

    // Spawn slightly above water
    shapeMesh.position.y = 1; 
    scene.add(shapeMesh);
}

function computeVolume(shape){
    const d = shape.dimensions;
    switch(shape.type){
        case "sphere": return (4/3)*Math.PI*d.radius**3;
        case "cuboid": return d.width*d.height*d.depth;
        case "pyramid": return (1/3)*d.width*d.width*d.height;
        case "cylinder": return Math.PI*d.radius**2*d.height;
        case "cone": return (1/3)*Math.PI*d.radius**2*d.height;
        case "capsule": return Math.PI*d.radius**2*(d.height + (4/3)*d.radius);
        case "torus": return 2*Math.PI**2*d.radius*d.depth**2;
        case "ring": return Math.PI*(d.width**2 - d.radius**2);
        case "octahedron": return (Math.sqrt(2)/3)*d.radius**3;
        case "dodecahedron": return ((15+7*Math.sqrt(5))/4)*d.radius**3;
        case "icosahedron": return (5*(3+Math.sqrt(5))/12)*d.radius**3;
        default: return 1;
    }
}

function animate(){
    requestAnimationFrame(animate);

    if(!shapeMesh) return;

    const waterSurface = 0;
    const bottom = -POOL_DEPTH;

    // Convert mass/volume to density in kg/m³
    const volume_m3 = shapeProps.volume * 1e-6;   // cm³ -> m³
    const mass_kg = shapeProps.mass / 1000;       // g -> kg
    const density = mass_kg / volume_m3;          // kg/m³

    // If density < water -> float
    if(density < WATER_DENSITY){
        shapeMesh.position.y = waterSurface; // float at top
    } 
    // If density > water -> sink
    else {
        shapeMesh.position.y = bottom + 0.5; // sit at bottom
    }

    document.getElementById("depthDisplay").textContent = "Depth: " + Math.max(0,-shapeMesh.position.y).toFixed(2) + " m";

    renderer.render(scene,camera);
}


window.addEventListener("DOMContentLoaded", () => {
    initScene();
    loadShape();
    animate();
});





