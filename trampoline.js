let scene, camera, renderer;
let trampolineMesh;
let simObject;
let simMass = 1;
let velocity = 0;
let positionY = 10;
let gravity = 9.81;
let restitution = 0.85;
let firstBounceDone = false;
let peakHeightAfterBounce = 0;
let isDropped = false;
let lastTime = performance.now();

const AIR_MIN = 0;
const AIR_MAX = 2;
let airResistance = 0.05;


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


const customShapes = {
  cuboid: { geometry: (w,h,d) => new THREE.BoxGeometry(w,h,d), density: 0.6 },
  sphere: { geometry: (r) => new THREE.SphereGeometry(r,64,64), density: 0.6 },
  ellipsoid: { geometry: (r) => new THREE.SphereGeometry(1,64,64), density: 0.6 },
  pyramid: { geometry: (w,h) => new THREE.ConeGeometry(w,h,4), density: 0.6 },
  cylinder: { geometry: (r,h) => new THREE.CylinderGeometry(r,r,h,32), density: 0.7 },
  cone: { geometry: (r,h) => new THREE.ConeGeometry(r,h,32), density: 0.7 },
  torus: { geometry: (r,tube) => new THREE.TorusGeometry(r,tube,16,100), density: 0.8 },
  capsule: { geometry: (r,h) => new THREE.CapsuleGeometry(r,h,8,16), density: 0.7 },
  ring: { geometry: (innerR,width) => new THREE.RingGeometry(innerR, innerR+width,32), density: 0.6 },
  octahedron: { geometry: (r) => new THREE.OctahedronGeometry(r,0), density: 0.6 },
  dodecahedron: { geometry: (r) => new THREE.DodecahedronGeometry(r,0), density: 0.6 },
  icosahedron: { geometry: (r) => new THREE.IcosahedronGeometry(r,0), density: 0.6 },
};


function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 15, 25);
  camera.lookAt(0,0,0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("canvas-container").appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10,20,10);
  scene.add(dirLight);
}


function createTrampoline() {
  const geometry = new THREE.CylinderGeometry(10,10,0.5,32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  trampolineMesh = new THREE.Mesh(geometry, material);
  trampolineMesh.position.y = 0;
  scene.add(trampolineMesh);
}


function setupObject(mesh, mass) {
  simObject = mesh;
  simMass = mass;
  velocity = 0;
  positionY = Number(document.getElementById("dropheightSlider")?.value) || 10;
  simObject.position.y = positionY;
  scene.add(simObject);

  firstBounceDone = false;
  peakHeightAfterBounce = 0;
}


function trampolineStep(deltaTime) {
  if (!simObject || !trampolineMesh || !isDropped) return;

  const gravityAccel = -gravity;
  const airAccel = -(airResistance / simMass) * velocity;

  velocity += (gravityAccel + airAccel) * deltaTime;
  positionY += velocity * deltaTime;

  simObject.geometry.computeBoundingBox();
  const bbox = simObject.geometry.boundingBox;
  let halfHeight = (bbox.max.y - bbox.min.y) / 2;
  if (simObject.scale.y) halfHeight *= simObject.scale.y;

  const trampolineY = trampolineMesh.position.y;
  const bottomY = positionY - halfHeight;

  if (bottomY <= trampolineY && velocity < 0) {
    positionY = trampolineY + halfHeight;
    velocity = -velocity * restitution;

    if (!firstBounceDone) {
      firstBounceDone = true;
      peakHeightAfterBounce = positionY;
    }
  }

  if (firstBounceDone && velocity > 0 && positionY > peakHeightAfterBounce) {
    peakHeightAfterBounce = positionY;
  }

  simObject.position.y = positionY;

  document.getElementById("currentHeight").textContent =
    positionY.toFixed(2);
  document.getElementById("peakHeight").textContent =
    firstBounceDone ? peakHeightAfterBounce.toFixed(2) : "-";
}


function animate() {
  const now = performance.now();
  const deltaTime = (now - lastTime)/1000;
  lastTime = now;

  trampolineStep(deltaTime);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}


function startTrampolineSim(mesh, mass) {
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
    renderer = null;
  }

  trampolineMesh = null;
  simObject = null;

  initScene();
  createTrampoline();
  setupObject(mesh, mass);
  animate();
}


