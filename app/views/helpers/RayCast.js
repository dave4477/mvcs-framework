import * as THREE from './../../../app/libs/three.module.js';

export default class RayCast {
    constructor(origin, direction, near = 0, far = 10) {
        this.raycaster = new THREE.Raycaster(origin, direction, near, far);
        return this.raycaster;
    }

    changeDirection(direction) {
        switch (direction) {
            case 1:
                this.raycaster.ray.direction = new THREE.Vector3(1,0,0);
                break;

            case -1:
                this.raycaster.ray.direction = new THREE.Vector3(-1,0,0);
                break;
        }
    }
}