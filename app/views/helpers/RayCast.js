import * as THREE from './../../libs/three.module.js';
import DebugSettings from './../../DebugSettings.js';

export default class RayCast {
    constructor(origin, direction, scene = null, near = 0, far = 10) {
        direction = direction.normalize();
        this.raycaster = new THREE.Raycaster(origin, direction, near, far);
        this.arrowHelper = null;
        this.scene = scene;

        if (scene && DebugSettings.showRayCast) {
            this.arrowHelper = new THREE.ArrowHelper(this.raycaster.ray.direction, scene.position, far, 0xffffff);
            scene.add( this.arrowHelper );

        }
        this.raycaster.userData = {owner:this};
        return this.raycaster;
    }

    drawRay() {
        if (this.scene && DebugSettings.showRayCast) {
            this.arrowHelper.position.set(0, 0, this.scene.position.z);
        }
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