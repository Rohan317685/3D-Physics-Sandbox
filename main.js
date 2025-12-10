let scene, camera, renderer;
let cuboid;


function initCuboidEditor() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xFFFFFF);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 8;


const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);


const hemiLight = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.8);
scene.add(hemiLight);


const positions = [
  [5, 5, 5],
  [-5, 5, 5],
  [5, -5, 5],
  [-5, -5, 5],
  [5, 5, -5],
  [-5, 5, -5],
  [5, -5, -5],
  [-5, -5, -5]
];

positions.forEach(pos => {
  const light = new THREE.PointLight(0xffffff, 0.5);
  light.position.set(...pos);
  scene.add(light);
});

    
    
    setupSliders();
    updateCuboid();
    animate();
}
function createCuboid(w, h, d) {
    if (cuboid) scene.remove(cuboid);

    const geometry = new THREE.BoxGeometry(w, h, d);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xff5500,
        metalness: 0.8,
        roughness: 0.2
     });
    cuboid = new THREE.Mesh(geometry, material);

    scene.add(cuboid);
}

function setupSliders() {
    const widthSlider = document.getElementById("widthSlider");
    const heightSlider = document.getElementById("heightSlider");
    const depthSlider = document.getElementById("depthSlider");


    widthSlider.oninput = updateCuboid;
    heightSlider.oninput = updateCuboid;
    depthSlider.oninput = updateCuboid;

    updateCuboid();
}


function updateCuboid(){
    let w = Number(document.getElementById("widthSlider").value);
    let h = Number(document.getElementById("heightSlider").value);
    let d = Number(document.getElementById("depthSlider").value);

    document.getElementById("widthValue").textContent = w + " cm";
    document.getElementById("heightValue").textContent = h + " cm";
    document.getElementById("depthValue").textContent = d + " cm";

    createCuboid(w, h, d)

    let volume = w * h * d;
    let density = 0.6;

    document.getElementById("volumeOutput").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massOutput").textContent = (volume * density).toFixed(2) + " g";

}

function animate() {
    requestAnimationFrame(animate);
    cuboid.rotation.y += 0.01;
    renderer.render(scene, camera);
}


if(window.location.pathname.includes("Cuboid-Page.html")) {
    initCuboidEditor();
}