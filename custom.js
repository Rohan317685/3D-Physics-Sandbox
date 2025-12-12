let scene, camera, renderer;
let customShape;

const shapeSliders = {
    cuboid: ["widthSlider", "heightSlider", "depthSlider", "massSlider"],
    sphere: ["radiusSlider", "massSlider"],
    ellipsoid: ["radiusSlider", "massSlider"],
    pyramid: ["widthSlider", "heightSlider", "massSlider"],
    cylinder: ["radiusSlider", "heightSlider", "massSlider"],
    cone: ["radiusSlider", "heightSlider", "massSlider"],
    torus: ["radiusSlider", "depthSlider", "massSlider"],
    capsule: ["radiusSlider", "heightSlider", "massSlider"],
    ring: ["radiusSlider", "widthSlider", "massSlider"],
    octahedron: ["radiusSlider", "massSlider"],
    dodecahedron: ["radiusSlider", "massSlider"],
    icosahedron: ["radiusSlider", "massSlider"]
};

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

function updateSlidersForShape(shape) {
    const allSliders = ["widthSlider", "heightSlider", "depthSlider", "radiusSlider", "massSlider"];
    const slidersToShow = shapeSliders[shape] || [];
    allSliders.forEach(id => {
        const el = document.getElementById(id);
        const container = el.closest("label") || el.parentElement;
        container.style.display = slidersToShow.includes(id) ? "block" : "none";
    });
}

function initCustomScene() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 15);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, -2, -8);
    scene.add(fillLight);
}

function createCustomShape(type, width, height, depth, radius, color) {
    if (customShape) scene.remove(customShape);
    let geometry;

    switch (type) {
        case "cuboid":
            geometry = new THREE.BoxGeometry(width, height, depth);
            break;
        case "sphere":
        case "ellipsoid": 
            geometry = new THREE.SphereGeometry(radius, 64, 64);
            break;
        case "pyramid":
            geometry = new THREE.ConeGeometry(width, height, 4);
            break;
        case "cylinder":
            geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
            break;
        case "cone":
            geometry = new THREE.ConeGeometry(radius, height, 32);
            break;
        case "torus":
            geometry = new THREE.TorusGeometry(radius, depth, 16, 100);
            break;
        case "capsule":
            geometry = new THREE.CapsuleGeometry(radius, height, 4, 8);
            break;
        case "ring":
            geometry = new THREE.RingGeometry(radius, width, 32);
            break;
        case "octahedron":
            geometry = new THREE.OctahedronGeometry(radius);
            break;
        case "dodecahedron":
            geometry = new THREE.DodecahedronGeometry(radius);
            break;
        case "icosahedron":
            geometry = new THREE.IcosahedronGeometry(radius);
            break;
        default:
            console.error("Unknown shape type");
            return;
    }

    const material = new THREE.MeshStandardMaterial({ color: color });
    customShape = new THREE.Mesh(geometry, material);
    if (type === "pyramid") customShape.rotation.y = Math.PI / 4;
    scene.add(customShape);
}

function updateCustomShape() {
    const type = document.getElementById("shapeSelector").value;
    updateSlidersForShape(type);

    const width = Number(document.getElementById("widthSlider").value);
    const height = Number(document.getElementById("heightSlider").value);
    const depth = Number(document.getElementById("depthSlider").value);
    const radius = Number(document.getElementById("radiusSlider").value);
    const mass = Number(document.getElementById("massSlider").value);

    const selectedMaterial = document.getElementById("materialSelector").value;
    const materialProps = materials[selectedMaterial];

    const massControl = document.getElementById("massControl");
    massControl.style.display = selectedMaterial === "none" ? "block" : "none";

    let shapeColor;
    if (selectedMaterial === "none") {
        shapeColor = parseInt(document.getElementById("colorPicker").value.slice(1), 16);
    } else {
        shapeColor = materialProps.color;
        document.getElementById("colorPicker").value = "#" + shapeColor.toString(16).padStart(6, '0');
    }

    createCustomShape(type, width, height, depth, radius, shapeColor);

    if (document.getElementById("widthValue")) document.getElementById("widthValue").textContent = width + " cm";
    if (document.getElementById("heightValue")) document.getElementById("heightValue").textContent = height + " cm";
    if (document.getElementById("depthValue")) document.getElementById("depthValue").textContent = depth + " cm";
    if (document.getElementById("radiusValue")) document.getElementById("radiusValue").textContent = radius + " cm";

    let volume = 0;
    switch (type) {
        case "cuboid": volume = width * height * depth; break;
        case "sphere":
        case "ellipsoid": volume = (4/3) * Math.PI * radius**3; break;
        case "pyramid": volume = (1/3) * width * width * height; break;
        case "cylinder": volume = Math.PI * radius**2 * height; break;
        case "cone": volume = (1/3) * Math.PI * radius**2 * height; break;
        case "torus": volume = 2 * Math.PI**2 * radius * depth**2; break;
        case "capsule": volume = Math.PI * radius**2 * ((4/3)*radius + height); break;
        case "ring": volume = Math.PI * (width**2 - radius**2); break;
        case "octahedron": volume = (Math.sqrt(2)/3) * radius**3; break;
        case "dodecahedron": volume = (15 + 7*Math.sqrt(5))/4 * radius**3; break;
        case "icosahedron": volume = (5*(3+Math.sqrt(5))/12) * radius**3; break;
    }

    let density = selectedMaterial === "none" ? (volume ? mass / volume : 0) : materialProps.density;

    document.getElementById("volumeSliderValue").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massSliderValue").textContent = mass.toFixed(2) + " g";
    document.getElementById("densityOutput").textContent = density.toFixed(2) + " g/cm³";
}

function setupCustomControls() {
    document.getElementById("shapeSelector").onchange = updateCustomShape;
    document.getElementById("colorPicker").oninput = updateCustomShape;
    document.getElementById("widthSlider").oninput = updateCustomShape;
    document.getElementById("heightSlider").oninput = updateCustomShape;
    document.getElementById("depthSlider").oninput = updateCustomShape;
    document.getElementById("radiusSlider").oninput = updateCustomShape;
    document.getElementById("massSlider").oninput = updateCustomShape;
    document.getElementById("materialSelector").onchange = updateCustomShape;
}

function animateCustom() {
    requestAnimationFrame(animateCustom);
    if (customShape) customShape.rotation.y += 0.01;
    renderer.render(scene, camera);
}

function initCustomEditor() {
    initCustomScene();
    setupCustomControls();
    updateCustomShape();
    animateCustom();
}

if (window.location.pathname.includes("Custom-Page.html")) {
    initCustomEditor();
} 

document.getElementById("sendToTrampolineBtn").addEventListener("click", () => {
    const shapeType = document.getElementById("shapeSelector")?.value || "cuboid"; 
    const width = Number(document.getElementById("widthSlider")?.value || 2);
    const height = Number(document.getElementById("heightSlider")?.value || 2);
    const depth = Number(document.getElementById("depthSlider")?.value || 2);
    const radius = Number(document.getElementById("radiusSlider")?.value || 1);

    const shapeData = {
        type: shapeType,
        dimensions: { width, height, depth, radius }
    };

    localStorage.setItem("trampolineShape", JSON.stringify(shapeData));

    
    window.location.href = "Trampoline-Page.html";
});
