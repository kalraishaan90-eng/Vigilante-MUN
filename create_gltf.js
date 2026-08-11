const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'public', 'assets', '3d');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Minimal GLTF structure with a box/cylinder mesh named 'Cylinder' or 'Cube'
function createMinimalGLTF(nodeName, type) {
  return {
    asset: { version: '2.0', generator: 'Vigilante3D' },
    scenes: [{ nodes: [0] }],
    nodes: [{ name: nodeName, mesh: 0 }],
    meshes: [
      {
        name: nodeName,
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            indices: 2,
          },
        ],
      },
    ],
    buffers: [
      {
        uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAAAACAPwAAAAAAAAAAAAAAAAAAgD8AAAAAAACAPwAAAAAAAAAAAAAAAAAAgD8AAAAAAACAPwAAAAAAAAAAAAAAAAAAgD8AAAAAAACAPwAAAAAAAAAAAAAAAAAAgD8AAAAA',
        byteLength: 120,
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 },
      { buffer: 0, byteOffset: 36, byteLength: 36, target: 34962 },
      { buffer: 0, byteOffset: 72, byteLength: 12, target: 34963 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', max: [1, 1, 0], min: [0, 0, 0] },
      { bufferView: 1, componentType: 5126, count: 3, type: 'VEC3', max: [0, 0, 1], min: [0, 0, 1] },
      { bufferView: 2, componentType: 5123, count: 3, type: 'SCALAR', max: [2], min: [0] },
    ],
  };
}

fs.writeFileSync(path.join(assetsDir, 'lens.glb'), JSON.stringify(createMinimalGLTF('Cylinder', 'cylinder')));
fs.writeFileSync(path.join(assetsDir, 'cube.glb'), JSON.stringify(createMinimalGLTF('Cube', 'cube')));
fs.writeFileSync(path.join(assetsDir, 'bar.glb'), JSON.stringify(createMinimalGLTF('Cube', 'bar')));
console.log('Created GLTF files in public/assets/3d');
