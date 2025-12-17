// ================= FLOAT PAGE (CLEAN VERSION) =================

let scene, camera, renderer;
let shapeMesh, waterPlane;

const WATER_DENSITY = 1000; // kg/m³
const DEFAULT_DENSITY = 600;

// ---------------- INIT SCENE ----------------

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef6ff);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 6, 18);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const container = document.getElementById("canvas-container");
  if (!container) {
    alert("canvas-container not found");
    return;
  }
  container.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  // Water surface
  const waterGeo = new THREE.PlaneGeometry(30, 12);
  const waterMat = new THREE.MeshPhongMaterial({
    color: 0x1e90ff,
    transparent: true,
    opacity: 0.7
  });

  waterPlane = new THREE.Mesh(waterGeo, waterMat);
  waterPlane.rotation.x = -Math.PI / 2;
  waterPlane.position.y = 0;
  scene.add(waterPlane);

  window.addEventListener("resize", onResize);
  onResize();
}

// ---------------- LOAD SHAPE ----------------

function loadShape() {
  const raw = localStorage.getItem("trampolineShape");
  if (!raw) {
    alert("No shape data found. Go back to editor.");
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    alert("Invalid shape data");
    console.error(e);
    return;
  }

  if (data.type !== "sphere") {
    alert("Float sim currently supports spheres only");
    return;
  }

  const radius = Number(data.dimensions?.radius);
  if (!radius || radius <= 0) {
    alert("Invalid sphere radius");
    return;
  }

  const density = Number(data.density ?? DEFAULT_DENSITY);
  const color = data.color ?? "#ff5500";

  if (shapeMesh) scene.remove(shapeMesh);

  const geometry = new THREE.SphereGeometry(radius, 48, 48);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.1
  });

  shapeMesh = new THREE.Mesh(geometry, material);
  shapeMesh.position.y = 6;
  scene.add(shapeMesh);

  // Physics values
  shapeMesh.radius = radius;
  shapeMesh.volume = (4 / 3) * Math.PI * radius ** 3;
  shapeMesh.density = density;
  shapeMesh.mass = shapeMesh.volume * density;
}

// ---------------- ANIMATION ----------------

function animate() {
  requestAnimationFrame(animate);

  if (shapeMesh) {
    // Fraction submerged based on density ratio
    const submerged = Math.min(
      shapeMesh.density / WATER_DENSITY,
      1
    );

    // Target vertical position
    const targetY =
      (0.5 - submerged) * (shapeMesh.radius * 2);

    shapeMesh.position.y +=
      (targetY - shapeMesh.position.y) * 0.04;
  }

  renderer.render(scene, camera);
}

// ---------------- RESIZE ----------------

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---------------- START ----------------

window.addEventListener("DOMContentLoaded", () => {
  initScene();
  loadShape();
  animate();
});
