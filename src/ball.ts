import * as THREE from 'three';                 // import all THREE.js components
import { GameOptions } from './gameOptions';    // import game options

// Ball class extends THREE.Mesh
export class Ball extends THREE.Mesh {

    velocity : number;  // ball velocity

    constructor() {

        // create ball material
        const material : THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
            color : GameOptions.ballColor
        });
        
        // create ball geometry
        const geometry : THREE.SphereGeometry = new THREE.SphereGeometry(GameOptions.ballRadius);
        
        super(geometry, material);
        
        // ball casts shadow
        this.castShadow = true;

        // place the ball
        this.position.set(0, 5, GameOptions.platformRadius - GameOptions.ballRadius);

        // set ball velocity at zero
        this.velocity = 0;
    }

    // method to apply gravity and update vertical position
    update(delta : number) : void {

        // apply gravity
        this.velocity -= GameOptions.gravity * delta;

        // update y position
        this.position.y += this.velocity * delta;
    }

    // method to make ball bounce
    bounce() : void {

        // set velocity to bounce impulse
        this.velocity = GameOptions.bounceImpulse;
    }
} 
