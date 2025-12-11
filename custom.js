let scene, camera, renderer;
let customShape;

const materials = {
    none: { color: null, density: 0.6 },
    wood: { color: 0x8B4513, density: 0.7 },
    metal: { color: 0xaaaaaa, density: 7.8 },
    plastic: { color: 0xffc107, density: 1.2}
};


function initCustomScene()  {
    scene = new THREE.Scene();


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    document.body.appendChild(renderer.domElement);


    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000

    );

    camera.position.set(0, 2, 15);

 
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);


    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, -2, -8);
    scene.add(fillLight);

}

function createCustomShape(type, width, height, depth, color)  {
    if(customShape) scene.remove(customShape);


    let geometry;


    switch(type) {
        case "cuboid":
            geometry = new THREE.BoxGeometry(width, height, depth);
            break;
        case "sphere":
            geometry = new THREE.SphereGeometry(width / 2, 64, 64);
            break;
        case "pyramid":
            geometry = new THREE.ConeGeometry(width, height, 4);
            break;
        default:
            console.error("Unknown shape type");
            return;
    }

    const material = new THREE.MeshStandardMaterial({ color: color });
    customShape = new THREE.Mesh(geometry, material);
    if(type === "pyramid") customShape.rotation.y = Math.PI / 4;
    scene.add(customShape);
}


function updateCustomShape() {
    const type = document.getElementById("shapeSelector").value;
    const width = Number(document.getElementById("widthSlider").value);
    const height = Number(document.getElementById("heightSlider").value);
    const depth = Number(document.getElementById("depthSlider").value);
    const mass = Number(document.getElementById("massSlider").value);

    const selectedMaterial = document.getElementById("materialSelector").value;
    const materialProps = materials[selectedMaterial];

  
    let shapeColor;
    if (selectedMaterial === "none") {
        shapeColor = parseInt(document.getElementById("colorPicker").value.slice(1), 16);
    } else {
        shapeColor = materialProps.color;
       
        document.getElementById("colorPicker").value = "#" + shapeColor.toString(16).padStart(6, '0');
    }

    createCustomShape(type, width, height, depth, shapeColor);


    document.getElementById("widthValue").textContent = width + " cm";
    document.getElementById("heightValue").textContent = height + " cm";
    document.getElementById("depthValue").textContent = depth + " cm";

  
    let volume = 0;
    switch(type) {
        case "cuboid": volume = width * height * depth; break;
        case "sphere": volume = (4/3) * Math.PI * Math.pow(width/2, 3); break;
        case "pyramid": volume = (1/3) * width * width * height; break;
    }

    
    let density;
    if (selectedMaterial === "none")  {
        density = volume ? (mass / volume) : 0;
    } else {
        density = materialProps.density;
    }


   
    document.getElementById("volumeSliderValue").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massSliderValue").textContent = mass.toFixed(2) + " g";
    document.getElementById("densityOutput").textContent = density.toFixed(2) + " g/cm³";
}


function setupCustomControls()  {
    document.getElementById("shapeSelector").onchange = updateCustomShape;
    document.getElementById("colorPicker").oninput = updateCustomShape;
    document.getElementById("widthSlider").oninput = updateCustomShape;
    document.getElementById("heightSlider").oninput = updateCustomShape;
    document.getElementById("depthSlider").oninput = updateCustomShape;
    document.getElementById("massSlider").oninput = updateCustomShape;
    document.getElementById("materialSelector").onchange = updateCustomShape;
}

function animateCustom() {
    requestAnimationFrame(animateCustom);
    if(customShape) customShape.rotation.y += 0.01; 
    renderer.render(scene, camera);
}

function initCustomEditor()  {
    initCustomScene();
    setupCustomControls();
    updateCustomShape();
    animateCustom();
}

if (window.location.pathname.includes("Custom-Page.html")) {
    initCustomEditor();
}
