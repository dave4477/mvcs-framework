import * as THREE from './../../../app/libs/three.module.js';

export default class Spikes {

    constructor() {
        this.loader = new THREE.TextureLoader();
    }

    create(x, y) {

        const boxGeometry = new THREE.ConeGeometry(1, 2, 8, 8);
        let material;
        material = Physijs.createMaterial(new THREE.MeshLambertMaterial({map: this.loader.load('images/steel.jpg')}), 1, 1);
        material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
        material.map.repeat.set(.5, .5);

        this.spike = new Physijs.ConeMesh(boxGeometry, material, 0);
        this.spike.collisions = 0;
        this.spike.name = "spike";
        this.spike.position.x = x;
        this.spike.position.y = y;
        this.spike.userData.isDeadly = true;
        return this.spike;
    }


}