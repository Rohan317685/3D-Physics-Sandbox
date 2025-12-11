let scene, camera, renderer;


function initBaseScene() {
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
}


let cuboid;

function initCuboidEditor() {
    initBaseScene();
    camera.position.set(0, 2, 10);


    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 8);
    scene.add(dir);

    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-5, -2, -8);
    scene.add(fill);

    setupCuboidSliders();
    updateCuboid();
    animateCuboid();
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

function setupCuboidSliders() {
    document.getElementById("widthSlider").oninput = updateCuboid;
    document.getElementById("heightSlider").oninput = updateCuboid;
    document.getElementById("depthSlider").oninput = updateCuboid;
}

function updateCuboid() {
    let w = Number(document.getElementById("widthSlider").value);
    let h = Number(document.getElementById("heightSlider").value);
    let d = Number(document.getElementById("depthSlider").value);

    document.getElementById("widthValue").textContent = w + " cm";
    document.getElementById("heightValue").textContent = h + " cm";
    document.getElementById("depthValue").textContent = d + " cm";

    createCuboid(w, h, d);

    let volume = w * h * d;
    let density = 0.6;

    document.getElementById("volumeOutput").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massOutput").textContent = (volume * density).toFixed(2) + " g";
}

function animateCuboid() {
    requestAnimationFrame(animateCuboid);
    if (cuboid) cuboid.rotation.y += 0.01;
    renderer.render(scene, camera);
}


let sphere;

function initSphereEditor() {
    initBaseScene();
    camera.position.set(0, 2, 15);

 
    const directional = new THREE.DirectionalLight(0xffffff, 1.2);
    directional.position.set(5, 8, 10);
    scene.add(directional);

    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-6, -2, -8);
    scene.add(fill);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    setupSphereSlider();
    updateSphere();
    animateSphere();
}

function createSphere(radius) {
    if (sphere) scene.remove(sphere);

    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 0xff5500,
        metalness: 0.8,
        roughness: 0.2
    });

    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
}

function setupSphereSlider() {
    document.getElementById("widthSlider").oninput = updateSphere;
}

function updateSphere() {
    let r = Number(document.getElementById("widthSlider").value);

    document.getElementById("widthValue").textContent = r + " cm";

    createSphere(r);

    let volume = (4 / 3) * Math.PI * r * r * r;
    let density = 0.6;

    document.getElementById("volumeOutput").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massOutput").textContent = (volume * density).toFixed(2) + " g";
}

function animateSphere() {
    requestAnimationFrame(animateSphere);
    if (sphere) sphere.rotation.y += 0.01;
    renderer.render(scene, camera);
}


if (window.location.pathname.includes("Cuboid-Page.html")) {
    initCuboidEditor();
}

if (window.location.pathname.includes("Sphere-Page.html")) {
    initSphereEditor();
}

let pyramid;

function initPyramidEditor() {
    initBaseScene(); 
    camera.position.set(0, 3, 15);

   
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 8);
    scene.add(dir);

    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-5, -2, -8);
    scene.add(fill);

    setupPyramidSliders();
    updatePyramid();
    animatePyramid();
}

function createPyramid(width, height) {
    if (pyramid) scene.remove(pyramid);

    const geometry = new THREE.ConeGeometry(width, height, 4); 
    const material = new THREE.MeshStandardMaterial({
        color: 0xff5500,
        metalness: 0.8,
        roughness: 0.2
    });

    pyramid = new THREE.Mesh(geometry, material);
    pyramid.rotation.y = Math.PI / 4; 
    pyramid.position.y = height / 2;
    scene.add(pyramid);
}

function setupPyramidSliders() {
    document.getElementById("widthSlider").oninput = updatePyramid;
    document.getElementById("heightSlider").oninput = updatePyramid;
}

function updatePyramid() {
    let w = Number(document.getElementById("widthSlider").value);
    let h = Number(document.getElementById("heightSlider").value);

    document.getElementById("widthValue").textContent = w + " cm";
    document.getElementById("heightValue").textContent = h + " cm";

    createPyramid(w, h);

    let volume = (1/3) * w * w * h; 
    let density = 0.6;

    document.getElementById("volumeOutput").textContent = volume.toFixed(2) + " cm³";
    document.getElementById("massOutput").textContent = (volume * density).toFixed(2) + " g";
}

function animatePyramid() {
    requestAnimationFrame(animatePyramid);
    if (pyramid) pyramid.rotation.y += 0.01;
    renderer.render(scene, camera);
}

if (window.location.pathname.includes("Pyramid-Page.html")) {
    initPyramidEditor();
}