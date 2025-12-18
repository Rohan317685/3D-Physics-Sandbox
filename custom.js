let scene, camera, renderer;
let activeMesh = null;

// Materials / densities
const materials = {
    none: { color: null, density: 0.6 },
    wood: { color: 0x8B4513, density: 0.7 },
    metal: { color: 0xaaaaaa, density: 7.8 },
    plastic: { color: 0xffc107, density: 1.2 },
    rubber: { color: 0x000000, density: 1.5, metalness: 0.1, roughness: 0.9 },
    glass: { color: 0x77ffff, density: 2.5, metalness: 0.0, roughness: 0.1 },
    ice: { color: 0x99ccff, density: 0.9, metalness: 0.0, roughness: 0.05 },
    stone: { color: 0x777777, density: 2.7, metalness: 0.2, roughness: 0.8 },
    sand: { color: 0xD2B48C, density: 1.6, metalness: 0.1, roughness: 0.7 },
    fabric: { color: 0xff66cc, density: 0.8, metalness: 0.0, roughness: 0.9 },
    copper: { color: 0xb87333, density: 8.9, metalness: 0.9, roughness: 0.3 },
    gold: { color: 0xffd700, density: 19.3, metalness: 1.0, roughness: 0.1 },
    silver: { color: 0xc0c0c0, density: 10.5, metalness: 1.0, roughness: 0.2 },
    aluminum: { color: 0xd9d9d9, density: 2.7, metalness: 0.8, roughness: 0.3 },
    lead: { color: 0x555555, density: 11.3, metalness: 0.3, roughness: 0.7 },
    concrete: { color: 0x999999, density: 2.4, metalness: 0.1, roughness: 0.9 },
    titanium: { color: 0x888888, density: 4.5, metalness: 0.9, roughness: 0.2 }
};

// Slider IDs per shape
const shapeSliders = {
    cuboid: ["widthSlider","heightSlider","depthSlider","massSlider"],
    sphere: ["radiusSlider","massSlider"],
    ellipsoid: ["radiusSlider","massSlider"],
    pyramid: ["widthSlider","heightSlider","massSlider"],
    cylinder: ["radiusSlider","heightSlider","massSlider"],
    cone: ["radiusSlider","heightSlider","massSlider"],
    torus: ["radiusSlider","depthSlider","massSlider"],
    capsule: ["radiusSlider","heightSlider","massSlider"],
    ring: ["radiusSlider","widthSlider","massSlider"],
    octahedron: ["radiusSlider","massSlider"],
    dodecahedron: ["radiusSlider","massSlider"],
    icosahedron: ["radiusSlider","massSlider"]
};

