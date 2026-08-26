import * as THREE from 'three';                 // import all THREE.js components
import { gsap } from 'gsap';                    // import the GSAP library used for tween-based animations
import { GameOptions } from './gameOptions';    // import game options
import { Platform } from './platform';          // import Platform class
import { Ball } from './ball';                  // import Ball class
import './style.css';                           // import web page style sheet

// create the 3D scene container
const scene : THREE.Scene = new THREE.Scene();

// set up a perspective camera, then manually position and orient it
const camera : THREE.PerspectiveCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 12);
camera.lookAt(0, -2, 0);

// create the WebGL renderer with antialiasing enabled
const renderer : THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias : true
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
    const platform : Platform = new Platform(GameOptions.platformGap * -i, i > 0);
    
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

// boolean variable to check if the game is over
let gameOver : boolean = false;

// function to be executed at each frame
function update() : void {

    // ask the browser to call this function again on the next animation frame
    requestAnimationFrame(update);

    // if the game is over, just render the scene and exit the function
    if (gameOver) { 
        renderer.render(scene, camera);
        return;
    }

    // get the time elapsed since the last frame
    const delta : number = clock.getDelta();

    // get top platform
    const topPlatform = platformGroup.children[0];

    // get current camera y position
    const currentCameraY = camera.position.y;

    // y target is always a bit above top platform
    const targetY = topPlatform.position.y + 4;

    // lerp camera position and direction. Some hardcoded values here, will optimize a bit later
    camera.position.y = THREE.MathUtils.lerp(currentCameraY, targetY, 0.01);
    camera.lookAt(0, THREE.MathUtils.lerp(currentCameraY - 6, topPlatform.position.y - 2, 0.01), 0);
    
    // make light follow the camera
    light.position.y = camera.position.y + 6;
    
    // determine rotation direction according to pressed keys  
    let rotateDirection : number = 0;

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

    // get the topmost platform
    const topmostPlatform : Platform = platformGroup.children[0] as Platform;

    // loop through all spikes
    for (const spike of topmostPlatform.spikes) {

        // get spike tip position
        const spikeTip = new THREE.Vector3(0, GameOptions.spikeHeight / 2, 0); 

        // get spike tip local world coordinate
        spike.localToWorld(spikeTip);

        // determine the distance from spike tip to ball center
        const distanceToTip = spikeTip.distanceTo(ball.position);
            
        // is the spike lower than ball radius? So we have a collision
        // I reduced by 10% ball radius to make the game easier
        if (distanceToTip < GameOptions.ballRadius * 0.9) {
            
            // now it's game over
            gameOver = true;
           
            // tween camera position using GSAP
            gsap.to(camera.position, {
                z           : ball.position.z + 4,                                          // z position
                x           : spikeTip.x > 0 ? ball.position.x + 4 : ball.position.x - 4,   // x position
                y           : ball.position.y,                                              // y position
                duration    : 2,                                                            // duration, in seconds
                ease        : 'power2.out',                                                 // easing
                onUpdate : () => {                                                          // function to be executed at each update
                    camera.lookAt(ball.position.x, ball.position.y, ball.position.z);
                }
            });

            // tween ball material color using GSAP
            gsap.to((ball.material as THREE.MeshStandardMaterial).color, {
                r: 1,           // red
                g: 0,           // green
                b: 0,           // blue
                duration: 2     // duration, in seconds
            });

            setTimeout(() => {

                // reset gameOver flag
                gameOver = false;

                // reset ball position and velocity
                ball.position.set(0, 2, GameOptions.platformRadius - 0.4);
                ball.velocity = 0;

                // reset camera
                camera.position.set(0, 4, 12);
                camera.lookAt(0, -2, 0);

                // reset column
                column.position.y = 0;

                // clear and recreate platforms
                platformGroup.clear();
                for (let i : number = 0; i < GameOptions.totalPlaftforms; i ++) {
                    const newPlatform = new Platform(GameOptions.platformGap * -i, i > 0);
                    platformGroup.add(newPlatform);
                }

                // reset platform group rotation
                platformGroup.rotation.y = 0;

                // reset ball color
                const mat = ball.material as THREE.MeshStandardMaterial;
                mat.color.set(GameOptions.ballColor);
            
            }, 3000); // wait 3 seconds

            // render the scene and exit the function
            renderer.render(scene, camera);
            return;
        }
    }

    // if the velocity is less than zero (the ball is falling)
    if (ball.velocity < 0) {

        // get the y coordinate of the first platform floor, according to ball rdius, platform y position and height
        const impactPoint : number = topmostPlatform.position.y + GameOptions.platformHeight / 2 + + GameOptions.ballRadius;
        
        // is ball y positon less than impact point (the ball is touching platform floor)
        if (ball.position.y < impactPoint) {

            // get platform start and end angle. Final + Math.PI * 2 and % (Math.PI * 2) are used to avoid negative values
            const startAngle = ((topmostPlatform.rotation.y + platformGroup.rotation.y) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); 
            const endAngle = ((startAngle + topmostPlatform.thetaLength) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            
            // if start angle is less than end angle, it means the interval includes zero, ball's position. Which should now fall
            if (startAngle < endAngle) {
                
                // remove the platform from the group and scene
                platformGroup.remove(topmostPlatform);
                scene.remove(topmostPlatform);

                // move the column down to pretend it's endless
                column.position.y -= GameOptions.platformGap;

                // create a new platform below the last one ad add it to platform group
                const lastPlatform : Platform = platformGroup.children[platformGroup.children.length - 1] as Platform;
                const newY : number = lastPlatform.position.y - GameOptions.platformGap;
                const newPlatform : Platform = new Platform(newY, true);
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