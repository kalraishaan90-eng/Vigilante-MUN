const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');

const assetsDir = path.join(__dirname, 'public', 'assets', '3d');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

function exportMesh(mesh, filename) {
  const exporter = new GLTFExporter();
  const scene = new THREE.Scene();
  scene.add(mesh);

  exporter.parse(
    scene,
    (gltf) => {
      const outPath = path.join(assetsDir, filename);
      fs.writeFileSync(outPath, JSON.stringify(gltf, null, 2));
      console.log(`Saved ${filename}`);
    },
    (err) => {
      console.error(`Error saving ${filename}`, err);
    },
    { binary: false }
  );
}

// 1. Lens mesh (Cylinder with Cylinder node name)
const lensGeo = new THREE.CylinderGeometry(5, 5, 2, 64);
const lensMesh = new THREE.Mesh(lensGeo, new THREE.MeshStandardMaterial());
lensMesh.name = 'Cylinder';
exportMesh(lensMesh, 'lens.glb');

// 2. Cube mesh (Box with Cube node name)
const cubeGeo = new THREE.BoxGeometry(4, 4, 4);
const cubeMesh = new THREE.Mesh(cubeGeo, new THREE.MeshStandardMaterial());
cubeMesh.name = 'Cube';
exportMesh(cubeMesh, 'cube.glb');

// 3. Bar mesh (Box with Cube node name)
const barGeo = new THREE.BoxGeometry(10, 2, 2);
const barMesh = new THREE.Mesh(barGeo, new THREE.MeshStandardMaterial());
barMesh.name = 'Cube';
exportMesh(barMesh, 'bar.glb');
