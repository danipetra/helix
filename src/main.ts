import * as THREE from 'three';                 // import all THREE.js components
import { GameOptions } from './gameOptions';    // import game options
import { Platform } from './platform';          // import Platform class
import { Ball } from './ball';                  // import Ball class
import './style.css';                           // import web page style sheet

// create the 3D scene container
const scene : THREE.Scene = new THREE.Scene();

// set up a perspective camera, then manually position and orient it
const camera : THREE.PerspectiveCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 12);

// create the WebGL renderer with antialiasing enabled
const renderer : THREE.WebGLRenderer = new THREE.WebGLRenderer({
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
const ambientLight : THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.3);

// add the ambient light to the scene
scene.add(ambientLight);

// create a directional light to simulate sunlight
const light : THREE.PointLight = new THREE.PointLight(0xffffff, 40);

// manually position the light source
light.position.set(5, 10, 7.5);

// enable shadow casting from this light
light.castShadow = true;

// add the directional light to the scene
scene.add(light);

// create the geometry for the central column
const columnGeometry : THREE.CylinderGeometry = new THREE.CylinderGeometry(GameOptions.columnRadius, GameOptions.columnRadius, 50);

// create a standard material for the column
const columnMaterial : THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
    color : GameOptions.columnColor
});

// create the column mesh using geometry and material
const column : THREE.Mesh = new THREE.Mesh(columnGeometry, columnMaterial);

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

    // create a new platform
    const platform : Platform = new Platform(GameOptions.platformGap * -i);
    
    // add platform to platformGroup
    platformGroup.add(platform);
}

// create and add the ball
const ball : Ball = new Ball();
scene.add(ball);
  
// store the key press timestamps or false when released
const keys : { [key : string] : number | false } = {};

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

    // get top platform
    const topPlatform = platformGroup.children[0];

    // get current camera y position
    const currentY = camera.position.y;

    // y target is always a bit above top platform
    const targetY = topPlatform.position.y + 2.5;

    // lerp camera position and direction. Some hardcoded values here, will optimize a bit later
    camera.position.y = THREE.MathUtils.lerp(currentY, targetY, 0.02);
    camera.lookAt(0, THREE.MathUtils.lerp(currentY - 4, topPlatform.position.y - 2, 0.05), 0);
    
    // make light follow the camera
    light.position.y = camera.position.y + 6;
    
    // determine rotation direction according to pressed keys  
    let rotateDirection : number = 0;

    // get the time elapsed since the last frame
    const delta : number = clock.getDelta();

    // do we need to rotate counter clockwise?
    if (keys['a'] && !keys['d']) {
        rotateDirection = 1;
    }
    else  {

        // do we need to rotate clockwise?
        if (keys['d'] && !keys['a']) {
            rotateDirection = -1;
        }
        else {

            // are we trying to rotate in both directions? Let's see which one was the latest
            if (keys['d'] && keys['a']) {
                rotateDirection = (keys['a'] > keys['d']) ? 1 : -1;
            }
        }
    }        

    // apply rotation to the platform group
    platformGroup.rotation.y += rotateDirection * GameOptions.rotationSpeed * delta;

    // update ball position
    ball.update(delta);

    // if the velocity is less than zero (the ball is falling)
    if (ball.velocity < 0) {

        // get the topmost platform
        const platform : Platform = platformGroup.children[0] as Platform;

        // get the y coordinate of the first platform floor, according to ball rdius, platform y position and height
        const impactPoint : number = platform.position.y + GameOptions.platformHeight / 2 + + GameOptions.ballRadius;
        
        // is ball y positon less than impact point (the ball is touching platform floor)
        if (ball.position.y < impactPoint) {

            // get platform start and end angle. Final + Math.PI * 2 and % (Math.PI * 2) are used to avoid negative values
            const startAngle = ((platform.rotation.y + platformGroup.rotation.y) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); 
            const endAngle = ((startAngle + platform.thetaLength) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            
            // if start angle is less than end angle, it means the interval includes zero, ball's position. Which should now fall
            if (startAngle < endAngle) {
                
                // remove the platform from the group and scene
                platformGroup.remove(platform);
                scene.remove(platform);

                // move the column down to pretend it's endless
                column.position.y -= GameOptions.platformGap;

                // create a new platform below the last one
                const lastPlatform : Platform = platformGroup.children[platformGroup.children.length - 1] as Platform;
                const newY : number = lastPlatform.position.y - GameOptions.platformGap;
                const newPlatform : Platform = new Platform(newY);
                platformGroup.add(newPlatform);
            }

            // if not, make the ball bounce
            else {

                // place the ball on the impact point, not to intersecate the platform
                ball.position.y = impactPoint;

                // method to make ball bounce
                ball.bounce();    
            }
        } 
    }

    // render the scene from the camera's point of view
    renderer.render(scene, camera);
}

// resize window listener
window.addEventListener('resize', () : void => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

update();