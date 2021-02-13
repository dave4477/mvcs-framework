import * as THREE from './../../../app/libs/three.module.js';
import Platform from './Platform.js';

const levelMap = [
    {type:"ground", x:12, y:-8, z:0, width:32, height:16, depth:12},
    {type:"ground", x:48, y:-8, z:0, width:34, height:16, depth:8},

        // 1st floor
        {type:"ground", x:68, y:2, z:0, width:6, height:1, depth:8},
            // 2nd
            {type:"ground", x:77, y:5, z:0, width:8, height:1, depth:8},

        // 1st floor
        {type:"ground", x:86, y:2, z:0, width:6, height:1, depth:8},

    {type:"ground", x:155, y:-8, z:0, width:128, height:16, depth:8},

    {type:"ground-falling", x:225, y:1, z:0, width:4, height:0.4, depth:4},

    {type:"ground", x:235, y:3, z:0, width:8, height:2, depth:4},

    {type:"ground-falling", x:225, y:12, z:0, width:4, height:0.4, depth:4},

    {type:"ground", x:202, y:14, z:0, width:34, height:2, depth:4},
    {type:"ground", x:170, y:14, z:0, width:16, height:2, depth:4},
    {type:"ground-falling", x:156, y:14, z:0, width:4, height:0.4, depth:4},
    {type:"ground", x:142, y:14, z:0, width:16, height:2, depth:4},

    // moving platform is not added here but is between here.

    {type:"ground", x:120, y:14, z:0, width:16, height:2, depth:4}

];

export default class Platforms {
    constructor() {
    }
    
    static create(scene) {
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
        ground.position.set(0, -30, 0);
        ground.name = "bottomCatcher";
        scene.add(ground);
    }
}