// --- Base Scene ---
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    const container = document.getElementById("canvas-container") || document.body;
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0,2,15);

    scene.add(new THREE.AmbientLight(0xffffff,0.6));
    const dirLight=new THREE.DirectionalLight(0xffffff,1);
    dirLight.position.set(5,10,8);
    scene.add(dirLight);

    window.addEventListener("resize", ()=>{
        camera.aspect=window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- Clear existing mesh ---
function clearMesh(){
    if(activeMesh) scene.remove(activeMesh);
}

// --- Create mesh for any shape ---
function createMesh(type,width,height,depth,radius,color){
    if(activeMesh) scene.remove(activeMesh);
    let geo;
    switch(type){
        case "cuboid": geo=new THREE.BoxGeometry(width,height,depth); break;
        case "sphere":
        case "ellipsoid": geo=new THREE.SphereGeometry(radius,64,64); break;
        case "pyramid": geo=new THREE.ConeGeometry(width,height,4); break;
        case "cylinder": geo=new THREE.CylinderGeometry(radius,radius,height,32); break;
        case "cone": geo=new THREE.ConeGeometry(radius,height,32); break;
        case "torus": geo=new THREE.TorusGeometry(radius,depth,16,100); break;
        case "capsule": geo=new THREE.CapsuleGeometry(radius,height,4,8); break;
        case "ring": geo=new THREE.RingGeometry(radius,width,32); break;
        case "octahedron": geo=new THREE.OctahedronGeometry(radius); break;
        case "dodecahedron": geo=new THREE.DodecahedronGeometry(radius); break;
        case "icosahedron": geo=new THREE.IcosahedronGeometry(radius); break;
        default: console.error("Unknown shape type"); return;
    }

    const mat = new THREE.MeshStandardMaterial({color});
    activeMesh = new THREE.Mesh(geo, mat);

    if(type==="pyramid") activeMesh.rotation.y=Math.PI/4;
    if(["cuboid","pyramid","capsule"].includes(type)){
        geo.computeBoundingBox();
        const center=new THREE.Vector3();
        geo.boundingBox.getCenter(center);
        activeMesh.position.sub(center);
        if(type==="pyramid") activeMesh.position.y = height/2;
    }

    scene.add(activeMesh);

    // Auto adjust camera
    const maxDim=Math.max(width,height,depth,radius);
    camera.position.z = Math.max(10,maxDim*2);
}

// --- Update mesh based on controls ---
function updateMesh(){
    const type = document.getElementById("shapeSelector").value;
    const width = Number(document.getElementById("widthSlider")?.value || 1);
    const height = Number(document.getElementById("heightSlider")?.value || 1);
    const depth = Number(document.getElementById("depthSlider")?.value || 1);
    const radius = Number(document.getElementById("radiusSlider")?.value || 1);
    const mass = Number(document.getElementById("massSlider")?.value || 1);

    // Material
    const materialName = document.getElementById("materialSelector")?.value || "none";
    const matProps = materials[materialName];
    let color;
    if(materialName==="none") color = parseInt(document.getElementById("colorPicker").value.slice(1),16);
    else color=matProps.color;

    createMesh(type,width,height,depth,radius,color);

    // Update slider values
    ["width","height","depth","radius","mass"].forEach(id=>{
        const el=document.getElementById(id+"Value");
        if(el){
            const val=document.getElementById(id+"Slider")?.value;
            if(val!==undefined) el.textContent=val+" cm";
        }
    });

    // Compute volume
    let volume=0;
    switch(type){
        case "cuboid": volume=width*height*depth; break;
        case "sphere": case "ellipsoid": volume=(4/3)*Math.PI*radius**3; break;
        case "pyramid": volume=(1/3)*width*width*height; break;
        case "cylinder": volume=Math.PI*radius**2*height; break;
        case "cone": volume=(1/3)*Math.PI*radius**2*height; break;
        case "torus": volume=2*Math.PI**2*radius*depth**2; break;
        case "capsule": volume=Math.PI*radius**2*((4/3)*radius+height); break;
        case "ring": volume=Math.PI*(width**2-radius**2); break;
        case "octahedron": volume=(Math.sqrt(2)/3)*radius**3; break;
        case "dodecahedron": volume=(15+7*Math.sqrt(5))/4*radius**3; break;
        case "icosahedron": volume=(5*(3+Math.sqrt(5))/12)*radius**3; break;
    }

    const density = materialName==="none" ? (volume?mass/volume:0) : matProps.density;

    const volEl=document.getElementById("volumeSliderValue");
    if(volEl) volEl.textContent=volume.toFixed(2)+" cm³";
    const massEl=document.getElementById("massSliderValue");
    if(massEl) massEl.textContent=mass.toFixed(2)+" g";
    const densEl=document.getElementById("densityOutput");
    if(densEl) densEl.textContent=density.toFixed(2)+" g/cm³";
}

// --- Show/Hide sliders ---
function updateSlidersForShape(type){
    const allSliders=["widthSlider","heightSlider","depthSlider","radiusSlider","massSlider"];
    const visible = shapeSliders[type] || [];
    allSliders.forEach(id=>{
        const el=document.getElementById(id);
        if(!el) return;
        const label=el.closest("label")||el.parentElement;
        label.style.display = visible.includes(id) ? "block" : "none";
    });
}

// --- Attach events ---
function setupControls(){
    ["shapeSelector","widthSlider","heightSlider","depthSlider","radiusSlider","massSlider","colorPicker","materialSelector"].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.addEventListener("input",updateMesh);
    });

    const shapeSel=document.getElementById("shapeSelector");
    if(shapeSel) shapeSel.addEventListener("change",()=>{updateSlidersForShape(shapeSel.value); updateMesh();});

    // Trampoline button
    const btn=document.getElementById("sendToTrampolineBtn");
    if(btn) btn.addEventListener("click",()=>{
        const type=document.getElementById("shapeSelector")?.value || "cuboid";
        const width=Number(document.getElementById("widthSlider")?.value||1);
        const height=Number(document.getElementById("heightSlider")?.value||1);
        const depth=Number(document.getElementById("depthSlider")?.value||1);
        const radius=Number(document.getElementById("radiusSlider")?.value||1);
        const color=document.getElementById("colorPicker")?.value || "#ff5500";

        localStorage.setItem("trampolineShape",JSON.stringify({
            type,dimensions:{width,height,depth,radius},color
        }));
        window.location.href="Trampoline-Page.html";
    });
}

// --- Animation ---
function animate(){
    requestAnimationFrame(animate);
    if(activeMesh) activeMesh.rotation.y+=0.01;
    renderer.render(scene,camera);
}

// --- Initialize editor ---
function initEditor(){
    initScene();
    setupControls();
    const type=document.getElementById("shapeSelector")?.value || "cuboid";
    updateSlidersForShape(type);
    updateMesh();
    animate();
}

// Auto-init for custom page
if(window.location.pathname.includes("Custom-Page.html")){
    window.addEventListener("DOMContentLoaded",initEditor);
}


