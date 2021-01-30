import * as THREE from './../../../app/libs/three.module.js';
import ObjectLoaders from './ObjectLoaders.js';

const levelMap = [
    {posX:6, posY:-8, posZ:0, geomX:16, geomY:16, geomZ:4},
    {posX:25, posY:-8, posZ:0, geomX:16, geomY:16, geomZ:4},
    {posX:43, posY:-9, posZ:0, geomX:16, geomY:16, geomZ:4},
    {posX:59, posY:-9, posZ:0, geomX:16, geomY:16, geomZ:4},

        // 1st floor
        {posX:59, posY:1, posZ:0, geomX:6, geomY:1, geomZ:1},
            // 2nd
            {posX:68.5, posY:4, posZ:0, geomX:6, geomY:1, geomZ:1},

    {posX:75, posY:-9, posZ:0, geomX:16, geomY:16, geomZ:4},
    {posX:92, posY:-8, posZ:0, geomX:16, geomY:16, geomZ:4}
];

export default class Platforms {
    constructor() {
    }
    
    static create(scene) {
        // // Ground
        const loader = new THREE.TextureLoader();

        for (let i = 0; i < levelMap.length; i++) {
            const obj = levelMap[i];
            const ground_material = Physijs.createMaterial(
                new THREE.MeshLambertMaterial({map: loader.load('images/rocks.jpg')}),
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
            ground.name = "ground";

            // const objectLoader = new ObjectLoaders();
            // objectLoader.loadObjMTL('./assets/grass/', 'grass.mtl', './assets/grass/', 'grass.obj').then((object) => {
            //     object.position.y = ground.geometry.boundingBox.max.y + 0.05;
            // ground.add(object);
            scene.add(ground);
            //});
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
        ground.position.set(0, -50, 0);
        ground.name = "bottomCatcher";
        scene.add(ground);
    }
}