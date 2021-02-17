import * as THREE from './../../../app/libs/three.module.js';
import Grass from './Grass.js';

export default class Platform {

    static create(type, posVec3, geomVec3) {
        const loader = new THREE.TextureLoader();
        let texture;
        if (type == "ground-falling") {
            texture = 'images/Medium4.jpg';
        } else {
            texture = 'images/groundtexture01.jpg'
        }
        const ground_material = Physijs.createMaterial( new THREE.MeshLambertMaterial({map: loader.load(texture)}), 0, 0 );
        ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
        ground_material.map.repeat.set(1, 1);

        const ground = new Physijs.BoxMesh( new THREE.BoxGeometry(geomVec3.x, geomVec3.y, geomVec3.z), ground_material, 0 );
        ground.position.set(posVec3.x, posVec3.y, posVec3.z);
        ground.receiveShadow = true;
        ground.name = type;

        const grass = new Grass(ground);
        ground.userData = {
            grass: grass
        };

        return ground;
    }
}

