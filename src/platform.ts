import * as THREE from 'three';                 // import all THREE.js components
import { GameOptions } from './gameOptions';    // import game options

// Platform class extends THREE.Group
export class Platform extends THREE.Group {

    thetaLength : number;   // theta length, in radians
    
    constructor(posY : number) {
        
        super();

        // choose a random rotation angle around the column
        const angle : number = Math.random() * Math.PI * 2;
            
        // choose a random color for this platform
        const material : THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
            color : GameOptions.platformColors[Math.floor(Math.random() * GameOptions.platformColors.length)]
        });
            
        // define the angular length of the platform arc
        this.thetaLength = GameOptions.minThetaLength + Math.random() * (GameOptions.maxThetaLength - GameOptions.minThetaLength); 
          
        // create the curved surface of the platform using a cylinder segment
        const cylinderGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(GameOptions.platformRadius, GameOptions.platformRadius, GameOptions.platformHeight, 32, 1, false, 0, this.thetaLength);
            
        // create a mesh with the cylinder geometry and material
        const cylinder: THREE.Mesh = new THREE.Mesh(cylinderGeometry, material);
        
        // the cylinder casts and receives shadows
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;
            
        // add the cylinder to the platform group
        this.add(cylinder);
          
        // gap material, where te ball should land
        const gapMaterial : THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
            color : GameOptions.gapColor 
        });

        // create the complementary curved surface of the platform using a cylinder segment
        const gapGeometry: THREE.CylinderGeometry = new THREE.CylinderGeometry(GameOptions.platformRadius, GameOptions.platformRadius, GameOptions.platformHeight, 32, 1, false, this.thetaLength, Math.PI * 2 - this.thetaLength);

        // create a mesh with the cylinder geometry and material
        const gap : THREE.Mesh = new THREE.Mesh(gapGeometry, gapMaterial);

        // the gap casts and receives shadows
        gap.castShadow = true;
        gap.receiveShadow = true;

        // add the gap to the platform group
        this.add(gap);
        
        // place the platform vertically
        this.position.y = posY;
           
        // rotate the platform around the column
        this.rotation.y = angle;
    }
}