import * as THREE from 'three';                 // import all THREE.js components
import { GameOptions } from './gameOptions';    // import game options

// Platform class extends THREE.Group
export class Platform extends THREE.Group {

    thetaLength : number;           // theta length, in radians
    spikes      : THREE.Mesh[];     // store spikes for collision detection
    
    constructor(posY : number, hasSpikes : boolean) {
        
        super();

        // start with no spikes
        this.spikes = [];

        // choose a random rotation angle around the column
        const angle : number = hasSpikes ? Math.random() * Math.PI * 2 : - Math.PI / 2;
            
        // choose a random color for this platform
        const material : THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
            color : GameOptions.platformColors[Math.floor(Math.random() * GameOptions.platformColors.length)]
        });
            
        // define the angular length of the platform arc
        this.thetaLength = hasSpikes ? GameOptions.minThetaLength + Math.random() * (GameOptions.maxThetaLength - GameOptions.minThetaLength) : Math.PI; 
          
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

        // does the platform have spikes?
        if (hasSpikes) {

            // create deadly spikes on the solid section
            const spikeStep: number = Math.PI / 16; 
            for (let angleSpike : number =  Math.PI / 60; angleSpike < this.thetaLength - Math.PI / 60; angleSpike += spikeStep) {

                // should we place a spike?
                if (Math.random() < GameOptions.spikeProbability) {
                    
                    // define spike geometry
                    const spikeGeometry : THREE.ConeGeometry = new THREE.ConeGeometry(GameOptions.spikeRadius, GameOptions.spikeHeight);

                    // define spike color
                    const spikeMaterial : THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
                        color: GameOptions.spikeColor
                    });

                    // create the spike mesh
                    const spike : THREE.Mesh = new THREE.Mesh(spikeGeometry, spikeMaterial);

                    // random between -2 and +2 degrees in radians
                    const jitter : number = (Math.random() * 4 - 2) * (Math.PI / 180); 

                    // final spike angle
                    const finalAngle : number = angleSpike + jitter;

                    // place the spike, using trigonometry
                    spike.position.x = Math.cos(-finalAngle + Math.PI / 2) * (GameOptions.platformRadius - GameOptions.ballRadius);
                    spike.position.z = Math.sin(-finalAngle + Math.PI / 2) * (GameOptions.platformRadius - GameOptions.ballRadius);
                    spike.position.y = GameOptions.platformHeight / 2 + GameOptions.spikeHeight / 2;

                    // spikes cast and receive shadows
                    spike.castShadow = true;
                    spike.receiveShadow = true;

                    // add the spike and push it in spikes array
                    this.add(spike);
                    this.spikes.push(spike);
                }
            }
        }
        
        // place the platform vertically
        this.position.y = posY;
           
        // rotate the platform around the column
        this.rotation.y = angle;
    }
}