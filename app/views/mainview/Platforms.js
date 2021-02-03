import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from './ObjectLoaders.js';

const levelMap = [
    {type:"ground", posX:12, posY:-8, posZ:0, geomX:32, geomY:16, geomZ:4},
    {type:"ground", posX:48, posY:-8, posZ:0, geomX:34, geomY:16, geomZ:4},

        // 1st floor
        {type:"ground", posX:68, posY:2, posZ:0, geomX:6, geomY:1, geomZ:1},
            // 2nd
            {type:"ground", posX:77, posY:5, posZ:0, geomX:8, geomY:1, geomZ:1},

        // 1st floor
        {type:"ground", posX:86, posY:2, posZ:0, geomX:6, geomY:1, geomZ:1},

    {type:"ground", posX:155, posY:-8, posZ:0, geomX:128, geomY:16, geomZ:4},

    {type:"ground-falling", posX:222, posY:0, posZ:0, geomX:4, geomY:0.5, geomZ:4}
];

export default class Platforms {
    constructor() {
    }
    
    static create(scene) {
        // Ground
        const loader = new THREE.TextureLoader();
        for (let i = 0; i < levelMap.length; i++) {
            const obj = levelMap[i];
            const ground_material = Physijs.createMaterial(
                new THREE.MeshLambertMaterial({map: loader.load('images/groundtexture02.jpg')}),
                .0, // high friction
                0 // low restitution
            );
            ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
            ground_material.map.repeat.set(1, 1);

            const ground = new Physijs.BoxMesh(
                new THREE.BoxGeometry(obj.geomX, obj.geomY, obj.geomZ),
                ground_material,
                0 // mass
            );
            ground.position.set(obj.posX, obj.posY, obj.posZ);
            ground.receiveShadow = true;
            ground.name = obj.type;
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
            new THREE.BoxGeometry(500, 10, 20),
            ground_material,
            0 // mass
        );
        ground.visible = false;
        ground.position.set(0, -30, 0);
        ground.name = "bottomCatcher";
        scene.add(ground);
    }
}