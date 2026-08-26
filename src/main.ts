import * as THREE from 'three';                 // import all THREE.js components
import { GameOptions } from './gameOptions';    // import game options
import { Platform } from './platform';          // import game options
import './style.css';                           // import web page style sheet

// create the 3D scene container
const scene: THREE.Scene = new THREE.Scene();

// set up a perspective camera, then manually position and orient it
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 12);
camera.lookAt(0, -2, 0);

// create the WebGL renderer with antialiasing enabled
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: true
});

// set the renderer size to match the window
renderer.setSize(window.innerWidth, window.innerHeight);

// enable shadow rendering
renderer.shadowMap.enabled = true;

// use soft shadows for smoother lighting
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// add the renderer canvas to the DOM
document.body.appendChild(renderer.domElement);

// create an ambient light to softly illuminate the scene
const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.3);

// add the ambient light to the scene
scene.add(ambientLight);

// create a directional light to simulate sunlight
const light: THREE.DirectionalLight = new THREE.DirectionalLight();

// manually position the light source
light.position.set(5, 10, 7.5);

// enable shadow casting from this light
light.castShadow = true;

// add the directional light to the scene
scene.add(light);

// create the geometry for the central column
const columnGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(GameOptions.columnRadius, GameOptions.columnRadius, 50);

// create a standard material for the column
const columnMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
    color : GameOptions.columnColor
});

// create the column mesh using geometry and material
const column: THREE.Mesh = new THREE.Mesh(columnGeometry, columnMaterial);

// enable shadow reception on the column
column.receiveShadow = true;

// add the column to the scene
scene.add(column);

// create a group to hold all platforms
const platformGroup : THREE.Group = new THREE.Group();

// add the platform group to the scene
scene.add(platformGroup);

// build the platforms
for (let i : number = 0; i < GameOptions.totalPlaftforms; i ++) {

    const platform : Platform = new Platform(GameOptions.platformGap * -i);
    
    platformGroup.add(platform);

}
  
// store the key press timestamps or false when released
const keys : { [key: string]: number | false } = {};

// handle keydown events and store press time
window.addEventListener('keydown', (e : KeyboardEvent) => {
    const key : string = e.key.toLowerCase();
    if (!keys[key]) {
        keys[key] = Date.now();
    }
});

// handle keyup events and reset key state
window.addEventListener('keyup', (e : KeyboardEvent) => {
    const key : string = e.key.toLowerCase();
    keys[key] = false;
});

// three clock to measure time between frames
const clock : THREE.Clock = new THREE.Clock();

// function to be executed at each frame
function update() : void {

    requestAnimationFrame(update);
    
    // determine rotation direction according to pressed keys  
    let rotateDirection : number = 0;

    // get the time elapsed since the last frame
    const delta : number = clock.getDelta();
    
    // counter clockwise
    if (keys['a'] && !keys['d']) {
        rotateDirection = 1;
    }
    else  {
        // clockwise
        if (keys['d'] && !keys['a']) {
            rotateDirection = -1;
        }
        else {
            // both directions, so we see which one was the latest
            if (keys['d'] && keys['a']) {
                rotateDirection = (keys['a'] > keys['d']) ? 1 : -1;
            }
        }
    }        

    // apply rotation to the platform group
    platformGroup.rotation.y += rotateDirection * GameOptions.rotationSpeed * delta;
    
    // render the scene from the camera's point of view
    renderer.render(scene, camera);
}
  
update();