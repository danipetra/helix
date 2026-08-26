import * as THREE from 'three';                 // import all THREE.js components
import { GameOptions } from './gameOptions';    // import game options

// Platform class extends THREE.Group
export class Platform extends THREE.Group {
    
    constructor(posY : number) {
        
        super();

        // choose a random rotation angle around the column
        const angle : number = Math.random() * Math.PI * 2;
            
        // choose a random color for this platform
        const material : THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
            color : GameOptions.platformColors[Math.floor(Math.random() * GameOptions.platformColors.length)]
        });
            
        // define the angular length of the platform arc
        const thetaLength : number = GameOptions.minThetaLength + Math.random() * (GameOptions.maxThetaLength - GameOptions.minThetaLength); 
          
        // create the curved surface of the platform using a cylinder segment
        const cylinderGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(GameOptions.platformRadius, GameOptions.platformRadius, GameOptions.platformHeight, 32, 1, false, 0, thetaLength);
            
        // create a mesh with the cylinder geometry and material
        const cylinder: THREE.Mesh = new THREE.Mesh(cylinderGeometry, material);
        
        // the cylinder casts and receives shadows
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;
            
        // add the cylinder to the platform group
        this.add(cylinder);
          
        // create the first side plane to close the cylinder slice
        const side1: THREE.Mesh = new THREE.Mesh(new THREE.PlaneGeometry(GameOptions.platformRadius, GameOptions.platformHeight), material);
        side1.position.x = 0
        side1.position.z = GameOptions.platformRadius / 2;
        side1.rotation.y = - Math.PI / 2;
        
        // side1 casts and receives shadows
        side1.castShadow = true;
        side1.receiveShadow = true;
        
        // add the side to the platform group
        this.add(side1);
          
        // create the second side plane to close the cylinder slice
        const side2: THREE.Mesh = new THREE.Mesh(new THREE.PlaneGeometry(GameOptions.platformRadius, GameOptions.platformHeight), material);
        side2.position.x = Math.sin(thetaLength) * GameOptions.platformRadius / 2;
        side2.position.z = Math.cos(thetaLength) * GameOptions.platformRadius / 2;
        side2.rotation.y = thetaLength - Math.PI * 3 / 2;
        
        // side2 casts and receives shadows
        side2.castShadow = true;
        side2.receiveShadow = true;
        
        // add the side to the platform group
        this.add(side2);

        // place the platform vertically
        this.position.y = posY;
           
        // rotate the platform around the column
        this.rotation.y = angle;
    }
}