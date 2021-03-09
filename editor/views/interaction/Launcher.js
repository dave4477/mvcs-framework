import * as THREE from './../../libs/three.module.js';

export default class Jumper {
    constructor() {

    }

    create(posVec3, geomVec3, launchPower) {
        const loader = new THREE.TextureLoader();
        let texture = 'images/movingplatform.jpg';
        const ground_material = Physijs.createMaterial( new THREE.MeshLambertMaterial({map: loader.load(texture)}), 0, 0 );
        ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
        ground_material.map.repeat.set(1, 1);

        const ground = new Physijs.BoxMesh( new THREE.BoxGeometry(geomVec3.x, geomVec3.y, geomVec3.z), ground_material, 0 );
        ground.position.set(posVec3.x, posVec3.y, posVec3.z);
        ground.receiveShadow = true;
        // ground.castShadow = true;
        ground.userData.launchPower = launchPower;
        ground.name = "launcher";

        return ground;
    }

}