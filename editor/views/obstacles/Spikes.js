import * as THREE from './../../libs/three.module.js';
const DEG2RAD = Math.PI / 180;

export default class Spikes {

    constructor() {
    }

    create(x, y, z =0, rotation = 0) {
        const boxGeometry = new THREE.ConeGeometry(1, 2, 8, 8);
        let material;
        material = Physijs.createMaterial(new THREE.MeshPhongMaterial({color:0xbbbbfef, shininess:100 }), 1, 1);

        this.spike = new Physijs.ConeMesh(boxGeometry, material, 0);
        this.spike.collisions = 0;
        this.spike.castShadow = true;
        this.spike.name = "spike";
        this.spike.position.x = x;
        this.spike.position.y = y;
        this.spike.position.z = z;
        this.spike.userData = {owner:this};
        this.spike.rotation.z = rotation * DEG2RAD;
        return this.spike;
    }

    destroy() {
        this.spike.geometry.dispose();
        // this.spike.material.map.dispose();
        this.spike.material.dispose();
        this.spike.userData = null;
        this.spike = null;
    }

}