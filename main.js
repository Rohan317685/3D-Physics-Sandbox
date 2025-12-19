let scene, camera, renderer;
let activeMesh = null;
const DEFAULT_DENSITY = 600; 


function initBaseScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const container = document.getElementById("canvas-container") || document.body;
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 15);

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 8);
    scene.add(dir);
}

function clearMesh() {
    if (activeMesh) scene.remove(activeMesh);
}

function getColor() {
    return parseInt((document.getElementById("colorPicker")?.value || "#ff5500").slice(1), 16);
}

function saveShape(shapeType, dims) {
    const color = document.getElementById("colorPicker").value;
    const shapeData = {
        type: shapeType,
        dimensions: dims,
        color: color,
        density: DEFAULT_DENSITY
    };
    localStorage.setItem("trampolineShape", JSON.stringify(shapeData));
}


function updateSphere() {
    const r = Number(document.getElementById("widthSlider").value);
    document.getElementById("widthValue").textContent = r + " cm";

    clearMesh();
    const geometry = new THREE.SphereGeometry(r, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: getColor(),
        metalness: 0.6,
        roughness: 0.3
    });

    activeMesh = new THREE.Mesh(geometry, material);
    scene.add(activeMesh);

    const volume = (4/3) * Math.PI * r**3;
    document.getElementById("volumeOutput").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massOutput").textContent = (volume * 0.6).toFixed(2) + " g";
}

function initSphereEditor() {
    initBaseScene();
    camera.position.set(0, 2, 15);

    document.getElementById("widthSlider").oninput = updateSphere;
    document.getElementById("colorPicker").oninput = updateSphere;
    updateSphere();
    animate();
}


function updateCuboid() {
    const w = Number(document.getElementById("widthSlider").value);
    const h = Number(document.getElementById("heightSlider").value);
    const d = Number(document.getElementById("depthSlider").value);

    document.getElementById("widthValue").textContent = w + " cm";
    document.getElementById("heightValue").textContent = h + " cm";
    document.getElementById("depthValue").textContent = d + " cm";

    clearMesh();
    const geometry = new THREE.BoxGeometry(w,h,d);
    const material = new THREE.MeshStandardMaterial({
        color: getColor(),
        metalness: 0.6,
        roughness: 0.3
    });

    activeMesh = new THREE.Mesh(geometry, material);
    scene.add(activeMesh);

    const volume = w*h*d;
    document.getElementById("volumeOutput").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massOutput").textContent = (volume * 0.6).toFixed(2) + " g";
}

function initCuboidEditor() {
    initBaseScene();
    camera.position.set(0, 3, 12);

    ["widthSlider","heightSlider","depthSlider","colorPicker"].forEach(id => {
        document.getElementById(id).oninput = updateCuboid;
    });

    updateCuboid();
    animate();
}


function updatePyramid() {
    const w = Number(document.getElementById("widthSlider").value);
    const h = Number(document.getElementById("heightSlider").value);

    document.getElementById("widthValue").textContent = w + " cm";
    document.getElementById("heightValue").textContent = h + " cm";

    clearMesh();
    const geometry = new THREE.ConeGeometry(w, h, 4);
    const material = new THREE.MeshStandardMaterial({
        color: getColor(),
        metalness: 0.6,
        roughness: 0.3
    });

    activeMesh = new THREE.Mesh(geometry, material);
    activeMesh.rotation.y = Math.PI/4;
    activeMesh.position.y = h/2;
    scene.add(activeMesh);

    const volume = (1/3) * w*w*h;
    document.getElementById("volumeOutput").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massOutput").textContent = (volume * 0.6).toFixed(2) + " g";
}

function initPyramidEditor() {
    initBaseScene();
    camera.position.set(0, 5, 12);
    camera.lookAt(0,0,0);

    ["widthSlider","heightSlider","colorPicker"].forEach(id => {
        document.getElementById(id).oninput = updatePyramid;
    });

    updatePyramid();
    animate();
}


function animate() {
    requestAnimationFrame(animate);
    if (activeMesh) activeMesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}


window.addEventListener("DOMContentLoaded", () => {
    const page = location.pathname.split("/").pop();

    if (page === "Sphere-Page.html") initSphereEditor();
    else if (page === "Cuboid-Page.html") initCuboidEditor();
    else if (page === "Pyramid-Page.html") initPyramidEditor();

    
    document.getElementById("goToFloat")?.addEventListener("click", () => {
        let dims, type = "";
        if (page === "Sphere-Page.html") {
            type = "sphere";
            dims = { radius: Number(document.getElementById("widthSlider").value) };
        } else if (page === "Cuboid-Page.html") {
            type = "cuboid";
            dims = {
                width: Number(document.getElementById("widthSlider").value),
                height: Number(document.getElementById("heightSlider").value),
                depth: Number(document.getElementById("depthSlider").value)
            };
        } else if (page === "Pyramid-Page.html") {
            type = "pyramid";
            dims = {
                width: Number(document.getElementById("widthSlider").value),
                height: Number(document.getElementById("heightSlider").value)
            };
        }
        saveShape(type, dims);
        location.href = "Float-Page.html";
    });

    
    document.getElementById("sendToTrampolineBtn")?.addEventListener("click", () => {
        let dims, type = "";
        if (page === "Sphere-Page.html") {
            type = "sphere";
            dims = { radius: Number(document.getElementById("widthSlider").value) };
        } else if (page === "Cuboid-Page.html") {
            type = "cuboid";
            dims = {
                width: Number(document.getElementById("widthSlider").value),
                height: Number(document.getElementById("heightSlider").value),
                depth: Number(document.getElementById("depthSlider").value)
            };
        } else if (page === "Pyramid-Page.html") {
            type = "pyramid";
            dims = {
                width: Number(document.getElementById("widthSlider").value),
                height: Number(document.getElementById("heightSlider").value)
            };
        }
        saveShape(type, dims);
        location.href = "Trampoline-Page.html";
    });
});

window.addEventListener("DOMContentLoaded", () => {
    

    
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            
            if (window.history.length > 1) {
                window.history.back();
            } else {
                
                window.location.href = "index.html";
            }
        });
    }
});
