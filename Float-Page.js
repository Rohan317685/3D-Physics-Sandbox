let scene, camera, renderer;
let shapeMesh, poolPlane;

const WATER_DENSITY = 1000; // kg/m³

init();
animate();

/* -------------------- INIT -------------------- */
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef6ff);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 12, 20);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("canvas-container").appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  // Water
  const waterGeo = new THREE.PlaneGeometry(30, 12);
  const waterMat = new THREE.MeshPhongMaterial({
    color: 0x1e90ff,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  poolPlane = new THREE.Mesh(waterGeo, waterMat);
  poolPlane.rotation.x = -Math.PI / 2;
  scene.add(poolPlane);

  loadShape();
  window.addEventListener("resize", onResize);
}

/* -------------------- LOAD SHAPE -------------------- */
function loadShape() {
  let data = JSON.parse(localStorage.getItem("trampolineShape"));

  if (!data) {
    data = {
      type: "sphere",
      dimensions: { radius: 1 },
      density: 600, // g/m³
      color: 0xff5500
    };
  }

  if (shapeMesh) scene.remove(shapeMesh);

  const d = data.dimensions;
  let geometry;

  switch (data.type) {
    case "sphere":
      geometry = new THREE.SphereGeometry(d.radius, 48, 48);
      break;

    case "ellipsoid":
      geometry = new THREE.SphereGeometry(1, 48, 48);
      break;

    case "cuboid":
      geometry = new THREE.BoxGeometry(d.width, d.height, d.depth);
      break;

    case "pyramid":
      geometry = new THREE.ConeGeometry(d.width, d.height, 4);
      break;

    case "cylinder":
      geometry = new THREE.CylinderGeometry(d.radius, d.radius, d.height, 48);
      break;

    case "cone":
      geometry = new THREE.ConeGeometry(d.radius, d.height, 48);
      break;

    case "torus":
      geometry = new THREE.TorusGeometry(d.radius, d.depth, 24, 48);
      break;

    case "capsule":
      geometry = new THREE.CapsuleGeometry(d.radius, d.height, 8, 16);
      break;

    case "ring":
      geometry = new THREE.RingGeometry(d.radius * 0.6, d.radius, 48);
      break;

    case "octahedron":
      geometry = new THREE.OctahedronGeometry(d.radius);
      break;

    case "dodecahedron":
      geometry = new THREE.DodecahedronGeometry(d.radius);
      break;

    case "icosahedron":
      geometry = new THREE.IcosahedronGeometry(d.radius);
      break;

    default:
      console.warn("Unknown shape:", data.type);
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  const material = new THREE.MeshStandardMaterial({
    color: data.color,
    roughness: 0.6,
    metalness: 0.1
  });

  shapeMesh = new THREE.Mesh(geometry, material);

  // Scale ellipsoid correctly
  if (data.type === "ellipsoid") {
    shapeMesh.scale.set(d.width, d.height, d.depth);
  }

  scene.add(shapeMesh);

  // Physics
  shapeMesh.volume = calculateVolume(data);
  shapeMesh.density = data.density / 1000; // g/m³ → kg/m³
  shapeMesh.mass = shapeMesh.volume * shapeMesh.density;

  shapeMesh.position.y = 5;
}


  shapeMesh = new THREE.Mesh(geometry, material);
  scene.add(shapeMesh);

  // --- PHYSICS PROPERTIES ---
  shapeMesh.volume = calculateVolume(data);          // m³
  shapeMesh.density = data.density / 1000;           // g/m³ → kg/m³
  shapeMesh.mass = shapeMesh.volume * shapeMesh.density;

  shapeMesh.position.y = 5;


/* -------------------- VOLUME -------------------- */
function calculateVolume(shape) {
  const d = shape.dimensions;

  switch (shape.type) {
    case "sphere":
      return (4 / 3) * Math.PI * d.radius ** 3;

    case "cuboid":
      return d.width * d.height * d.depth;

    case "pyramid":
      return (1 / 3) * d.width * d.width * d.height;

    default:
      return 1;
  }
}

/* -------------------- ANIMATION -------------------- */
function animate() {
  requestAnimationFrame(animate);

  if (shapeMesh) {
    // Fraction submerged based on density ratio
    const submergedFraction = Math.min(
      shapeMesh.density / WATER_DENSITY,
      1
    );

    // Target height (water surface at y = 0)
    const height = getShapeHeight();
    const targetY = (0.5 - submergedFraction) * height;

    // Smooth motion
    shapeMesh.position.y += (targetY - shapeMesh.position.y) * 0.05;

    // Depth display
    document.getElementById("depthDisplay").textContent =
      `Depth: ${Math.max(0, -shapeMesh.position.y).toFixed(2)} m`;
  }

  renderer.render(scene, camera);
}

/* -------------------- HELPERS -------------------- */
function getShapeHeight() {
  const box = new THREE.Box3().setFromObject(shapeMesh);
  return box.max.y - box.min.y;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}