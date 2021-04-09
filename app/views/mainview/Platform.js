import * as THREE from './../../libs/three.module.js';
import Grass from './Grass.js';
import ObjectsPreloader from './../helpers/ObjectsPreloader.js';


const DEG2RAD = Math.PI / 180;

export default class Platform {

    static create(type, posVec3, geomVec3, angle) {
        const loader = new THREE.TextureLoader();
        let texture;
        if (type == "ground-falling") {
            texture = loader.load('images/Medium4.jpg');

        } else {
            texture = ObjectsPreloader.getCache()["Platform01"];
            //texture = 'images/groundtexture01.jpg'
        }
        const ground_material = Physijs.createMaterial( new THREE.MeshLambertMaterial({map: texture}), 0, 0 );
        ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
        ground_material.map.repeat.set(1, 1);

        const ground = new Physijs.BoxMesh( new THREE.BoxGeometry(geomVec3.x, geomVec3.y, geomVec3.z), ground_material, 0 );
        ground.position.set(posVec3.x, posVec3.y, posVec3.z);
        ground.receiveShadow = true;
        // ground.castShadow = true;
        ground.name = type;
        if (angle) {
            ground.rotation.z = angle * DEG2RAD;
        }
        const grass = new Grass(ground);
        ground.userData = {
            grass: grass
        };

        return ground;
    }
}

