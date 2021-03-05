import * as THREE from './../../../app/libs/three.module.js';
import Platform from './Platform.js';


export default class Platforms {
    constructor() {
    }
    
    static create(scene, levelMap) {
        // Ground
        for (let i = 0; i < levelMap.length; i++) {
            const groundData = levelMap[i];
            const metrics = new THREE.Vector3(groundData.width, groundData.height, groundData.depth);
            const position = new THREE.Vector3(groundData.x, groundData.y, groundData.z);
            const ground = Platform.create(groundData.type, position , metrics);
            scene.add(ground);
        }
    }



    static createBottomCatcher(scene) {
        const loader = new THREE.TextureLoader();

        const ground_material = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({map: loader.load('images/rocks.jpg')}),
            1, // high friction
            0 // low restitution
        );
        ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
        ground_material.map.repeat.set(3, 3);

        const ground = new Physijs.BoxMesh(
            new THREE.BoxGeometry(1500, 20, 500),
            ground_material,
            0 // mass
        );
        ground.visible = false;
        ground.position.set(0, -36, 0);
        ground.name = "bottomCatcher";
        scene.add(ground);
    }
}