function loadObjectFromStorage() {
  const shapeJSON = localStorage.getItem("trampolineShape");
  if (!shapeJSON) return;

  const shapeData = JSON.parse(shapeJSON);
  const shapeType = shapeData.type;
  const dims = shapeData.dimensions;
  const colorHex = shapeData.color || "#ff5500";

  if (!customShapes[shapeType]) return;
  const shapeInfo = customShapes[shapeType];

  let geometry;

  switch(shapeType) {
    case "cuboid": geometry = shapeInfo.geometry(dims.width, dims.height, dims.depth); break;
    case "sphere": geometry = shapeInfo.geometry(dims.radius); break;
    case "ellipsoid": geometry = shapeInfo.geometry(1); break;
    case "pyramid": geometry = shapeInfo.geometry(dims.width, dims.height); break;
    case "cylinder": geometry = shapeInfo.geometry(dims.radius, dims.height); break;
    case "cone": geometry = shapeInfo.geometry(dims.radius, dims.height); break;
    case "torus": geometry = shapeInfo.geometry(dims.radius, dims.depth); break;
    case "capsule": geometry = shapeInfo.geometry(dims.radius, dims.height); break;
    case "ring": geometry = shapeInfo.geometry(dims.radius, dims.width); break;
    case "octahedron": case "dodecahedron": case "icosahedron": geometry = shapeInfo.geometry(dims.radius); break;
    default: geometry = new THREE.BoxGeometry(2,2,2);
  }

  const material = new THREE.MeshStandardMaterial({
    color: parseInt(colorHex.replace("#", ""), 16)
  });

  const mesh = new THREE.Mesh(geometry, material);

  if (shapeType === "ellipsoid") mesh.scale.set(dims.radius, dims.radius, dims.radius);

  let volume = (dims.width||dims.radius||1) * (dims.height||dims.radius||1) * (dims.depth||dims.radius||1);
  const mass = Math.min(volume * shapeInfo.density, 100);

  startTrampolineSim(mesh, mass);
}

window.addEventListener("DOMContentLoaded", () => {

  loadObjectFromStorage();

  const dropHeightSlider = document.getElementById("dropheightSlider");
  const dropHeightValue = document.getElementById("dropHeightValue");
  const dropBtn = document.getElementById("dropBtn");
  const resetPeakBtn = document.getElementById("resetPeakBtn");
  const airSlider = document.getElementById("airSlider");
  const airValue = document.getElementById("airValue");
  const currentHeightDisplay = document.getElementById("currentHeight");
  const peakHeightDisplay = document.getElementById("peakHeight");

 
  airResistance = clamp(Number(airSlider.value), AIR_MIN, AIR_MAX);
  airValue.textContent = airResistance.toFixed(2) + " kg/s";

  airSlider?.addEventListener("input", () => {
    airResistance = clamp(Number(airSlider.value), AIR_MIN, AIR_MAX);
    airValue.textContent = airResistance.toFixed(2) + " kg/s";
  });

  
  dropHeightSlider?.addEventListener("input", () => {
    const dropHeight = Number(dropHeightSlider.value);
    dropHeightValue.textContent = dropHeight;

    if (simObject) {
      positionY = dropHeight;
      simObject.position.y = positionY;

      firstBounceDone = false;
      peakHeightAfterBounce = 0;
      isDropped = false;

      currentHeightDisplay.textContent = positionY.toFixed(2);
      peakHeightDisplay.textContent = "-";
    }
  });

  dropBtn?.addEventListener("click", () => {
    if (!simObject) return;

    isDropped = true;
    velocity = 0;
    firstBounceDone = false;
    peakHeightAfterBounce = 0;

    
    peakHeightDisplay.textContent = "-";
  });

  
  resetPeakBtn?.addEventListener("click", () => {
    if (!simObject) return;

  
    firstBounceDone = false;
    peakHeightAfterBounce = positionY;

    peakHeightDisplay.textContent = "-";
  });
});

