import * as THREE from './../../../app/libs/three.module.js';

const DEG2RAD = Math.PI / 180;

export default class Spikes {

    constructor() {
        this.loader = new THREE.TextureLoader();
    }

    create(x, y, z =0, rotation = 0) {

        const boxGeometry = new THREE.ConeGeometry(1, 2, 8, 8);
        let material;
        material = Physijs.createMaterial(new THREE.MeshPhongMaterial({map: this.loader.load('images/steel.jpg'), shininess:100}), 1, 1);
        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set(.5, .5);

        this.spike = new Physijs.ConeMesh(boxGeometry, material, 0);
        this.spike.collisions = 0;
        this.spike.castShadow = true;
        this.spike.name = "spike";
        this.spike.position.x = x;
        this.spike.position.y = y;
        this.spike.position.z = z;

        this.spike.rotation.z = rotation * DEG2RAD;
        return this.spike;
    }


}