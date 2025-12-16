let scene, camera, renderer;
let shapeMesh, poolPlane, leftWall, rightWall;
const waterDensity = 1000; // kg/m³

// UI
const depthDisplay = document.getElementById("depthDisplay");

// Load shape from editor
function loadShape() {
    const shapeJSON = localStorage.getItem("trampolineShape");
    if(!shapeJSON) return {
        type:"cuboid",
        dimensions:{width:2,height:2,depth:2},
        mass:5,
        color:"#ff5500"
    };
    return JSON.parse(shapeJSON);
}

// Compute volume
function computeVolume(shape) {
    const d = shape.dimensions;
    switch(shape.type){
        case "cuboid": return d.width*d.height*d.depth;
        case "sphere": return (4/3)*Math.PI*Math.pow(d.radius,3);
        case "cylinder": return Math.PI*Math.pow(d.radius,2)*d.height;
        case "pyramid": return (1/3)*Math.pow(d.width,2)*d.height;
        default: return 1;
    }
}

// Initialize scene, camera, lights, pool, walls
function initScene(shapeData){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0,0,25);
    camera.lookAt(0,0,0);

    // Renderer
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("canvas-container").appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff,0.7);
    const dirLight = new THREE.DirectionalLight(0xffffff,0.8);
    dirLight.position.set(10,20,15);
    scene.add(ambient, dirLight);

    // 2D Pool (bottom half)
    const poolGeo = new THREE.PlaneGeometry(20,10);
    const poolMat = new THREE.MeshPhongMaterial({
        color:0x003366, // deep blue
        transparent:true,
        opacity:0.8
    });
    poolPlane = new THREE.Mesh(poolGeo, poolMat);
    scene.add(poolPlane);

    // Brick walls on sides
    const wallGeo = new THREE.PlaneGeometry(1,10);
    const wallMat = new THREE.MeshPhongMaterial({color:0x8B4513}); // brown
    leftWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall = new THREE.Mesh(wallGeo, wallMat);
    scene.add(leftWall, rightWall);

    // Shape mesh
    let geometry;
    switch(shapeData.type){
        case "cuboid":
            geometry = new THREE.BoxGeometry(shapeData.dimensions.width, shapeData.dimensions.height, shapeData.dimensions.depth);
            break;
        case "sphere":
            geometry = new THREE.SphereGeometry(shapeData.dimensions.radius,32,32);
            break;
        case "cylinder":
            geometry = new THREE.CylinderGeometry(shapeData.dimensions.radius, shapeData.dimensions.radius, shapeData.dimensions.height,32);
            break;
        case "pyramid":
            geometry = new THREE.ConeGeometry(shapeData.dimensions.width, shapeData.dimensions.height,4);
            break;
        default:
            geometry = new THREE.BoxGeometry(1,1,1);
    }
    const material = new THREE.MeshStandardMaterial({
        color: shapeData.color ? parseInt(shapeData.color.replace("#",""),16) : 0xff5500
    });
    shapeMesh = new THREE.Mesh(geometry, material);
    shapeMesh.position.z = 0.1; // in front of pool
    shapeMesh.mass = shapeData.mass || 5;
    shapeMesh.volume = computeVolume(shapeData);
    shapeMesh.dimensions = shapeData.dimensions;
    scene.add(shapeMesh);

    resizeScene();
    window.addEventListener("resize", resizeScene);
}

// Resize pool and walls to bottom half
function resizeScene(){
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const viewHeight = 2 * Math.tan(vFOV/2) * camera.position.z;
    const viewWidth = viewHeight * camera.aspect;

    // Pool
    poolPlane.scale.set(viewWidth/20, viewHeight/2/10,1);
    poolPlane.position.y = -viewHeight/4;

    // Walls
    leftWall.scale.set(1, viewHeight/10,1);
    rightWall.scale.set(1, viewHeight/10,1);
    const halfPoolWidth = poolPlane.scale.x * 20 / 2;
    leftWall.position.set(-halfPoolWidth - 0.5, poolPlane.position.y, 0);
    rightWall.position.set(halfPoolWidth + 0.5, poolPlane.position.y, 0);

    // constrain shape horizontal
    const maxX = halfPoolWidth - (shapeMesh.dimensions.width/2 || 1);
    if(shapeMesh.position.x > maxX) shapeMesh.position.x = maxX;
    if(shapeMesh.position.x < -maxX) shapeMesh.position.x = -maxX;
}

// Animate float/sink
function animate(){
    requestAnimationFrame(animate);

    if(shapeMesh){
        const fractionSubmerged = Math.min(shapeMesh.mass / (waterDensity * shapeMesh.volume),1);
        const halfHeight = shapeMesh.dimensions.height/2 || 1;

        const poolBottomY = poolPlane.position.y - (poolPlane.scale.y*10)/2;
        const poolTopY = poolPlane.position.y + (poolPlane.scale.y*10)/2;

        // Equilibrium position
        let equilibriumY = fractionSubmerged >= 1 
            ? poolBottomY + halfHeight
            : poolPlane.position.y + (fractionSubmerged - 0.5)*(poolPlane.scale.y*10);

        // Constrain inside pool
        if(equilibriumY + halfHeight > poolTopY) equilibriumY = poolTopY - halfHeight;
        if(equilibriumY - halfHeight < poolBottomY) equilibriumY = poolBottomY + halfHeight;

        // slower movement
        shapeMesh.position.y += (equilibriumY - shapeMesh.position.y)*0.03;

        // depth calculation
        const topOfShape = shapeMesh.position.y + halfHeight;
        const depth = Math.max(0, poolTopY - topOfShape);
        depthDisplay.textContent = "Depth: " + depth.toFixed(2) + " m";
    }

    renderer.render(scene,camera);
}


window.addEventListener("DOMContentLoaded", ()=>{
    const shapeData = loadShape();
    if(!shapeData) return alert("No shape found! Create one in the editor first.");
    initScene(shapeData);
    animate();
});
